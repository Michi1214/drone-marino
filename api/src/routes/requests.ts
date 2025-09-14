import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { enforceTokens } from "../middleware/enforceTokens";
import { Request as NavReq } from "../models/Request";
import { User } from "../models/User";
import { Area } from "../models/Area";
import { sequelize } from "../config/db";
import { rectFrom, routeHitsAnyRect, Pt } from "../utils/geo";
import { XMLBuilder } from "fast-xml-parser";
import { Op } from "sequelize";

const r = Router();

/** USER: create request (charges tokens) */
r.post("/v1/requests", auth, requireRole("user"), enforceTokens, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { boatCode, startAt, endAt, route } = req.body;

    // Validazioni minime
    if (!boatCode || String(boatCode).length !== 10) throw { status: 422, code: "VALIDATION", message: "boatCode must be 10 chars" };
    const s = new Date(startAt), e = new Date(endAt);
    if (isNaN(s.getTime())) throw { status: 422, code: "VALIDATION", message: "invalid startAt" };
    if (isNaN(e.getTime())) throw { status: 422, code: "VALIDATION", message: "invalid endAt" };
    if (e <= s) throw { status: 422, code: "VALIDATION", message: "endAt must be after startAt" };
    const minH = Number(process.env.MIN_HOURS_BEFORE_NAV || 48);
    const now = new Date();
    if (s.getTime() - now.getTime() < minH * 3600_000) throw { status: 422, code: "VALIDATION", message: `startAt must be at least ${minH}h from now` };
    if (!Array.isArray(route) || route.length < 4) throw { status: 422, code: "VALIDATION", message: "route must be array of points" };
    const first = route[0], last = route[route.length - 1];
    if (!(first.lat === last.lat && first.lon === last.lon)) throw { status: 422, code: "VALIDATION", message: "route must be closed (first == last)" };

    // Check aree vietate (ignora validità temporale per il minimal)
    const areas = await Area.findAll();
    const rects = areas.map(a => rectFrom(a.lat1, a.lon1, a.lat2, a.lon2));
    if (routeHitsAnyRect(route as Pt[], rects)) throw { status: 422, code: "FORBIDDEN_ROUTE", message: "route crosses a forbidden area" };

    // Addebito token + creazione richiesta atomica
    const cost = Number(process.env.TOKEN_COST_REQUEST || 5);
    const user = await User.findOne({ where: { email: req.user!.email }, transaction: t, lock: t.LOCK.UPDATE });
    if (!user) throw { status: 401, code: "UNAUTHORIZED" };
    if (user.tokens < cost) throw { status: 401, code: "UNAUTHORIZED", message: "Not enough tokens" };

    user.tokens = user.tokens - cost;
    await user.save({ transaction: t });

    const created = await NavReq.create({
      userId: user.id,
      boatCode,
      startAt: s,
      endAt: e,
      route,
      status: "pending"
    }, { transaction: t });

    await t.commit();
    res.status(201).json(created);
  } catch (e) {
    await t.rollback();
    next(e);
  }
});

/** USER: cancel if pending and owned */
r.delete("/v1/requests/:id", auth, requireRole("user"), async (req, res, next) => {
  try {
    const me = await User.findOne({ where: { email: req.user!.email } });
    const rqt = await NavReq.findByPk(req.params.id);
    if (!me || !rqt || rqt.userId !== me.id) return res.status(404).json({ error: "NOT_FOUND" });
    if (rqt.status !== "pending") return res.status(409).json({ error: "CONFLICT", message: "only pending can be cancelled" });
    rqt.status = "cancelled";
    await rqt.save();
    res.status(200).json(rqt);
  } catch (e) { next(e); }
});

/** LIST (user sees own; operator sees all). Export JSON/XML */
r.get("/v1/requests", auth, async (req, res, next) => {
  try {
    const { status, from, to, format } = req.query as any;
    const where: any = {};
    if (status) where.status = status;

    if (from || to) {
      where.startAt = {};
      if (from) where.startAt[Op.gte] = new Date(from);
      if (to) where.startAt[Op.lte] = new Date(to);
    }

    let items;
    if (req.user!.role === "operator") {
      items = await NavReq.findAll({ where, order: [["createdAt", "DESC"]] });
    } else {
      const me = await User.findOne({ where: { email: req.user!.email } });
      items = await NavReq.findAll({ where: { ...where, userId: me!.id }, order: [["createdAt", "DESC"]] });
    }

    if ((format || "").toString().toLowerCase() === "xml" || req.headers.accept === "application/xml") {
      const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
      const xml = builder.build({ requests: { item: items.map(i => i.toJSON()) } });
      res.setHeader("Content-Type", "application/xml").send(xml);
    } else {
      res.json({ items });
    }
  } catch (e) { next(e); }
});

/** OPERATOR: accept / reject */
r.post("/v1/requests/:id/accept", auth, requireRole("operator"), async (req, res, next) => {
  try {
    const rqt = await NavReq.findByPk(req.params.id);
    if (!rqt) return res.status(404).json({ error: "NOT_FOUND" });
    if (rqt.status !== "pending") return res.status(409).json({ error: "CONFLICT" });
    rqt.status = "accepted";
    await rqt.save();
    res.json(rqt);
  } catch (e) { next(e); }
});

r.post("/v1/requests/:id/reject", auth, requireRole("operator"), async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    if (!reason) return res.status(422).json({ error: "VALIDATION", message: "reason is required" });
    const rqt = await NavReq.findByPk(req.params.id);
    if (!rqt) return res.status(404).json({ error: "NOT_FOUND" });
    if (rqt.status !== "pending") return res.status(409).json({ error: "CONFLICT" });
    rqt.status = "rejected";
    rqt.rejectionReason = reason;
    await rqt.save();
    res.json(rqt);
  } catch (e) { next(e); }
});

/** ADMIN: set credit for an email */
r.post("/v1/admin/users/credit", auth, requireRole("admin"), async (req, res, next) => {
  try {
    const { email, tokens } = req.body || {};
    if (!email || typeof tokens !== "number" || tokens < 0) return res.status(422).json({ error: "VALIDATION" });
    const u = await User.findOne({ where: { email } });
    if (!u) return res.status(404).json({ error: "NOT_FOUND" });
    u.tokens = tokens;
    await u.save();
    res.json({ email: u.email, tokens: u.tokens });
  } catch (e) { next(e); }
});

export default r;

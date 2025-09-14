import { Router } from "express";
import { Area } from "../models/Area";
import { requireRole } from "../middleware/requireRole";
import { auth } from "../middleware/auth";

const r = Router();

// NIENTE r.use(...) globale senza path

// [O] Get all areas
r.get("/v1/areas", auth, async (req, res, next) => {
  try {
    const areas = await Area.findAll();
    res.json(areas);
  } catch (e) {
    next(e);
  }
});

// [O] Get area by ID
r.get("/v1/areas/:id", auth, async (req, res, next) => {
  try {
    const area = await Area.findByPk(req.params.id);
    if (!area) return res.status(404).json({ error: "NOT_FOUND" });
    res.json(area);
  } catch (e) {
    next(e);
  }
});


// [O] Create area
r.post("/v1/areas", auth, requireRole("operator"), async (req, res, next) => {
  try {
    const { name, lat1, lon1, lat2, lon2, validFrom, validTo } = req.body;
    const created = await Area.create({
      name: name || null,
      lat1, lon1, lat2, lon2,
      validFrom: validFrom || null,
      validTo: validTo || null
    });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// [O] Update area
r.put("/v1/areas/:id", auth, requireRole("operator"), async (req, res, next) => {
  try {
    const a = await Area.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: "NOT_FOUND" });
    await a.update(req.body);
    res.json(a);
  } catch (e) { next(e); }
});

// [O] Delete area
r.delete("/v1/areas/:id", auth, requireRole("operator"), async (req, res, next) => {
  try {
    const a = await Area.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: "NOT_FOUND" });
    await a.destroy();
    res.status(204).end();
  } catch (e) { next(e); }
});

export default r;

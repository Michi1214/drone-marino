import { Router } from "express";
import { Area } from "../models/Area";

const r = Router();

// elenco pubblico aree vietate
r.get("/v1/areas/public", async (_req, res, next) => {
  try {
    const items = await Area.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ items });
  } catch (e) { next(e); }
});

export default r;

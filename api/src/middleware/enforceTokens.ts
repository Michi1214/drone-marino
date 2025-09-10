import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

/** Traccia: con token esauriti, ogni richiesta dell'utente restituisce 401.
 *  Applichiamo ai soli endpoint [U] (user). */
export async function enforceTokens(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "UNAUTHORIZED" });
  if (req.user.role !== "user") return next();

  const u = await User.findOne({ where: { email: req.user.email } });
  if (!u) return res.status(401).json({ error: "UNAUTHORIZED" });
  if (u.tokens <= 0) return res.status(401).json({ error: "UNAUTHORIZED", message: "No tokens left" });
  next();
}

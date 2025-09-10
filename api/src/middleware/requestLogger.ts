import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  const role = req.user?.role ?? "anon";
  console.log(`[REQ] ${req.method} ${req.originalUrl} role=${role}`);
  next();
}

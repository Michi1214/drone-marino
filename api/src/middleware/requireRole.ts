import { Request, Response, NextFunction } from "express";

export function requireRole(...roles: Array<"user"|"operator"|"admin">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "UNAUTHORIZED" });
    if (!roles.includes(req.user.role)) {
      console.log(`[FORBIDDEN] ${req.method} ${req.originalUrl} role=${req.user.role} requires=${roles.join(",")}`);
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    next();
  };
}

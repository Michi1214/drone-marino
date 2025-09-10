import fs from "fs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const pubPath = process.env.JWT_PUBLIC_KEY_PATH || "/run/secrets/jwt_public.pem";
const ISS = process.env.JWT_ISS || undefined;
const AUD = process.env.JWT_AUD || undefined;

const publicKey = fs.readFileSync(pubPath);

export interface JwtUser {
  sub: string;
  email: string;
  role: "user" | "operator" | "admin";
  [k: string]: any;
}

declare global {
  namespace Express {
    interface Request { user?: JwtUser; }
  }
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "UNAUTHORIZED", message: "Missing token" });

  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      issuer: ISS,
      audience: AUD
    }) as JwtUser;
    if (!payload.email || !payload.role) throw new Error("Invalid payload");
    req.user = payload;
    next();
  } catch (e: any) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: e.message });
  }
}

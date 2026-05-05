import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

export interface JwtPayload {
  id: string;
  nome: string;
  email: string;
  role: Role;
}

// Extend Express Request to carry the decoded user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─── authenticate ──────────────────────────────────────────────────────────
// Validates the Bearer token and attaches the decoded payload to req.user
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Token de autenticação não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

// ─── authorize ─────────────────────────────────────────────────────────────
// Factory that creates a middleware allowing only the specified roles
export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Acesso negado. Requer perfil: ${roles.join(" ou ")}`,
      });
    }

    next();
  };
}

import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export type Role = "ADMIN" | "RECEPCIONISTA" | "MEDICO";

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: Role;
}

export function saveAuth(token: string, user: AuthUser) {
  Cookies.set("clinicos_token", token, { expires: 1, sameSite: "strict" });
  Cookies.set("clinicos_user", JSON.stringify(user), {
    expires: 1,
    sameSite: "strict",
  });
}

export function getUser(): AuthUser | null {
  const raw = Cookies.get("clinicos_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return Cookies.get("clinicos_token") ?? null;
}

export function logout() {
  Cookies.remove("clinicos_token");
  Cookies.remove("clinicos_user");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}

export function getDashboardPath(role: Role): string {
  const map: Record<Role, string> = {
    ADMIN: "/admin",
    RECEPCIONISTA: "/recepcionista",
    MEDICO: "/medico",
  };
  return map[role];
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  RECEPCIONISTA: "Recepcionista",
  MEDICO: "Médico",
};

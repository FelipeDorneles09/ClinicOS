/**
 * Testes unitários — src/lib/auth.ts
 *
 * Testa as funções utilitárias de autenticação sem depender
 * de browser real, cookies ou chamadas de rede.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock do módulo js-cookie ─────────────────────────────────────────────────
// Simula o comportamento do cookie em memória para que os testes
// não dependam de document.cookie real do jsdom.
const cookieStore: Record<string, string> = {};

vi.mock("js-cookie", () => ({
  default: {
    get: (key: string) => cookieStore[key],
    set: (key: string, value: string) => { cookieStore[key] = value; },
    remove: (key: string) => { delete cookieStore[key]; },
  },
}));

// ─── Mock do jwt-decode ───────────────────────────────────────────────────────
vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

import {
  getDashboardPath,
  getUser,
  saveAuth,
  getToken,
  logout,
  ROLE_LABELS,
  type AuthUser,
  type Role,
} from "@/lib/auth";
import { jwtDecode } from "jwt-decode";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const usuarioAdmin: AuthUser = {
  id: "u1",
  nome: "Felipe Admin",
  email: "admin@clinicos.com",
  role: "ADMIN",
};

// ─── Testes ───────────────────────────────────────────────────────────────────
describe("getDashboardPath", () => {
  it("deve retornar /admin para role ADMIN", () => {
    expect(getDashboardPath("ADMIN")).toBe("/admin");
  });

  it("deve retornar /recepcionista para role RECEPCIONISTA", () => {
    expect(getDashboardPath("RECEPCIONISTA")).toBe("/recepcionista");
  });

  it("deve retornar /medico para role MEDICO", () => {
    expect(getDashboardPath("MEDICO")).toBe("/medico");
  });
});

describe("ROLE_LABELS", () => {
  it("deve ter label correto para cada role", () => {
    expect(ROLE_LABELS.ADMIN).toBe("Administrador");
    expect(ROLE_LABELS.RECEPCIONISTA).toBe("Recepcionista");
    expect(ROLE_LABELS.MEDICO).toBe("Médico");
  });
});

describe("saveAuth / getToken / getUser / logout", () => {
  beforeEach(() => {
    // Limpa cookies entre testes
    Object.keys(cookieStore).forEach(k => delete cookieStore[k]);
  });

  it("saveAuth deve persistir token e usuário nos cookies", () => {
    saveAuth("meu-token-jwt", usuarioAdmin);

    expect(getToken()).toBe("meu-token-jwt");
    expect(getUser()).toMatchObject({ id: "u1", role: "ADMIN" });
  });

  it("getUser deve retornar null quando não há cookie", () => {
    expect(getUser()).toBeNull();
  });

  it("getToken deve retornar null quando não há cookie", () => {
    expect(getToken()).toBeNull();
  });

  it("logout deve remover os cookies de token e usuário", () => {
    saveAuth("meu-token-jwt", usuarioAdmin);
    expect(getToken()).not.toBeNull();

    // logout chama window.location.href — não disponível no jsdom, então espionamos
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: "" };

    logout();

    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();

    // Restaura window.location
    window.location = originalLocation;
  });
});

describe("isTokenValid", () => {
  beforeEach(() => {
    Object.keys(cookieStore).forEach(k => delete cookieStore[k]);
  });

  it("deve retornar false quando não há token", async () => {
    const { isTokenValid } = await import("@/lib/auth");
    expect(isTokenValid()).toBe(false);
  });

  it("deve retornar false quando o token está expirado", async () => {
    cookieStore["clinicos_token"] = "token-expirado";
    vi.mocked(jwtDecode).mockReturnValue({ exp: Math.floor(Date.now() / 1000) - 3600 });

    const { isTokenValid } = await import("@/lib/auth");
    expect(isTokenValid()).toBe(false);
  });

  it("deve retornar true quando o token ainda é válido", async () => {
    cookieStore["clinicos_token"] = "token-valido";
    vi.mocked(jwtDecode).mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

    const { isTokenValid } = await import("@/lib/auth");
    expect(isTokenValid()).toBe(true);
  });
});

/**
 * Testes de integração — POST /api/auth/login
 *
 * O Prisma está completamente mockado via src/__mocks__/prisma.ts,
 * então nenhum banco real é necessário para rodar esses testes.
 */
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app";
import { prismaMock } from "../__mocks__/prisma";

// JWT_SECRET precisa estar definido para que o controller gere o token
process.env.JWT_SECRET = "test_secret_key";

// ─── Fixture ─────────────────────────────────────────────────────────────────
const senhaPlana = "Senha@123";
const senhaHash = bcrypt.hashSync(senhaPlana, 8);

const usuarioAtivo = {
  id: "user-1",
  nome: "Admin Teste",
  email: "admin@clinicos.com",
  senhaHash,
  role: "ADMIN" as const,
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Testes ──────────────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  it("deve retornar 200 e um token JWT para credenciais válidas", async () => {
    // Arrange
    prismaMock.usuario.findUnique.mockResolvedValue(usuarioAtivo as any);

    // Act
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: usuarioAtivo.email, senha: senhaPlana });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.usuario).toMatchObject({
      id: "user-1",
      email: "admin@clinicos.com",
      role: "ADMIN",
    });
  });

  it("deve retornar 422 quando o e-mail tem formato inválido", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nao-e-um-email", senha: "qualquer" });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error");
  });

  it("deve retornar 422 quando a senha está ausente", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@clinicos.com" });

    expect(res.status).toBe(422);
  });

  it("deve retornar 401 quando o usuário não existe no banco", async () => {
    // Arrange — Prisma retorna null (usuário não encontrado)
    prismaMock.usuario.findUnique.mockResolvedValue(null);

    // Act
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "fantasma@clinicos.com", senha: "qualquer" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Credenciais inválidas");
  });

  it("deve retornar 401 quando a senha está incorreta", async () => {
    prismaMock.usuario.findUnique.mockResolvedValue(usuarioAtivo as any);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: usuarioAtivo.email, senha: "senha_errada" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Credenciais inválidas");
  });

  it("deve retornar 401 quando o usuário está inativo", async () => {
    prismaMock.usuario.findUnique.mockResolvedValue({
      ...usuarioAtivo,
      ativo: false,
    } as any);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: usuarioAtivo.email, senha: senhaPlana });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Credenciais inválidas");
  });
});

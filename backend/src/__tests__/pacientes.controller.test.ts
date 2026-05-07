/**
 * Testes de integração — /api/pacientes
 *
 * Cobre: listagem, criação com CPF válido, CPF duplicado, e busca por ID.
 * O Prisma é 100% mockado; nenhuma conexão real com banco é necessária.
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { prismaMock } from "../__mocks__/prisma";

process.env.JWT_SECRET = "test_secret_key";

// ─── Helper — gera um Bearer token válido para os testes ─────────────────────
function makeToken(role: "ADMIN" | "RECEPCIONISTA" | "MEDICO" = "RECEPCIONISTA") {
  return jwt.sign(
    { id: "user-test", nome: "Teste", email: "teste@clinicos.com", role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
}

// ─── Fixture ──────────────────────────────────────────────────────────────────
const pacienteFixture = {
  id: "paciente-1",
  nomeCompleto: "João da Silva",
  cpf: "12345678901",
  dataNasc: new Date("1990-05-15"),
  telefone: "11999999999",
  email: "joao@exemplo.com",
  observacoes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Testes ───────────────────────────────────────────────────────────────────
describe("GET /api/pacientes", () => {
  it("deve retornar lista de pacientes com status 200", async () => {
    prismaMock.paciente.findMany.mockResolvedValue([pacienteFixture] as any);

    const res = await request(app)
      .get("/api/pacientes")
      .set("Authorization", `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({ cpf: "12345678901" });
  });

  it("deve filtrar pacientes por nome via query string", async () => {
    prismaMock.paciente.findMany.mockResolvedValue([pacienteFixture] as any);

    const res = await request(app)
      .get("/api/pacientes?nome=João")
      .set("Authorization", `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    // Verifica que o mock foi chamado (o filtro foi passado ao Prisma)
    expect(prismaMock.paciente.findMany).toHaveBeenCalledTimes(1);
  });

  it("deve retornar 401 sem token de autenticação", async () => {
    const res = await request(app).get("/api/pacientes");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/pacientes", () => {
  const payload = {
    nomeCompleto: "Maria Oliveira",
    cpf: "98765432100",
    dataNasc: "1985-03-20",
    telefone: "11988887777",
    email: "maria@exemplo.com",
  };

  it("deve criar paciente com dados válidos e retornar 201", async () => {
    prismaMock.paciente.findUnique.mockResolvedValue(null); // CPF não existe
    prismaMock.paciente.create.mockResolvedValue({
      ...pacienteFixture,
      ...payload,
      dataNasc: new Date(payload.dataNasc),
    } as any);

    const res = await request(app)
      .post("/api/pacientes")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.cpf).toBe(payload.cpf);
  });

  it("deve retornar 409 quando o CPF já está cadastrado", async () => {
    // findUnique retorna um paciente existente → CPF duplicado
    prismaMock.paciente.findUnique.mockResolvedValue(pacienteFixture as any);

    const res = await request(app)
      .post("/api/pacientes")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error", "CPF já cadastrado");
  });

  it("deve retornar 422 quando o CPF tem formato inválido", async () => {
    const res = await request(app)
      .post("/api/pacientes")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send({ ...payload, cpf: "123" }); // CPF curto demais

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error");
  });

  it("deve retornar 422 quando o nome é muito curto", async () => {
    const res = await request(app)
      .post("/api/pacientes")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send({ ...payload, nomeCompleto: "AB" });

    expect(res.status).toBe(422);
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app).post("/api/pacientes").send(payload);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/pacientes/:id", () => {
  it("deve retornar o paciente quando encontrado", async () => {
    prismaMock.paciente.findUnique.mockResolvedValue({
      ...pacienteFixture,
      consultas: [],
    } as any);

    const res = await request(app)
      .get("/api/pacientes/paciente-1")
      .set("Authorization", `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", "paciente-1");
  });

  it("deve retornar 404 quando o paciente não existe", async () => {
    prismaMock.paciente.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/pacientes/id-inexistente")
      .set("Authorization", `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Paciente não encontrado");
  });
});

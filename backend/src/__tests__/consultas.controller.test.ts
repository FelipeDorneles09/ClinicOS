/**
 * Testes de integração — /api/consultas
 *
 * Cobre: criação de consulta, conflito de horário, médico/paciente inexistente,
 * atualização de status e restrição de acesso por role.
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { prismaMock } from "../__mocks__/prisma";

process.env.JWT_SECRET = "test_secret_key";

// ─── Helper tokens ────────────────────────────────────────────────────────────
function makeToken(
  role: "ADMIN" | "RECEPCIONISTA" | "MEDICO" = "RECEPCIONISTA",
  id = "user-recep"
) {
  return jwt.sign(
    { id, nome: "Teste", email: "teste@clinicos.com", role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const medicoFixture = {
  id: "medico-1",
  usuarioId: "user-medico",
  deletedAt: null,
  usuario: { nome: "Dr. House" },
};

const pacienteFixture = {
  id: "paciente-1",
  nomeCompleto: "João da Silva",
};

const consultaFixture = {
  id: "consulta-1",
  pacienteId: "paciente-1",
  medicoId: "medico-1",
  dataHora: new Date("2025-06-15T10:00:00.000Z"),
  status: "AGENDADA",
  observacoes: null,
  criadoPorId: "user-recep",
  paciente: { nomeCompleto: "João da Silva" },
  medico: {
    ...medicoFixture,
    usuario: { nome: "Dr. House" },
    especialidades: [],
  },
  criadoPor: { nome: "Recepcionista" },
};

const payloadValido = {
  pacienteId: "paciente-1",
  medicoId: "medico-1",
  dataHora: "2025-06-15T10:00:00.000Z",
  observacoes: "Consulta de rotina",
};

// ─── Testes: criação ──────────────────────────────────────────────────────────
describe("POST /api/consultas", () => {
  it("deve criar consulta com dados válidos e retornar 201", async () => {
    // Sem conflito de horário
    prismaMock.consulta.findFirst.mockResolvedValue(null);
    // Médico e paciente existem
    prismaMock.medico.findUnique.mockResolvedValue(medicoFixture as any);
    prismaMock.paciente.findUnique.mockResolvedValue(pacienteFixture as any);
    // Criação retorna a consulta
    prismaMock.consulta.create.mockResolvedValue(consultaFixture as any);

    const res = await request(app)
      .post("/api/consultas")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send(payloadValido);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id", "consulta-1");
    expect(res.body.status).toBe("AGENDADA");
  });

  it("deve retornar 409 quando há conflito de horário", async () => {
    // findFirst retorna uma consulta existente → conflito
    prismaMock.consulta.findFirst.mockResolvedValue(consultaFixture as any);

    const res = await request(app)
      .post("/api/consultas")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send(payloadValido);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/horário indisponível/i);
  });

  it("deve retornar 404 quando o médico não existe", async () => {
    prismaMock.consulta.findFirst.mockResolvedValue(null); // sem conflito
    prismaMock.medico.findUnique.mockResolvedValue(null);   // médico ausente
    prismaMock.paciente.findUnique.mockResolvedValue(pacienteFixture as any);

    const res = await request(app)
      .post("/api/consultas")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send(payloadValido);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/médico/i);
  });

  it("deve retornar 404 quando o paciente não existe", async () => {
    prismaMock.consulta.findFirst.mockResolvedValue(null);
    prismaMock.medico.findUnique.mockResolvedValue(medicoFixture as any);
    prismaMock.paciente.findUnique.mockResolvedValue(null); // paciente ausente

    const res = await request(app)
      .post("/api/consultas")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send(payloadValido);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/paciente/i);
  });

  it("deve retornar 422 com payload inválido (Zod)", async () => {
    const res = await request(app)
      .post("/api/consultas")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send({ pacienteId: "", medicoId: "", dataHora: "data-invalida" });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error");
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app).post("/api/consultas").send(payloadValido);
    expect(res.status).toBe(401);
  });
});

// ─── Testes: listagem ─────────────────────────────────────────────────────────
describe("GET /api/consultas", () => {
  it("deve listar consultas com status 200 para admin", async () => {
    prismaMock.consulta.findMany.mockResolvedValue([consultaFixture] as any);

    const res = await request(app)
      .get("/api/consultas")
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });
});

// ─── Testes: atualizar status ─────────────────────────────────────────────────
describe("PATCH /api/consultas/:id/status", () => {
  it("deve atualizar status com sucesso para admin", async () => {
    prismaMock.consulta.findUnique.mockResolvedValue({
      ...consultaFixture,
      medico: medicoFixture,
    } as any);
    prismaMock.consulta.update.mockResolvedValue({
      ...consultaFixture,
      status: "CONCLUIDA",
    } as any);

    const res = await request(app)
      .patch("/api/consultas/consulta-1/status")
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`)
      .send({ status: "CONCLUIDA" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("CONCLUIDA");
  });

  it("deve retornar 403 quando médico tenta atualizar consulta de outro médico", async () => {
    prismaMock.consulta.findUnique.mockResolvedValue({
      ...consultaFixture,
      medico: { ...medicoFixture, usuarioId: "outro-medico-id" },
    } as any);

    const res = await request(app)
      .patch("/api/consultas/consulta-1/status")
      .set("Authorization", `Bearer ${makeToken("MEDICO", "user-medico-diferente")}`)
      .send({ status: "CONCLUIDA" });

    expect(res.status).toBe(403);
  });

  it("deve retornar 404 quando a consulta não existe", async () => {
    prismaMock.consulta.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/consultas/id-inexistente/status")
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`)
      .send({ status: "CANCELADA" });

    expect(res.status).toBe(404);
  });

  it("deve retornar 422 com status inválido", async () => {
    const res = await request(app)
      .patch("/api/consultas/consulta-1/status")
      .set("Authorization", `Bearer ${makeToken("ADMIN")}`)
      .send({ status: "INVALIDO" });

    expect(res.status).toBe(422);
  });
});

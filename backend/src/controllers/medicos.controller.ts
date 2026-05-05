import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../lib/prisma";

const criarMedicoSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  crm: z.string().min(4, "CRM inválido"),
  especialidadeIds: z.array(z.string()).min(1, "Informe ao menos uma especialidade"),
});

// GET /api/medicos
export async function listarMedicos(req: Request, res: Response) {
  const { especialidade_id } = req.query;

  const medicos = await prisma.medico.findMany({
    where: {
      deletedAt: null, // apenas médicos ativos (não soft-deletados)
      ...(especialidade_id
        ? { especialidades: { some: { especialidadeId: String(especialidade_id) } } }
        : {}),
    },
    include: {
      usuario: { select: { id: true, nome: true, email: true, ativo: true } },
      especialidades: {
        include: { especialidade: { select: { id: true, nome: true } } },
      },
      _count: { select: { consultas: true } },
    },
    orderBy: { usuario: { nome: "asc" } },
  });

  return res.json(medicos);
}

// POST /api/medicos
export async function criarMedico(req: Request, res: Response) {
  const parse = criarMedicoSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(422).json({ error: parse.error.flatten().fieldErrors });
  }

  const { nome, email, senha, crm, especialidadeIds } = parse.data;

  // Verifica e-mail e CRM únicos
  const [emailExiste, crmExiste] = await Promise.all([
    prisma.usuario.findUnique({ where: { email } }),
    prisma.medico.findUnique({ where: { crm } }),
  ]);

  if (emailExiste) return res.status(409).json({ error: "E-mail já cadastrado" });
  if (crmExiste) return res.status(409).json({ error: "CRM já cadastrado" });

  const senhaHash = await bcrypt.hash(senha, 12);

  const medico = await prisma.medico.create({
    data: {
      crm,
      usuario: { create: { nome, email, senhaHash, role: "MEDICO" } },
      especialidades: {
        create: especialidadeIds.map((id) => ({ especialidadeId: id })),
      },
    },
    include: {
      usuario: { select: { id: true, nome: true, email: true } },
      especialidades: { include: { especialidade: true } },
    },
  });

  return res.status(201).json(medico);
}

// GET /api/medicos/:id/agenda
export async function agendaMedico(req: Request, res: Response) {
  const { id } = req.params;
  const { data } = req.query;

  const targetDate = data ? new Date(String(data)) : new Date();
  const inicio = new Date(targetDate);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(targetDate);
  fim.setHours(23, 59, 59, 999);

  const medico = await prisma.medico.findUnique({
    where: { id },
    include: { usuario: { select: { nome: true } } },
  });

  if (!medico) {
    return res.status(404).json({ error: "Médico não encontrado" });
  }

  const consultas = await prisma.consulta.findMany({
    where: {
      medicoId: id,
      dataHora: { gte: inicio, lte: fim },
    },
    include: {
      paciente: { select: { id: true, nomeCompleto: true, cpf: true, telefone: true } },
    },
    orderBy: { dataHora: "asc" },
  });

  return res.json({ medico, consultas });
}

// DELETE /api/medicos/:id  — Soft Delete
export async function softDeleteMedico(req: Request, res: Response) {
  const { id } = req.params;

  const medico = await prisma.medico.findUnique({ where: { id } });
  if (!medico) {
    return res.status(404).json({ error: "Médico não encontrado" });
  }

  if (medico.deletedAt) {
    return res.status(409).json({ error: "Médico já está inativo" });
  }

  const atualizado = await prisma.medico.update({
    where: { id },
    data: { deletedAt: new Date() },
    include: { usuario: { select: { nome: true } } },
  });

  return res.json({
    message: `Médico ${atualizado.usuario.nome} desativado com sucesso`,
    deletedAt: atualizado.deletedAt,
  });
}

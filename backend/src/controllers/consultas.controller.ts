import { Request, Response } from "express";
import { z } from "zod";
import { StatusConsulta } from "@prisma/client";
import prisma from "../lib/prisma";

const criarConsultaSchema = z.object({
  pacienteId: z.string().min(1, "Paciente obrigatório"),
  medicoId: z.string().min(1, "Médico obrigatório"),
  dataHora: z.string().refine((d) => !isNaN(Date.parse(d)), "Data/hora inválida"),
  observacoes: z.string().optional(),
});

const atualizarStatusSchema = z.object({
  status: z.enum(["AGENDADA", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"]),
  observacoes: z.string().optional(),
});

// GET /api/consultas?medico_id=&data=&status=
export async function listarConsultas(req: Request, res: Response) {
  const { medico_id, data, status } = req.query;

  let dataFiltro = {};
  if (data) {
    const d = new Date(String(data));
    const inicio = new Date(d);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(d);
    fim.setHours(23, 59, 59, 999);
    dataFiltro = { gte: inicio, lte: fim };
  }

  const consultas = await prisma.consulta.findMany({
    where: {
      ...(medico_id ? { medicoId: String(medico_id) } : {}),
      ...(data ? { dataHora: dataFiltro } : {}),
      ...(status ? { status: status as StatusConsulta } : {}),
    },
    include: {
      paciente: { select: { id: true, nomeCompleto: true, cpf: true } },
      medico: {
        include: {
          usuario: { select: { nome: true } },
          especialidades: { include: { especialidade: { select: { nome: true } } } },
        },
      },
      criadoPor: { select: { nome: true } },
    },
    orderBy: { dataHora: "asc" },
  });

  return res.json(consultas);
}

// GET /api/consultas/agenda-hoje — apenas o médico logado
export async function agendaHoje(req: Request, res: Response) {
  const userId = req.user!.id;

  const medico = await prisma.medico.findUnique({ where: { usuarioId: userId } });
  if (!medico) {
    return res.status(404).json({ error: "Perfil de médico não encontrado" });
  }

  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(hoje);
  fim.setHours(23, 59, 59, 999);

  const consultas = await prisma.consulta.findMany({
    where: {
      medicoId: medico.id,
      dataHora: { gte: inicio, lte: fim },
    },
    include: {
      paciente: {
        select: { id: true, nomeCompleto: true, cpf: true, telefone: true, dataNasc: true },
      },
    },
    orderBy: { dataHora: "asc" },
  });

  return res.json({ medicoId: medico.id, data: hoje.toISOString().split("T")[0], consultas });
}

// POST /api/consultas
export async function criarConsulta(req: Request, res: Response) {
  const parse = criarConsultaSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(422).json({ error: parse.error.flatten().fieldErrors });
  }

  const { pacienteId, medicoId, dataHora, observacoes } = parse.data;
  const dataHoraDate = new Date(dataHora);

  // ─── Dupla verificação de conflito ──────────────────────────────────────
  // Nível 1 (API): retorna erro 409 semântico antes de tocar no banco
  const conflito = await prisma.consulta.findFirst({
    where: {
      medicoId,
      dataHora: dataHoraDate,
      status: { not: "CANCELADA" },
    },
  });

  if (conflito) {
    return res.status(409).json({
      error: "Horário indisponível. Este médico já possui consulta agendada neste horário.",
    });
  }

  // Valida existências
  const [medico, paciente] = await Promise.all([
    prisma.medico.findUnique({ where: { id: medicoId } }),
    prisma.paciente.findUnique({ where: { id: pacienteId } }),
  ]);

  if (!medico || medico.deletedAt) {
    return res.status(404).json({ error: "Médico não encontrado ou inativo" });
  }
  if (!paciente) {
    return res.status(404).json({ error: "Paciente não encontrado" });
  }

  try {
    const consulta = await prisma.consulta.create({
      data: {
        pacienteId,
        medicoId,
        dataHora: dataHoraDate,
        observacoes,
        criadoPorId: req.user!.id,
      },
      include: {
        paciente: { select: { nomeCompleto: true } },
        medico: { include: { usuario: { select: { nome: true } } } },
      },
    });

    return res.status(201).json(consulta);
  } catch (err: unknown) {
    // Nível 2 (DB): unique constraint do Prisma/PostgreSQL capturado aqui
    if ((err as { code?: string }).code === "P2002") {
      return res.status(409).json({
        error: "Conflito de horário detectado pelo banco de dados.",
      });
    }
    throw err;
  }
}

// PATCH /api/consultas/:id/status
export async function atualizarStatus(req: Request, res: Response) {
  const { id } = req.params;

  const parse = atualizarStatusSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(422).json({ error: parse.error.flatten().fieldErrors });
  }

  const { status, observacoes } = parse.data;

  const consulta = await prisma.consulta.findUnique({
    where: { id },
    include: { medico: true },
  });

  if (!consulta) {
    return res.status(404).json({ error: "Consulta não encontrada" });
  }

  // Médico só pode atualizar as próprias consultas
  if (req.user!.role === "MEDICO" && consulta.medico.usuarioId !== req.user!.id) {
    return res.status(403).json({ error: "Você só pode atualizar suas próprias consultas" });
  }

  const atualizada = await prisma.consulta.update({
    where: { id },
    data: {
      status,
      ...(observacoes !== undefined && { observacoes }),
    },
    include: {
      paciente: { select: { nomeCompleto: true } },
      medico: { include: { usuario: { select: { nome: true } } } },
    },
  });

  return res.json(atualizada);
}

import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";

const criarPacienteSchema = z.object({
  nomeCompleto: z.string().min(3, "Nome muito curto"),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter 11 dígitos numéricos (sem pontos ou traços)"),
  dataNasc: z.string().refine((d) => !isNaN(Date.parse(d)), "Data inválida"),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  observacoes: z.string().optional(),
});

// GET /api/pacientes?cpf=&nome=
export async function listarPacientes(req: Request, res: Response) {
  const { cpf, nome } = req.query;

  const pacientes = await prisma.paciente.findMany({
    where: {
      ...(cpf ? { cpf: { contains: String(cpf) } } : {}),
      ...(nome
        ? { nomeCompleto: { contains: String(nome), mode: "insensitive" } }
        : {}),
    },
    orderBy: { nomeCompleto: "asc" },
    take: 50,
  });

  return res.json(pacientes);
}

// POST /api/pacientes
export async function criarPaciente(req: Request, res: Response) {
  const parse = criarPacienteSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(422).json({ error: parse.error.flatten().fieldErrors });
  }

  const { nomeCompleto, cpf, dataNasc, telefone, email, observacoes } = parse.data;

  const cpfExiste = await prisma.paciente.findUnique({ where: { cpf } });
  if (cpfExiste) {
    return res.status(409).json({ error: "CPF já cadastrado" });
  }

  const paciente = await prisma.paciente.create({
    data: {
      nomeCompleto,
      cpf,
      dataNasc: new Date(dataNasc),
      telefone,
      email: email || null,
      observacoes,
    },
  });

  return res.status(201).json(paciente);
}

// GET /api/pacientes/:id
export async function buscarPaciente(req: Request, res: Response) {
  const { id } = req.params;

  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: {
      consultas: {
        include: {
          medico: {
            include: { usuario: { select: { nome: true } } },
          },
        },
        orderBy: { dataHora: "desc" },
        take: 20,
      },
    },
  });

  if (!paciente) {
    return res.status(404).json({ error: "Paciente não encontrado" });
  }

  return res.json(paciente);
}

// PUT /api/pacientes/:id
export async function editarPaciente(req: Request, res: Response) {
  const { id } = req.params;

  const paciente = await prisma.paciente.findUnique({ where: { id } });
  if (!paciente) {
    return res.status(404).json({ error: "Paciente não encontrado" });
  }

  const parse = criarPacienteSchema.partial().safeParse(req.body);
  if (!parse.success) {
    return res.status(422).json({ error: parse.error.flatten().fieldErrors });
  }

  const { nomeCompleto, cpf, dataNasc, telefone, email, observacoes } = parse.data;

  // Verifica se o novo CPF já pertence a outro paciente
  if (cpf && cpf !== paciente.cpf) {
    const cpfExiste = await prisma.paciente.findUnique({ where: { cpf } });
    if (cpfExiste) {
      return res.status(409).json({ error: "CPF já cadastrado em outro paciente" });
    }
  }

  const atualizado = await prisma.paciente.update({
    where: { id },
    data: {
      ...(nomeCompleto && { nomeCompleto }),
      ...(cpf && { cpf }),
      ...(dataNasc && { dataNasc: new Date(dataNasc) }),
      ...(telefone !== undefined && { telefone }),
      ...(email !== undefined && { email: email || null }),
      ...(observacoes !== undefined && { observacoes }),
    },
  });

  return res.json(atualizado);
}

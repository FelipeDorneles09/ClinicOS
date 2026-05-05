import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";

const criarSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  descricao: z.string().optional(),
});

// GET /api/especialidades
export async function listarEspecialidades(_req: Request, res: Response) {
  const especialidades = await prisma.especialidade.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { medicos: true } } },
  });

  return res.json(especialidades);
}

// POST /api/especialidades
export async function criarEspecialidade(req: Request, res: Response) {
  const parse = criarSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(422).json({ error: parse.error.flatten().fieldErrors });
  }

  const { nome, descricao } = parse.data;

  const existe = await prisma.especialidade.findUnique({ where: { nome } });
  if (existe) {
    return res.status(409).json({ error: "Especialidade já cadastrada" });
  }

  const especialidade = await prisma.especialidade.create({
    data: { nome, descricao },
  });

  return res.status(201).json(especialidade);
}

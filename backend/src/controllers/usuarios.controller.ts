import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../lib/prisma";

const criarUsuarioSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  role: z.enum(["ADMIN", "RECEPCIONISTA", "MEDICO"]),
});

// GET /api/usuarios
export async function listarUsuarios(_req: Request, res: Response) {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      ativo: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(usuarios);
}

// POST /api/usuarios
export async function criarUsuario(req: Request, res: Response) {
  const parse = criarUsuarioSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(422).json({ error: parse.error.flatten().fieldErrors });
  }

  const { nome, email, senha, role } = parse.data;

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) {
    return res.status(409).json({ error: "E-mail já cadastrado" });
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const usuario = await prisma.usuario.create({
    data: { nome, email, senhaHash, role },
    select: { id: true, nome: true, email: true, role: true, ativo: true, createdAt: true },
  });

  return res.status(201).json(usuario);
}

// PATCH /api/usuarios/:id/toggle-ativo
export async function toggleAtivo(req: Request, res: Response) {
  const { id } = req.params;

  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  // Impede desativar o próprio admin logado
  if (id === req.user!.id) {
    return res.status(400).json({ error: "Você não pode desativar seu próprio usuário" });
  }

  const atualizado = await prisma.usuario.update({
    where: { id },
    data: { ativo: !usuario.ativo },
    select: { id: true, nome: true, email: true, role: true, ativo: true },
  });

  return res.json(atualizado);
}

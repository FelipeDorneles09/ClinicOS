import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ─── Status helpers ──────────────────────────────────────────────────────────
export type StatusConsulta =
  | "AGENDADA"
  | "EM_ANDAMENTO"
  | "CONCLUIDA"
  | "CANCELADA";

export const STATUS_LABELS: Record<StatusConsulta, string> = {
  AGENDADA: "Agendada",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const STATUS_COLORS: Record<StatusConsulta, string> = {
  AGENDADA: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  EM_ANDAMENTO: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  CONCLUIDA: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  CANCELADA: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

// ─── CPF formatting ──────────────────────────────────────────────────────────
export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// ─── Date helpers ────────────────────────────────────────────────────────────
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calcAge(dataNasc: string): number {
  const today = new Date();
  const birth = new Date(dataNasc);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

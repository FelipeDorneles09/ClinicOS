export type StatusConsulta = "AGENDADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";

const STATUS_CONFIG: Record<
  StatusConsulta,
  { label: string; dot: string; bg: string; text: string }
> = {
  AGENDADA:     { label: "Agendada",     dot: "bg-info",    bg: "bg-info/10",    text: "text-info" },
  EM_ANDAMENTO: { label: "Em andamento", dot: "bg-warning", bg: "bg-warning/10", text: "text-warning" },
  CONCLUIDA:    { label: "Concluída",    dot: "bg-success", bg: "bg-success/10", text: "text-success" },
  CANCELADA:    { label: "Cancelada",    dot: "bg-danger",  bg: "bg-danger/10",  text: "text-danger" },
};

interface StatusBadgeProps {
  status: StatusConsulta;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const px = size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px} ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} pulse-dot`} />
      {cfg.label}
    </span>
  );
}

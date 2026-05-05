"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Clock, ArrowRight } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonTable } from "@/components/Skeletons";
import { formatTime, formatDate, calcAge, type StatusConsulta } from "@/lib/utils";

interface Consulta {
  id: string; dataHora: string; status: StatusConsulta; observacoes: string | null;
  paciente: { nomeCompleto: string; cpf: string; dataNasc: string; telefone: string | null };
}

const PROXIMOS: Record<StatusConsulta, StatusConsulta | null> = {
  AGENDADA: "EM_ANDAMENTO", EM_ANDAMENTO: "CONCLUIDA", CONCLUIDA: null, CANCELADA: null,
};
const LABELS_ACAO: Partial<Record<StatusConsulta, string>> = {
  AGENDADA: "Iniciar atendimento", EM_ANDAMENTO: "Concluir consulta",
};

export default function MedicoPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get("/consultas/agenda-hoje");
    setConsultas(data.consultas); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function handleStatus(consulta: Consulta) {
    const proximo = PROXIMOS[consulta.status];
    if (!proximo) return;
    setUpdating(consulta.id);
    try {
      await api.patch(`/consultas/${consulta.id}/status`, { status: proximo });
      toast.success(`Status: ${proximo.replace("_", " ")}`);
      load();
    } catch { toast.error("Erro ao atualizar status"); }
    finally { setUpdating(null); }
  }

  const agendadas   = consultas.filter(c => c.status === "AGENDADA").length;
  const emAndamento = consultas.filter(c => c.status === "EM_ANDAMENTO").length;
  const concluidas  = consultas.filter(c => c.status === "CONCLUIDA").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bodydark">Minha Agenda</h1>
        <p className="mt-1 text-sm text-bodydark2">{formatDate(new Date().toISOString())} · {consultas.length} consulta(s)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: "Aguardando",    value: agendadas,   icon: Clock,         iconBg: "bg-info/10",    iconColor: "text-info" },
          { label: "Em andamento",  value: emAndamento, icon: CalendarCheck, iconBg: "bg-warning/10", iconColor: "text-warning" },
          { label: "Concluídas",    value: concluidas,  icon: CalendarCheck, iconBg: "bg-success/10", iconColor: "text-success" },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Consultas */}
      {loading ? <SkeletonTable rows={4} /> : consultas.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <CalendarCheck size={44} className="text-bodydark2/30 mb-3" weight="duotone" />
          <p className="text-base font-semibold text-bodydark">Agenda vazia por hoje</p>
          <p className="mt-1 text-sm text-bodydark2">Aproveite para revisar seus prontuários</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultas.map((c, i) => {
            const proximo = PROXIMOS[c.status];
            const acao = LABELS_ACAO[c.status];
            const isActive = c.status === "EM_ANDAMENTO";
            return (
              <motion.div key={c.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`card p-5 flex items-center justify-between gap-4 transition-all ${
                  isActive ? "border-warning/40 bg-warning/5" : ""
                }`}>
                {/* Left: time + patient */}
                <div className="flex items-center gap-5 min-w-0">
                  <div className="flex flex-col items-center flex-shrink-0 text-center w-14">
                    <Clock size={13} className="text-bodydark2 mb-1" />
                    <span className="font-mono text-lg font-bold text-bodydark leading-none">
                      {formatTime(c.dataHora)}
                    </span>
                  </div>
                  <div className="h-10 w-px bg-stroke flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-bodydark truncate">{c.paciente.nomeCompleto}</p>
                    <p className="text-xs text-bodydark2 mt-0.5">
                      {calcAge(c.paciente.dataNasc)} anos
                      {c.paciente.telefone ? ` · ${c.paciente.telefone}` : ""}
                    </p>
                    {c.observacoes && (
                      <p className="mt-1 text-xs text-bodydark2 italic truncate">{c.observacoes}</p>
                    )}
                  </div>
                </div>

                {/* Right: status + action */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={c.status} />
                  {proximo && acao && (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      disabled={updating === c.id}
                      onClick={() => handleStatus(c)}
                      className="flex items-center gap-1.5 rounded border border-stroke px-3 py-2 text-xs font-semibold text-bodydark hover:border-primary hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50">
                      {updating === c.id ? "..." : acao}
                      {updating !== c.id && <ArrowRight size={12} />}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

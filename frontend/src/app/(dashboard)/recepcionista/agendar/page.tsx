"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Warning, CheckCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { formatCPF, formatTime } from "@/lib/utils";

interface Medico {
  id: string; crm: string;
  usuario: { nome: string };
  especialidades: { especialidade: { nome: string } }[];
}
interface Paciente { id: string; nomeCompleto: string; cpf: string; }

const HORARIOS = [
  "07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00",
];

const inputCls = "w-full rounded border border-stroke bg-boxdark-2 px-4 py-2.5 text-sm text-bodydark placeholder-bodydark2 focus:border-primary focus:outline-none transition-colors";

export default function AgendarPage() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [buscaPac, setBuscaPac] = useState("");
  const [selectedMedico, setSelectedMedico] = useState("");
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [selectedData, setSelectedData] = useState(new Date().toISOString().split("T")[0]);
  const [selectedHorario, setSelectedHorario] = useState("");
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { api.get("/medicos").then(r => setMedicos(r.data)); }, []);

  useEffect(() => {
    if (!buscaPac) { setPacientes([]); return; }
    const t = setTimeout(async () => {
      const isNum = buscaPac.replace(/\D/g, "").length === 11;
      const param = isNum ? `?cpf=${buscaPac.replace(/\D/g, "")}` : `?nome=${buscaPac}`;
      const { data } = await api.get(`/pacientes${param}`);
      setPacientes(data);
    }, 300);
    return () => clearTimeout(t);
  }, [buscaPac]);

  const loadSlots = useCallback(async () => {
    if (!selectedMedico || !selectedData) return;
    const { data } = await api.get(`/consultas?medico_id=${selectedMedico}&data=${selectedData}`);
    setOcupados((data as { dataHora: string }[]).map(c => formatTime(c.dataHora)));
    setSelectedHorario("");
  }, [selectedMedico, selectedData]);
  useEffect(() => { loadSlots(); }, [loadSlots]);

  async function handleAgendar() {
    if (!selectedPaciente || !selectedMedico || !selectedHorario) {
      toast.error("Preencha todos os campos"); return;
    }
    setSaving(true);
    const [h, m] = selectedHorario.split(":");
    const dataHora = new Date(`${selectedData}T${h.padStart(2,"0")}:${m}:00`).toISOString();
    try {
      await api.post("/consultas", { pacienteId: selectedPaciente.id, medicoId: selectedMedico, dataHora });
      setSuccess(true);
      toast.success("Consulta agendada com sucesso!");
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Erro ao agendar");
    } finally { setSaving(false); }
  }

  function reset() {
    setSuccess(false); setSelectedMedico(""); setSelectedPaciente(null);
    setBuscaPac(""); setSelectedHorario("");
    setSelectedData(new Date().toISOString().split("T")[0]);
  }

  const medicoSel = medicos.find(m => m.id === selectedMedico);
  const step = (n: number, label: string) => (
    <div className="flex items-center gap-2 mb-4">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{n}</span>
      <h2 className="text-sm font-bold text-bodydark">{label}</h2>
    </div>
  );

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="card max-w-sm w-full p-10 text-center space-y-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle size={32} weight="fill" className="text-success" />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold text-bodydark">Consulta agendada!</h2>
            <p className="mt-1 text-sm text-bodydark2">{selectedPaciente?.nomeCompleto}</p>
            <p className="font-mono text-xs text-bodydark2 mt-1">{selectedData} às {selectedHorario}</p>
          </div>
          <button onClick={reset}
            className="w-full rounded border border-stroke py-2.5 text-sm font-medium text-bodydark hover:bg-meta-4 transition-colors">
            Agendar outra consulta
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-bodydark">Agendar Consulta</h1>
        <p className="mt-1 text-sm text-bodydark2">Siga os passos para criar um novo agendamento</p>
      </div>

      {/* Step 1 — Paciente */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }} className="card p-6">
        {step(1, "Paciente")}
        {selectedPaciente ? (
          <div className="flex items-center justify-between rounded border border-success/20 bg-success/5 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-bodydark">{selectedPaciente.nomeCompleto}</p>
              <p className="font-mono text-xs text-bodydark2">{formatCPF(selectedPaciente.cpf)}</p>
            </div>
            <button onClick={() => { setSelectedPaciente(null); setBuscaPac(""); }}
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">Trocar</button>
          </div>
        ) : (
          <div className="space-y-2">
            <input value={buscaPac} onChange={e => setBuscaPac(e.target.value)}
              placeholder="Buscar por nome ou CPF..." className={inputCls} />
            {pacientes.length > 0 && (
              <div className="rounded border border-stroke bg-boxdark-2 overflow-hidden">
                {pacientes.map(p => (
                  <button key={p.id} type="button"
                    onClick={() => { setSelectedPaciente(p); setBuscaPac(""); setPacientes([]); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-meta-4 border-b border-stroke last:border-0 transition-colors">
                    <span className="text-sm font-semibold text-bodydark">{p.nomeCompleto}</span>
                    <span className="font-mono text-xs text-bodydark2">{formatCPF(p.cpf)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Step 2 — Médico + Data */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }} className="card p-6">
        {step(2, "Médico e data")}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-bodydark2 uppercase tracking-wide">Médico</label>
            <select value={selectedMedico} onChange={e => setSelectedMedico(e.target.value)} className={inputCls}>
              <option value="">Selecionar...</option>
              {medicos.map(m => (
                <option key={m.id} value={m.id}>
                  {m.usuario.nome} · {m.especialidades[0]?.especialidade.nome ?? ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-bodydark2 uppercase tracking-wide">Data</label>
            <input type="date" value={selectedData}
              min={new Date().toISOString().split("T")[0]}
              onChange={e => setSelectedData(e.target.value)} className={inputCls} />
          </div>
        </div>
        {medicoSel && (
          <p className="mt-3 text-xs text-bodydark2">
            CRM: <span className="font-mono">{medicoSel.crm}</span> ·{" "}
            {medicoSel.especialidades.map(e => e.especialidade.nome).join(", ")}
          </p>
        )}
      </motion.div>

      {/* Step 3 — Horário */}
      {selectedMedico && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          {step(3, "Horário disponível")}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {HORARIOS.map(h => {
              const ocupado = ocupados.includes(h);
              const sel = selectedHorario === h;
              return (
                <motion.button key={h} type="button" disabled={ocupado}
                  whileTap={!ocupado ? { scale: 0.93 } : undefined}
                  onClick={() => !ocupado && setSelectedHorario(h)}
                  className={`rounded py-2.5 font-mono text-xs font-semibold transition-all ${
                    ocupado
                      ? "bg-meta-4/40 text-bodydark2/40 cursor-not-allowed line-through"
                      : sel
                        ? "bg-primary text-white shadow-md"
                        : "bg-meta-4 text-bodydark hover:bg-stroke hover:text-bodydark"
                  }`}>
                  {h}
                </motion.button>
              );
            })}
          </div>
          {ocupados.length > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-bodydark2">
              <Warning size={12} className="text-warning" />
              {ocupados.length} horário(s) indisponível(is) nesta data
            </p>
          )}
        </motion.div>
      )}

      {/* Confirm */}
      <motion.button onClick={handleAgendar}
        disabled={saving || !selectedPaciente || !selectedMedico || !selectedHorario}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md">
        <CalendarCheck size={18} weight="fill" />
        {saving ? "Agendando..." : "Confirmar Agendamento"}
      </motion.button>
    </div>
  );
}

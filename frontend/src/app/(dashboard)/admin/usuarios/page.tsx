"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, Plus, X, ToggleLeft, ToggleRight } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { SkeletonTable } from "@/components/Skeletons";
import { ROLE_LABELS, type AuthUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

type Role = "ADMIN" | "RECEPCIONISTA" | "MEDICO";
interface Usuario { id: string; nome: string; email: string; role: Role; ativo: boolean; createdAt: string; }

const ROLE_STYLES: Record<Role, string> = {
  ADMIN:         "bg-primary/10 text-primary border border-primary/20",
  RECEPCIONISTA: "bg-info/10 text-info border border-info/20",
  MEDICO:        "bg-success/10 text-success border border-success/20",
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", role: "RECEPCIONISTA" as Role });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get("/usuarios");
    setUsuarios(data); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function handleToggle(id: string, nome: string, ativo: boolean) {
    if (!confirm(`Deseja ${ativo ? "desativar" : "ativar"} o usuário ${nome}?`)) return;
    try {
      await api.patch(`/usuarios/${id}/toggle-ativo`);
      toast.success(`Usuário ${ativo ? "desativado" : "ativado"}`);
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Erro");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/usuarios", form);
      toast.success("Usuário criado!");
      setShowModal(false);
      setForm({ nome: "", email: "", senha: "", role: "RECEPCIONISTA" });
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Erro ao criar");
    } finally { setSaving(false); }
  }

  const inputCls = "w-full rounded border border-stroke bg-boxdark-2 px-4 py-2.5 text-sm text-bodydark placeholder-bodydark2 focus:border-primary focus:outline-none transition-colors";
  const ativos = usuarios.filter(u => u.ativo).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bodydark">Usuários do Sistema</h1>
          <p className="mt-1 text-sm text-bodydark2">
            <span className="text-success font-medium">{ativos} ativos</span>
            {" · "}
            <span className="text-danger font-medium">{usuarios.length - ativos} inativos</span>
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-md">
          <Plus size={16} weight="bold" /> Novo Usuário
        </motion.button>
      </div>

      {loading ? <SkeletonTable rows={5} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="table-header">
              <tr className="border-b border-stroke text-left">
                {["Usuário", "Perfil", "Cadastro", "Status", ""].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-bodydark2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke/60">
              {usuarios.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`hover:bg-meta-4/40 transition-colors ${!u.ativo ? "opacity-50" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {u.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-bodydark">{u.nome}</p>
                        <p className="text-xs text-bodydark2">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[u.role]}`}>
                      {ROLE_LABELS[u.role as AuthUser["role"]]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-bodydark2 font-mono">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.ativo ? "text-success" : "text-bodydark2"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.ativo ? "bg-success" : "bg-bodydark2"}`} />
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggle(u.id, u.nome, u.ativo)}
                      className={`transition-colors ${u.ativo ? "text-bodydark2 hover:text-danger" : "text-bodydark2 hover:text-success"}`}
                      title={u.ativo ? "Desativar" : "Ativar"}>
                      {u.ativo ? <ToggleRight size={22} weight="fill" /> : <ToggleLeft size={22} />}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="card w-full max-w-sm p-6 space-y-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-stroke pb-4">
                <h2 className="text-base font-bold text-bodydark">Novo Usuário</h2>
                <button onClick={() => setShowModal(false)} className="text-bodydark2 hover:text-danger transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                {[
                  { id: "nome",  label: "Nome",   type: "text",     val: form.nome,  set: (v: string) => setForm(f => ({ ...f, nome: v })) },
                  { id: "email", label: "E-mail", type: "email",    val: form.email, set: (v: string) => setForm(f => ({ ...f, email: v })) },
                  { id: "senha", label: "Senha",  type: "password", val: form.senha, set: (v: string) => setForm(f => ({ ...f, senha: v })) },
                ].map(field => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-bodydark2 uppercase tracking-wide">{field.label}</label>
                    <input required type={field.type} value={field.val} onChange={e => field.set(e.target.value)} className={inputCls} />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bodydark2 uppercase tracking-wide">Perfil</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                    className={inputCls}>
                    <option value="RECEPCIONISTA">Recepcionista</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.98 }}
                  className="w-full rounded bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 transition-colors">
                  {saving ? "Criando..." : "Criar Usuário"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

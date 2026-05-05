"use client";

import { usePathname } from "next/navigation";
import { Bell, List } from "@phosphor-icons/react";
import { type AuthUser, ROLE_LABELS } from "@/lib/auth";

const BREADCRUMB_MAP: Record<string, string> = {
  "/admin":                     "Painel Administrativo",
  "/admin/medicos":             "Corpo Clínico",
  "/admin/usuarios":            "Usuários",
  "/recepcionista":             "Central de Atendimento",
  "/recepcionista/pacientes":   "Pacientes",
  "/recepcionista/agendar":     "Agendar Consulta",
  "/medico":                    "Minha Agenda",
};

interface TopbarProps {
  user: AuthUser;
  onMenuClick: () => void;
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const pageTitle = BREADCRUMB_MAP[pathname] ?? "ClinicOS";

  const initials = user.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex w-full items-center bg-boxdark border-b border-stroke px-4 sm:px-6 h-16 shadow-md flex-shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-bodydark2 hover:bg-meta-4 hover:text-bodydark transition-colors"
        aria-label="Abrir menu"
      >
        <List size={22} />
      </button>

      {/* Breadcrumb */}
      <div className="flex flex-col justify-center min-w-0">
        <nav className="flex items-center gap-1.5 text-xs text-bodydark2 truncate">
          <span className="hidden sm:inline">ClinicOS</span>
          <span className="hidden sm:inline">/</span>
          <span className="text-bodydark font-semibold truncate">{pageTitle}</span>
        </nav>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-meta-4 text-bodydark2 transition-colors hover:bg-stroke hover:text-bodydark">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        {/* User chip */}
        <div className="flex items-center gap-2 rounded-full bg-meta-4 py-1.5 pl-1.5 pr-3 border border-stroke">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-bodydark leading-none">{user.nome.split(" ")[0]}</p>
            <p className="text-[10px] text-bodydark2 mt-0.5">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

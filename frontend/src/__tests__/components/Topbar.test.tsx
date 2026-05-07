/**
 * Testes do componente Topbar.
 *
 * O Topbar usa `usePathname` do Next.js, então mockamos o módulo
 * para controlar o pathname durante o teste sem depender do router real.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Topbar } from "@/components/Topbar";
import { type AuthUser } from "@/lib/auth";

// ─── Mock do Next.js navigation ──────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/recepcionista"),
}));

// ─── Mock dos ícones do Phosphor (evita erros de SVG no jsdom) ───────────────
vi.mock("@phosphor-icons/react", () => ({
  Bell: () => <svg data-testid="icon-bell" />,
  List: () => <svg data-testid="icon-list" />,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const userAdmin: AuthUser = {
  id: "u1",
  nome: "Felipe Dorneles",
  email: "felipe@clinicos.com",
  role: "ADMIN",
};

const userMedico: AuthUser = {
  id: "u2",
  nome: "Dr. Marcus House",
  email: "house@clinicos.com",
  role: "MEDICO",
};

// ─── Testes ───────────────────────────────────────────────────────────────────
describe("Topbar", () => {
  const onMenuClick = vi.fn();

  beforeEach(() => {
    onMenuClick.mockClear();
  });

  it("deve renderizar o primeiro nome do usuário", () => {
    render(<Topbar user={userAdmin} onMenuClick={onMenuClick} />);
    // O componente exibe apenas o primeiro nome
    expect(screen.getByText("Felipe")).toBeInTheDocument();
  });

  it("deve exibir o label de role correto para ADMIN", () => {
    render(<Topbar user={userAdmin} onMenuClick={onMenuClick} />);
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });

  it("deve exibir o label de role correto para MEDICO", () => {
    render(<Topbar user={userMedico} onMenuClick={onMenuClick} />);
    expect(screen.getByText("Médico")).toBeInTheDocument();
  });

  it("deve exibir as iniciais corretas do usuário", () => {
    render(<Topbar user={userAdmin} onMenuClick={onMenuClick} />);
    // "Felipe Dorneles" → iniciais "FD"
    expect(screen.getByText("FD")).toBeInTheDocument();
  });

  it("deve exibir o breadcrumb da página baseado no pathname mockado", () => {
    render(<Topbar user={userAdmin} onMenuClick={onMenuClick} />);
    // pathname = "/recepcionista" → "Central de Atendimento"
    expect(screen.getByText("Central de Atendimento")).toBeInTheDocument();
  });

  it("deve chamar onMenuClick ao clicar no botão de menu", async () => {
    const user = userEvent.setup();
    render(<Topbar user={userAdmin} onMenuClick={onMenuClick} />);

    const menuBtn = screen.getByRole("button", { name: /abrir menu/i });
    await user.click(menuBtn);

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar o ícone de notificações", () => {
    render(<Topbar user={userAdmin} onMenuClick={onMenuClick} />);
    expect(screen.getByTestId("icon-bell")).toBeInTheDocument();
  });
});

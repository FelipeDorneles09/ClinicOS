import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClinicOS — Sistema de Gestão Clínica",
  description:
    "Plataforma de gestão hospitalar com agendamento inteligente, prontuário digital e controle de acesso por perfil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-bg-body text-bodydark">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#24303F",
              color: "#DEE4EE",
              border: "1px solid #2E3A47",
              borderRadius: "0.625rem",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#24303F" },
            },
            error: {
              iconTheme: { primary: "#D34053", secondary: "#24303F" },
            },
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard-client";

export const metadata: Metadata = {
  title: "Painel do Sr. Flávio - Controle Financeiro",
  description: "Dashboard financeiro pessoal intuitivo com acompanhamento de despesas fixas, variáveis e escala de parcelamentos, especialmente otimizado para acessibilidade.",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <DashboardClient />
    </main>
  );
}

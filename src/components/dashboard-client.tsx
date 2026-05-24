"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Zap, 
  Calendar, 
  CreditCard, 
  Percent, 
  CheckCircle,
  Sparkles,
  Type
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";

// Configuração para Recharts
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

// ==========================================================================
// 1. ESTRUTURA DE DADOS INICIAL E CONSTANTES
// ==========================================================================

interface Expense {
  id: string;
  name: string;
  type: "consumption" | "fixed" | "installment" | "adjustment";
  value: number;
  isAsterisk: boolean;
  installments?: {
    current: number;
    total: number;
  } | null;
}

interface MonthData {
  id: string;
  name: string;
  proventos: number;
  expenses: Expense[];
}

const MONTHS_ORDER = [
  "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

const MONTH_NAMES: Record<string, string> = {
  abril: "Abril",
  maio: "Maio",
  junho: "Junho",
  julho: "Julho",
  agosto: "Agosto",
  setembro: "Setembro",
  outubro: "Outubro",
  novembro: "Novembro",
  dezembro: "Dezembro"
};

// Despesas gerais descritas inicialmente (Valores de Abril)
const INITIAL_GENERAL_EXPENSES: Expense[] = [
  { id: "sabesp", name: "Sabesp*", type: "consumption", value: 100.00, isAsterisk: true },
  { id: "cpfl", name: "CPFL*", type: "consumption", value: 414.95, isAsterisk: true },
  { id: "iptu", name: "IPTU", type: "fixed", value: 100.78, isAsterisk: false },
  { id: "play_ps5", name: "Play PS5", type: "fixed", value: 44.90, isAsterisk: false },
  { id: "google", name: "Google", type: "fixed", value: 96.99, isAsterisk: false },
  { id: "celular", name: "Celular", type: "fixed", value: 64.90, isAsterisk: false },
  { id: "gato", name: "Gato", type: "fixed", value: 50.00, isAsterisk: false },
  { id: "prevent", name: "Prevent", type: "fixed", value: 796.12, isAsterisk: false },
  { id: "nubank", name: "Nubank*", type: "consumption", value: 400.00, isAsterisk: true },
];

// Despesas específicas e parceladas de Abril
const INITIAL_APRIL_SPECIFIC_EXPENSES: Expense[] = [
  { id: "casa", name: "Casa", type: "fixed", value: 1500.00, isAsterisk: false },
  { id: "vivo", name: "Vivo", type: "fixed", value: 150.00, isAsterisk: false },
  { id: "osan", name: "OSAN", type: "fixed", value: 65.00, isAsterisk: false },
  
  // Parcelados
  { id: "gran", name: "Gran (10/12)", type: "installment", value: 135.00, isAsterisk: false, installments: { current: 10, total: 12 } },
  { id: "pia", name: "Pia (18/18)", type: "installment", value: 20.00, isAsterisk: false, installments: { current: 18, total: 18 } },
  { id: "clovis_celular", name: "Clovis celular (11/12)", type: "installment", value: 65.00, isAsterisk: false, installments: { current: 11, total: 12 } },
  { id: "ps5_parcela", name: "PS5 (10/20)", type: "installment", value: 200.00, isAsterisk: false, installments: { current: 10, total: 20 } },
  { id: "havan", name: "Havan (8/10)", type: "installment", value: 26.00, isAsterisk: false, installments: { current: 8, total: 10 } },
  { id: "seguro_casa", name: "Seguro Casa (9/10)", type: "installment", value: 24.00, isAsterisk: false, installments: { current: 9, total: 10 } },
  { id: "jogo_panelas", name: "Jogo panelas (4/9)", type: "installment", value: 51.00, isAsterisk: false, installments: { current: 4, total: 9 } },
  { id: "teclado_mouse", name: "Teclado e mouse (4/4)", type: "installment", value: 34.00, isAsterisk: false, installments: { current: 4, total: 4 } },
  { id: "ventilador", name: "Ventilador (4/7)", type: "installment", value: 50.00, isAsterisk: false, installments: { current: 4, total: 7 } },
  { id: "microondas", name: "Microondas (4/11)", type: "installment", value: 67.00, isAsterisk: false, installments: { current: 4, total: 11 } },
  { id: "tv_parcela", name: "TV (4/21)", type: "installment", value: 90.00, isAsterisk: false, installments: { current: 4, total: 21 } },
  { id: "campainha", name: "Campainha (3/8)", type: "installment", value: 22.00, isAsterisk: false, installments: { current: 3, total: 8 } },
  { id: "fone", name: "Fone (3/12)", type: "installment", value: 26.00, isAsterisk: false, installments: { current: 3, total: 12 } },
  { id: "pc", name: "PC (3/10)", type: "installment", value: 540.00, isAsterisk: false, installments: { current: 3, total: 10 } },
  { id: "compras", name: "Compras*", type: "consumption", value: 510.00, isAsterisk: true },
  { id: "clovis_nirv", name: "Clovis nirv (2/3)", type: "installment", value: 100.00, isAsterisk: false, installments: { current: 2, total: 3 } },
  { id: "ifood", name: "IFOOD*", type: "consumption", value: 135.00, isAsterisk: true },
];

const INITIAL_APRIL_ADJUSTMENT: Expense = {
  id: "filhinho_ajuda",
  name: "Ajuda do meu filhinho",
  type: "adjustment",
  value: 210.00,
  isAsterisk: false
};

// ==========================================================================
// 2. LOGICA DE EVOLUÇÃO TEMPORAL (COM CONTAS VARIÁVEIS ZERADAS EM MAIO)
// ==========================================================================
const generateInitialDashboardData = (): MonthData[] => {
  const data: MonthData[] = [];

  MONTHS_ORDER.forEach((monthId, index) => {
    // Proventos: Abril é R$ 0,00. Maio a Dezembro padrão R$ 8.480,00.
    const proventos = monthId === "abril" ? 0.00 : 8480.00;
    const expenses: Expense[] = [];

    // Mês 0: ABRIL - Tudo preenchido conforme dados originais
    if (monthId === "abril") {
      expenses.push(...JSON.parse(JSON.stringify(INITIAL_GENERAL_EXPENSES)));
      expenses.push(...JSON.parse(JSON.stringify(INITIAL_APRIL_SPECIFIC_EXPENSES)));
      expenses.push(JSON.parse(JSON.stringify(INITIAL_APRIL_ADJUSTMENT)));
    } 
    // Mês >= 1: MAIO A DEZEMBRO - Variáveis zeradas e parcelas evoluindo
    else {
      // 1. Contas de consumo fixas/recorrentes da lista geral
      INITIAL_GENERAL_EXPENSES.forEach(exp => {
        if (exp.isAsterisk) {
          // Zeradas a partir de Maio conforme a nova regra
          expenses.push({ ...JSON.parse(JSON.stringify(exp)), value: 0.00 });
        } else {
          expenses.push(JSON.parse(JSON.stringify(exp)));
        }
      });

      // 2. Despesas específicas fixas extras (Casa, Vivo, OSAN)
      expenses.push(
        { id: "casa", name: "Casa", type: "fixed", value: 1500.00, isAsterisk: false },
        { id: "vivo", name: "Vivo", type: "fixed", value: 150.00, isAsterisk: false },
        { id: "osan", name: "OSAN", type: "fixed", value: 65.00, isAsterisk: false }
      );

      // 3. Despesas específicas de consumo extras (Compras, IFOOD) - Zeradas a partir de Maio
      expenses.push(
        { id: "compras", name: "Compras*", type: "consumption", value: 0.00, isAsterisk: true },
        { id: "ifood", name: "IFOOD*", type: "consumption", value: 0.00, isAsterisk: true }
      );

      // 4. Lógica de evolução das parcelas a partir de Abril (mês base)
      // index indica quantos meses se passaram desde Abril (Abril = 0, Maio = 1, Junho = 2, etc.)
      INITIAL_APRIL_SPECIFIC_EXPENSES.forEach(exp => {
        if (exp.type === "installment" && exp.installments) {
          const nextInstallmentNum = exp.installments.current + index;
          if (nextInstallmentNum <= exp.installments.total) {
            expenses.push({
              ...JSON.parse(JSON.stringify(exp)),
              name: `${exp.name.split(" ")[0]} (${nextInstallmentNum}/${exp.installments.total})`,
              installments: {
                current: nextInstallmentNum,
                total: exp.installments.total
              }
            });
          }
        }
      });
    }

    data.push({
      id: monthId,
      name: MONTH_NAMES[monthId],
      proventos,
      expenses
    });
  });

  return data;
};

// ==========================================================================
// 3. COMPONENTE PRINCIPAL (PREMIUM & CLEAN STYLE)
// ==========================================================================
export default function DashboardClient() {
  const [data, setData] = useState<MonthData[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<string>("maio");
  const [savedFeedbacks, setSavedFeedbacks] = useState<Record<string, boolean>>({});
  const [isLargeText, setIsLargeText] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("dashflavio_data");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        setData(generateInitialDashboardData());
      }
    } else {
      const initial = generateInitialDashboardData();
      setData(initial);
      localStorage.setItem("dashflavio_data", JSON.stringify(initial));
    }

    const storedTextSize = localStorage.getItem("dashflavio_large_text");
    if (storedTextSize === "true") {
      setIsLargeText(true);
    }
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <p className="text-xl font-bold text-blue-400 animate-pulse font-sans tracking-wide">Carregando painel premium...</p>
      </div>
    );
  }

  const selectedMonth = data.find(m => m.id === selectedMonthId) || data[1];

  // ==========================================================================
  // CÁLCULOS FINANCEIROS
  // ==========================================================================
  const proventosValue = selectedMonth.proventos;

  const consumptionExpenses = selectedMonth.expenses.filter(e => e.type === "consumption");
  const fixedExpenses = selectedMonth.expenses.filter(e => e.type === "fixed");
  const installmentExpenses = selectedMonth.expenses.filter(e => e.type === "installment");
  const adjustments = selectedMonth.expenses.filter(e => e.type === "adjustment");

  const grossExpenses = 
    consumptionExpenses.reduce((sum, e) => sum + e.value, 0) +
    fixedExpenses.reduce((sum, e) => sum + e.value, 0) +
    installmentExpenses.reduce((sum, e) => sum + e.value, 0);

  const totalAdjustments = adjustments.reduce((sum, e) => sum + e.value, 0);
  const totalExpensesValue = Math.max(0, grossExpenses - totalAdjustments);
  const balanceValue = proventosValue - totalExpensesValue;

  // ==========================================================================
  // MANIPULADORES DE EDICAO
  // ==========================================================================
  const handleProventoChange = (val: number) => {
    const updated = data.map(m => {
      if (m.id === selectedMonthId) {
        return { ...m, proventos: val };
      }
      return m;
    });
    setData(updated);
    localStorage.setItem("dashflavio_data", JSON.stringify(updated));
  };

  const handleExpenseChange = (expenseId: string, val: number) => {
    const updated = data.map(m => {
      if (m.id === selectedMonthId) {
        const updatedExpenses = m.expenses.map(e => {
          if (e.id === expenseId) {
            return { ...e, value: val };
          }
          return e;
        });
        return { ...m, expenses: updatedExpenses };
      }
      return m;
    });
    
    setData(updated);
    localStorage.setItem("dashflavio_data", JSON.stringify(updated));

    // Feedback visual suave de salvamento
    setSavedFeedbacks(prev => ({ ...prev, [expenseId]: true }));
    setTimeout(() => {
      setSavedFeedbacks(prev => ({ ...prev, [expenseId]: false }));
    }, 1000);
  };

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `dashflavio_backup_2026.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const toggleTextSize = () => {
    const newVal = !isLargeText;
    setIsLargeText(newVal);
    localStorage.setItem("dashflavio_large_text", String(newVal));
  };

  const chartData = data.map(m => {
    const mConsumption = m.expenses.filter(e => e.type === "consumption").reduce((sum, e) => sum + e.value, 0);
    const mFixed = m.expenses.filter(e => e.type === "fixed").reduce((sum, e) => sum + e.value, 0);
    const mInstallments = m.expenses.filter(e => e.type === "installment").reduce((sum, e) => sum + e.value, 0);
    const mAdjustments = m.expenses.filter(e => e.type === "adjustment").reduce((sum, e) => sum + e.value, 0);
    const mTotal = Math.max(0, (mConsumption + mFixed + mInstallments) - mAdjustments);

    return {
      id: m.id,
      name: m.name,
      "Gastos": Number(mTotal.toFixed(2)),
      "Receitas": m.proventos
    };
  });

  const currentIndex = MONTHS_ORDER.indexOf(selectedMonthId);

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-slate-950 font-sans antialiased text-slate-100 selection:bg-indigo-500 selection:text-white ${isLargeText ? "text-lg md:text-xl" : "text-base"}`}>
        
        {/* ==========================================================================
           HEADER ULTRA-PREMIUM (DARK LUXURY DESIGN)
           ========================================================================== */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-8">
            
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/10 border border-indigo-400/20">
                SF
              </div>
              <div>
                <h1 className="font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-2 text-2xl md:text-3xl">
                  Sr. Flávio <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wider uppercase">Premium Plus</span>
                </h1>
                <p className="text-slate-400 font-medium text-sm md:text-base">
                  Controle financeiro elegante de alta fidelidade
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Botão de Acessibilidade Visual */}
              <Button
                variant="outline"
                onClick={toggleTextSize}
                className="flex items-center gap-2 border-slate-800 bg-slate-900/50 hover:bg-indigo-950/30 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 shadow-sm transition-all rounded-xl h-12 px-4"
                title="Aumentar tamanho das letras para melhor conforto"
              >
                <Type className="h-5 w-5 text-indigo-400" />
                <span className="hidden sm:inline font-bold">Texto {isLargeText ? "Padrão" : "Grande"}</span>
              </Button>

              {/* Salvar Backup */}
              <Button
                variant="outline"
                onClick={handleExport}
                className="flex items-center gap-2 border-slate-800 bg-slate-900/50 hover:bg-indigo-950/30 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 shadow-sm transition-all rounded-xl h-12 px-4"
                title="Salvar arquivo de backup com suas alterações"
              >
                <Download className="h-5 w-5 text-indigo-400" />
                <span className="hidden sm:inline font-bold">Backup</span>
              </Button>
            </div>

          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
          
          {/* ==========================================================================
             Navegador de Meses (Premium Pill Tabs)
             ========================================================================== */}
          <section className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-slate-900/40 p-4 border border-slate-900 sm:flex-row backdrop-blur-md">
            <Button
              variant="ghost"
              disabled={currentIndex === 0}
              onClick={() => setSelectedMonthId(MONTHS_ORDER[currentIndex - 1])}
              className="flex h-12 items-center gap-2 px-5 font-extrabold text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl disabled:opacity-20 border border-transparent hover:border-slate-800 transition-all"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
              Anterior
            </Button>

            <div className="w-full overflow-x-auto py-1 scrollbar-none">
              <div className="flex justify-center gap-2.5 min-w-[720px]">
                {MONTHS_ORDER.map(mId => {
                  const isActive = selectedMonthId === mId;
                  return (
                    <button
                      key={mId}
                      onClick={() => setSelectedMonthId(mId)}
                      className={`h-11 rounded-xl px-5 font-bold transition-all text-sm uppercase tracking-wider border
                        ${isActive 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105" 
                          : "bg-slate-900/50 hover:bg-slate-800 text-slate-400 border-slate-900 hover:text-slate-200"
                        }`}
                    >
                      {MONTH_NAMES[mId]}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="ghost"
              disabled={currentIndex === MONTHS_ORDER.length - 1}
              onClick={() => setSelectedMonthId(MONTHS_ORDER[currentIndex + 1])}
              className="flex h-12 items-center gap-2 px-5 font-extrabold text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl disabled:opacity-20 border border-transparent hover:border-slate-800 transition-all"
            >
              Próximo
              <ChevronRight className="h-5 w-5 stroke-[2.5]" />
            </Button>
          </section>

          {/* ==========================================================================
             Cartões de Métricas (Luxury Glassmorphism Cards)
             ========================================================================== */}
          <section className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Card Proventos */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 p-7 border border-slate-900 shadow-xl shadow-slate-950/50 group hover:border-emerald-500/20 transition-all duration-300">
              <div className="absolute right-0 top-0 h-32 w-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-300" />
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
                  <TrendingUp className="h-7 w-7 stroke-[2]" />
                </div>
                <div className="flex-1">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Entradas do Mês</span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Altere o valor dando um clique no campo:</span>
                  <div className="relative mt-2.5 flex items-center">
                    <span className="mr-1 text-slate-400 font-bold text-xl">R$</span>
                    <input
                      type="number"
                      value={proventosValue || ""}
                      onChange={(e) => handleProventoChange(Number(e.target.value))}
                      className={`w-40 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 px-3 py-1 font-black text-emerald-400 focus:border-emerald-500 focus:bg-emerald-950/20 focus:outline-none transition-all shadow-inner
                        ${isLargeText ? "text-3xl" : "text-2xl"}`}
                      step="0.01"
                      min="0"
                      title="Clique aqui para alterar o valor de proventos deste mês"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Gastos */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 p-7 border border-slate-900 shadow-xl shadow-slate-950/50 group hover:border-rose-500/20 transition-all duration-300">
              <div className="absolute right-0 top-0 h-32 w-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/10 transition-all duration-300" />
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-md">
                  <TrendingDown className="h-7 w-7 stroke-[2]" />
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Total de Gastos</span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Soma líquida de todas as despesas:</span>
                  <p className={`font-black text-rose-400 mt-2.5 tracking-tight ${isLargeText ? "text-4xl" : "text-3xl"}`}>
                    R$ {totalExpensesValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Saldo Final */}
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b p-7 border shadow-xl shadow-slate-950/50 transition-all duration-300 group
              ${balanceValue >= 0 
                ? "from-slate-900/90 to-slate-950 border-slate-900 hover:border-indigo-500/20" 
                : "from-red-950/20 to-slate-950 border-red-950 hover:border-red-500/30"
              }`}>
              <div className={`absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl pointer-events-none transition-all duration-300
                ${balanceValue >= 0 ? "bg-indigo-500/5 group-hover:bg-indigo-500/10" : "bg-red-500/10 group-hover:bg-red-500/20"}`} 
              />
              <div className="flex items-center gap-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border shadow-md
                  ${balanceValue >= 0 
                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                  }`}>
                  <Wallet className="h-7 w-7 stroke-[2]" />
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Saldo Líquido</span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">O que sobrou em conta:</span>
                  <p className={`font-black mt-2.5 tracking-tight
                    ${balanceValue >= 0 ? "text-indigo-400" : "text-red-500"}
                    ${isLargeText ? "text-4xl" : "text-3xl"}`}>
                    R$ {balanceValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

          </section>

          {/* ==========================================================================
             GRADE DE LAYOUT (ESQUERDA: LISTA FINANCEIRA, DIREITA: GRÁFICO PREVISÃO)
             ========================================================================== */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Esquerda: Listagem de Contas por Categoria */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <Card className="shadow-2xl bg-slate-900/30 border-slate-900 backdrop-blur-md rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-800 bg-slate-900/50 pb-5 px-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className={`font-black text-slate-100 flex items-center gap-2 ${isLargeText ? "text-2xl" : "text-xl"}`}>
                        Contas de <span className="capitalize text-indigo-400 font-black">{selectedMonth.name}</span>
                      </CardTitle>
                      <CardDescription className={`text-slate-400 font-medium ${isLargeText ? "text-base" : "text-sm"}`}>
                        Dê um clique no valor em azul para atualizar. Contas de consumo com <span className="text-amber-400 font-black">*</span> começam zeradas a partir de Maio.
                      </CardDescription>
                    </div>
                    <span className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      {selectedMonth.expenses.length} Contas
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="flex flex-col gap-8 p-6">
                    
                    {/* 1. Contas de Consumo */}
                    {consumptionExpenses.length > 0 && (
                      <div className="rounded-2xl border border-amber-950/30 bg-amber-950/5 p-5">
                        <div className="flex items-center gap-3 mb-2 border-b border-amber-950/20 pb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Zap className="h-5 w-5 stroke-[2]" />
                          </div>
                          <h3 className="font-black text-amber-300 text-lg">Contas de Consumo (Valores Variáveis)</h3>
                        </div>
                        
                        <TableExpensesList 
                          expenses={consumptionExpenses} 
                          onValueChange={handleExpenseChange}
                          savedFeedbacks={savedFeedbacks}
                          isLargeText={isLargeText}
                          isFuture={selectedMonthId !== "abril"} // Começa a zerar em Maio (mês index >= 1)
                        />
                      </div>
                    )}

                    {/* 2. Contas Fixas */}
                    {fixedExpenses.length > 0 && (
                      <div className="rounded-2xl border border-indigo-950/30 bg-indigo-950/5 p-5">
                        <div className="flex items-center gap-3 mb-2 border-b border-indigo-950/20 pb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Calendar className="h-5 w-5 stroke-[2]" />
                          </div>
                          <h3 className="font-black text-indigo-300 text-lg">Despesas Fixas e Assinaturas</h3>
                        </div>
                        
                        <TableExpensesList 
                          expenses={fixedExpenses} 
                          onValueChange={handleExpenseChange}
                          savedFeedbacks={savedFeedbacks}
                          isLargeText={isLargeText}
                        />
                      </div>
                    )}

                    {/* 3. Parcelamentos */}
                    {installmentExpenses.length > 0 && (
                      <div className="rounded-2xl border border-purple-950/30 bg-purple-950/5 p-5">
                        <div className="flex items-center gap-3 mb-2 border-b border-purple-950/20 pb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <CreditCard className="h-5 w-5 stroke-[2]" />
                          </div>
                          <h3 className="font-black text-purple-300 text-lg">Compras Parceladas Ativas</h3>
                        </div>
                        
                        <TableExpensesList 
                          expenses={installmentExpenses} 
                          onValueChange={handleExpenseChange}
                          savedFeedbacks={savedFeedbacks}
                          isLargeText={isLargeText}
                        />
                      </div>
                    )}

                    {/* 4. Ajustes/Deduções */}
                    {adjustments.length > 0 && (
                      <div className="rounded-2xl border border-emerald-950/30 bg-emerald-950/5 p-5">
                        <div className="flex items-center gap-3 mb-2 border-b border-emerald-950/20 pb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Percent className="h-5 w-5 stroke-[2]" />
                          </div>
                          <h3 className="font-black text-emerald-300 text-lg">Descontos e Reembolsos</h3>
                        </div>
                        
                        <TableExpensesList 
                          expenses={adjustments} 
                          onValueChange={handleExpenseChange}
                          savedFeedbacks={savedFeedbacks}
                          isLargeText={isLargeText}
                        />
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
              
            </div>

            {/* Direita: Gráfico de Evolução Futura */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <Card className="shadow-2xl bg-slate-900/30 border-slate-900 backdrop-blur-md rounded-2xl overflow-hidden p-6">
                <div className="mb-6">
                  <h3 className={`font-black text-slate-100 flex items-center gap-2 ${isLargeText ? "text-2xl" : "text-xl"}`}>
                    <Sparkles className="h-6 w-6 text-indigo-400" />
                    Previsão de Gastos Futuros
                  </h3>
                  <p className="text-slate-400 font-medium text-xs mt-1">
                    Visualize o declínio progressivo nos totais de despesas à medida que as parcelas vão terminando até Dezembro.
                  </p>
                </div>
                
                <div className="h-80 w-full bg-slate-950/40 rounded-xl p-4 border border-slate-900">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="bar-normal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity={0.7} />
                          <stop offset="100%" stopColor="#312e81" stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="bar-selected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                          <stop offset="100%" stopColor="#1e1b4b" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={13} 
                        fontWeight={700}
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        fontWeight={600}
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(value) => `R$ ${value}`}
                      />
                      <ChartTooltip 
                        content={<CustomChartTooltip isLargeText={isLargeText} />} 
                      />
                      <Bar 
                        dataKey="Gastos" 
                        radius={[8, 8, 0, 0]} 
                        maxBarSize={40}
                      >
                        {chartData.map((entry, index) => {
                          const isActive = entry.id === selectedMonthId;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={isActive ? "url(#bar-selected)" : "url(#bar-normal)"}
                              className="transition-all cursor-pointer hover:opacity-90"
                              onClick={() => setSelectedMonthId(entry.id)}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex justify-center gap-6 mt-6 text-sm text-slate-400 font-bold border-t border-slate-900 pt-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded bg-indigo-500/60 border border-indigo-400/20"></span>
                    Demais Meses
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded bg-indigo-600 shadow-md shadow-indigo-500/20"></span>
                    Mês Selecionado ({MONTH_NAMES[selectedMonthId]})
                  </div>
                </div>
              </Card>

            </div>

          </div>

        </main>
        
        <footer className="mt-20 border-t border-slate-900 bg-slate-950 py-10 text-center text-slate-500 text-sm font-semibold tracking-wide">
          <p>© 2026 Controle Financeiro Premium do Sr. Flávio. Desenvolvido com sofisticação e acessibilidade máxima.</p>
        </footer>

      </div>
    </TooltipProvider>
  );
}

// ==========================================================================
// 4. COMPONENTE AUXILIAR: TABELA FINANCEIRA DE DESPESAS (PREMIUM DESIGN)
// ==========================================================================

interface TableExpensesListProps {
  expenses: Expense[];
  onValueChange: (expenseId: string, value: number) => void;
  savedFeedbacks: Record<string, boolean>;
  isLargeText: boolean;
  isFuture?: boolean;
}

function TableExpensesList({ 
  expenses, 
  onValueChange, 
  savedFeedbacks,
  isLargeText,
  isFuture = false
}: TableExpensesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  const handleStartEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setTempValue(exp.value.toFixed(2));
  };

  const handleSaveEdit = (expenseId: string) => {
    const parsed = parseFloat(tempValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onValueChange(expenseId, parsed);
    }
    setEditingId(null);
  };

  return (
    <div className="overflow-x-auto w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-800 hover:bg-transparent">
            <TableHead className="w-1/2 font-extrabold text-slate-400 text-xs uppercase tracking-wider">Conta</TableHead>
            <TableHead className="w-1/4 font-extrabold text-slate-400 text-xs uppercase tracking-wider">Status</TableHead>
            <TableHead className="w-1/4 text-right font-extrabold text-slate-400 text-xs uppercase tracking-wider">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map(exp => {
            const isEditing = editingId === exp.id;
            const isSaved = savedFeedbacks[exp.id];
            
            let badgeComponent = null;
            if (exp.type === "consumption") {
              if (isFuture && exp.value === 0) {
                badgeComponent = (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20 animate-pulse">
                    Preencher! ⚠️
                  </span>
                );
              } else {
                badgeComponent = (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/5 px-2.5 py-1 text-xs font-bold text-amber-500/80 border border-amber-500/10">
                    Consumo
                  </span>
                );
              }
            } else if (exp.type === "fixed") {
              badgeComponent = (
                <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/5 px-2.5 py-1 text-xs font-bold text-indigo-400/80 border border-indigo-500/10">
                  Fixo
                </span>
              );
            } else if (exp.type === "installment" && exp.installments) {
              const current = exp.installments.current;
              const total = exp.installments.total;
              const percent = (current / total) * 100;
              
              badgeComponent = (
                <div className="flex flex-col gap-1 w-full max-w-[120px]">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/5 px-2.5 py-1 text-xs font-bold text-purple-400/80 border border-purple-500/10">
                    Parc. {current}/{total}
                  </span>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            } else if (exp.type === "adjustment") {
              badgeComponent = (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  Reembolso (-)
                </span>
              );
            }

            return (
              <TableRow 
                key={exp.id} 
                className={`border-b border-slate-900/60 hover:bg-slate-900/20 transition-colors
                  ${isSaved ? "bg-emerald-950/20" : ""}
                `}
              >
                {/* Nome */}
                <TableCell className={`py-4 font-bold text-slate-200 ${isLargeText ? "text-lg" : "text-base"}`}>
                  <span className="flex items-center gap-1.5">
                    {exp.name}
                    {exp.isAsterisk && (
                      <span className="text-amber-500 font-extrabold" title="Conta de valor variável">*</span>
                    )}
                  </span>
                </TableCell>
                
                {/* Badge Status */}
                <TableCell className="py-4">
                  {badgeComponent}
                </TableCell>
                
                {/* Valor Editável */}
                <TableCell className="py-4 text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-slate-500 text-sm font-bold">R$</span>
                      <Input
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSaveEdit(exp.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(exp.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-24 text-right font-extrabold text-indigo-400 border-2 border-indigo-500 bg-slate-950"
                        autoFocus
                        step="0.01"
                      />
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEdit(exp)}
                      className={`inline-flex items-center gap-2 cursor-pointer rounded-xl px-3.5 py-2 border border-slate-900/40 bg-slate-900/30 hover:border-indigo-500/30 hover:bg-indigo-950/20 hover:text-indigo-400 transition-all font-black text-right text-indigo-300
                        ${isFuture && exp.value === 0 && exp.type === "consumption" 
                          ? "border-dashed border-amber-500/40 bg-amber-500/5 text-amber-400 hover:border-amber-500/60 hover:bg-amber-950/20" 
                          : ""
                        }
                        ${isLargeText ? "text-xl" : "text-lg"}`}
                      title="Clique para alterar o valor da conta"
                    >
                      <span>
                        R$ {exp.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      {isSaved && (
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-500 animate-bounce stroke-[2.5]" />
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ==========================================================================
// 5. CUSTOM CHART TOOLTIP
// ==========================================================================
interface CustomChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      Receitas: number;
    };
  }>;
  label?: string;
  isLargeText: boolean;
}

function CustomChartTooltip({ active, payload }: CustomChartTooltipProps) {
  if (active && payload && payload.length) {
    const currentMonthData = payload[0].payload;
    const expense = payload[0].value;
    const income = currentMonthData.Receitas;
    const balance = income - expense;
    const name = currentMonthData.name;

    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-md p-4.5 shadow-2xl flex flex-col gap-1.5 text-sm">
        <h4 className="font-black text-slate-100 text-base border-b border-slate-900 pb-1.5 capitalize">{name} 2026</h4>
        <p className="font-semibold text-slate-400">
          Receitas: <span className="text-emerald-400 font-extrabold">R$ {income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </p>
        <p className="font-semibold text-slate-400">
          Gastos: <span className="text-rose-400 font-extrabold">R$ {expense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </p>
        <p className={`font-black border-t border-slate-900 pt-1.5 mt-1.5
          ${balance >= 0 ? "text-indigo-400" : "text-red-500"}`}>
          Saldo: R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }

  return null;
}

"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  RotateCcw, 
  Zap, 
  Calendar, 
  CreditCard, 
  Percent, 
  HelpCircle,
  Lightbulb,
  CheckCircle,
  Info
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
// 1. ESTRUTURA DE DADOS INICIAL
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

// Despesas gerais que ocorrem em Abril
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
// FUNÇÃO GERADORA DE DADOS ANUAIS (ABRIL A DEZEMBRO 2026)
// ==========================================================================
const generateInitialDashboardData = (): MonthData[] => {
  const data: MonthData[] = [];

  MONTHS_ORDER.forEach((monthId, index) => {
    // 1. Proventos
    let proventos = 8480.00;
    if (monthId === "abril") {
      proventos = 0.00;
    }

    const expenses: Expense[] = [];

    // Em abril, colocamos TODOS os gastos descritos
    if (monthId === "abril") {
      expenses.push(...JSON.parse(JSON.stringify(INITIAL_GENERAL_EXPENSES)));
      expenses.push(...JSON.parse(JSON.stringify(INITIAL_APRIL_SPECIFIC_EXPENSES)));
      expenses.push(JSON.parse(JSON.stringify(INITIAL_APRIL_ADJUSTMENT)));
    } 
    // Em maio, mantemos o valor de consumo e evoluímos as parcelas
    else if (monthId === "maio") {
      // Gerais de Maio
      expenses.push(...JSON.parse(JSON.stringify(INITIAL_GENERAL_EXPENSES)));
      
      // Fixas recorrentes extras
      expenses.push(
        { id: "casa", name: "Casa", type: "fixed", value: 1500.00, isAsterisk: false },
        { id: "vivo", name: "Vivo", type: "fixed", value: 150.00, isAsterisk: false },
        { id: "osan", name: "OSAN", type: "fixed", value: 65.00, isAsterisk: false }
      );

      // Consumo extras que têm o mesmo valor em Maio
      expenses.push(
        { id: "compras", name: "Compras*", type: "consumption", value: 510.00, isAsterisk: true },
        { id: "ifood", name: "IFOOD*", type: "consumption", value: 135.00, isAsterisk: true }
      );

      // Evolução de parcelas a partir de Abril (Abril era a base index 0)
      // Calculamos: Abril foi +0 parcelas. Maio é +1 parcela.
      INITIAL_APRIL_SPECIFIC_EXPENSES.forEach(exp => {
        if (exp.type === "installment" && exp.installments) {
          const nextInstallmentNum = exp.installments.current + 1;
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
    // A partir de Junho, zeramos as de consumo (*) e as parcelas continuam evoluindo
    else {
      // Diferença em meses desde Abril
      const diffMonths = index; // Abril é 0, Maio é 1, Junho é 2, etc.

      // 1. Contas de consumo com asterisco (zeradas a partir de Junho)
      INITIAL_GENERAL_EXPENSES.forEach(exp => {
        if (exp.isAsterisk) {
          expenses.push({ ...JSON.parse(JSON.stringify(exp)), value: 0.00 });
        } else {
          expenses.push(JSON.parse(JSON.stringify(exp)));
        }
      });

      // Fixas extras repetem o valor
      expenses.push(
        { id: "casa", name: "Casa", type: "fixed", value: 1500.00, isAsterisk: false },
        { id: "vivo", name: "Vivo", type: "fixed", value: 150.00, isAsterisk: false },
        { id: "osan", name: "OSAN", type: "fixed", value: 65.00, isAsterisk: false }
      );

      // Consumos extras zerados
      expenses.push(
        { id: "compras", name: "Compras*", type: "consumption", value: 0.00, isAsterisk: true },
        { id: "ifood", name: "IFOOD*", type: "consumption", value: 0.00, isAsterisk: true }
      );

      // Evolução das parcelas
      INITIAL_APRIL_SPECIFIC_EXPENSES.forEach(exp => {
        if (exp.type === "installment" && exp.installments) {
          const nextInstallmentNum = exp.installments.current + diffMonths;
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

export default function DashboardClient() {
  const [data, setData] = useState<MonthData[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<string>("maio"); // Inicializa em Maio por padrão
  const [savedFeedbacks, setSavedFeedbacks] = useState<Record<string, boolean>>({});
  const [isLargeText, setIsLargeText] = useState<boolean>(false);

  // Inicialização do LocalStorage
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-xl font-bold text-slate-700 animate-pulse">Carregando painel financeiro...</p>
      </div>
    );
  }

  const selectedMonth = data.find(m => m.id === selectedMonthId) || data[1]; // Fallback para Maio

  // ==========================================================================
  // CÁLCULOS DINÂMICOS DO MÊS SELECIONADO
  // ==========================================================================
  
  // Total de Entradas
  const proventosValue = selectedMonth.proventos;

  // Separar gastos por tipo
  const consumptionExpenses = selectedMonth.expenses.filter(e => e.type === "consumption");
  const fixedExpenses = selectedMonth.expenses.filter(e => e.type === "fixed");
  const installmentExpenses = selectedMonth.expenses.filter(e => e.type === "installment");
  const adjustments = selectedMonth.expenses.filter(e => e.type === "adjustment");

  // Gastos brutos (sem os descontos/ajustes)
  const grossExpenses = 
    consumptionExpenses.reduce((sum, e) => sum + e.value, 0) +
    fixedExpenses.reduce((sum, e) => sum + e.value, 0) +
    installmentExpenses.reduce((sum, e) => sum + e.value, 0);

  // Descontos
  const totalAdjustments = adjustments.reduce((sum, e) => sum + e.value, 0);

  // Gastos líquidos (Gastos - Descontos)
  const totalExpensesValue = Math.max(0, grossExpenses - totalAdjustments);

  // Saldo Final
  const balanceValue = proventosValue - totalExpensesValue;

  // ==========================================================================
  // MANIPULADORES DE EDICAO DE VALORES
  // ==========================================================================
  
  // Atualiza Provento
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

  // Atualiza Despesa específica
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

    // Feedback visual temporário de "Salvo!"
    setSavedFeedbacks(prev => ({ ...prev, [expenseId]: true }));
    setTimeout(() => {
      setSavedFeedbacks(prev => ({ ...prev, [expenseId]: false }));
    }, 1000);
  };

  // Resetar dados para o padrão
  const handleReset = () => {
    if (confirm("Você quer restaurar todos os valores do painel de volta para as configurações iniciais? Todas as suas alterações manuais serão perdidas.")) {
      const initial = generateInitialDashboardData();
      setData(initial);
      localStorage.setItem("dashflavio_data", JSON.stringify(initial));
      setSelectedMonthId("maio");
    }
  };

  // Exportar dados para arquivo JSON
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

  // Alterna tamanho da fonte para idosos
  const toggleTextSize = () => {
    const newVal = !isLargeText;
    setIsLargeText(newVal);
    localStorage.setItem("dashflavio_large_text", String(newVal));
  };

  // ==========================================================================
  // ESTRUTURAÇÃO DOS DADOS PARA O GRÁFICO
  // ==========================================================================
  const chartData = data.map(m => {
    const mConsumption = m.expenses.filter(e => e.type === "consumption").reduce((sum, e) => sum + e.value, 0);
    const mFixed = m.expenses.filter(e => e.type === "fixed").reduce((sum, e) => sum + e.value, 0);
    const mInstallments = m.expenses.filter(e => e.type === "installment").reduce((sum, e) => sum + e.value, 0);
    const mAdjustments = m.expenses.filter(e => e.type === "adjustment").reduce((sum, e) => sum + e.value, 0);
    const mTotal = Math.max(0, (mConsumption + mFixed + mInstallments) - mAdjustments);

    return {
      id: m.id,
      name: m.name,
      "Total Gastos": Number(mTotal.toFixed(2)),
      "Receitas": m.proventos
    };
  });

  // ==========================================================================
  // CONSELHOS FINANCEIROS DINÂMICOS
  // ==========================================================================
  const getFinancialTips = () => {
    const tips = [];
    
    if (selectedMonthId === "abril") {
      tips.push({
        title: "Início dos registros financeiros",
        text: "Este é o mês inicial da sua tabela. Todos os gastos parcelados (15 contas) estão ativos. O provento é R$ 0,00 pois começamos as receitas no próximo mês.",
        emoji: "📋",
        color: "amber"
      });
      tips.push({
        title: "Ajuda importante registrada",
        text: "Uma dedução de R$ 210,00 referente à ajuda do seu filhinho foi cadastrada neste mês para reduzir o total líquido das despesas.",
        emoji: "💖",
        color: "emerald"
      });
    }

    if (selectedMonthId === "maio") {
      tips.push({
        title: "Entradas iniciadas!",
        text: "Sua receita de R$ 8.480,00 foi ativada. Excelente! Sobrou uma bela quantia de saldo livre na conta.",
        emoji: "💰",
        color: "emerald"
      });
      tips.push({
        title: "Duas parcelas totalmente quitadas! 🎉",
        text: "Neste mês de Maio, as contas da 'Pia (18/18)' e do 'Teclado e mouse (4/4)' foram concluídas com sucesso. São R$ 54,00 a menos de gastos!",
        emoji: "🎉",
        color: "indigo"
      });
    }

    if (selectedMonthId === "junho") {
      tips.push({
        title: "Aviso de contas variáveis (*)",
        text: "A partir deste mês de Junho, Sabesp, CPFL, Nubank, Compras e iFood começam zerados (R$ 0,00). Lembre-se de olhar o valor nas faturas e digitar o valor real na tabela!",
        emoji: "⚡",
        color: "amber"
      });
      tips.push({
        title: "Três contas parceladas a menos! 👏",
        text: "Quitadas as parcelas do 'Clovis celular', 'Seguro Casa' e do 'Clovis nirv'. Seu custo caiu R$ 189,00 adicionais a partir deste mês!",
        emoji: "💵",
        color: "indigo"
      });
    }

    if (selectedMonthId === "julho") {
      tips.push({
        title: "Mais duas parcelas encerradas!",
        text: "Você encerrou os pagamentos da parcela da 'Gran' e da loja 'Havan'. Redução de mais R$ 161,00 nas despesas mensais!",
        emoji: "✨",
        color: "indigo"
      });
    }

    if (selectedMonthId === "agosto") {
      tips.push({
        title: "Mais uma conta finalizada!",
        text: "A parcela do 'Ventilador' de R$ 50,00 foi concluída no mês passado. Menos gastos fixos na sua conta!",
        emoji: "❄️",
        color: "indigo"
      });
    }

    if (selectedMonthId === "outubro") {
      tips.push({
        title: "Grandes vitórias financeiras!",
        text: "Foram quitadas as parcelas do 'Jogo de panelas' (R$ 51,00) e da 'Campainha' (R$ 22,00). Suas despesas estão cada vez menores!",
        emoji: "🍳",
        color: "indigo"
      });
    }

    if (selectedMonthId === "dezembro") {
      tips.push({
        title: "Fim do ano e contas quitadas!",
        text: "Último mês do ano de controle! As parcelas pesadas do 'PC' (R$ 540,00) e 'Microondas' (R$ 67,00) foram totalmente quitadas em Novembro, liberando R$ 607,00 no seu orçamento de Dezembro! Excelente controle financeiro!",
        emoji: "🎄",
        color: "emerald"
      });
    }

    // Conselho padrão sobre o saldo
    if (balanceValue > 0) {
      tips.push({
        title: "Saldo saudável!",
        text: `Neste mês você está no azul! Estão sobrando R$ ${balanceValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. Excelente planejamento.`,
        emoji: "✅",
        color: "emerald"
      });
    } else if (balanceValue < 0 && selectedMonthId !== "abril") {
      tips.push({
        title: "Atenção ao saldo negativo",
        text: `Seus gastos superaram seus proventos neste mês em R$ ${Math.abs(balanceValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. Verifique se é possível economizar em alguma conta variável.`,
        emoji: "⚠️",
        color: "rose"
      });
    }

    return tips;
  };

  const currentIndex = MONTHS_ORDER.indexOf(selectedMonthId);

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-slate-50 font-sans antialiased text-slate-800 ${isLargeText ? "text-lg md:text-xl" : "text-base"}`}>
        
        {/* ==========================================================================
           HEADER DO DASHBOARD
           ========================================================================== */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-bold text-xl shadow-lg border-2 border-white">
                SF
              </div>
              <div>
                <h1 className={`font-bold tracking-tight text-blue-900 ${isLargeText ? "text-3xl" : "text-2xl"}`}>
                  Painel do Sr. Flávio
                </h1>
                <p className={`text-slate-500 ${isLargeText ? "text-base" : "text-sm"}`}>
                  Controle simples, grande e intuitivo do seu dinheiro
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Botão Acessibilidade de Texto */}
              <Button
                variant="outline"
                size={isLargeText ? "lg" : "default"}
                onClick={toggleTextSize}
                className="flex items-center gap-2 border-blue-200 text-blue-800 bg-blue-50/50 hover:bg-blue-50 hover:text-blue-900 shadow-sm"
                title="Aumentar ou diminuir o tamanho dos textos na tela"
              >
                <span className="font-bold text-lg">A<span className="text-sm">A</span></span>
                <span className="hidden sm:inline font-semibold">Texto Grande: {isLargeText ? "Sim" : "Não"}</span>
              </Button>

              <Button
                variant="outline"
                size={isLargeText ? "lg" : "default"}
                onClick={handleExport}
                className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                title="Exportar arquivo de backup com todas as edições"
              >
                <Download className="h-5 w-5" />
                <span className="hidden sm:inline font-semibold">Salvar Backup</span>
              </Button>

              <Button
                variant="outline"
                size={isLargeText ? "lg" : "default"}
                onClick={handleReset}
                className="flex items-center gap-2 border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                title="Apagar edições e voltar aos valores originais"
              >
                <RotateCcw className="h-5 w-5" />
                <span className="hidden sm:inline font-semibold">Limpar Tudo</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          
          {/* ==========================================================================
             SELEÇÃO DOS MESES (BOTÕES GRANDES)
             ========================================================================== */}
          <section className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              disabled={currentIndex === 0}
              onClick={() => setSelectedMonthId(MONTHS_ORDER[currentIndex - 1])}
              className="flex h-14 items-center gap-2 px-6 font-bold text-lg border-2"
            >
              <ChevronLeft className="h-6 w-6 stroke-[3]" />
              Mês Anterior
            </Button>

            {/* Abas horizontais roláveis de meses */}
            <div className="w-full overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="flex justify-center gap-2 min-w-[700px]">
                {MONTHS_ORDER.map(mId => {
                  const isActive = selectedMonthId === mId;
                  const isFuture = mId !== "abril" && mId !== "maio" && mId !== selectedMonthId;
                  return (
                    <button
                      key={mId}
                      onClick={() => setSelectedMonthId(mId)}
                      className={`h-12 rounded-xl px-5 font-bold transition-all text-base border-2 capitalize
                        ${isActive 
                          ? "bg-blue-800 border-blue-800 text-white shadow-md scale-105" 
                          : isFuture 
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200" 
                            : "bg-blue-50/50 hover:bg-blue-50 text-blue-800 border-blue-100"
                        }`}
                    >
                      {MONTH_NAMES[mId]}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="outline"
              size="lg"
              disabled={currentIndex === MONTHS_ORDER.length - 1}
              onClick={() => setSelectedMonthId(MONTHS_ORDER[currentIndex + 1])}
              className="flex h-14 items-center gap-2 px-6 font-bold text-lg border-2"
            >
              Próximo Mês
              <ChevronRight className="h-6 w-6 stroke-[3]" />
            </Button>
          </section>

          {/* ==========================================================================
             RESUMOS DO MÊS (CARTÕES GIGANTES)
             ========================================================================== */}
          <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Cartão de Entradas */}
            <Card className="border-l-8 border-l-emerald-600 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-6 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <TrendingUp className="h-9 w-9 stroke-[2.5]" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-500 font-medium">Entradas do Mês</p>
                  <p className="text-xs text-slate-400">Clique para alterar a aposentadoria</p>
                  <div className="relative mt-1 flex items-center">
                    <span className="mr-1 text-slate-500 font-bold text-lg">R$</span>
                    <input
                      type="number"
                      value={proventosValue || ""}
                      onChange={(e) => handleProventoChange(Number(e.target.value))}
                      className={`w-36 rounded-lg border-2 border-dashed border-emerald-300 bg-transparent px-2 py-1 font-bold text-emerald-800 focus:border-emerald-600 focus:bg-emerald-50 focus:outline-none transition-colors
                        ${isLargeText ? "text-3xl" : "text-2xl"}`}
                      step="0.01"
                      min="0"
                      title="Clique aqui para digitar o valor de proventos deste mês"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cartão de Gastos */}
            <Card className="border-l-8 border-l-rose-600 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-6 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-700">
                  <TrendingDown className="h-9 w-9 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Total de Gastos</p>
                  <p className="text-xs text-slate-400">Total somado de todas as contas</p>
                  <p className={`font-extrabold text-rose-700 mt-1 ${isLargeText ? "text-4xl" : "text-3xl"}`}>
                    R$ {totalExpensesValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cartão de Saldo Final */}
            <Card className={`border-l-8 shadow-sm hover:shadow-md transition-all
              ${balanceValue >= 0 
                ? "border-l-blue-700 bg-blue-50/20" 
                : "border-l-red-600 bg-red-50/20 animate-pulse border-red-300"
              }`}>
              <CardContent className="flex items-center gap-6 p-6">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full 
                  ${balanceValue >= 0 ? "bg-blue-50 text-blue-700" : "bg-red-100 text-red-700"}`}>
                  <Wallet className="h-9 w-9 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Sobrou na Conta</p>
                  <p className="text-xs text-slate-400">Dinheiro livre pós despesas</p>
                  <p className={`font-extrabold mt-1
                    ${balanceValue >= 0 ? "text-blue-900" : "text-red-700"}
                    ${isLargeText ? "text-4xl" : "text-3xl"}`}>
                    R$ {balanceValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>

          </section>

          {/* ==========================================================================
             GRADE PRINCIPAL (ESQUERDA: LISTA DE CONTAS, DIREITA: GRÁFICOS E DICAS)
             ========================================================================== */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Coluna Esquerda: Listagem de Despesas */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <Card className="shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className={`font-extrabold text-blue-900 ${isLargeText ? "text-2xl" : "text-xl"}`}>
                        Contas de <span className="capitalize text-blue-600 font-black">{selectedMonth.name}</span>
                      </CardTitle>
                      <CardDescription className={isLargeText ? "text-base" : "text-sm"}>
                        Clique diretamente nos números azuis na coluna &quot;Valor&quot; para fazer alterações rápidas.
                      </CardDescription>
                    </div>
                    <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-extrabold text-blue-800">
                      {selectedMonth.expenses.length} itens cadastrados
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="flex flex-col gap-8 p-6">
                    
                    {/* 1. Contas de Consumo */}
                    {consumptionExpenses.length > 0 && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-6 w-6 text-amber-700 stroke-[2.5]" />
                          <h3 className="font-extrabold text-amber-900 text-lg">Contas de Consumo (Valores Variáveis)</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                          Em Abril e Maio os valores são fixos. De Junho em diante começam em R$ 0,00. Quando sua fatura chegar, preencha o valor correto.
                        </p>
                        
                        <TableExpensesList 
                          expenses={consumptionExpenses} 
                          onValueChange={handleExpenseChange}
                          savedFeedbacks={savedFeedbacks}
                          isLargeText={isLargeText}
                          isFuture={selectedMonthId !== "abril" && selectedMonthId !== "maio"}
                        />
                      </div>
                    )}

                    {/* 2. Contas Fixas */}
                    {fixedExpenses.length > 0 && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-6 w-6 text-blue-700 stroke-[2.5]" />
                          <h3 className="font-extrabold text-blue-900 text-lg">Contas Fixas e Assinaturas (Mesmo Valor)</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                          Estes gastos se repetem com o mesmo valor todos os meses automaticamente.
                        </p>
                        
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
                      <div className="rounded-xl border border-purple-200 bg-purple-50/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-6 w-6 text-purple-700 stroke-[2.5]" />
                          <h3 className="font-extrabold text-purple-900 text-lg">Compras Parceladas (Evolução das Parcelas)</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                          O sistema acompanha as parcelas automaticamente. Quando a parcela chega ao final, ela some nos meses futuros e economiza seu orçamento!
                        </p>
                        
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
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Percent className="h-6 w-6 text-emerald-700 stroke-[2.5]" />
                          <h3 className="font-extrabold text-emerald-900 text-lg">Descontos, Ajudas e Ajustes especiais</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                          Estes valores reduzem a sua despesa total (são subtraídos dos gastos). Ex: R$ 210,00 de reembolso do seu filho.
                        </p>
                        
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

            {/* Coluna Direita: Gráficos, Dicas e Avisos */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Gráfico de Barras da Evolução */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className={`font-extrabold text-blue-900 ${isLargeText ? "text-2xl" : "text-xl"}`}>
                    Previsão de Gastos Futuros
                  </CardTitle>
                  <CardDescription className={isLargeText ? "text-base" : "text-sm"}>
                    Gráfico que mostra como seus gastos diminuem ao longo dos meses conforme as parcelas vão terminando.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80 pb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        fontSize={13} 
                        fontWeight={700}
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <YAxis 
                        stroke="#64748b" 
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
                        dataKey="Total Gastos" 
                        radius={[8, 8, 0, 0]} 
                        maxBarSize={45}
                      >
                        {chartData.map((entry, index) => {
                          const isActive = entry.id === selectedMonthId;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={isActive ? "#1d4ed8" : "#93c5fd"} 
                              className="transition-all cursor-pointer"
                              onClick={() => setSelectedMonthId(entry.id)}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
                <div className="flex justify-center gap-6 pb-6 text-sm text-slate-500 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 rounded bg-blue-300"></span>
                    Outros Meses
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 rounded bg-blue-700"></span>
                    Mês Selecionado ({MONTH_NAMES[selectedMonthId]})
                  </div>
                </div>
              </Card>

              {/* Dicas e Conselhos Financeiros do Sr. Flávio */}
              <Card className="border-t-4 border-t-amber-500 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <Lightbulb className="h-6 w-6 stroke-[2]" />
                  </div>
                  <div>
                    <CardTitle className={`font-extrabold text-slate-900 ${isLargeText ? "text-2xl" : "text-xl"}`}>
                      Conselhos do seu Painel
                    </CardTitle>
                    <CardDescription className={isLargeText ? "text-base" : "text-sm"}>
                      Ideias inteligentes baseadas nos gastos de {selectedMonth.name}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="flex flex-col gap-4">
                  {getFinancialTips().map((tip, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-4 rounded-xl border p-4
                        ${tip.color === "emerald" ? "bg-emerald-50/50 border-emerald-200" : ""}
                        ${tip.color === "amber" ? "bg-amber-50/50 border-amber-200" : ""}
                        ${tip.color === "indigo" ? "bg-indigo-50/50 border-indigo-200" : ""}
                        ${tip.color === "rose" ? "bg-rose-50/50 border-rose-200" : ""}
                      `}
                    >
                      <span className="text-3xl" role="img" aria-hidden="true">{tip.emoji}</span>
                      <div className="flex-1">
                        <strong className={`block text-slate-900 ${isLargeText ? "text-lg" : "text-base"}`}>
                          {tip.title}
                        </strong>
                        <p className={`text-slate-600 mt-0.5 leading-relaxed ${isLargeText ? "text-base" : "text-sm"}`}>
                          {tip.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Instruções de Uso Simples para o Idoso */}
              <Card className="bg-slate-100/50 border-slate-200 border shadow-sm">
                <CardContent className="p-6 flex flex-col gap-4">
                  <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-blue-800" />
                    Como usar este Painel?
                  </h3>
                  <ul className="list-none flex flex-col gap-3 pl-0 text-slate-700">
                    <li className="relative pl-6 text-sm">
                      <span className="absolute left-0 top-1 h-3.5 w-3.5 text-blue-800 font-black">1.</span>
                      <strong>Editar valores:</strong> Dê um clique duplo ou simples no valor de qualquer conta na tabela. Um retângulo surgirá para você digitar. O painel salva tudo sozinho!
                    </li>
                    <li className="relative pl-6 text-sm">
                      <span className="absolute left-0 top-1 h-3.5 w-3.5 text-blue-800 font-black">2.</span>
                      <strong>Mudar os meses:</strong> Utilize os botões gigantes <strong>&quot;Mês Anterior&quot;</strong> e <strong>&quot;Próximo Mês&quot;</strong> no topo.
                    </li>
                    <li className="relative pl-6 text-sm">
                      <span className="absolute left-0 top-1 h-3.5 w-3.5 text-blue-800 font-black">3.</span>
                      <strong>Contas variáveis (*):</strong> A partir de Junho elas começam em zero. Olhe o valor da conta física que chega em sua casa e atualize aqui!
                    </li>
                    <li className="relative pl-6 text-sm">
                      <span className="absolute left-0 top-1 h-3.5 w-3.5 text-blue-800 font-black">4.</span>
                      <strong>Salvar ou Apagar:</strong> Use o botão <strong>&quot;Salvar Backup&quot;</strong> no canto superior direito para guardar as informações. O botão <strong>&quot;Limpar Tudo&quot;</strong> restaura os valores originais de fábrica do painel.
                    </li>
                  </ul>
                </CardContent>
              </Card>

            </div>

          </div>

        </main>
        
        <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-slate-500 text-sm font-medium">
          <p>© 2026 Controle Financeiro Familiar do Sr. Flávio. Desenvolvido com carinho e acessibilidade máxima.</p>
        </footer>

      </div>
    </TooltipProvider>
  );
}

// ==========================================================================
// 2. COMPONENTE AUXILIAR: TABELA DE DESPESAS
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
          <TableRow className="border-b border-slate-200">
            <TableHead className="w-1/2 font-extrabold text-slate-700 text-sm">Nome da Conta</TableHead>
            <TableHead className="w-1/4 font-extrabold text-slate-700 text-sm">Situação</TableHead>
            <TableHead className="w-1/4 text-right font-extrabold text-slate-700 text-sm">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map(exp => {
            const isEditing = editingId === exp.id;
            const isSaved = savedFeedbacks[exp.id];
            
            // Definição da badge de status
            let badgeComponent = null;
            if (exp.type === "consumption") {
              if (isFuture && exp.value === 0) {
                badgeComponent = (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-300 animate-pulse">
                    Preencher! ⚠️
                  </span>
                );
              } else {
                badgeComponent = (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                    Consumo Variável
                  </span>
                );
              }
            } else if (exp.type === "fixed") {
              badgeComponent = (
                <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                  Fixo Mensal
                </span>
              );
            } else if (exp.type === "installment" && exp.installments) {
              const current = exp.installments.current;
              const total = exp.installments.total;
              const percent = (current / total) * 100;
              
              badgeComponent = (
                <div className="flex flex-col gap-1 w-full max-w-[120px]">
                  <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
                    Parc. {current} de {total}
                  </span>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            } else if (exp.type === "adjustment") {
              badgeComponent = (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  Desconto (-)
                </span>
              );
            }

            return (
              <TableRow 
                key={exp.id} 
                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors
                  ${isSaved ? "bg-emerald-50/70" : ""}
                `}
              >
                {/* Nome */}
                <TableCell className={`py-4 font-bold text-slate-800 ${isLargeText ? "text-lg" : "text-base"}`}>
                  <span className="flex items-center gap-2">
                    {exp.name}
                    {exp.isAsterisk && (
                      <span className="text-amber-500 font-extrabold" title="Conta de valor variável">*</span>
                    )}
                  </span>
                </TableCell>
                
                {/* Situação / Badge */}
                <TableCell className="py-4">
                  {badgeComponent}
                </TableCell>
                
                {/* Valor */}
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
                        className="w-24 text-right font-extrabold text-blue-900 border-2 border-blue-600 bg-white"
                        autoFocus
                        step="0.01"
                      />
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEdit(exp)}
                      className={`inline-flex items-center gap-2 cursor-pointer rounded-lg px-3 py-1.5 border-2 border-transparent hover:border-blue-300 hover:bg-blue-50/50 transition-all font-black text-right text-blue-800
                        ${isFuture && exp.value === 0 && exp.type === "consumption" 
                          ? "border-dashed border-amber-300 bg-amber-50 text-amber-800" 
                          : ""
                        }
                        ${isLargeText ? "text-xl" : "text-lg"}`}
                      title="Clique duas vezes para editar o valor"
                    >
                      <span>
                        R$ {exp.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      {isSaved && (
                        <CheckCircle className="h-4 w-4 text-emerald-600 animate-bounce stroke-[3]" />
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
// 3. COMPONENTE AUXILIAR: CUSTOM CHART TOOLTIP
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

function CustomChartTooltip({ active, payload, isLargeText }: CustomChartTooltipProps) {
  if (active && payload && payload.length) {
    const currentMonthData = payload[0].payload;
    const expense = payload[0].value;
    const income = currentMonthData.Receitas;
    const balance = income - expense;
    const name = currentMonthData.name;

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg flex flex-col gap-1.5 text-sm">
        <h4 className="font-extrabold text-blue-900 text-base border-b border-slate-100 pb-1 capitalize">{name} 2026</h4>
        <p className="font-semibold text-slate-500">
          Receitas: <span className="text-emerald-700 font-extrabold">R$ {income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </p>
        <p className="font-semibold text-slate-500">
          Gastos: <span className="text-rose-700 font-extrabold">R$ {expense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </p>
        <p className={`font-extrabold border-t border-slate-100 pt-1 mt-1
          ${balance >= 0 ? "text-blue-800" : "text-red-700"}`}>
          Saldo: R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }

  return null;
}

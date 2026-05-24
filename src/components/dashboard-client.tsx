"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Download, 
  Zap, 
  Calendar, 
  CreditCard, 
  Percent, 
  CheckCircle,
  Plus,
  Trash2,
  Check,
  ChevronDown
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
// 1. MODELOS E ESTRUTURAS DE DADOS
// ==========================================================================

interface Expense {
  id: string;
  name: string;
  type: "consumption" | "fixed" | "installment" | "adjustment";
  value: number;
  isAsterisk: boolean; // Mantido internamente para a lógica de zerar a partir de maio
  paid: boolean; // Controle de contas pagas
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

// Dados base de despesas gerais (Sem asterisco no nome a ser exibido)
const INITIAL_GENERAL_EXPENSES: Expense[] = [
  { id: "sabesp", name: "Sabesp", type: "consumption", value: 100.00, isAsterisk: true, paid: false },
  { id: "cpfl", name: "CPFL", type: "consumption", value: 414.95, isAsterisk: true, paid: false },
  { id: "iptu", name: "IPTU", type: "fixed", value: 100.78, isAsterisk: false, paid: false },
  { id: "play_ps5", name: "Play PS5", type: "fixed", value: 44.90, isAsterisk: false, paid: false },
  { id: "google", name: "Google", type: "fixed", value: 96.99, isAsterisk: false, paid: false },
  { id: "celular", name: "Celular", type: "fixed", value: 64.90, isAsterisk: false, paid: false },
  { id: "gato", name: "Gato", type: "fixed", value: 50.00, isAsterisk: false, paid: false },
  { id: "prevent", name: "Prevent", type: "fixed", value: 796.12, isAsterisk: false, paid: false },
  { id: "nubank", name: "Nubank", type: "consumption", value: 400.00, isAsterisk: true, paid: false },
];

const INITIAL_APRIL_SPECIFIC_EXPENSES: Expense[] = [
  { id: "casa", name: "Casa", type: "fixed", value: 1500.00, isAsterisk: false, paid: false },
  { id: "vivo", name: "Vivo", type: "fixed", value: 150.00, isAsterisk: false, paid: false },
  { id: "osan", name: "OSAN", type: "fixed", value: 65.00, isAsterisk: false, paid: false },
  
  // Parcelados
  { id: "gran", name: "Gran (10/12)", type: "installment", value: 135.00, isAsterisk: false, paid: false, installments: { current: 10, total: 12 } },
  { id: "pia", name: "Pia (18/18)", type: "installment", value: 20.00, isAsterisk: false, paid: false, installments: { current: 18, total: 18 } },
  { id: "clovis_celular", name: "Clovis celular (11/12)", type: "installment", value: 65.00, isAsterisk: false, paid: false, installments: { current: 11, total: 12 } },
  { id: "ps5_parcela", name: "PS5 (10/20)", type: "installment", value: 200.00, isAsterisk: false, paid: false, installments: { current: 10, total: 20 } },
  { id: "havan", name: "Havan (8/10)", type: "installment", value: 26.00, isAsterisk: false, paid: false, installments: { current: 8, total: 10 } },
  { id: "seguro_casa", name: "Seguro Casa (9/10)", type: "installment", value: 24.00, isAsterisk: false, paid: false, installments: { current: 9, total: 10 } },
  { id: "jogo_panelas", name: "Jogo panelas (4/9)", type: "installment", value: 51.00, isAsterisk: false, paid: false, installments: { current: 4, total: 9 } },
  { id: "teclado_mouse", name: "Teclado e mouse (4/4)", type: "installment", value: 34.00, isAsterisk: false, paid: false, installments: { current: 4, total: 4 } },
  { id: "ventilador", name: "Ventilador (4/7)", type: "installment", value: 50.00, isAsterisk: false, paid: false, installments: { current: 4, total: 7 } },
  { id: "microondas", name: "Microondas (4/11)", type: "installment", value: 67.00, isAsterisk: false, paid: false, installments: { current: 4, total: 11 } },
  { id: "tv_parcela", name: "TV (4/21)", type: "installment", value: 90.00, isAsterisk: false, paid: false, installments: { current: 4, total: 21 } },
  { id: "campainha", name: "Campainha (3/8)", type: "installment", value: 22.00, isAsterisk: false, paid: false, installments: { current: 3, total: 8 } },
  { id: "fone", name: "Fone (3/12)", type: "installment", value: 26.00, isAsterisk: false, paid: false, installments: { current: 3, total: 12 } },
  { id: "pc", name: "PC (3/10)", type: "installment", value: 540.00, isAsterisk: false, paid: false, installments: { current: 3, total: 10 } },
  { id: "compras", name: "Compras", type: "consumption", value: 510.00, isAsterisk: true, paid: false },
  { id: "clovis_nirv", name: "Clovis nirv (2/3)", type: "installment", value: 100.00, isAsterisk: false, paid: false, installments: { current: 2, total: 3 } },
  { id: "ifood", name: "IFOOD", type: "consumption", value: 135.00, isAsterisk: true, paid: false },
];

const INITIAL_APRIL_ADJUSTMENT: Expense = {
  id: "filhinho_ajuda",
  name: "Ajuda do meu filhinho",
  type: "adjustment",
  value: 210.00,
  isAsterisk: false,
  paid: true // Ajustes/reembolsos sempre contam como recebidos/pagos por padrão
};

// ==========================================================================
// 2. FUNÇÃO GERADORA DE DADOS ANUAIS (REGRA DE MAIO ATUALIZADA)
// ==========================================================================
const generateInitialDashboardData = (): MonthData[] => {
  const data: MonthData[] = [];

  MONTHS_ORDER.forEach((monthId, index) => {
    const proventos = monthId === "abril" ? 0.00 : 8480.00;
    const expenses: Expense[] = [];

    // Mês 0: ABRIL
    if (monthId === "abril") {
      expenses.push(...JSON.parse(JSON.stringify(INITIAL_GENERAL_EXPENSES)));
      expenses.push(...JSON.parse(JSON.stringify(INITIAL_APRIL_SPECIFIC_EXPENSES)));
      expenses.push(JSON.parse(JSON.stringify(INITIAL_APRIL_ADJUSTMENT)));
    } 
    // Mês >= 1: MAIO A DEZEMBRO - Todos os variáveis (*) começam ZERADOS
    else {
      // 1. Gerais
      INITIAL_GENERAL_EXPENSES.forEach(exp => {
        if (exp.isAsterisk) {
          // Zerado a partir de Maio
          expenses.push({ ...JSON.parse(JSON.stringify(exp)), value: 0.00 });
        } else {
          expenses.push(JSON.parse(JSON.stringify(exp)));
        }
      });

      // 2. Fixas recorrentes específicas
      expenses.push(
        { id: "casa", name: "Casa", type: "fixed", value: 1500.00, isAsterisk: false, paid: false },
        { id: "vivo", name: "Vivo", type: "fixed", value: 150.00, isAsterisk: false, paid: false },
        { id: "osan", name: "OSAN", type: "fixed", value: 65.00, isAsterisk: false, paid: false }
      );

      // 3. Consumo específicas (Compras e IFOOD) - Zerados a partir de Maio
      expenses.push(
        { id: "compras", name: "Compras", type: "consumption", value: 0.00, isAsterisk: true, paid: false },
        { id: "ifood", name: "IFOOD", type: "consumption", value: 0.00, isAsterisk: true, paid: false }
      );

      // 4. Evolução das parcelas
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

export default function DashboardClient() {
  const [data, setData] = useState<MonthData[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<string>("maio");
  const [savedFeedbacks, setSavedFeedbacks] = useState<Record<string, boolean>>({});
  const [isLargeText, setIsLargeText] = useState<boolean>(false);

  // Estados para formulário de adicionar nova conta
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newAccName, setNewAccName] = useState<string>("");
  const [newAccValue, setNewAccValue] = useState<string>("");
  const [newAccType, setNewAccType] = useState<"consumption" | "fixed" | "installment">("fixed");
  const [newAccInstallments, setNewAccInstallments] = useState<string>("1");

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
        <p className="text-xl font-bold text-slate-500 animate-pulse font-sans tracking-wide">Carregando painel Lady's House...</p>
      </div>
    );
  }

  const selectedMonth = data.find(m => m.id === selectedMonthId) || data[1];

  // ==========================================================================
  // CÁLCULOS DINÂMICOS DO MÊS COM REGRAS DE CONTAS PAGAS
  // ==========================================================================
  
  // Total de Entradas
  const proventosValue = selectedMonth.proventos;

  // Filtragem de Despesas por Categoria
  const consumptionExpenses = selectedMonth.expenses.filter(e => e.type === "consumption");
  const fixedExpenses = selectedMonth.expenses.filter(e => e.type === "fixed");
  const installmentExpenses = selectedMonth.expenses.filter(e => e.type === "installment");
  const adjustments = selectedMonth.expenses.filter(e => e.type === "adjustment");

  // Total Geral Projetado (Tudo ativo)
  const totalProjectedExpenses = 
    consumptionExpenses.reduce((sum, e) => sum + e.value, 0) +
    fixedExpenses.reduce((sum, e) => sum + e.value, 0) +
    installmentExpenses.reduce((sum, e) => sum + e.value, 0) -
    adjustments.reduce((sum, e) => sum + e.value, 0);

  // REGRA DE CONTAS PAGAS (obviamente diminuindo o saldo as entradas e aumentando as saídas, deixando o saldo disponível da diferença):
  // 1. Saídas (Gastos Realizados / Pagos) = Soma das contas marcadas como PAGAS
  const totalPaidExpenses = 
    selectedMonth.expenses
      .filter(e => e.paid && e.type !== "adjustment")
      .reduce((sum, e) => sum + e.value, 0);

  // 2. Entradas Disponíveis = Proventos + Reembolsos (ajustes sempre contam como entrada positiva)
  const totalIncomeAvailable = proventosValue + adjustments.reduce((sum, e) => sum + e.value, 0);

  // 3. Saldo Real Disponível = Entradas Disponíveis - Saídas (Total Pago)
  const balanceAvailable = Math.max(-99999, totalIncomeAvailable - totalPaidExpenses);

  // ==========================================================================
  // EDITORES DE ESTADO E PERSISTÊNCIA
  // ==========================================================================
  
  // Alternar Status de Pago/Pendente
  const handleTogglePaid = (expenseId: string) => {
    const updated = data.map(m => {
      if (m.id === selectedMonthId) {
        const updatedExpenses = m.expenses.map(e => {
          if (e.id === expenseId) {
            return { ...e, paid: !e.paid };
          }
          return e;
        });
        return { ...m, expenses: updatedExpenses };
      }
      return m;
    });
    setData(updated);
    localStorage.setItem("dashflavio_data", JSON.stringify(updated));
  };

  // Alterar Proventos do Mês
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

  // Alterar valor de despesa na tabela
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

    setSavedFeedbacks(prev => ({ ...prev, [expenseId]: true }));
    setTimeout(() => {
      setSavedFeedbacks(prev => ({ ...prev, [expenseId]: false }));
    }, 1000);
  };

  // Excluir uma conta adicionada manualmente
  const handleDeleteExpense = (expenseId: string) => {
    if (confirm("Deseja realmente excluir esta conta deste mês?")) {
      const updated = data.map(m => {
        if (m.id === selectedMonthId) {
          return { ...m, expenses: m.expenses.filter(e => e.id !== expenseId) };
        }
        return m;
      });
      setData(updated);
      localStorage.setItem("dashflavio_data", JSON.stringify(updated));
    }
  };

  // Adicionar Nova Conta Não Prevista
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedValue = parseFloat(newAccValue);
    if (!newAccName.trim() || isNaN(parsedValue) || parsedValue < 0) {
      alert("Por favor, preencha o nome e o valor corretamente.");
      return;
    }

    const uniqueId = `custom_${Date.now()}`;
    const newExpense: Expense = {
      id: uniqueId,
      name: newAccName,
      type: newAccType,
      value: parsedValue,
      isAsterisk: false,
      paid: false
    };

    if (newAccType === "installment") {
      const totalInst = parseInt(newAccInstallments) || 1;
      newExpense.installments = {
        current: 1,
        total: totalInst
      };
      newExpense.name = `${newAccName} (1/${totalInst})`;
    }

    // Adiciona no mês atual selecionado
    const updated = data.map(m => {
      if (m.id === selectedMonthId) {
        return { ...m, expenses: [...m.expenses, newExpense] };
      }
      return m;
    });

    // Se a conta for FIXA ou PARCELADA, também podemos propagá-la para os meses futuros!
    // Para simplificar e manter a segurança, vamos adicioná-la no mês atual selecionado.
    setData(updated);
    localStorage.setItem("dashflavio_data", JSON.stringify(updated));

    // Reset formulário
    setNewAccName("");
    setNewAccValue("");
    setNewAccType("fixed");
    setNewAccInstallments("1");
    setIsDialogOpen(false);
  };

  // Exportar Backup
  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `dashflavio_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const toggleTextSize = () => {
    const newVal = !isLargeText;
    setIsLargeText(newVal);
    localStorage.setItem("dashflavio_large_text", String(newVal));
  };

  // ==========================================================================
  // ESTRUTURAÇÃO DE DADOS PARA GRÁFICOS
  // ==========================================================================
  const chartData = data.map(m => {
    // Gastos pagos naquele mês
    const mPaid = m.expenses
      .filter(e => e.paid && e.type !== "adjustment")
      .reduce((sum, e) => sum + e.value, 0);

    return {
      id: m.id,
      name: m.name,
      "Gastos Pagos": Number(mPaid.toFixed(2)),
      "Receitas": m.proventos
    };
  });

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-slate-50/50 font-sans antialiased text-slate-800 selection:bg-indigo-500 selection:text-white ${isLargeText ? "text-lg md:text-xl" : "text-base"}`}>
        
        {/* ==========================================================================
           HEADER PREMIUM E SOFISTICADO (ESTILO BANCO PREMIUM LIGHT)
           ========================================================================== */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-8">
            
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl shadow-md shadow-indigo-600/10">
                LH
              </div>
              <div>
                <h1 className="font-extrabold tracking-tight text-slate-900 text-2xl md:text-3xl flex items-center gap-2">
                  Lady&apos;s House
                </h1>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-0.5">
                  Controle financeiro Lady&apos;s House
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Adicionar Conta Não Prevista */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger
                  className="flex h-12 items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold px-4 md:px-5 cursor-pointer transition-colors inline-flex justify-center"
                  title="Adicionar uma conta que não estava na lista original"
                >
                  <Plus className="h-5 w-5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Nova Conta</span>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[440px] rounded-2xl bg-white border border-slate-100 p-6 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-slate-900 font-extrabold text-xl">Adicionar Conta Não Prevista</DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm">
                      Insira os detalhes abaixo para adicionar este gasto na tabela de <strong className="capitalize text-indigo-600 font-extrabold">{selectedMonth.name}</strong>.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddAccount} className="flex flex-col gap-4 mt-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nome da Conta</label>
                      <Input
                        type="text"
                        value={newAccName}
                        onChange={(e) => setNewAccName(e.target.value)}
                        placeholder="Ex: Farmácia, Mercado Extra"
                        className="h-12 border-slate-200 focus:border-indigo-500 rounded-xl"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Valor Inicial (R$)</label>
                      <Input
                        type="number"
                        value={newAccValue}
                        onChange={(e) => setNewAccValue(e.target.value)}
                        placeholder="0,00"
                        step="0.01"
                        min="0"
                        className="h-12 border-slate-200 focus:border-indigo-500 rounded-xl"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tipo de Gasto</label>
                      <select
                        value={newAccType}
                        onChange={(e) => setNewAccType(e.target.value as any)}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="fixed">Gasto Fixo (recorrente)</option>
                        <option value="consumption">Gasto de Consumo (variável)</option>
                        <option value="installment">Gasto Parcelado</option>
                      </select>
                    </div>

                    {newAccType === "installment" && (
                      <div className="flex flex-col gap-1.5 animate-fadeIn">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Total de Parcelas</label>
                        <Input
                          type="number"
                          value={newAccInstallments}
                          onChange={(e) => setNewAccInstallments(e.target.value)}
                          min="1"
                          className="h-12 border-slate-200 focus:border-indigo-500 rounded-xl"
                          required
                        />
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md mt-2 w-full"
                    >
                      Confirmar e Adicionar
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Botão Letra Grande */}
              <Button
                variant="outline"
                onClick={toggleTextSize}
                className="flex h-12 items-center gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm rounded-xl px-4"
                title="Aumentar ou diminuir o tamanho dos textos da tela"
              >
                <span className="font-black text-lg">A<span className="text-sm">A</span></span>
                <span className="hidden sm:inline font-bold">Texto {isLargeText ? "Padrão" : "Grande"}</span>
              </Button>

              {/* Exportar Backup */}
              <Button
                variant="outline"
                onClick={handleExport}
                className="flex h-12 items-center gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm rounded-xl px-4"
                title="Salvar arquivo de alterações localmente"
              >
                <Download className="h-5 w-5 text-indigo-600" />
                <span className="hidden sm:inline font-bold">Backup</span>
              </Button>
            </div>

          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
          
          {/* ==========================================================================
             SELETOR DE MESES TOTALMENTE REFORMULADO (RESPONSIVO E HORIZONTAL COMPLETO)
             ========================================================================== */}
          <section className="mb-10 rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4 text-center sm:text-left">
              Selecione o mês para visualizar e gerenciar
            </span>
            
            {/* Desktop: Lista lado a lado completa sem setas */}
            <div className="hidden md:flex flex-wrap items-center justify-between gap-2.5">
              {MONTHS_ORDER.map(mId => {
                const isActive = selectedMonthId === mId;
                return (
                  <button
                    key={mId}
                    onClick={() => setSelectedMonthId(mId)}
                    className={`flex-1 h-12 rounded-xl font-extrabold transition-all text-sm uppercase tracking-wider border text-center flex items-center justify-center
                      ${isActive 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10 scale-105" 
                        : "bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-100 hover:text-slate-700"
                      }`}
                  >
                    {MONTH_NAMES[mId]}
                  </button>
                );
              })}
            </div>

            {/* Mobile: Dropdown Seletor Premium */}
            <div className="md:hidden relative w-full">
              <select
                value={selectedMonthId}
                onChange={(e) => setSelectedMonthId(e.target.value)}
                className="w-full h-14 rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 font-black text-slate-800 uppercase tracking-wider text-base focus:border-indigo-500 focus:outline-none appearance-none"
              >
                {MONTHS_ORDER.map(mId => (
                  <option key={mId} value={mId}>
                    {MONTH_NAMES[mId]} 2026
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown className="h-6 w-6 stroke-[3]" />
              </div>
            </div>
          </section>

          {/* ==========================================================================
             CARTÕES DE RESUMO (MÉTRICAS PREMIUM FINANCEIRAS COM FLUXO DE PAGOS)
             ========================================================================== */}
          <section className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Cartão de Entradas Disponíveis */}
            <div className="rounded-2xl bg-white p-7 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div className="flex-1">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block">Minhas Entradas</span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Altere clicando no número:</span>
                  <div className="relative mt-2 flex items-center">
                    <span className="mr-1 text-slate-500 font-bold text-xl">R$</span>
                    <input
                      type="number"
                      value={proventosValue || ""}
                      onChange={(e) => handleProventoChange(Number(e.target.value))}
                      className={`w-36 rounded-xl border border-dashed border-slate-200 bg-transparent px-2.5 py-0.5 font-black text-slate-800 focus:border-indigo-500 focus:bg-indigo-50/20 focus:outline-none transition-all
                        ${isLargeText ? "text-3xl" : "text-2xl"}`}
                      step="0.01"
                      min="0"
                      title="Clique aqui para alterar o valor de proventos deste mês"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cartão de Saídas (Soma de Contas Pagas) */}
            <div className="rounded-2xl bg-white p-7 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <TrendingDown className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block">Total Pago (Saídas)</span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Soma das contas marcadas como pagas:</span>
                  <p className={`font-black text-rose-600 mt-2 tracking-tight ${isLargeText ? "text-4xl" : "text-3xl"}`}>
                    R$ {totalPaidExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Cartão de Saldo Disponível (Diferença) */}
            <div className={`rounded-2xl p-7 border shadow-sm hover:shadow-md transition-all duration-300
              ${balanceAvailable >= 0 
                ? "bg-indigo-50/10 border-indigo-100/50" 
                : "bg-red-50/20 border-red-100"
              }`}>
              <div className="flex items-center gap-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border
                  ${balanceAvailable >= 0 
                    ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                    : "bg-red-100 text-red-600 border-red-200"
                  }`}>
                  <Wallet className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block">Saldo Disponível</span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Dinheiro livre na conta:</span>
                  <p className={`font-black mt-2 tracking-tight
                    ${balanceAvailable >= 0 ? "text-indigo-600" : "text-red-600"}
                    ${isLargeText ? "text-4xl" : "text-3xl"}`}>
                    R$ {balanceAvailable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

          </section>

          {/* ==========================================================================
             CONTEÚDO PRINCIPAL (Tabelas e Gráficos lado a lado)
             ========================================================================== */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Coluna Esquerda: Tabelas de Despesas */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <Card className="shadow-sm border-slate-100 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/30 pb-5 px-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className={`font-black text-slate-900 flex items-center gap-2 ${isLargeText ? "text-2xl" : "text-xl"}`}>
                        Contas de <span className="capitalize text-indigo-600 font-black">{selectedMonth.name}</span>
                      </CardTitle>
                      <CardDescription className={`text-slate-500 font-medium ${isLargeText ? "text-base" : "text-sm"}`}>
                        Marque o círculo para dar baixa (pagar) em cada conta. O saldo se atualizará na hora!
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="flex flex-col gap-8 p-6">
                    
                    {/* Grupo de Contas Gerais */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/20 p-5">
                      <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                          <Zap className="h-5 w-5 stroke-[2.5]" />
                        </div>
                        <h3 className="font-black text-slate-800 text-lg">Contas</h3>
                      </div>
                      
                      <TableExpensesList 
                        expenses={[...consumptionExpenses, ...fixedExpenses, ...installmentExpenses]} 
                        onValueChange={handleExpenseChange}
                        onTogglePaid={handleTogglePaid}
                        onDelete={handleDeleteExpense}
                        savedFeedbacks={savedFeedbacks}
                        isLargeText={isLargeText}
                        isFuture={selectedMonthId !== "abril"}
                      />
                    </div>

                    {/* Grupo de Reembolsos / Ajustes */}
                    {adjustments.length > 0 && (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/10 p-5">
                        <div className="flex items-center gap-3 mb-3 border-b border-emerald-100 pb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <Percent className="h-5 w-5 stroke-[2.5]" />
                          </div>
                          <h3 className="font-black text-emerald-800 text-lg">Reembolsos e Ajudas</h3>
                        </div>
                        
                        <TableExpensesList 
                          expenses={adjustments} 
                          onValueChange={handleExpenseChange}
                          onTogglePaid={handleTogglePaid}
                          onDelete={handleDeleteExpense}
                          savedFeedbacks={savedFeedbacks}
                          isLargeText={isLargeText}
                        />
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
              
            </div>

            {/* Coluna Direita: Gráficos de Projeção */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Gráfico de Barras de Contas Pagas */}
              <Card className="shadow-sm border-slate-100 bg-white rounded-2xl overflow-hidden p-6">
                <div className="mb-6">
                  <h3 className={`font-black text-slate-900 flex items-center gap-2 ${isLargeText ? "text-2xl" : "text-xl"}`}>
                    Evolução dos Pagamentos
                  </h3>
                  <p className="text-slate-500 font-medium text-xs mt-1">
                    Este gráfico rastreia a soma das contas que foram dadas como **pagas** de Abril a Dezembro de 2026.
                  </p>
                </div>
                
                <div className="h-80 w-full bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 10, left: -15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
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
                        dataKey="Gastos Pagos" 
                        radius={[6, 6, 0, 0]} 
                        maxBarSize={38}
                      >
                        {chartData.map((entry, index) => {
                          const isActive = entry.id === selectedMonthId;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={isActive ? "#4f46e5" : "#c7d2fe"} 
                              className="transition-all cursor-pointer hover:opacity-90"
                              onClick={() => setSelectedMonthId(entry.id)}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex justify-center gap-6 mt-6 text-sm text-slate-500 font-bold border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded bg-indigo-200 border border-indigo-300"></span>
                    Demais Meses
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded bg-indigo-600 shadow-sm shadow-indigo-600/10"></span>
                    Mês Ativo ({MONTH_NAMES[selectedMonthId]})
                  </div>
                </div>
              </Card>

              {/* Informação sobre despesas não pagas */}
              {totalProjectedExpenses - totalPaidExpenses > 0 && (
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-6 flex flex-col gap-2">
                  <h4 className="font-extrabold text-amber-800 flex items-center gap-2 text-base">
                    Contas Pendentes do Mês
                  </h4>
                  <p className="text-amber-700 text-sm font-medium">
                    Ainda restam **R$ {(totalProjectedExpenses - totalPaidExpenses).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}** em contas que não foram marcadas como pagas em {selectedMonth.name}.
                  </p>
                </div>
              )}

            </div>

          </div>

        </main>
        
        <footer className="mt-20 border-t border-slate-100 bg-white py-10 text-center text-slate-400 text-xs font-semibold tracking-widest">
          <p>© 2026 CONTROLE FINANCEIRO LADY&apos;S HOUSE. DESENVOLVIDO COM EXCLUSIVIDADE E ACESSIBILIDADE.</p>
        </footer>

      </div>
    </TooltipProvider>
  );
}

// ==========================================================================
// 5. COMPONENTE DE LISTAGEM FINANCEIRA (INTERFACES E CHECKS PREMIUM)
// ==========================================================================

interface TableExpensesListProps {
  expenses: Expense[];
  onValueChange: (expenseId: string, value: number) => void;
  onTogglePaid: (expenseId: string) => void;
  onDelete: (expenseId: string) => void;
  savedFeedbacks: Record<string, boolean>;
  isLargeText: boolean;
  isFuture?: boolean;
}

function TableExpensesList({ 
  expenses, 
  onValueChange, 
  onTogglePaid,
  onDelete,
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
          <TableRow className="border-b border-slate-100 hover:bg-transparent">
            <TableHead className="w-12"></TableHead> {/* Checkbox pago */}
            <TableHead className="w-2/5 font-extrabold text-slate-500 text-xs uppercase tracking-wider">Conta</TableHead>
            <TableHead className="w-1/4 font-extrabold text-slate-500 text-xs uppercase tracking-wider">Situação</TableHead>
            <TableHead className="w-1/4 text-right font-extrabold text-slate-500 text-xs uppercase tracking-wider">Valor</TableHead>
            <TableHead className="w-10"></TableHead> {/* Exclusão se for manual */}
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
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-100 animate-pulse">
                    Preencher!
                  </span>
                );
              } else {
                badgeComponent = (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50/50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-100">
                    Consumo
                  </span>
                );
              }
            } else if (exp.type === "fixed") {
              badgeComponent = (
                <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-100">
                  Fixo
                </span>
              );
            } else if (exp.type === "installment" && exp.installments) {
              const current = exp.installments.current;
              const total = exp.installments.total;
              
              badgeComponent = (
                <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-100">
                  Parc. {current}/{total}
                </span>
              );
            } else if (exp.type === "adjustment") {
              badgeComponent = (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-100">
                  Entrada/Reembolso
                </span>
              );
            }

            const isCustom = exp.id.startsWith("custom_");

            return (
              <TableRow 
                key={exp.id} 
                className={`border-b border-slate-100/70 hover:bg-slate-50/50 transition-colors duration-200
                  ${exp.paid ? "bg-emerald-50/20" : ""}
                  ${isSaved ? "bg-indigo-50/30" : ""}
                `}
              >
                {/* Checkbox Pago */}
                <TableCell className="py-4 text-center">
                  <button
                    onClick={() => onTogglePaid(exp.id)}
                    className={`h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none
                      ${exp.paid 
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" 
                        : "border-slate-300 bg-white hover:border-slate-400"
                      }`}
                    title={exp.paid ? "Marcar como pendente" : "Marcar como pago"}
                  >
                    {exp.paid && <Check className="h-4.5 w-4.5 stroke-[3]" />}
                  </button>
                </TableCell>

                {/* Nome */}
                <TableCell className={`py-4 font-bold text-slate-800 ${isLargeText ? "text-lg" : "text-base"} ${exp.paid ? "line-through text-slate-400 font-medium" : ""}`}>
                  {exp.name}
                </TableCell>
                
                {/* Situação */}
                <TableCell className="py-4">
                  {badgeComponent}
                </TableCell>
                
                {/* Valor Editável */}
                <TableCell className="py-4 text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-slate-400 text-xs font-bold">R$</span>
                      <Input
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSaveEdit(exp.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(exp.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-24 text-right font-extrabold text-indigo-600 border-2 border-indigo-500 bg-white h-9"
                        autoFocus
                        step="0.01"
                      />
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEdit(exp)}
                      className={`inline-flex items-center gap-1.5 cursor-pointer rounded-lg px-2.5 py-1 border border-slate-100 hover:border-indigo-400/30 hover:bg-indigo-50/50 transition-all font-black text-right text-indigo-700
                        ${isFuture && exp.value === 0 && exp.type === "consumption" 
                          ? "border-dashed border-amber-300 bg-amber-50 text-amber-700" 
                          : ""
                        }
                        ${exp.paid ? "text-slate-400 line-through font-bold bg-transparent border-transparent" : ""}
                        ${isLargeText ? "text-xl" : "text-lg"}`}
                      title="Clique para editar o valor da conta"
                    >
                      <span>
                        R$ {exp.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      {isSaved && (
                        <CheckCircle className="h-4.5 w-4.5 text-indigo-600 animate-bounce stroke-[2.5]" />
                      )}
                    </div>
                  )}
                </TableCell>

                {/* Excluir Conta Manual */}
                <TableCell className="py-4 text-center">
                  {isCustom ? (
                    <button
                      onClick={() => onDelete(exp.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Excluir esta conta manual"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
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
// 6. CUSTOM CHART TOOLTIP
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
    const paidSum = payload[0].value;
    const income = currentMonthData.Receitas;
    const balance = income - paidSum;
    const name = currentMonthData.name;

    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4.5 shadow-xl flex flex-col gap-1.5 text-sm text-slate-800">
        <h4 className="font-black text-slate-900 text-base border-b border-slate-100 pb-1.5 capitalize">{name} 2026</h4>
        <p className="font-semibold text-slate-500">
          Receitas: <span className="text-emerald-600 font-extrabold">R$ {income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </p>
        <p className="font-semibold text-slate-500">
          Total Pago: <span className="text-rose-600 font-extrabold">R$ {paidSum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </p>
        <p className="font-black border-t border-slate-100 pt-1.5 mt-1.5 text-indigo-600">
          Saldo Restante: R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }

  return null;
}

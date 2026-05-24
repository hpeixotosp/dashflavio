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
  ChevronDown,
  Sparkles,
  Type,
  CalendarDays
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
// 1. MODELOS E ESTRUTURAS DE DADOS (V4 - ESTÁVEL)
// ==========================================================================

interface Expense {
  id: string;
  name: string;
  type: "consumption" | "fixed" | "installment" | "adjustment";
  value: number;
  isAsterisk: boolean;
  paid: boolean;
  paymentDate?: string;
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
  "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

const MONTH_NAMES: Record<string, string> = {
  maio: "Maio",
  junho: "Junho",
  julho: "Julho",
  agosto: "Agosto",
  setembro: "Setembro",
  outubro: "Outubro",
  novembro: "Novembro",
  dezembro: "Dezembro"
};

const BASE_GENERAL_EXPENSES = [
  { id: "sabesp", name: "Sabesp", type: "consumption", value: 100.00, isAsterisk: true },
  { id: "cpfl", name: "CPFL", type: "consumption", value: 414.95, isAsterisk: true },
  { id: "iptu", name: "IPTU", type: "fixed", value: 100.78, isAsterisk: false },
  { id: "play_ps5", name: "Play PS5", type: "fixed", value: 44.90, isAsterisk: false },
  { id: "google", name: "Google", type: "fixed", value: 96.99, isAsterisk: false },
  { id: "celular", name: "Celular", type: "fixed", value: 64.90, isAsterisk: false },
  { id: "gato", name: "Gato", type: "fixed", value: 50.00, isAsterisk: false },
  { id: "prevent", name: "Prevent", type: "fixed", value: 796.12, isAsterisk: false },
  { id: "nubank", name: "Nubank", type: "consumption", value: 400.00, isAsterisk: true },
  { id: "cartao_elo", name: "Cartão Elo", type: "consumption", value: 0.00, isAsterisk: true },
  { id: "farmacia", name: "Farmácia", type: "consumption", value: 0.00, isAsterisk: true },
];

const BASE_SPECIFIC_EXPENSES = [
  { id: "casa", name: "Casa", type: "fixed", value: 1500.00, isAsterisk: false },
  { id: "vivo", name: "Vivo", type: "fixed", value: 150.00, isAsterisk: false },
  { id: "osan", name: "OSAN", type: "fixed", value: 65.00, isAsterisk: false },
  
  // Parcelas
  { id: "gran", name: "Gran", type: "installment", value: 135.00, isAsterisk: false, installments: { current: 10, total: 12 } },
  { id: "pia", name: "Pia", type: "installment", value: 20.00, isAsterisk: false, installments: { current: 18, total: 18 } },
  { id: "clovis_celular", name: "Clovis celular", type: "installment", value: 65.00, isAsterisk: false, installments: { current: 11, total: 12 } },
  { id: "ps5_parcela", name: "PS5", type: "installment", value: 200.00, isAsterisk: false, installments: { current: 10, total: 20 } },
  { id: "havan", name: "Havan", type: "installment", value: 26.00, isAsterisk: false, installments: { current: 8, total: 10 } },
  { id: "seguro_casa", name: "Seguro Casa", type: "installment", value: 24.00, isAsterisk: false, installments: { current: 9, total: 10 } },
  { id: "jogo_panelas", name: "Jogo panelas", type: "installment", value: 51.00, isAsterisk: false, installments: { current: 4, total: 9 } },
  { id: "teclado_mouse", name: "Teclado e mouse", type: "installment", value: 34.00, isAsterisk: false, installments: { current: 4, total: 4 } },
  { id: "ventilador", name: "Ventilador", type: "installment", value: 50.00, isAsterisk: false, installments: { current: 4, total: 7 } },
  { id: "microondas", name: "Microondas", type: "installment", value: 67.00, isAsterisk: false, installments: { current: 4, total: 11 } },
  { id: "tv_parcela", name: "TV", type: "installment", value: 90.00, isAsterisk: false, installments: { current: 4, total: 21 } },
  { id: "campainha", name: "Campainha", type: "installment", value: 22.00, isAsterisk: false, installments: { current: 3, total: 8 } },
  { id: "fone", name: "Fone", type: "installment", value: 26.00, isAsterisk: false, installments: { current: 3, total: 12 } },
  { id: "pc", name: "PC", type: "installment", value: 540.00, isAsterisk: false, installments: { current: 3, total: 10 } },
  { id: "compras", name: "Compras", type: "consumption", value: 510.00, isAsterisk: true },
  { id: "clovis_nirv", name: "Clovis nirv", type: "installment", value: 100.00, isAsterisk: false, installments: { current: 2, total: 3 } },
  { id: "ifood", name: "IFOOD", type: "consumption", value: 135.00, isAsterisk: true },
];

// ==========================================================================
// 2. FUNÇÃO GERADORA DE DADOS ANUAIS (REGRA DE MAIO - COMPLETA)
// ==========================================================================
const generateInitialDashboardData = (): MonthData[] => {
  const data: MonthData[] = [];

  MONTHS_ORDER.forEach((monthId, index) => {
    const proventos = 8480.00;
    const expenses: Expense[] = [];

    // index indica a evolução desde Maio (Maio = 0, Junho = 1, etc.)
    const monthsSinceApril = index + 1;

    // 1. Gerais (Com preenchimento real de Maio)
    BASE_GENERAL_EXPENSES.forEach(exp => {
      let val = exp.value;
      if (exp.isAsterisk) {
        if (index === 0) {
          // Valores reais da imagem para Maio
          if (exp.id === "sabesp") val = 100.00;
          else if (exp.id === "cpfl") val = 415.00;
          else if (exp.id === "nubank") val = 400.00;
          else if (exp.id === "cartao_elo") val = 170.00;
          else val = 0.00;
        } else {
          // Zerados nos demais meses
          val = 0.00;
        }
      }
      expenses.push({ ...JSON.parse(JSON.stringify(exp)), value: val, paid: false });
    });

    // 2. Fixas específicas (Casa, Vivo, OSAN)
    expenses.push(
      { id: "casa", name: "Casa", type: "fixed", value: 1500.00, isAsterisk: false, paid: false },
      { id: "vivo", name: "Vivo", type: "fixed", value: 150.00, isAsterisk: false, paid: false },
      { id: "osan", name: "OSAN", type: "fixed", value: 65.00, isAsterisk: false, paid: false }
    );

    // 3. Consumo específicas (Compras e IFOOD) - Pré-preenchidas em Maio, zeradas nos demais
    let comprasVal = 0.00;
    let ifoodVal = 0.00;
    if (index === 0) {
      comprasVal = 1080.00; // Valor real em Maio
      ifoodVal = 150.00;    // Valor real em Maio
    }
    expenses.push(
      { id: "compras", name: "Compras", type: "consumption", value: comprasVal, isAsterisk: true, paid: false },
      { id: "ifood", name: "IFOOD", type: "consumption", value: ifoodVal, isAsterisk: true, paid: false }
    );

    // 4. Lógica de parcelas decrementando (Débito)
    BASE_SPECIFIC_EXPENSES.forEach(exp => {
      if (exp.type === "installment" && exp.installments) {
        const nextInstallmentNum = exp.installments.current + monthsSinceApril;
        if (nextInstallmentNum <= exp.installments.total) {
          expenses.push({
            id: exp.id,
            name: `${exp.name} (${nextInstallmentNum}/${exp.installments.total})`,
            type: "installment",
            value: exp.value,
            isAsterisk: false,
            paid: false,
            installments: {
              current: nextInstallmentNum,
              total: exp.installments.total
            }
          });
        }
      }
    });

    // 5. Dente como Reembolso/Ajuste (Crédito) parcelado de 18 meses (iniciando em 1/18)
    const denteInstallmentNum = monthsSinceApril; // 1 em Maio, 2 em Junho, etc.
    if (denteInstallmentNum <= 18) {
      expenses.push({
        id: "dente_reembolso",
        name: `Dente (${denteInstallmentNum}/18)`,
        type: "adjustment",
        value: 250.00, // Crédito recorrente fixado de 250 reais
        isAsterisk: false,
        paid: false,
        installments: {
          current: denteInstallmentNum,
          total: 18
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

// Sanitização de nomes de exibição (garante a remoção de asteriscos)
const cleanName = (name: string) => {
  return name.replace(/\*/g, "").trim();
};

export default function DashboardClient() {
  const [data, setData] = useState<MonthData[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<string>("maio");
  const [savedFeedbacks, setSavedFeedbacks] = useState<Record<string, boolean>>({});
  const [isLargeText, setIsLargeText] = useState<boolean>(false);

  // Formulário de Nova Conta
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newAccName, setNewAccName] = useState<string>("");
  const [newAccValue, setNewAccValue] = useState<string>("");
  const [newAccType, setNewAccType] = useState<"consumption" | "fixed" | "installment">("fixed");
  const [newAccInstallments, setNewAccInstallments] = useState<string>("1");

  // Formulário de Novo Crédito
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState<boolean>(false);
  const [newCreditName, setNewCreditName] = useState<string>("");
  const [newCreditValue, setNewCreditValue] = useState<string>("");
  const [newCreditType, setNewCreditType] = useState<"fixed" | "installment">("fixed");
  const [newCreditInstallments, setNewCreditInstallments] = useState<string>("1");

  useEffect(() => {
    // Nova chave V9 para recarregar com Dente crédito e Farmácia débito variável
    const stored = localStorage.getItem("dashflavio_data_v9");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        setData(generateInitialDashboardData());
      }
    } else {
      const initial = generateInitialDashboardData();
      setData(initial);
      localStorage.setItem("dashflavio_data_v9", JSON.stringify(initial));
    }

    const storedTextSize = localStorage.getItem("dashflavio_large_text");
    if (storedTextSize === "true") {
      setIsLargeText(true);
    }
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-xl font-bold text-primary animate-pulse font-sans tracking-wide">Carregando painel...</p>
      </div>
    );
  }

  const selectedMonth = data.find(m => m.id === selectedMonthId) || data[0];

  // ==========================================================================
  // CÁLCULOS DINÂMICOS (AS CONTAS SÃO CONSIDERADAS POR PADRÃO!)
  // ==========================================================================
  const proventosValue = selectedMonth.proventos;

  const consumptionExpenses = selectedMonth.expenses.filter(e => e.type === "consumption");
  const fixedExpenses = selectedMonth.expenses.filter(e => e.type === "fixed");
  const installmentExpenses = selectedMonth.expenses.filter(e => e.type === "installment");
  const adjustments = selectedMonth.expenses.filter(e => e.type === "adjustment");

  // 1. Saídas (Total de Gastos) = Todas as contas ativas listadas são consideradas por padrão!
  const grossExpenses = 
    consumptionExpenses.reduce((sum, e) => sum + e.value, 0) +
    fixedExpenses.reduce((sum, e) => sum + e.value, 0) +
    installmentExpenses.reduce((sum, e) => sum + e.value, 0);

  // Total de descontos
  const totalAdjustments = adjustments.reduce((sum, e) => sum + e.value, 0);

  // Total de Gastos Líquidos (Saídas)
  const totalExpensesValue = Math.max(0, grossExpenses - totalAdjustments);

  // 2. Entradas = Proventos + Reembolsos
  const totalIncomeValue = proventosValue + totalAdjustments;

  // 3. Saldo Disponível (Diferença) = Entradas - Saídas
  const balanceAvailable = totalIncomeValue - totalExpensesValue;

  // Total das faturas pagas no mês (para exibição de pendências)
  const totalPaidExpenses = selectedMonth.expenses
    .filter(e => e.paid && e.type !== "adjustment")
    .reduce((sum, e) => sum + e.value, 0);

  // ==========================================================================
  // EDITORES DE ESTADO E PERSISTÊNCIA
  // ==========================================================================
  
  // Alternar Pago / Pendente com Preenchimento Automático de Data
  const handleTogglePaid = (expenseId: string) => {
    const updated = data.map(m => {
      if (m.id === selectedMonthId) {
        const updatedExpenses = m.expenses.map(e => {
          if (e.id === expenseId) {
            const isPaying = !e.paid;
            const todayStr = isPaying ? new Date().toLocaleDateString("sv-SE") : ""; 
            return {
              ...e,
              paid: isPaying,
              paymentDate: todayStr
            };
          }
          return e;
        });
        return { ...m, expenses: updatedExpenses };
      }
      return m;
    });
    setData(updated);
    localStorage.setItem("dashflavio_data_v9", JSON.stringify(updated));
  };

  // Alterar data de pagamento manualmente
  const handlePaymentDateChange = (expenseId: string, dateStr: string) => {
    const updated = data.map(m => {
      if (m.id === selectedMonthId) {
        const updatedExpenses = m.expenses.map(e => {
          if (e.id === expenseId) {
            return { ...e, paymentDate: dateStr };
          }
          return e;
        });
        return { ...m, expenses: updatedExpenses };
      }
      return m;
    });
    setData(updated);
    localStorage.setItem("dashflavio_data_v9", JSON.stringify(updated));
  };

  // Alterar Provento do Mês
  const handleProventoChange = (val: number) => {
    const updated = data.map(m => {
      if (m.id === selectedMonthId) {
        return { ...m, proventos: val };
      }
      return m;
    });
    setData(updated);
    localStorage.setItem("dashflavio_data_v9", JSON.stringify(updated));
  };

  // Alterar valor da despesa na tabela
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
    localStorage.setItem("dashflavio_data_v9", JSON.stringify(updated));

    setSavedFeedbacks(prev => ({ ...prev, [expenseId]: true }));
    setTimeout(() => {
      setSavedFeedbacks(prev => ({ ...prev, [expenseId]: false }));
    }, 1000);
  };

  // Excluir qualquer conta! ("eu devo ter a opção de excluí-la.")
  const handleDeleteExpense = (expenseId: string) => {
    if (confirm("Você deseja realmente excluir esta conta da lista deste mês?")) {
      const updated = data.map(m => {
        if (m.id === selectedMonthId) {
          return { ...m, expenses: m.expenses.filter(e => e.id !== expenseId) };
        }
        return m;
      });
      setData(updated);
      localStorage.setItem("dashflavio_data_v9", JSON.stringify(updated));
    }
  };

  // Adicionar Nova Conta Não Prevista
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedValue = parseFloat(newAccValue);
    if (!newAccName.trim() || isNaN(parsedValue) || parsedValue < 0) {
      alert("Por favor, preencha os dados corretamente.");
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

    const updated = data.map(m => {
      if (m.id === selectedMonthId) {
        return { ...m, expenses: [...m.expenses, newExpense] };
      }
      return m;
    });

    setData(updated);
    localStorage.setItem("dashflavio_data_v9", JSON.stringify(updated));

    setNewAccName("");
    setNewAccValue("");
    setNewAccType("fixed");
    setNewAccInstallments("1");
    setIsDialogOpen(false);
  };

  // Adicionar Novo Crédito Não Previsto
  const handleAddCredit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedValue = parseFloat(newCreditValue);
    if (!newCreditName.trim() || isNaN(parsedValue) || parsedValue < 0) {
      alert("Por favor, preencha os dados corretamente.");
      return;
    }

    const uniqueId = `custom_credit_${Date.now()}`;
    const newCredit: Expense = {
      id: uniqueId,
      name: newCreditName,
      type: "adjustment", // Crédito/Reembolso
      value: parsedValue,
      isAsterisk: false,
      paid: false
    };

    if (newCreditType === "installment") {
      const totalInst = parseInt(newCreditInstallments) || 1;
      newCredit.installments = {
        current: 1,
        total: totalInst
      };
      newCredit.name = `${newCreditName} (1/${totalInst})`;
    }

    const updated = data.map(m => {
      if (m.id === selectedMonthId) {
        return { ...m, expenses: [...m.expenses, newCredit] };
      }
      return m;
    });

    setData(updated);
    localStorage.setItem("dashflavio_data_v9", JSON.stringify(updated));

    setNewCreditName("");
    setNewCreditValue("");
    setNewCreditType("fixed");
    setNewCreditInstallments("1");
    setIsCreditDialogOpen(false);
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

  // ESTRUTURAÇÃO DE DADOS PARA O GRÁFICO (GASTOS TOTAIS PROJETADOS POR PADRÃO)
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

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary/30 selection:text-primary-foreground ${isLargeText ? "text-lg md:text-xl" : "text-base"}`}>
        
        {/* ==========================================================================
           HEADER ULTRA-PREMIUM NATIVE DARK LUXURY
           ========================================================================== */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-8">
            
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-white font-black text-2xl shadow-xl shadow-primary/25 border border-primary/20 tracking-wider">
                LH
              </div>
              <div>
                <h1 className="font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-2 text-2xl md:text-3xl">
                  Lady&apos;s House
                </h1>
                <p className="text-muted-foreground/90 font-black text-[9px] md:text-[10px] uppercase tracking-[0.22em] mt-1">
                  CONTROLE FINANCEIRO LADY&apos;S HOUSE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Adicionar Conta Não Prevista */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger
                  className="flex h-12 items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg font-bold px-4 md:px-5 cursor-pointer transition-all inline-flex justify-center border border-primary/20 hover:scale-105"
                  title="Adicionar uma conta não programada na tabela"
                >
                  <Plus className="h-5 w-5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Nova Conta</span>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[440px] rounded-2xl bg-card border border-border p-6 shadow-2xl text-foreground">
                  <DialogHeader>
                    <DialogTitle className="text-white font-extrabold text-xl">Adicionar Conta Não Prevista</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                      Insira os detalhes abaixo para adicionar este gasto na tabela de <strong className="capitalize text-primary font-extrabold">{selectedMonth.name}</strong>.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddAccount} className="flex flex-col gap-4 mt-4 text-foreground">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome da Conta</label>
                      <Input
                        type="text"
                        value={newAccName}
                        onChange={(e) => setNewAccName(e.target.value)}
                        placeholder="Ex: Sabesp, CPFL, Mercado"
                        className="h-12 border-border bg-background focus:border-primary rounded-xl"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor Inicial (R$)</label>
                      <Input
                        type="number"
                        value={newAccValue}
                        onChange={(e) => setNewAccValue(e.target.value)}
                        placeholder="0,00"
                        step="0.01"
                        min="0"
                        className="h-12 border-border bg-background focus:border-primary rounded-xl"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tipo de Gasto</label>
                      <select
                        value={newAccType}
                        onChange={(e) => setNewAccType(e.target.value as any)}
                        className="h-12 w-full rounded-xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="fixed">Gasto Fixo (recorrente)</option>
                        <option value="consumption">Gasto de Consumo (variável)</option>
                        <option value="installment">Gasto Parcelado</option>
                      </select>
                    </div>

                    {newAccType === "installment" && (
                      <div className="flex flex-col gap-1.5 animate-fadeIn">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total de Parcelas</label>
                        <Input
                          type="number"
                          value={newAccInstallments}
                          onChange={(e) => setNewAccInstallments(e.target.value)}
                          min="1"
                          className="h-12 border-border bg-background focus:border-primary rounded-xl"
                          required
                        />
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md mt-2 w-full"
                    >
                      Confirmar e Adicionar
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Adicionar Crédito Não Previsto */}
              <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
                <DialogTrigger
                  className="flex h-12 items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg font-bold px-4 md:px-5 cursor-pointer transition-all inline-flex justify-center border border-emerald-500/20 hover:scale-105"
                  title="Adicionar uma receita ou reembolso na tabela"
                >
                  <Plus className="h-5 w-5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Novo Crédito</span>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[440px] rounded-2xl bg-card border border-border p-6 shadow-2xl text-foreground">
                  <DialogHeader>
                    <DialogTitle className="text-white font-extrabold text-xl">Adicionar Crédito / Reembolso</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                      Insira os detalhes abaixo para adicionar este reembolso ou ajuda na tabela de <strong className="capitalize text-emerald-400 font-extrabold">{selectedMonth.name}</strong>.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCredit} className="flex flex-col gap-4 mt-4 text-foreground">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome do Crédito</label>
                      <Input
                        type="text"
                        value={newCreditName}
                        onChange={(e) => setNewCreditName(e.target.value)}
                        placeholder="Ex: Reembolso Consulta, Ajuda Clovis"
                        className="h-12 border-border bg-background focus:border-emerald-500 rounded-xl"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor Inicial (R$)</label>
                      <Input
                        type="number"
                        value={newCreditValue}
                        onChange={(e) => setNewCreditValue(e.target.value)}
                        placeholder="0,00"
                        step="0.01"
                        min="0"
                        className="h-12 border-border bg-background focus:border-emerald-500 rounded-xl"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tipo de Crédito</label>
                      <select
                        value={newCreditType}
                        onChange={(e) => setNewCreditType(e.target.value as any)}
                        className="h-12 w-full rounded-xl border border-border bg-background px-3 font-semibold text-foreground focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="fixed">Crédito Fixo (recorrente)</option>
                        <option value="installment">Crédito Parcelado</option>
                      </select>
                    </div>

                    {newCreditType === "installment" && (
                      <div className="flex flex-col gap-1.5 animate-fadeIn">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total de Parcelas</label>
                        <Input
                          type="number"
                          value={newCreditInstallments}
                          onChange={(e) => setNewCreditInstallments(e.target.value)}
                          min="1"
                          className="h-12 border-border bg-background focus:border-emerald-500 rounded-xl"
                          required
                        />
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md mt-2 w-full"
                    >
                      Confirmar e Adicionar
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Botão de Acessibilidade */}
              <Button
                variant="outline"
                onClick={toggleTextSize}
                className="flex h-12 items-center gap-2 border-border bg-card hover:bg-muted hover:border-primary/20 text-foreground shadow-sm transition-all rounded-xl px-4"
                title="Aumentar tamanho das letras para melhor conforto"
              >
                <Type className="h-5 w-5 text-primary" />
                <span className="hidden sm:inline font-bold">Texto {isLargeText ? "Padrão" : "Grande"}</span>
              </Button>

              {/* Salvar Backup */}
              <Button
                variant="outline"
                onClick={handleExport}
                className="flex h-12 items-center gap-2 border-border bg-card hover:bg-muted hover:border-primary/20 text-foreground shadow-sm transition-all rounded-xl px-4"
                title="Salvar arquivo de backup localmente"
              >
                <Download className="h-5 w-5 text-primary" />
                <span className="hidden sm:inline font-bold">Backup</span>
              </Button>
            </div>

          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
          
          {/* ==========================================================================
             SELETOR DE MESES HORIZONTAL COMPLETO (DESKTOP E DROPDOWN MOBILE)
             ========================================================================== */}
          <section className="mb-10 rounded-2xl bg-card p-5 border border-border shadow-md">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-4 text-center sm:text-left">
              Selecione o mês para visualizar e gerenciar
            </span>
            
            {/* Desktop: Lista completa lado a lado */}
            <div className="hidden md:flex flex-wrap items-center justify-between gap-2.5">
              {MONTHS_ORDER.map(mId => {
                const isActive = selectedMonthId === mId;
                return (
                  <button
                    key={mId}
                    onClick={() => setSelectedMonthId(mId)}
                    className={`flex-1 h-12 rounded-xl font-extrabold transition-all text-sm uppercase tracking-wider border text-center flex items-center justify-center cursor-pointer
                      ${isActive 
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105" 
                        : "bg-background hover:bg-muted text-muted-foreground border-border hover:text-foreground"
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
                className="w-full h-14 rounded-2xl border-2 border-border bg-card px-5 font-black text-foreground uppercase tracking-wider text-base focus:border-primary focus:outline-none appearance-none"
              >
                {MONTHS_ORDER.map(mId => (
                  <option key={mId} value={mId}>
                    {MONTH_NAMES[mId]} 2026
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <ChevronDown className="h-6 w-6 stroke-[3]" />
              </div>
            </div>
          </section>

          {/* ==========================================================================
             CARTÕES DE RESUMO (NATIVE DEEP SLATE CARDS)
             ========================================================================== */}
          <section className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Card Proventos */}
            <Card className="shadow-lg border-border bg-card group hover:border-emerald-500/30 transition-all duration-300">
              <CardContent className="flex items-center gap-5 p-7">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
                  <TrendingUp className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div className="flex-1">
                  <span className="text-muted-foreground font-bold text-xs uppercase tracking-wider block">Minhas Entradas</span>
                  <span className="text-[10px] text-muted-foreground/60 font-semibold mt-0.5 block">Altere clicando no número:</span>
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
              </CardContent>
            </Card>

            {/* Card Gastos (Soma de todas as contas por padrão, não precisa clicar em nada!) */}
            <Card className="shadow-lg border-border bg-card group hover:border-rose-500/30 transition-all duration-300">
              <CardContent className="flex items-center gap-5 p-7">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-md">
                  <TrendingDown className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-muted-foreground font-bold text-xs uppercase tracking-wider block">Total de Gastos (Saídas)</span>
                  <span className="text-[10px] text-muted-foreground/60 font-semibold mt-0.5 block">Soma de todas as despesas listadas:</span>
                  <p className={`font-black text-rose-400 mt-2.5 tracking-tight ${isLargeText ? "text-4xl" : "text-3xl"}`}>
                    R$ {totalExpensesValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card Saldo Final */}
            <Card className={`shadow-lg border-border transition-all duration-300 group
              ${balanceAvailable >= 0 
                ? "bg-card hover:border-primary/30" 
                : "bg-red-950/10 border-red-900/30 hover:border-red-500/40"
              }`}>
              <CardContent className="flex items-center gap-5 p-7">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border shadow-md
                  ${balanceAvailable >= 0 
                    ? "bg-primary/10 text-primary border-primary/20" 
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                  }`}>
                  <Wallet className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-muted-foreground font-bold text-xs uppercase tracking-wider block">Saldo Disponível</span>
                  <span className="text-[10px] text-muted-foreground/60 font-semibold mt-0.5 block">Dinheiro líquido restante:</span>
                  <p className={`font-black mt-2.5 tracking-tight
                    ${balanceAvailable >= 0 ? "text-primary" : "text-red-500"}
                    ${isLargeText ? "text-4xl" : "text-3xl"}`}>
                    R$ {balanceAvailable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>

          </section>

          {/* ==========================================================================
             GRADE DE LAYOUT (ESQUERDA: LISTA FINANCEIRA, DIREITA: GRÁFICOS)
             ========================================================================== */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Esquerda: Listagem de Contas por Categoria */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <Card className="shadow-2xl border-border bg-card rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border bg-muted/30 pb-5 px-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className={`font-black text-slate-100 flex items-center gap-2 ${isLargeText ? "text-2xl" : "text-xl"}`}>
                        Contas de <span className="capitalize text-primary font-black">{selectedMonth.name}</span>
                      </CardTitle>
                      <CardDescription className={`text-muted-foreground font-medium ${isLargeText ? "text-base" : "text-sm"}`}>
                        Dê um clique no valor em azul para atualizar. Todas as contas são somadas por padrão.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6">
                    
                    {/* Grupo Único e Limpo de Contas */}
                    <div className="rounded-2xl border border-border bg-background/50 p-5">
                      <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                          <Zap className="h-5 w-5 stroke-[2.5]" />
                        </div>
                        <h3 className="font-black text-slate-200 text-lg">Contas</h3>
                      </div>
                      
                      <TableExpensesList 
                        expenses={[...consumptionExpenses, ...fixedExpenses, ...installmentExpenses]} 
                        onValueChange={handleExpenseChange}
                        onTogglePaid={handleTogglePaid}
                        onDateChange={handlePaymentDateChange}
                        onDelete={handleDeleteExpense}
                        savedFeedbacks={savedFeedbacks}
                        isLargeText={isLargeText}
                        isFuture={true} // Todos começam zerados por padrão
                      />
                    </div>

                    {/* Grupo de Reembolsos / Ajustes */}
                    {adjustments.length > 0 && (
                      <div className="rounded-2xl border border-border bg-background/50 p-5">
                        <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Percent className="h-5 w-5 stroke-[2.5]" />
                          </div>
                          <h3 className="font-black text-emerald-300 text-lg">Reembolsos e Ajudas</h3>
                        </div>
                        
                        <TableExpensesList 
                          expenses={adjustments} 
                          onValueChange={handleExpenseChange}
                          onTogglePaid={handleTogglePaid}
                          onDateChange={handlePaymentDateChange}
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

            {/* Direita: Gráfico de Evolução e Estatísticas */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Gráfico de Barras de Gastos Totais */}
              <Card className="shadow-2xl border-border bg-card rounded-2xl overflow-hidden p-6">
                <div className="mb-6">
                  <h3 className={`font-black text-slate-100 flex items-center gap-2 ${isLargeText ? "text-2xl" : "text-xl"}`}>
                    <Sparkles className="h-6 w-6 text-primary" />
                    Gastos do Mês
                  </h3>
                  <p className="text-muted-foreground font-medium text-xs mt-1">
                    Este gráfico projeta o **Total de Gastos** considerado por padrão para cada mês de Maio a Dezembro de 2026.
                  </p>
                </div>
                
                <div className="h-80 w-full bg-slate-950/40 rounded-2xl p-5 border border-border/80 shadow-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="bar-normal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#312e81" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="bar-selected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="var(--muted-foreground)" 
                        fontSize={13} 
                        fontWeight={700}
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <YAxis 
                        stroke="var(--muted-foreground)" 
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
                
                <div className="flex justify-center gap-6 mt-6 text-sm text-muted-foreground font-bold border-t border-border pt-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded bg-primary/40 border border-primary/20"></span>
                    Demais Meses
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded bg-primary shadow-md shadow-primary/20"></span>
                    Mês Selecionado ({MONTH_NAMES[selectedMonthId]})
                  </div>
                </div>
              </Card>

              {/* Informação sobre faturas pendentes */}
              {totalExpensesValue - totalPaidExpenses > 0 && (
                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 flex flex-col gap-2">
                  <h4 className="font-extrabold text-primary flex items-center gap-2 text-base">
                    Contas Pendentes de Baixa
                  </h4>
                  <p className="text-muted-foreground text-sm font-medium">
                    Ainda restam **R$ {(totalExpensesValue - totalPaidExpenses).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}** em faturas a marcar como pagas em {selectedMonth.name}.
                  </p>
                </div>
              )}

            </div>

          </div>

        </main>
        
        <footer className="mt-20 border-t border-border bg-card py-10 text-center text-muted-foreground text-sm font-black tracking-[0.1em] uppercase">
          <p>© 2026 Controle Financeiro Lady&apos;s House</p>
        </footer>

      </div>
    </TooltipProvider>
  );
}

// ==========================================================================
// 4. COMPONENTE AUXILIAR: TABELA FINANCEIRA DE DESPESAS (NATIVE DARK LUXURY)
// ==========================================================================

interface TableExpensesListProps {
  expenses: Expense[];
  onValueChange: (expenseId: string, value: number) => void;
  onTogglePaid: (expenseId: string) => void;
  onDateChange: (expenseId: string, dateStr: string) => void;
  onDelete: (expenseId: string) => void;
  savedFeedbacks: Record<string, boolean>;
  isLargeText: boolean;
  isFuture?: boolean;
}

function TableExpensesList({ 
  expenses, 
  onValueChange, 
  onTogglePaid,
  onDateChange,
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
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="font-extrabold text-slate-400 text-xs uppercase tracking-wider">Conta</TableHead>
            <TableHead className="hidden md:table-cell w-[100px] font-extrabold text-slate-400 text-xs uppercase tracking-wider">Tipo</TableHead>
            <TableHead className="w-[110px] md:w-[150px] text-right font-extrabold text-slate-400 text-xs uppercase tracking-wider">Valor</TableHead>
            <TableHead className="w-[70px] text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Pago?</TableHead>
            <TableHead className="w-[50px] text-center"></TableHead> {/* Lixeira */}
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
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20 animate-pulse">
                    Preencher!
                  </span>
                );
              } else {
                badgeComponent = (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/5 px-2.5 py-0.5 text-[11px] font-bold text-amber-500/80 border border-amber-500/10">
                    Consumo
                  </span>
                );
              }
            } else if (exp.type === "fixed") {
              badgeComponent = (
                <span className="inline-flex items-center gap-1 rounded-lg bg-primary/5 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/10">
                  Fixo
                </span>
              );
            } else if (exp.type === "installment" && exp.installments) {
              const current = exp.installments.current;
              const total = exp.installments.total;
              
              badgeComponent = (
                <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/5 px-2.5 py-0.5 text-[11px] font-bold text-purple-400/80 border border-purple-500/10">
                  Parc. {current}/{total}
                </span>
              );
            } else if (exp.type === "adjustment") {
              badgeComponent = (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                  Reembolso
                </span>
              );
            }

            return (
              <TableRow 
                key={exp.id} 
                className={`border-b border-border/50 hover:bg-muted/10 transition-colors
                  ${exp.paid ? "bg-emerald-950/10" : ""}
                  ${isSaved ? "bg-primary/5" : ""}
                `}
              >
                {/* 1. Nome + Data de Pagamento Integrada logo abaixo */}
                <TableCell className={`py-4 font-bold text-slate-200 ${isLargeText ? "text-lg" : "text-base"}`}>
                  <div className="flex flex-col">
                    <span className={exp.paid ? "line-through text-slate-500 font-medium" : ""}>
                      {cleanName(exp.name)}
                    </span>
                    
                    {/* DATA DE PAGAMENTO INTEGRADA: Espaço horizontal poupado e layout 100% limpo! */}
                    {exp.paid && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 font-semibold animate-fadeIn">
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded tracking-wide uppercase">Pago</span>
                        <span>no dia:</span>
                        <div className="relative inline-flex items-center gap-1.5 bg-slate-900 border border-border rounded-lg px-2 py-0.5 text-xs text-slate-200">
                          <input
                            type="date"
                            value={exp.paymentDate || ""}
                            onChange={(e) => onDateChange(exp.id, e.target.value)}
                            className="bg-transparent border-none text-slate-200 font-bold focus:outline-none focus:ring-0 cursor-pointer text-xs w-28 h-6"
                            title="Alterar data do pagamento"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
                
                {/* 2. Tipo Badge (Oculto no mobile) */}
                <TableCell className="py-4 hidden md:table-cell">
                  {badgeComponent}
                </TableCell>

                {/* 3. Valor Editável */}
                <TableCell className="py-4 text-right whitespace-nowrap">
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
                        className="w-28 text-right font-extrabold text-primary border-2 border-primary bg-background h-9"
                        autoFocus
                        step="0.01"
                      />
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEdit(exp)}
                      className={`inline-flex items-center gap-2 cursor-pointer rounded-xl px-3.5 py-2 border border-border bg-background/50 hover:border-primary/30 hover:bg-muted text-primary whitespace-nowrap
                        ${isFuture && exp.value === 0 && exp.type === "consumption" 
                          ? "border-dashed border-amber-500/40 bg-amber-500/5 text-amber-400 hover:border-amber-500/60 hover:bg-amber-950/20" 
                          : ""
                        }
                        ${exp.paid ? "text-slate-500 line-through font-bold bg-transparent border-transparent" : ""}
                        ${isLargeText ? "text-xl" : "text-lg"}`}
                      title="Clique para editar o valor"
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

                {/* 4. Checkbox Pago */}
                <TableCell className="py-4 text-center">
                  <button
                    onClick={() => onTogglePaid(exp.id)}
                    className={`h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none cursor-pointer mx-auto
                      ${exp.paid 
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-500/20" 
                        : "border-slate-700 bg-background hover:border-slate-500"
                      }`}
                    title={exp.paid ? "Marcar como pendente" : "Marcar como pago"}
                  >
                    {exp.paid && <Check className="h-4 w-4 stroke-[3]" />}
                  </button>
                </TableCell>

                {/* 5. Excluir Conta por Padrão */}
                <TableCell className="py-4 text-center">
                  <button
                    onClick={() => onDelete(exp.id)}
                    className="text-slate-500 hover:text-red-500 p-2 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Excluir esta conta da lista deste mês"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
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
    const grossSum = payload[0].value;
    const income = currentMonthData.Receitas;
    const balance = income - grossSum;
    const name = currentMonthData.name;

    return (
      <div className="rounded-2xl border border-border bg-card p-4.5 shadow-2xl flex flex-col gap-1.5 text-sm text-foreground">
        <h4 className="font-black text-white text-base border-b border-border pb-1.5 capitalize">{name} 2026</h4>
        <p className="font-semibold text-muted-foreground">
          Receitas: <span className="text-emerald-400 font-extrabold">R$ {income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </p>
        <p className="font-semibold text-muted-foreground">
          Total Gastos: <span className="text-rose-400 font-extrabold">R$ {grossSum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </p>
        <p className="font-black border-t border-border pt-1.5 mt-1.5 text-primary">
          Saldo Disponível: R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }

  return null;
}

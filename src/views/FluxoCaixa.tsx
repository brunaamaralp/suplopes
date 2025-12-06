import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, Button, Select, Badge } from '../components/ui';
import { FORMAT_CURRENCY, MovementType, TransactionType, Nature } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, CartesianGrid, ReferenceLine, Area, Cell } from 'recharts';
import { FileText, Download, ChevronRight, ChevronDown } from 'lucide-react';
import { exportToCSV } from '../services/export';

export const FluxoCaixa: React.FC = () => {
  const { transactions, accounts, categories } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Helper to determine if a transaction is income or expense for a specific account
  // For transfers, we need to check the category nature
  const getTransactionEffect = (t: typeof transactions[0], forAccount: string | 'all') => {
    if (t.type === MovementType.INCOME) {
      return { isIncome: true, isExpense: false, amount: t.amount };
    }
    if (t.type === MovementType.EXPENSE) {
      return { isIncome: false, isExpense: true, amount: t.amount };
    }
    // For TRANSFER type
    if (t.type === MovementType.TRANSFER) {
      const cat = categories.find(c => c.id === t.categoryCode || c.code === t.categoryCode);
      // If viewing all accounts, transfers cancel out (ignore them)
      if (forAccount === 'all') {
        return { isIncome: false, isExpense: false, amount: 0 };
      }
      // For specific account, check nature
      if (cat?.nature === Nature.CREDIT) {
        return { isIncome: true, isExpense: false, amount: t.amount };
      }
      if (cat?.nature === Nature.DEBIT) {
        return { isIncome: false, isExpense: true, amount: t.amount };
      }
    }
    return { isIncome: false, isExpense: false, amount: 0 };
  };

  // 1. General Report Data (Charts and Cards)
  const reportData = useMemo(() => {
    const startOfMonth = new Date(`${selectedMonth}-01`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

    // Filter relevant transactions
    let periodTrans = transactions.filter(t => {
      const inMonth = t.date.startsWith(selectedMonth);
      const accMatch = selectedAccount === 'all' || t.accountId === selectedAccount;
      return inMonth && accMatch;
    });

    // Dados sempre reais do Supabase (sem mock)

    // Calculate Previous Balance (Initial + Transactions before this month)
    let prevBalance = 0;
    if (selectedAccount === 'all') {
      prevBalance = accounts.reduce((acc, a) => acc + (a.initialBalance || 0), 0);
      const oldTrans = transactions.filter(t => t.date < `${selectedMonth}-01`);
      prevBalance += oldTrans.reduce((acc, t) => {
        const effect = getTransactionEffect(t, 'all');
        if (effect.isIncome) return acc + effect.amount;
        if (effect.isExpense) return acc - effect.amount;
        return acc;
      }, 0);
    } else {
      const acc = accounts.find(a => a.id === selectedAccount);
      prevBalance = acc?.initialBalance || 0;
      const oldTrans = transactions.filter(t => t.accountId === selectedAccount && t.date < `${selectedMonth}-01`);
      prevBalance += oldTrans.reduce((acc, t) => {
        const effect = getTransactionEffect(t, selectedAccount);
        if (effect.isIncome) return acc + effect.amount;
        if (effect.isExpense) return acc - effect.amount;
        return acc;
      }, 0);
    }

    // Calculate totals using the helper function
    let totalIncome = 0;
    let totalExpense = 0;
    for (const t of periodTrans) {
      const effect = getTransactionEffect(t, selectedAccount);
      if (effect.isIncome) totalIncome += effect.amount;
      if (effect.isExpense) totalExpense += effect.amount;
    }
    const finalBalance = prevBalance + totalIncome - totalExpense;

    // Daily Evolution
    const daysInMonth = endOfMonth.getDate();
    const evolution = [] as { day: number; date: string; Entradas: number; Saídas: number; ResultadoDia: number; SaldoAcumulado: number }[];
    let runningBalance = prevBalance;

    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = `${selectedMonth}-${String(i).padStart(2, '0')}`;
      const dayTrans = periodTrans.filter(t => t.date === dayStr);
      
      let dayIncome = 0;
      let dayExpense = 0;
      for (const t of dayTrans) {
        const effect = getTransactionEffect(t, selectedAccount);
        if (effect.isIncome) dayIncome += effect.amount;
        if (effect.isExpense) dayExpense += effect.amount;
      }

      const dayResult = dayIncome - dayExpense;
      runningBalance += dayResult;

      evolution.push({
        day: i,
        date: dayStr,
        Entradas: dayIncome,
        Saídas: dayExpense,
        ResultadoDia: dayResult,
        SaldoAcumulado: runningBalance
      });
    }

    return {
      periodTrans,
      prevBalance,
      totalIncome,
      totalExpense,
      finalBalance,
      evolution
    };
  }, [transactions, accounts, selectedMonth, selectedAccount, categories]);

  // 2. DFC Structural Report Data
  const dfcReport = useMemo(() => {
    // Sort categories to ensure hierarchy order using code
    const sortedCats = [...categories].sort((a, b) => {
      const codeA = a.code || a.id;
      const codeB = b.code || b.id;
      return codeA.localeCompare(codeB, undefined, { numeric: true });
    });

    // Filter transactions for the period/account
    const relevantTrans = reportData.periodTrans;

    return sortedCats.map(cat => {
      const effectiveCode = cat.code || cat.id;
      
      // Logic: A category total is the sum of all transactions that belong to it OR its children
      const catTotal = relevantTrans
        .filter(t => {
          const tCode = t.categoryCode;
          return tCode === effectiveCode || tCode.startsWith(effectiveCode + '.');
        })
        .reduce((sum, t) => {
          // Standardize: Income is positive, Expense is negative for the report sum
          const val = t.type === MovementType.INCOME ? t.amount : -t.amount;
          return sum + val;
        }, 0);

      const depth = effectiveCode.split('.').length - 1;
      // Check if it's a group (has children)
      const isGroup = sortedCats.some(c => {
        const cCode = c.code || c.id;
        return cCode.startsWith(effectiveCode + '.');
      });

      return {
        ...cat,
        effectiveCode,
        total: catTotal,
        depth,
        isGroup
      };
    });
  }, [categories, reportData.periodTrans]);

  // Helper to strip ID from name for cleaner display
  const getCleanName = (name: string, code: string) => {
    if (name.startsWith(code)) {
      return name.substring(code.length).replace(/^[ -]+/, '').trim();
    }
    return name;
  };

  // Toggle expand/collapse for DFC groups
  const toggleDfcGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand root levels on load
  useEffect(() => {
    const rootLevels = dfcReport.filter(c => c.depth < 1).map(c => c.id);
    setExpandedGroups(prev => {
      const next = new Set(prev);
      rootLevels.forEach(id => next.add(id));
      return next;
    });
  }, [categories.length]);

  // Filter visible DFC items based on expanded groups
  const visibleDfcReport = useMemo(() => {
    return dfcReport.filter(cat => {
      const effectiveCode = cat.effectiveCode;
      const parentCode = cat.group || (effectiveCode.includes('.') ? effectiveCode.split('.').slice(0, -1).join('.') : null);

      if (!parentCode) return true; // Always show roots

      // Check if all ancestors are expanded
      let currentParentCode = parentCode;
      while (currentParentCode) {
        const parentCat = dfcReport.find(c => c.effectiveCode === currentParentCode);
        if (!parentCat) break;

        if (!expandedGroups.has(parentCat.id)) return false;

        const parentEffectiveCode = parentCat.effectiveCode;
        currentParentCode = parentCat.group || (parentEffectiveCode.includes('.') ? parentEffectiveCode.split('.').slice(0, -1).join('.') : '');
      }
      return true;
    });
  }, [dfcReport, expandedGroups]);

  const handleExport = () => {
    const exportData = [
      // Add Summary Header Rows
      { id: 'RESUMO', name: '--- RESUMO DO PERÍODO ---', total: 0, depth: 0 },
      { id: 'SALDO_INI', name: 'Saldo Inicial', total: reportData.prevBalance, depth: 1 },
      { id: 'ENTRADAS', name: 'Total Entradas', total: reportData.totalIncome, depth: 1 },
      { id: 'SAIDAS', name: 'Total Saídas', total: reportData.totalExpense, depth: 1 },
      { id: 'SALDO_FIM', name: 'Saldo Final', total: reportData.finalBalance, depth: 1 },
      { id: 'DFC', name: '--- DETALHAMENTO DFC ---', total: 0, depth: 0 },
      // Add Actual Data
      ...dfcReport
    ];

    exportToCSV(
      exportData,
      [
        { header: 'Código', key: 'id' },
        { header: 'Descrição', key: (item) => getCleanName(item.name, item.id) },
        { header: 'Total', key: (item) => FORMAT_CURRENCY(item.total) }
      ],
      'Relatorio_Fluxo_Caixa_DFC'
    );
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-textPrimary">Fluxo de Caixa</h2>
          </div>
          <p className="text-sm text-textSecondary">Análise financeira e DFC</p>
        </div>

        <div className="flex gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-input border border-glass rounded-lg px-3 py-2 text-textPrimary focus:outline-none"
          />
          <Select
            options={[{ value: 'all', label: 'Todas as Contas' }, ...accounts.map(a => ({ value: a.id, label: a.name }))]}
            value={selectedAccount}
            onChange={e => setSelectedAccount(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-input/40">
          <p className="text-xs text-textSecondary mb-1">Saldo Inicial</p>
          <p className="text-xl font-bold text-textPrimary">{FORMAT_CURRENCY(reportData.prevBalance)}</p>
        </Card>
        <Card className="p-4 bg-positive/10 border-positive/30">
          <p className="text-xs text-positive mb-1">Entradas</p>
          <p className="text-xl font-bold text-positive">{FORMAT_CURRENCY(reportData.totalIncome)}</p>
        </Card>
        <Card className="p-4 bg-negative/10 border-negative/30">
          <p className="text-xs text-negative mb-1">Saídas</p>
          <p className="text-xl font-bold text-negative">{FORMAT_CURRENCY(reportData.totalExpense)}</p>
        </Card>
        <Card className="p-4 bg-primary/10 border-primary/30">
          <p className="text-xs text-primary mb-1">Saldo Final</p>
          <p className="text-xl font-bold text-primary">{FORMAT_CURRENCY(reportData.finalBalance)}</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 h-[320px] sm:h-[380px] lg:h-[420px] bg-gradient-to-br from-slate-50 to-white border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Evolução do Saldo</h3>
              <p className="text-xs text-slate-500">Como seu saldo mudou ao longo do mês</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <ComposedChart data={reportData.evolution} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
              <defs>
                <linearGradient id="gradientAreaSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} strokeOpacity={0.5} />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                interval={4}
                tickFormatter={(day) => `${day}`}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                tickFormatter={(value) => value >= 1000 ? `R$${(value / 1000).toFixed(0)}k` : `R$${value}`}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.98)', 
                  borderRadius: '12px', 
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  padding: '12px 16px'
                }}
                formatter={(value: number) => [FORMAT_CURRENCY(value), 'Saldo']}
                labelFormatter={(day) => <span style={{ fontWeight: 600, color: '#1e293b' }}>Dia {day}</span>}
                cursor={{ stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '4 4' }}
              />

              <Area
                type="monotone"
                dataKey="SaldoAcumulado"
                fill="url(#gradientAreaSaldo)"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 h-[320px] sm:h-[380px] lg:h-[420px] bg-gradient-to-br from-slate-50 to-white border-0 shadow-lg">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">Resumo do Mês</h3>
            <p className="text-xs text-slate-500">Comparativo de entradas e saídas</p>
          </div>
          
          <div className="flex flex-col justify-center h-[calc(100%-60px)] space-y-6">
            {/* Entradas */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">📈 Entradas</span>
                <span className="text-lg font-bold text-emerald-600">{FORMAT_CURRENCY(reportData.totalIncome)}</span>
              </div>
              <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                  style={{ 
                    width: `${Math.min(100, (reportData.totalIncome / Math.max(reportData.totalIncome, reportData.totalExpense, 1)) * 100)}%` 
                  }}
                >
                  {reportData.totalIncome > 0 && (
                    <span className="text-xs font-bold text-white drop-shadow">
                      {((reportData.totalIncome / (reportData.totalIncome + reportData.totalExpense || 1)) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Saídas */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">📉 Saídas</span>
                <span className="text-lg font-bold text-rose-600">{FORMAT_CURRENCY(reportData.totalExpense)}</span>
              </div>
              <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                  style={{ 
                    width: `${Math.min(100, (reportData.totalExpense / Math.max(reportData.totalIncome, reportData.totalExpense, 1)) * 100)}%` 
                  }}
                >
                  {reportData.totalExpense > 0 && (
                    <span className="text-xs font-bold text-white drop-shadow">
                      {((reportData.totalExpense / (reportData.totalIncome + reportData.totalExpense || 1)) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">💰 Resultado do Período</span>
                <span className={`text-xl font-bold ${(reportData.totalIncome - reportData.totalExpense) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {(reportData.totalIncome - reportData.totalExpense) >= 0 ? '+' : ''}{FORMAT_CURRENCY(reportData.totalIncome - reportData.totalExpense)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {(reportData.totalIncome - reportData.totalExpense) >= 0 
                  ? '✅ Você teve mais entradas do que saídas neste mês!' 
                  : '⚠️ Suas saídas superaram as entradas neste mês.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* DFC Detailed Report Table - Same structure as PlanoContas */}
      <Card className="p-0 overflow-hidden min-h-[600px] bg-card border border-border/50 shadow-sm">
        <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/80">
          <div>
            <h3 className="text-lg font-bold text-textPrimary flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Demonstrativo de Resultados (DFC)
            </h3>
            <p className="text-xs text-textSecondary">Estrutura hierárquica conforme Plano de Contas</p>
          </div>
          <Button variant="secondary" onClick={handleExport}>
            <Download size={18} /> Exportar DFC
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 backdrop-blur sticky top-0 z-10">
              <tr className="text-textSecondary border-b border-border text-xs uppercase tracking-wider font-medium">
                <th className="py-4 px-6 w-[60%]">Conta / Estrutura</th>
                <th className="py-4 px-4 w-[20%]">Natureza</th>
                <th className="py-4 px-4 w-[20%] text-right">Total do Período</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {visibleDfcReport.map((row) => {
                const effectiveCode = row.effectiveCode;
                const depth = row.depth;
                const isGroup = row.isGroup;
                const isExpanded = expandedGroups.has(row.id);

                // Visual Styling based on hierarchy (same as PlanoContas)
                let rowClass = "hover:bg-gray-50/50 transition-colors duration-150";
                let textClass = "text-textSecondary";
                let codeClass = "text-textSecondary/70 font-mono";

                if (depth === 0) { // Root (e.g., 1 - RECEITAS)
                  rowClass = "bg-gray-100/80 hover:bg-gray-100";
                  textClass = "font-bold text-lg text-primary uppercase tracking-tight";
                  codeClass = "font-bold text-lg text-primary mr-3";
                } else if (depth === 1) { // Subgroup (e.g., 1.1)
                  rowClass = "bg-gray-50/40";
                  textClass = "font-semibold text-base text-textPrimary uppercase tracking-tight";
                  codeClass = "font-semibold text-base text-primary/80 mr-3";
                } else if (isGroup) { // Other groups
                  textClass = "font-medium text-sm text-textPrimary uppercase";
                  codeClass = "font-medium text-sm text-primary/70 mr-2";
                } else { // Analytical
                  textClass = "text-sm text-textSecondary font-normal";
                  codeClass = "text-sm text-textSecondary/60 mr-2";
                }

                const isCredit = row.nature === Nature.CREDIT || (!row.nature && row.type === TransactionType.INCOME);

                // Format name: Uppercase for groups, Sentence case for analytical
                const displayName = getCleanName(row.name, effectiveCode);
                const formattedName = isGroup
                  ? displayName.toUpperCase()
                  : displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();

                // Amount styling
                let amountClass = "font-mono";
                if (row.total > 0) amountClass += " text-positive";
                else if (row.total < 0) amountClass += " text-negative";
                else amountClass += " text-textSecondary/50";

                if (depth === 0 || isGroup) amountClass += " font-bold";

                return (
                  <tr key={row.id} className={rowClass}>
                    {/* Structure Column */}
                    <td className="py-3 px-6 align-middle">
                      <div
                        className="flex items-center"
                        style={{ paddingLeft: `${depth * 24}px` }}
                      >
                        {isGroup ? (
                          <button
                            onClick={() => toggleDfcGroup(row.id)}
                            className="mr-2 p-1 hover:bg-black/5 rounded transition-colors text-textSecondary"
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        ) : (
                          <div className="w-6 mr-2 flex justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                          </div>
                        )}

                        <div className="flex items-center">
                          <span className={codeClass}>{effectiveCode}</span>
                          <span className={textClass}>{formattedName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Natureza */}
                    <td className="py-3 px-4 align-middle">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${isCredit
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-rose-700 bg-rose-50'
                        }`}>
                        {isCredit ? 'Entrada (+)' : 'Saída (-)'}
                      </span>
                    </td>

                    {/* Total */}
                    <td className={`py-3 px-4 text-right align-middle ${amountClass}`}>
                      {FORMAT_CURRENCY(row.total)}
                    </td>
                  </tr>
                );
              })}

              {dfcReport.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-16 text-center text-textSecondary">
                    <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium text-slate-500">Nenhuma conta encontrada</p>
                    <p className="text-sm text-slate-400">Configure o plano de contas para gerar o relatório.</p>
                  </td>
                </tr>
              )}

              {/* Grand Total Row */}
              <tr className="bg-primary/10 border-t-2 border-primary/30">
                <td className="py-4 px-6" colSpan={2}>
                  <div className="flex items-center">
                    <span className="font-bold text-primary text-lg">===</span>
                    <span className="ml-4 font-bold text-primary text-lg">RESULTADO FINAL DO PERÍODO</span>
                  </div>
                </td>
                <td className={`py-4 px-4 font-bold text-right text-xl font-mono ${reportData.finalBalance - reportData.prevBalance >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {FORMAT_CURRENCY(reportData.finalBalance - reportData.prevBalance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

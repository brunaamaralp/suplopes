import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, Button } from '../components/ui';
import { FORMAT_CURRENCY, MovementType, ViewState } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Wallet, AlertTriangle, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { transactions, accounts, corrections } = useFinance();

  // Check for daily reconciliation (Yesterday logic)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Check if ANY account was reconciled yesterday. 
  // Ideally, we might want to check if ALL active accounts were reconciled, 
  // but for a simple alert, checking if at least one record exists for yesterday is a good start,
  // or simply checking if there is a record for the date regardless of account.
  const hasReconciledYesterday = corrections.some(c => c.date === yesterdayStr);

  // Simple aggregations
  const totalIncome = transactions
    .filter(t => t.type === MovementType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === MovementType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Real balance including account initials
  const initialCapital = accounts.reduce((acc, curr) => acc + (curr.initialBalance || 0), 0);
  const currentTotalBalance = initialCapital + totalIncome - totalExpense;

  const chartData = [
    { name: 'Entradas', value: totalIncome, color: '#00f7a6' },
    { name: 'Saídas', value: totalExpense, color: '#f87171' },
  ]

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-textPrimary">Visão Geral</h2>
          <p className="text-textSecondary text-sm">Resumo financeiro do supermercado</p>
        </div>
      </header>

      {/* Daily Reconciliation Alert (Yesterday) */}
      {!hasReconciledYesterday && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-yellow-900 font-semibold">Conferência Pendente</h3>
              <p className="text-yellow-800 text-sm">
                Você ainda não registrou a conferência de saldos de <strong>Ontem ({yesterday.toLocaleDateString('pt-BR')})</strong>.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="whitespace-nowrap hover:bg-yellow-500/20 hover:text-yellow-100 border-yellow-500/30"
            onClick={() => onNavigate('CONFERENCIA')}
          >
            Realizar Agora <ArrowRight size={16} />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="border-l-4 border-l-primary relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <DollarSign size={20} />
            </div>
            <h3 className="text-textSecondary font-medium">Saldo Total Atual</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{FORMAT_CURRENCY(currentTotalBalance)}</p>
          <p className="text-xs text-textSecondary mt-1">+ {FORMAT_CURRENCY(initialCapital)} (Saldo Inicial)</p>
        </Card>

        <Card className="border-l-4 border-l-positive relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-positive/20 rounded-lg text-positive">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-textSecondary font-medium">Entradas</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{FORMAT_CURRENCY(totalIncome)}</p>
        </Card>

        <Card className="border-l-4 border-l-negative relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-negative/20 rounded-lg text-negative">
              <TrendingDown size={20} />
            </div>
            <h3 className="text-textSecondary font-medium">Saídas</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{FORMAT_CURRENCY(totalExpense)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-textPrimary">Balanço Entradas x Saídas</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {totalIncome === 0 && totalExpense === 0 ? (
              <p className="text-textSecondary">Sem dados para exibir</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => FORMAT_CURRENCY(value)}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }}
                    itemStyle={{ color: '#1e293b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-positive"></span>
              <span className="text-sm text-textSecondary">Entradas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-negative"></span>
              <span className="text-sm text-textSecondary">Saídas</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4 text-textPrimary">Contas</h3>
          <div className="space-y-4">
            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <Wallet size={48} className="mx-auto text-textMuted mb-3 opacity-50" />
                <p className="text-textSecondary mb-1">Nenhuma conta cadastrada</p>
                <p className="text-textMuted text-sm mb-4">Cadastre sua primeira conta para começar</p>
                <button
                  onClick={() => onNavigate('CONTAS')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
                >
                  <DollarSign size={16} />
                  Criar primeira conta
                </button>
              </div>
            ) : (
              accounts.map(acc => {
                const accIncome = transactions.filter(t => t.accountId === acc.id && t.type === MovementType.INCOME).reduce((s, t) => s + t.amount, 0);
                const accExpense = transactions.filter(t => t.accountId === acc.id && t.type === MovementType.EXPENSE).reduce((s, t) => s + t.amount, 0);
                const balance = (acc.initialBalance || 0) + accIncome - accExpense;

                return (
                  <div key={acc.id} className="flex justify-between items-center p-3 rounded-lg bg-input/50 border border-glass">
                    <div>
                      <p className="font-medium text-textPrimary">{acc.name}</p>
                      <p className="text-xs text-textSecondary">Inicial: {FORMAT_CURRENCY(acc.initialBalance)}</p>
                    </div>
                    <span className={`font-bold ${balance >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {FORMAT_CURRENCY(balance)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

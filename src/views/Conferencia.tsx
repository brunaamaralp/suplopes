import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, Button, Input, Select, Badge } from '../components/ui';
import { FORMAT_CURRENCY, MovementType, DailyBalanceCorrection, ReconciliationStatus, Nature } from '../types';
import { AlertTriangle, Save, Download, Lock, ChevronLeft, ChevronRight, CheckCircle, Calendar, Wallet, ShieldCheck, Unlock } from 'lucide-react';
import { exportToCSV } from '../services/export';

const ITEMS_PER_PAGE = 20;

export const Conferencia: React.FC = () => {
  const { accounts, transactions, corrections, categories, setCorrection, closingDate, setClosingDate, notify } = useFinance();
  
  // Main state: selected date for daily reconciliation
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  
  // State for bank balances input (key: accountId, value: number or '')
  const [bankBalances, setBankBalances] = useState<Record<string, number | ''>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  
  // History filters
  const [historyMonth, setHistoryMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showOnlyDivergent, setShowOnlyDivergent] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Closing period state
  const [newClosingDate, setNewClosingDate] = useState(closingDate || '');
  const [savingClosing, setSavingClosing] = useState(false);
  
  const isLockedDate = closingDate ? (selectedDate <= closingDate) : false;

  // Calculate system balance for an account up to a date
  const calculateSystemBalance = (accId: string, date: string, initialBalance: number) => {
    const relevant = transactions.filter(t => t.accountId === accId && t.date.substring(0, 10) <= date);
    let total = initialBalance;
    for (const t of relevant) {
      if (t.type === MovementType.INCOME) total += t.amount;
      else if (t.type === MovementType.EXPENSE) total -= t.amount;
      else if (t.type === MovementType.TRANSFER) {
        const cat = categories.find(c => c.id === t.categoryCode);
        if (cat?.nature === Nature.CREDIT) total += t.amount;
        else if (cat?.nature === Nature.DEBIT) total -= t.amount;
      }
    }
    return total;
  };

  // Load existing corrections for the selected date when date changes
  React.useEffect(() => {
    const dateCorrections = corrections.filter(c => c.date === selectedDate);
    const balances: Record<string, number | ''> = {};
    const notesMap: Record<string, string> = {};
    
    for (const acc of accounts) {
      const existing = dateCorrections.find(c => c.bankAccountId === acc.id);
      if (existing && typeof existing.bankBalance === 'number') {
        balances[acc.id] = existing.bankBalance;
      } else {
        balances[acc.id] = '';
      }
      notesMap[acc.id] = existing?.notes || '';
    }
    
    setBankBalances(balances);
    setNotes(notesMap);
  }, [selectedDate, corrections, accounts]);

  // Calculate daily summary for all accounts
  const dailySummary = useMemo(() => {
    return accounts.map(acc => {
      const systemBalance = calculateSystemBalance(acc.id, selectedDate, acc.initialBalance || 0);
      const bankBalance = bankBalances[acc.id];
      const hasInput = typeof bankBalance === 'number';
      const difference = hasInput ? bankBalance - systemBalance : 0;
      const isDivergent = hasInput && Math.abs(difference) > 0.01;
      const existingCorrection = corrections.find(c => c.date === selectedDate && c.bankAccountId === acc.id);
      
      return {
        account: acc,
        systemBalance,
        bankBalance,
        difference,
        isDivergent,
        hasInput,
        existingCorrection,
        note: notes[acc.id] || ''
      };
    });
  }, [accounts, selectedDate, bankBalances, notes, transactions, categories, corrections]);

  // Overall stats for the day
  const dayStats = useMemo(() => {
    const filled = dailySummary.filter(s => s.hasInput).length;
    const divergent = dailySummary.filter(s => s.isDivergent).length;
    const totalDiff = dailySummary.reduce((sum, s) => sum + (s.hasInput ? s.difference : 0), 0);
    return { filled, total: accounts.length, divergent, totalDiff };
  }, [dailySummary, accounts]);

  // Handle bank balance input change
  const handleBalanceChange = (accountId: string, value: string) => {
    if (value === '') {
      setBankBalances(prev => ({ ...prev, [accountId]: '' }));
    } else {
      const num = parseFloat(value);
      setBankBalances(prev => ({ ...prev, [accountId]: isNaN(num) ? '' : num }));
    }
  };

  // Handle note change
  const handleNoteChange = (accountId: string, value: string) => {
    setNotes(prev => ({ ...prev, [accountId]: value }));
  };

  // Save all reconciliations for the day
  const handleSaveAll = async () => {
    if (isLockedDate) {
      notify('error', 'Não é possível alterar conferências de períodos fechados');
      return;
    }
    
    setSaving(true);
    let failed = 0;
    
    for (const item of dailySummary) {
      // Only save if user has input a value
      if (!item.hasInput) continue;
      
      const status: ReconciliationStatus = item.isDivergent ? 'PENDING' : 'CONCILIATED';
      
      const res = await setCorrection({
        id: item.existingCorrection?.id,
        date: selectedDate,
        bankAccountId: item.account.id,
        systemBalance: item.systemBalance,
        bankBalance: item.bankBalance as number,
        difference: item.difference,
        status,
        notes: item.note || undefined,
      });
      
      if (!res.ok) failed++;
    }
    
    setSaving(false);
    
    if (failed > 0) {
      notify('error', `Falha ao salvar ${failed} conferência(s)`);
    } else {
      notify('success', 'Conferência do dia salva com sucesso');
    }
  };

  // History data
  const historyData = useMemo(() => {
    return corrections
      .filter(c => c.date.startsWith(historyMonth))
      .map(c => {
        const acc = accounts.find(a => a.id === c.bankAccountId);
        // Recalculate system balance with current transactions (dynamic comparison)
        const currentSystemBalance = acc ? calculateSystemBalance(c.bankAccountId, c.date, acc.initialBalance || 0) : 0;
        const bankBal = typeof c.bankBalance === 'number' ? c.bankBalance : 0;
        const diff = bankBal - currentSystemBalance;
        
        return {
          ...c,
          accountName: acc?.name || 'Conta Removida',
          systemBalance: currentSystemBalance,
          savedSystemBalance: c.systemBalance, // What was saved at the time
          bankBalance: bankBal,
          difference: diff,
          isDivergent: Math.abs(diff) > 0.01
        };
      })
      .filter(item => !showOnlyDivergent || item.isDivergent)
      .sort((a, b) => {
        // Sort by date desc, then by account name
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return a.accountName.localeCompare(b.accountName);
      });
  }, [corrections, historyMonth, showOnlyDivergent, accounts, transactions, categories]);

  // Group history by date for better visualization
  const historyByDate = useMemo(() => {
    const grouped: Record<string, typeof historyData> = {};
    for (const item of historyData) {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    }
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  }, [historyData]);

  const totalPages = Math.ceil(historyByDate.length / ITEMS_PER_PAGE);
  const paginatedHistory = historyByDate.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleExportHistory = () => {
    exportToCSV(
      historyData,
      [
        { header: 'Data', key: 'date' },
        { header: 'Conta', key: 'accountName' },
        { header: 'Saldo Sistema (Atual)', key: (item: any) => FORMAT_CURRENCY(item.systemBalance) },
        { header: 'Saldo Informado', key: (item: any) => FORMAT_CURRENCY(item.bankBalance) },
        { header: 'Diferença', key: (item: any) => FORMAT_CURRENCY(item.difference) },
        { header: 'Status', key: (item: any) => item.isDivergent ? 'DIVERGENTE' : 'OK' },
        { header: 'Observações', key: 'notes' }
      ],
      `Conferencias_${historyMonth}`
    );
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out] pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glass pb-6">
        <div>
          <h2 className="text-3xl font-bold text-textPrimary tracking-tight">Conferência de Saldos</h2>
          <p className="text-textSecondary mt-1">Registre o saldo real de todas as contas para o dia selecionado</p>
        </div>
        <div className="flex items-center gap-3">
          {closingDate && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-full">
              <Lock size={14} className="text-warning" />
              <span className="text-xs font-medium text-warning">Fechado até {new Date(closingDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
            </div>
          )}
        </div>
      </header>

      {/* Date Selection */}
      <section>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-textPrimary mb-2">
                <Calendar size={16} className="inline mr-2 text-primary" />
                Data da Conferência
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="text-lg font-mono"
              />
            </div>
            <div className="md:col-span-8 flex items-center justify-end gap-4">
              {/* Day Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-glass/20 rounded-lg">
                  <Wallet size={16} className="text-primary" />
                  <span className="text-textSecondary">Preenchidas:</span>
                  <span className="font-bold text-textPrimary">{dayStats.filled}/{dayStats.total}</span>
                </div>
                {dayStats.divergent > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-negative/10 rounded-lg">
                    <AlertTriangle size={16} className="text-negative" />
                    <span className="font-bold text-negative">{dayStats.divergent} divergente(s)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Daily Reconciliation - All Accounts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-primary rounded-full"></div>
            <h3 className="text-lg font-semibold text-textPrimary">
              Conferência do Dia: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </h3>
          </div>
          {isLockedDate && (
            <Badge type="warning" className="flex items-center gap-1">
              <Lock size={12} /> Período Fechado
            </Badge>
          )}
        </div>

        {accounts.length === 0 ? (
          <Card className="p-12 text-center">
            <Wallet size={48} className="mx-auto text-textSecondary/30 mb-4" />
            <p className="text-textSecondary">Nenhuma conta bancária cadastrada.</p>
            <p className="text-sm text-textSecondary/70 mt-1">Cadastre contas na seção "Contas Bancárias" para começar.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {dailySummary.map((item, idx) => (
              <Card 
                key={item.account.id} 
                className={`p-0 overflow-hidden border-2 transition-all duration-300 ${
                  !item.hasInput 
                    ? 'border-glass' 
                    : item.isDivergent 
                      ? 'border-negative/30 shadow-[0_0_15px_rgba(239,68,68,0.08)]' 
                      : 'border-positive/30 shadow-[0_0_15px_rgba(34,197,94,0.08)]'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Account Name */}
                  <div className="lg:col-span-3 p-5 bg-glass/10 flex items-center gap-3 border-b lg:border-b-0 lg:border-r border-glass/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wallet size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-textPrimary">{item.account.name}</h4>
                      <p className="text-xs text-textSecondary">Saldo inicial: {FORMAT_CURRENCY(item.account.initialBalance || 0)}</p>
                    </div>
                  </div>

                  {/* System Balance */}
                  <div className="lg:col-span-2 p-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-glass/50">
                    <span className="text-xs font-medium text-textSecondary mb-1">Saldo Sistema</span>
                    <span className="text-xl font-bold font-mono text-textPrimary">
                      {FORMAT_CURRENCY(item.systemBalance)}
                    </span>
                    <span className="text-[10px] text-textSecondary/60 mt-1">Calculado das movimentações</span>
                  </div>

                  {/* Bank Balance Input */}
                  <div className="lg:col-span-3 p-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-glass/50 bg-glass/5">
                    <span className="text-xs font-medium text-textPrimary mb-1">Saldo Real (Banco/Caixa)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.bankBalance === '' ? '' : item.bankBalance}
                      onChange={e => handleBalanceChange(item.account.id, e.target.value)}
                      placeholder="0,00"
                      disabled={isLockedDate}
                      className={`w-full bg-input border border-glass rounded-lg px-4 py-2 text-xl font-bold font-mono text-right focus:outline-none focus:border-primary transition-all ${
                        isLockedDate ? 'opacity-50 cursor-not-allowed' : ''
                      } ${item.isDivergent ? 'border-negative/50 focus:border-negative' : ''}`}
                    />
                  </div>

                  {/* Difference */}
                  <div className={`lg:col-span-2 p-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-glass/50 ${
                    !item.hasInput ? 'bg-glass/5' : item.isDivergent ? 'bg-negative/5' : 'bg-positive/5'
                  }`}>
                    <span className="text-xs font-medium text-textSecondary mb-1">Diferença</span>
                    {!item.hasInput ? (
                      <span className="text-lg text-textSecondary/50 font-mono">—</span>
                    ) : item.isDivergent ? (
                      <span className={`text-xl font-bold font-mono ${item.difference > 0 ? 'text-positive' : 'text-negative'}`}>
                        {item.difference > 0 ? '+' : ''}{FORMAT_CURRENCY(item.difference)}
                      </span>
                    ) : (
                      <span className="text-xl font-bold text-positive flex items-center gap-1">
                        <CheckCircle size={18} /> OK
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="lg:col-span-2 p-5 flex flex-col justify-center">
                    <span className="text-xs font-medium text-textSecondary mb-1">Observação</span>
                    <input
                      type="text"
                      value={item.note}
                      onChange={e => handleNoteChange(item.account.id, e.target.value)}
                      placeholder="Opcional..."
                      disabled={isLockedDate}
                      className={`w-full bg-input/50 border border-glass rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 ${
                        isLockedDate ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                </div>
              </Card>
            ))}

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSaveAll}
                disabled={saving || isLockedDate || dayStats.filled === 0}
                className="px-8 py-4 text-base font-medium shadow-lg hover:shadow-xl transition-all"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Salvando...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Save size={18} />
                    Salvar Conferência do Dia
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* History Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-textSecondary rounded-full"></div>
            <h3 className="text-lg font-semibold text-textPrimary">Histórico de Conferências</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setHistoryCollapsed(v => !v)} className="text-textSecondary">
            {historyCollapsed ? 'Expandir' : 'Recolher'}
          </Button>
        </div>

        {!historyCollapsed && (
          <Card className="p-0 overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-glass bg-glass/5 flex flex-wrap items-center gap-4">
              <div>
                <label className="text-xs text-textSecondary mb-1 block">Mês</label>
                <input
                  type="month"
                  value={historyMonth}
                  onChange={e => { setHistoryMonth(e.target.value); setCurrentPage(1); }}
                  className="bg-input border border-glass rounded-lg px-3 py-2 text-textPrimary focus:outline-none text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-textSecondary cursor-pointer bg-input/30 px-3 py-2 rounded-lg border border-glass hover:bg-input/50 transition-colors select-none mt-5">
                <input
                  type="checkbox"
                  checked={showOnlyDivergent}
                  onChange={e => { setShowOnlyDivergent(e.target.checked); setCurrentPage(1); }}
                  className="rounded border-glass bg-input text-primary focus:ring-primary w-4 h-4"
                />
                Apenas Divergências
              </label>

              <div className="ml-auto mt-5">
                <Button variant="secondary" onClick={handleExportHistory}>
                  <Download size={16} className="mr-2" /> Exportar CSV
                </Button>
              </div>
            </div>

            {/* History Table - Grouped by Date */}
            <div className="overflow-x-auto max-h-[600px]">
              {paginatedHistory.length === 0 ? (
                <div className="p-12 text-center text-textSecondary">
                  Nenhuma conferência encontrada para o período selecionado.
                </div>
              ) : (
                <div className="divide-y divide-glass">
                  {paginatedHistory.map(([date, items]) => (
                    <div key={date}>
                      {/* Date Header */}
                      <div className="px-6 py-3 bg-input/50 sticky top-0 z-10">
                        <span className="font-semibold text-textPrimary">
                          {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="ml-4 text-sm text-textSecondary">
                          {items.length} conta(s) conferida(s)
                        </span>
                        {items.some(i => i.isDivergent) && (
                          <Badge type="danger" className="ml-3 text-xs">
                            {items.filter(i => i.isDivergent).length} divergente(s)
                          </Badge>
                        )}
                      </div>

                      {/* Accounts for this date */}
                      <table className="w-full text-left">
                        <thead className="bg-glass/30 text-xs text-textSecondary uppercase">
                          <tr>
                            <th className="py-2 px-6 font-medium">Conta</th>
                            <th className="py-2 px-6 font-medium text-right">Saldo Sistema (Atual)</th>
                            <th className="py-2 px-6 font-medium text-right">Saldo Informado</th>
                            <th className="py-2 px-6 font-medium text-right">Diferença</th>
                            <th className="py-2 px-6 font-medium text-center">Status</th>
                            <th className="py-2 px-6 font-medium">Observação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-glass/30">
                          {items.map((item, idx) => (
                            <tr key={`${item.bankAccountId}-${idx}`} className={`transition-colors ${item.isDivergent ? 'bg-negative/5 hover:bg-negative/10' : 'hover:bg-input/20'}`}>
                              <td className="py-3 px-6 font-medium text-textPrimary">{item.accountName}</td>
                              <td className="py-3 px-6 text-right font-mono text-textSecondary">{FORMAT_CURRENCY(item.systemBalance)}</td>
                              <td className="py-3 px-6 text-right font-mono font-medium text-textPrimary">{FORMAT_CURRENCY(item.bankBalance)}</td>
                              <td className={`py-3 px-6 text-right font-mono font-bold ${
                                Math.abs(item.difference) <= 0.01 ? 'text-textSecondary/50' : (item.difference > 0 ? 'text-positive' : 'text-negative')
                              }`}>
                                {item.difference > 0 ? '+' : ''}{FORMAT_CURRENCY(item.difference)}
                              </td>
                              <td className="py-3 px-6 text-center">
                                {item.isDivergent ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-negative/10 text-negative border border-negative/20">
                                    DIVERGENTE
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-positive/10 text-positive border border-positive/20">
                                    OK
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-6 text-sm text-textSecondary truncate max-w-[200px]" title={item.notes || ''}>
                                {item.notes || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-glass bg-glass/5">
                <div className="text-xs text-textSecondary">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="px-3 py-1.5 text-xs h-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft size={14} /> Anterior
                  </Button>
                  <Button variant="secondary" className="px-3 py-1.5 text-xs h-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    Próxima <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </section>

      {/* Closing Period Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-1 bg-warning rounded-full"></div>
          <h3 className="text-lg font-semibold text-textPrimary">Fechamento de Período</h3>
        </div>

        <Card className="p-0 overflow-hidden border-2 border-warning/20">
          <div className="p-6 bg-warning/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={24} className="text-warning" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-textPrimary mb-1">Proteger Período Conferido</h4>
                <p className="text-sm text-textSecondary mb-4">
                  Ao definir uma data limite, todas as movimentações com data <strong>igual ou anterior</strong> ficarão 
                  bloqueadas para edição e exclusão. Use este recurso após conferir e validar os saldos do período.
                </p>

                {/* Current Status */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-card rounded-lg border border-glass">
                  <span className="text-sm text-textSecondary">Status atual:</span>
                  {closingDate ? (
                    <div className="flex items-center gap-2">
                      <Lock size={16} className="text-warning" />
                      <span className="font-medium text-warning">
                        Fechado até {new Date(closingDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Unlock size={16} className="text-positive" />
                      <span className="font-medium text-positive">Nenhum período fechado</span>
                    </div>
                  )}
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-textPrimary mb-2">
                      Fechar período até:
                    </label>
                    <Input
                      type="date"
                      value={newClosingDate}
                      onChange={e => setNewClosingDate(e.target.value)}
                      className="border-warning/30 focus:border-warning"
                    />
                  </div>
                  <div className="md:col-span-4 flex gap-2">
                    <Button
                      variant="primary"
                      onClick={async () => {
                        if (!newClosingDate) {
                          notify('error', 'Selecione uma data para fechar o período');
                          return;
                        }
                        setSavingClosing(true);
                        const res = await setClosingDate(newClosingDate);
                        setSavingClosing(false);
                        if (res.ok) {
                          notify('success', `Período fechado até ${new Date(newClosingDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`);
                        }
                      }}
                      disabled={savingClosing || !newClosingDate}
                      className="bg-warning hover:bg-warning/90 border-warning"
                    >
                      {savingClosing ? (
                        <span className="inline-flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Salvando...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Lock size={16} />
                          Fechar Período
                        </span>
                      )}
                    </Button>
                    {closingDate && (
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          setSavingClosing(true);
                          const res = await setClosingDate(null);
                          setSavingClosing(false);
                          setNewClosingDate('');
                          if (res.ok) {
                            notify('success', 'Período reaberto - todas as datas estão liberadas');
                          }
                        }}
                        disabled={savingClosing}
                        className="text-textSecondary"
                      >
                        <Unlock size={16} />
                        Reabrir
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Footer */}
          <div className="px-6 py-4 bg-warning/10 border-t border-warning/20">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-warning/80">
                <strong>Atenção:</strong> Após fechar um período, não será possível adicionar, editar ou excluir 
                movimentações com data anterior ou igual à data limite. Certifique-se de que todas as conferências 
                estão corretas antes de prosseguir.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

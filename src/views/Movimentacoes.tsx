
import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { get } from '../services/apiClient';
import { Card, Button, Input, Select, Badge } from '../components/ui';
import { Transaction, MovementType, TransactionType, FORMAT_CURRENCY, AccountType, Nature, MOVEMENT_LABEL } from '../types';
import { PAYMENT_METHODS } from '../constants';
import { Plus, Trash2, Edit, Search, Filter, X, Download, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Lock, Calendar } from 'lucide-react';
import { exportToCSV } from '../services/export';

const ITEMS_PER_PAGE = 50;

export const Movimentacoes: React.FC = () => {
  const { transactions, categories, accounts, addTransaction, updateTransaction, deleteTransaction, closingDate, notify } = useFinance();

  // State for Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ date?: string; amount?: string; accountId?: string; categoryCode?: string; description?: string; paymentMethod?: string }>({});
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    type: MovementType.EXPENSE,
    amount: 0,
    description: '',
  });
  const [transferOriginId, setTransferOriginId] = useState<string>('');
  const [transferDestId, setTransferDestId] = useState<string>('');
  const [categoryQuery, setCategoryQuery] = useState<string>('');
  const [categoryOpen, setCategoryOpen] = useState<boolean>(false);

  // State for Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // aberto/bloqueado
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showRangePicker, setShowRangePicker] = useState<boolean>(false);
  const [calendarCursor, setCalendarCursor] = useState<Date>(() => new Date());
  const [rangeDraft, setRangeDraft] = useState<{ start?: string; end?: string }>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<null | 'date' | 'amount' | 'account' | 'category' | 'type'>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | 'none'>('none');
  const [remoteTransactions, setRemoteTransactions] = useState<Transaction[]>([]);
  const remoteEnabled = (import.meta as any).env?.VITE_REMOTE_FILTERS === '1';

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterAccount, filterCategory, filterPaymentMethod, filterStatus, dateRange]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setIsLoading(true);
  }, []);

  useEffect(() => {
    if (remoteEnabled) return;
    setIsLoading(false);
  }, [transactions]);

  useEffect(() => {
    if (!showRangePicker) return;
    setRangeDraft({
      start: dateRange.start || undefined,
      end: dateRange.end || undefined,
    });
    const base = dateRange.start ? new Date(dateRange.start + 'T00:00:00Z') : new Date();
    setCalendarCursor(base);
  }, [showRangePicker]);

  const applyRemoteFilters = async () => {
    if (!remoteEnabled) return;
    setIsLoading(true);
    try {
      const qs = new URLSearchParams();
      if (dateRange.start) qs.set('start', dateRange.start);
      if (dateRange.end) qs.set('end', dateRange.end);
      if (filterType !== 'all') qs.set('type', filterType);
      if (filterAccount !== 'all') qs.set('accountId', filterAccount);
      if (filterCategory !== 'all') qs.set('categoryPrefix', filterCategory);
      if (filterPaymentMethod !== 'all') qs.set('paymentMethod', filterPaymentMethod);
      const data = await get(`/api/transactions?${qs.toString()}`);
      const mapped = Array.isArray(data) ? data.map((item: any) => ({
        id: String(item.id),
        date: String(item.date).slice(0, 10),
        type: String(item.type).toUpperCase() === 'INCOME' || String(item.type) === 'Entrada' ? MovementType.INCOME : MovementType.EXPENSE,
        categoryCode: item.categoryCode ?? item.categoryId,
        description: String(item.description ?? ''),
        paymentMethod: String(item.paymentMethod ?? ''),
        accountId: String(item.accountId ?? ''),
        amount: Number(item.amount ?? 0),
      })) : [];
      setRemoteTransactions(mapped);
    } catch (e) {
      notify('error', 'Falha ao carregar movimentações');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!remoteEnabled) return;
    applyRemoteFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, filterType, filterAccount, filterCategory, filterPaymentMethod, filterStatus]);

  // Handlers
  const handleOpenForm = (t?: Transaction) => {
    if (t) {
      if (closingDate && t.date <= closingDate) {
        alert("Este lançamento pertence a um período fechado e não pode ser editado.");
        return;
      }
      setEditingId(t.id);
      setFormData(t);
      if (t.type === MovementType.TRANSFER) {
        const base = t.id.endsWith('-OUT') || t.id.endsWith('-IN') ? t.id.replace(/-(OUT|IN)$/, '') : t.id;
        const outTx = transactions.find(x => x.id === base + '-OUT')
          || transactions.find(x => x.type === MovementType.TRANSFER && x.date === t.date && x.amount === t.amount && (categories.find(c => c.id === x.categoryCode)?.nature === Nature.DEBIT));
        const inTx = transactions.find(x => x.id === base + '-IN')
          || transactions.find(x => x.type === MovementType.TRANSFER && x.date === t.date && x.amount === t.amount && (categories.find(c => c.id === x.categoryCode)?.nature === Nature.CREDIT));
        setTransferOriginId(outTx?.accountId || (categories.find(c => c.id === t.categoryCode)?.nature === Nature.DEBIT ? t.accountId : (inTx?.accountId || '')));
        setTransferDestId(inTx?.accountId || (categories.find(c => c.id === t.categoryCode)?.nature === Nature.CREDIT ? t.accountId : (outTx?.accountId || '')));
        setCategoryQuery('');
      } else {
        setTransferOriginId('');
        setTransferDestId('');
        const selectedCat = categories.find(c => c.id === t.categoryCode);
        setCategoryQuery(selectedCat?.name || '');
      }
    } else {
      setEditingId(null);
      // Find an analytical category (leaf node) for expenses
      const defaultCat = categories.find(c => {
        if (!c.isActive || c.type !== TransactionType.EXPENSE) return false;
        // Check if it's a leaf node (no children)
        const categoryCode = c.code || c.id;
        const hasChildren = categories.some(other => {
          const otherCode = other.code || other.id;
          return otherCode !== categoryCode && otherCode.startsWith(categoryCode + '.');
        });
        return !hasChildren;
      });

      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: MovementType.EXPENSE,
        amount: 0,
        description: '',
        categoryCode: defaultCat?.id || '',
        accountId: accounts[0]?.id || ''
      });
      setTransferOriginId('');
      setTransferDestId('');
      setCategoryQuery(defaultCat?.name || '');
    }
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};
    if (!formData.date) errors.date = 'Informe a data';
    const amt = Number(formData.amount);
    if (isNaN(amt) || amt <= 0) errors.amount = 'Valor precisa ser um número > 0';
    if (formData.type !== MovementType.TRANSFER && !formData.accountId) errors.accountId = 'Selecione a conta';
    if (formData.type !== MovementType.TRANSFER && !formData.categoryCode) errors.categoryCode = 'Selecione a categoria';
    const validCatIds = availableCategories.map(c => c.id);
    if (formData.categoryCode && formData.type !== MovementType.TRANSFER && !validCatIds.includes(formData.categoryCode)) errors.categoryCode = 'Categoria não pertence ao tipo selecionado';
    // Descrição é opcional - não validar mais
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (formData.type === MovementType.TRANSFER) {
      if (!transferOriginId) {
        setFormErrors(prev => ({ ...prev, accountId: 'Selecione a conta de origem' }));
        return;
      }
      if (!transferDestId) {
        setFormErrors(prev => ({ ...prev, accountId: 'Selecione a conta de destino' }));
        return;
      }
      if (transferOriginId === transferDestId) {
        setFormErrors(prev => ({ ...prev, accountId: 'Origem e destino devem ser diferentes' }));
        return;
      }
      const debitCat = categories.find(c => c.isActive && c.accountType === AccountType.OPERACAO_PERMUTATIVA && c.nature === Nature.DEBIT)?.id;
      const creditCat = categories.find(c => c.isActive && c.accountType === AccountType.OPERACAO_PERMUTATIVA && c.nature === Nature.CREDIT)?.id;
      if (!debitCat || !creditCat) {
        alert('Categorias de transferência (débito/crédito) não encontradas no Plano de Contas.');
        return;
      }
      const idBase = (() => {
        if (editingId && (editingId.endsWith('-OUT') || editingId.endsWith('-IN'))) return editingId.replace(/-(OUT|IN)$/, '');
        return editingId || crypto.randomUUID();
      })();
      const outTx: Transaction = {
        id: idBase + '-OUT',
        date: formData.date!,
        type: MovementType.TRANSFER,
        categoryCode: debitCat,
        description: formData.description || 'Transferência entre contas',
        accountId: transferOriginId,
        amount: Number(formData.amount || 0),
      } as any;
      const inTx: Transaction = {
        id: idBase + '-IN',
        date: formData.date!,
        type: MovementType.TRANSFER,
        categoryCode: creditCat,
        description: formData.description || 'Transferência entre contas',
        accountId: transferDestId,
        amount: Number(formData.amount || 0),
      } as any;
      try {
        const r1 = editingId ? await updateTransaction(outTx) : await addTransaction(outTx);
        const r2 = editingId ? await updateTransaction(inTx) : await addTransaction(inTx);
        if (!r1.ok || !r2.ok) {
          const apiErrors = (r1.errors || []).concat(r2.errors || []);
          const mapped: typeof formErrors = {};
          apiErrors.forEach((err: any) => {
            if (err.field && err.message) {
              const key = err.field as keyof typeof mapped;
              (mapped as any)[key] = err.message;
            }
          });
          setFormErrors(mapped);
          return;
        }
        setIsFormOpen(false);
      } catch { }
      return;
    }

    const payload: Transaction = {
      id: editingId || crypto.randomUUID(),
      date: formData.date!,
      type: formData.type!,
      categoryCode: formData.categoryCode!,
      description: formData.description || '',
      accountId: formData.accountId!,
      amount: Number(formData.amount)
    };

    try {
      const result = editingId ? await updateTransaction(payload) : await addTransaction(payload);
      if (!result.ok) {
        const apiErrors = result.errors || [];
        const mapped: typeof formErrors = {};
        apiErrors.forEach((err: any) => {
          if (err.field && err.message) {
            const key = err.field as keyof typeof mapped;
            (mapped as any)[key] = err.message;
          }
        });
        setFormErrors(mapped);
        return;
      }
      setIsFormOpen(false);
    } catch {
      // Already notified in context; keep form open
    }
  };

  const allFilteredTransactions = useMemo(() => {
    const source = remoteEnabled ? remoteTransactions : transactions;
    const filtered = source.filter(t => {
      const matchType = filterType === 'all' || t.type === filterType;
      const matchAccount = filterAccount === 'all' || t.accountId === filterAccount;
      const matchCategory = filterCategory === 'all' || t.categoryCode === filterCategory || t.categoryCode.startsWith(filterCategory + '.');
      const matchPayment = filterPaymentMethod === 'all' || t.paymentMethod === filterPaymentMethod;
      const matchStart = !dateRange.start || t.date >= dateRange.start;
      const matchEnd = !dateRange.end || t.date <= dateRange.end;
      const isLocked = closingDate && t.date <= closingDate;
      const matchStatus = filterStatus === 'all' || (filterStatus === 'bloqueado' ? !!isLocked : !isLocked);

      // Search Logic
      const query = searchQuery.toLowerCase();
      const catName = categories.find(c => c.id === t.categoryCode)?.name.toLowerCase() || '';
      const matchSearch = !query ||
        t.description.toLowerCase().includes(query) ||
        catName.includes(query);

      return matchType && matchAccount && matchCategory && matchPayment && matchStart && matchEnd && matchStatus && matchSearch;
    });
    const dirMul = sortDir === 'desc' ? -1 : 1;
    const cmp = (a: Transaction, b: Transaction) => {
      if (!sortBy || sortDir === 'none') return new Date(b.date).getTime() - new Date(a.date).getTime();
      switch (sortBy) {
        case 'date':
          return dirMul * (new Date(a.date).getTime() - new Date(b.date).getTime());
        case 'amount':
          return dirMul * (a.amount - b.amount);
        case 'account': {
          const an = accounts.find(x => x.id === a.accountId)?.name || '';
          const bn = accounts.find(x => x.id === b.accountId)?.name || '';
          return dirMul * an.localeCompare(bn);
        }
        case 'category': {
          const an = categories.find(x => x.id === a.categoryCode)?.name || a.categoryCode;
          const bn = categories.find(x => x.id === b.categoryCode)?.name || b.categoryCode;
          return dirMul * an.localeCompare(bn);
        }
        case 'type':
          return dirMul * MOVEMENT_LABEL[a.type].localeCompare(MOVEMENT_LABEL[b.type]);
      }
    };
    return filtered.sort(cmp);
  }, [transactions, remoteTransactions, remoteEnabled, filterType, filterAccount, filterCategory, filterPaymentMethod, filterStatus, dateRange, searchQuery, categories, closingDate, sortBy, sortDir, accounts]);

  // Paginated Slice
  const totalPages = Math.ceil(allFilteredTransactions.length / ITEMS_PER_PAGE);
  const currentTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allFilteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [allFilteredTransactions, currentPage]);

  // Derived options based on type
  // Show only analytical categories (leaf nodes - categories without children)
  const availableCategories = useMemo(() => {
    // First, determine the expected type for the form
    const expectedType = formData.type === MovementType.INCOME ? TransactionType.INCOME : TransactionType.EXPENSE;

    return categories.filter(c => {
      if (!c.isActive) return false;

      // Check if this category has any children using the code field
      const categoryCode = c.code || c.id;
      const hasChildren = categories.some(other => {
        const otherCode = other.code || other.id;
        // A category is a child if its code starts with parent code + "."
        return otherCode !== categoryCode && otherCode.startsWith(categoryCode + '.');
      });

      // Only show analytical categories (no children = leaf nodes)
      if (hasChildren) return false;

      // Match the transaction type
      // For INCOME: show categories with type = INCOME (Entrada)
      // For EXPENSE: show categories with type = EXPENSE (Saída)
      const matchesType = c.type === expectedType;

      return matchesType;
    });
  }, [categories, formData.type]);

  const categorySuggestions = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) {
      // Show all available categories when no query
      return availableCategories
        .slice(0, 10)
        .map(c => ({ id: c.id, name: c.name }));
    }
    return availableCategories
      .filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q)))
      .slice(0, 8)
      .map(c => ({ id: c.id, name: c.name }));
  }, [categoryQuery, availableCategories]);

  const toggleSort = (col: 'date' | 'amount' | 'account' | 'category' | 'type') => {
    if (sortBy !== col) {
      setSortBy(col);
      setSortDir('asc');
      return;
    }
    if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      setSortDir('none');
    } else {
      setSortDir('asc');
    }
  };

  const handleExport = () => {
    exportToCSV<Transaction>(
      allFilteredTransactions,
      [
        { header: 'Data', key: 'date' },
        { header: 'Descrição', key: 'description' },
        { header: 'Tipo', key: (item: Transaction) => MOVEMENT_LABEL[item.type] },
        { header: 'Categoria', key: (item: Transaction) => categories.find(c => c.id === item.categoryCode)?.name || item.categoryCode },
        { header: 'Conta', key: (item: Transaction) => accounts.find(a => a.id === item.accountId)?.name || item.accountId },
        { header: 'Forma Pagto', key: 'paymentMethod' },
        { header: 'Valor', key: (item: Transaction) => FORMAT_CURRENCY(item.amount) },
      ],
      'Movimentacoes'
    );
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-textPrimary">Movimentações</h2>
          <p className="text-sm text-textSecondary">Registro diário de entradas e saídas</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus size={18} /> Novo Lançamento
        </Button>
      </div>

      <Card className="p-3">
        {/* Main Filter Bar - Always Visible */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar descrição ou categoria..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick Filters - Compact */}
          <div className="flex items-center gap-2">
            {/* Period */}
            <div className="relative">
              <Button size="sm" variant="secondary" onClick={() => setShowRangePicker(v => !v)} leftIcon={<Calendar size={16} />}>
                Período
              </Button>
              {showRangePicker && (
                <div className="absolute z-20 mt-2 p-3 bg-input rounded-lg border border-glass shadow-lg w-[320px] right-0">
                  <div className="flex items-center justify-between mb-2">
                    <Button variant="secondary" size="sm" onClick={() => {
                      const d = new Date(calendarCursor);
                      d.setUTCMonth(d.getUTCMonth() - 1);
                      setCalendarCursor(new Date(d));
                    }}>
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="text-sm font-medium text-textPrimary">
                      {new Date(calendarCursor).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                    </span>
                    <button
                      className="text-xs text-textSecondary hover:text-primary"
                      onClick={() => { setRangeDraft({}); setDateRange({ start: '', end: '' }); }}
                      title="Limpar intervalo"
                    >
                      Limpar
                    </button>
                    <Button variant="secondary" size="sm" onClick={() => {
                      const d = new Date(calendarCursor);
                      d.setUTCMonth(d.getUTCMonth() + 1);
                      setCalendarCursor(new Date(d));
                    }}>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-textSecondary mb-1">
                    <div>Seg</div>
                    <div>Ter</div>
                    <div>Qua</div>
                    <div>Qui</div>
                    <div>Sex</div>
                    <div>Sáb</div>
                    <div>Dom</div>
                  </div>
                  {(() => {
                    const y = calendarCursor.getUTCFullYear();
                    const m = calendarCursor.getUTCMonth();
                    const first = new Date(Date.UTC(y, m, 1));
                    const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
                    const startOffset = ((first.getUTCDay() + 6) % 7);
                    const cells: React.ReactNode[] = [];
                    for (let i = 0; i < startOffset; i++) cells.push(<div key={`empty-${i}`} className="h-8" />);
                    const fmt = (d: Date) => d.toISOString().slice(0, 10);
                    const isInRange = (s?: string, e?: string, v?: string) => {
                      if (!v) return false;
                      if (s && e) return v >= s && v <= e;
                      if (s && !e) return v === s;
                      return false;
                    };
                    for (let day = 1; day <= lastDay; day++) {
                      const d = new Date(Date.UTC(y, m, day));
                      const v = fmt(d);
                      const selected = isInRange(rangeDraft.start, rangeDraft.end, v);
                      const startSel = rangeDraft.start === v;
                      const endSel = rangeDraft.end === v;
                      cells.push(
                        <button
                          key={`day-${day}`}
                          className={`h-8 rounded text-xs ${selected ? 'bg-primary/20 text-primary' : 'hover:bg-input/60'} ${startSel || endSel ? 'ring-2 ring-primary font-medium' : 'text-textPrimary'}`}
                          onClick={() => {
                            setRangeDraft(prev => {
                              const s = prev.start;
                              const e = prev.end;
                              if (!s) {
                                return { start: v };
                              }
                              if (s && !e) {
                                if (v >= s) {
                                  const next = { start: s, end: v } as { start?: string; end?: string };
                                  setDateRange({ start: s, end: v });
                                  setShowRangePicker(false);
                                  return next;
                                }
                                return { start: v };
                              }
                              return { start: v };
                            });
                          }}
                          title={v}
                        >
                          {day}
                        </button>
                      );
                    }
                    return <div className="grid grid-cols-7 gap-1">{cells}</div>;
                  })()}
                </div>
              )}
            </div>

            {/* More Filters Toggle */}
            <Button
              size="sm"
              variant={showAdvanced ? "primary" : "secondary"}
              onClick={() => setShowAdvanced(v => !v)}
              leftIcon={<Filter size={16} />}
            >
              Filtros
            </Button>

            {/* Export */}
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExport}
              title="Exportar"
            >
              <Download size={16} />
            </Button>

            {/* Clear */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setFilterType('all');
                setFilterAccount('all');
                setFilterCategory('all');
                setFilterPaymentMethod('all');
                setFilterStatus('all');
                setDateRange({ start: '', end: '' });
                setSearchQuery('');
              }}
              title="Limpar filtros"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-glass">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              <Select
                label="Tipo"
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: MovementType.INCOME, label: 'Entradas' },
                  { value: MovementType.EXPENSE, label: 'Saídas' },
                  { value: MovementType.TRANSFER, label: 'Transferências' }
                ]}
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              />

              <Select
                label="Conta"
                options={[{ value: 'all', label: 'Todas' }, ...accounts.map(a => ({ value: a.id, label: a.name }))]}
                value={filterAccount}
                onChange={e => setFilterAccount(e.target.value)}
              />

              <Select
                label="Categoria"
                options={[{ value: 'all', label: 'Todas' }, ...categories.filter(c => c.isActive).map(c => ({ value: c.id, label: c.name }))]}
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
              />

              <Select
                label="Forma Pagamento"
                options={[{ value: 'all', label: 'Todas' }, ...PAYMENT_METHODS.map(m => ({ value: m, label: m }))]}
                value={filterPaymentMethod}
                onChange={e => setFilterPaymentMethod(e.target.value)}
              />

              <Select
                label="Status"
                options={[{ value: 'all', label: 'Todos' }, { value: 'aberto', label: 'Abertos' }, { value: 'bloqueado', label: 'Bloqueados' }]}
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden min-h-[500px] flex flex-col justify-between">
        {isLoading && (
          <div className="p-6 flex items-center justify-center">
            <div className="flex items-center gap-3 text-textSecondary">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Carregando movimentações…</span>
            </div>
          </div>
        )}
        {isCompact ? (
          <div className="p-4 space-y-3">
            {currentTransactions.map(t => {
              const cat = categories.find(c => c.id === t.categoryCode);
              const acc = accounts.find(a => a.id === t.accountId);
              const isLocked = closingDate && t.date <= closingDate;
              const amountClass = t.type === MovementType.INCOME ? 'text-positive' : t.type === MovementType.EXPENSE ? 'text-negative' : 'text-textPrimary';
              const sign = t.type === MovementType.EXPENSE ? '-' : t.type === MovementType.INCOME ? '+' : '';
              return (
                <div key={t.id} className={`rounded-2xl border border-glass bg-input/40 p-3 ${isLocked ? 'opacity-75' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-sm text-textPrimary">
                      {isLocked && <Lock size={12} className="text-textSecondary" title="Período Fechado" />}
                      {new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </div>
                    <div className={`font-bold ${amountClass}`}>
                      {sign} {FORMAT_CURRENCY(t.amount)}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-textPrimary">{t.description}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-textSecondary">
                    <span>{cat?.name || 'Desconhecida'}</span>
                    <span>•</span>
                    <span>{acc?.name}</span>
                    {t.paymentMethod && <Badge type="info" className="ml-auto">{t.paymentMethod}</Badge>}
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleOpenForm(t)} disabled={!!isLocked} leftIcon={<Edit size={16} />}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => {
                      if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
                        deleteTransaction(t.id);
                      }
                    }} disabled={!!isLocked} leftIcon={<Trash2 size={16} />}>Excluir</Button>
                  </div>
                </div>
              );
            })}
            {currentTransactions.length === 0 && (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-textMuted mb-3 opacity-50" />
                <p className="text-textSecondary font-medium mb-1">Nenhuma movimentação encontrada</p>
                <p className="text-textMuted text-sm mb-4">Registre sua primeira entrada ou saída</p>
                <button
                  onClick={() => handleOpenForm()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  Novo Lançamento
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-input/50">
                <tr className="text-textSecondary text-sm select-none">
                  <th className="py-4 px-4 font-medium cursor-pointer" onClick={() => toggleSort('date')}>
                    <span className="inline-flex items-center gap-1">Data {sortBy === 'date' && sortDir !== 'none' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</span>
                  </th>
                  <th className="py-4 px-4 font-medium">Descrição</th>
                  <th className="py-4 px-4 font-medium cursor-pointer" onClick={() => toggleSort('category')}>
                    <span className="inline-flex items-center gap-1">Categoria {sortBy === 'category' && sortDir !== 'none' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</span>
                  </th>
                  <th className="py-4 px-4 font-medium cursor-pointer" onClick={() => toggleSort('account')}>
                    <span className="inline-flex items-center gap-1">Conta {sortBy === 'account' && sortDir !== 'none' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</span>
                  </th>
                  <th className="py-4 px-4 font-medium cursor-pointer" onClick={() => toggleSort('amount')}>
                    <span className="inline-flex items-center gap-1">Valor {sortBy === 'amount' && sortDir !== 'none' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</span>
                  </th>
                  <th className="py-4 px-4 font-medium cursor-pointer" onClick={() => toggleSort('type')}>
                    <span className="inline-flex items-center gap-1">Tipo {sortBy === 'type' && sortDir !== 'none' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</span>
                  </th>
                  <th className="py-4 px-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass">
                {currentTransactions.map(t => {
                  const cat = categories.find(c => c.id === t.categoryCode);
                  const acc = accounts.find(a => a.id === t.accountId);
                  const isLocked = closingDate && t.date <= closingDate;
                  return (
                    <tr key={t.id} className={`hover:bg-input/20 transition-colors ${isLocked ? 'opacity-75' : ''}`}>
                      <td className="py-3 px-4 text-sm text-textPrimary whitespace-nowrap flex items-center gap-2">
                        {isLocked && <Lock size={12} className="text-textSecondary" title="Período Fechado" />}
                        {new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </td>
                      <td className="py-3 px-4 text-sm text-textPrimary">{t.description}</td>
                      <td className="py-3 px-4 text-sm text-textSecondary">
                        <div className="flex flex-col">
                          <span>{cat?.name || 'Desconhecida'}</span>
                          <span className="text-[10px] opacity-70">{t.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-textSecondary">{acc?.name}</td>
                      <td className="py-3 px-4 font-medium">
                        {t.type === MovementType.TRANSFER ? (
                          <span className="text-textPrimary">{FORMAT_CURRENCY(t.amount)}</span>
                        ) : (
                          <span className={t.type === MovementType.INCOME ? 'text-positive' : 'text-negative'}>
                            {t.type === MovementType.EXPENSE ? '-' : '+'} {FORMAT_CURRENCY(t.amount)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-textSecondary">{MOVEMENT_LABEL[t.type]}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenForm(t)}
                            className={`text-textSecondary ${isLocked ? 'opacity-30 cursor-not-allowed' : 'hover:text-primary'}`}
                            disabled={!!isLocked}
                            title={isLocked ? "Bloqueado por fechamento de período" : "Editar"}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
                                deleteTransaction(t.id);
                              }
                            }}
                            className={`text-textSecondary ${isLocked ? 'opacity-30 cursor-not-allowed' : 'hover:text-negative'}`}
                            disabled={!!isLocked}
                            title={isLocked ? "Bloqueado por fechamento de período" : "Excluir"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {currentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-0">
                      <div className="text-center py-12">
                        <Search size={48} className="mx-auto text-textMuted mb-3 opacity-50" />
                        <p className="text-textSecondary font-medium mb-1">Nenhuma movimentação encontrada</p>
                        <p className="text-textMuted text-sm mb-4">Registre sua primeira entrada ou saída</p>
                        <button
                          onClick={() => handleOpenForm()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
                        >
                          <Plus size={16} />
                          Novo Lançamento
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-glass bg-input/20">
            <div className="text-xs text-textSecondary hidden md:block">
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, allFilteredTransactions.length)} de {allFilteredTransactions.length} resultados
            </div>
            <div className="flex gap-2 mx-auto md:mx-0">
              <Button
                variant="secondary"
                className="px-3 py-1 text-xs"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} /> Anterior
              </Button>
              <span className="flex items-center px-3 text-sm text-textPrimary font-medium border border-glass rounded bg-input/50">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="secondary"
                className="px-3 py-1 text-xs"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-textPrimary">{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-textSecondary hover:text-white"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Data" type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} error={formErrors.date} />
                <Input label="Valor (R$)" type="number" step="0.01" min="0" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} error={formErrors.amount} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Tipo"
                  options={[{ value: MovementType.EXPENSE, label: 'Saída' }, { value: MovementType.INCOME, label: 'Entrada' }, { value: MovementType.TRANSFER, label: 'Transferência entre contas' }]}
                  value={formData.type}
                  onChange={e => {
                    const newType = e.target.value as MovementType;
                    const expectedType = newType === MovementType.INCOME ? TransactionType.INCOME : TransactionType.EXPENSE;

                    // Find an analytical category (leaf node) matching the new type
                    const analyticalCat = newType === MovementType.TRANSFER
                      ? null
                      : categories.find(c => {
                        if (!c.isActive || c.type !== expectedType) return false;
                        // Check if it's a leaf node (no children)
                        const categoryCode = c.code || c.id;
                        const hasChildren = categories.some(other => {
                          const otherCode = other.code || other.id;
                          return otherCode !== categoryCode && otherCode.startsWith(categoryCode + '.');
                        });
                        return !hasChildren;
                      });

                    const newCat = analyticalCat?.id || '';
                    const newCatName = analyticalCat?.name || '';

                    setFormData({
                      ...formData,
                      type: newType,
                      categoryCode: newCat
                    });
                    setCategoryQuery(newCatName);
                    setFormErrors(prev => ({ ...prev, categoryCode: undefined }));
                  }}
                />
                {formData.type === MovementType.TRANSFER ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Conta de Origem"
                      required
                      options={accounts.map(a => ({ value: a.id, label: a.name }))}
                      value={transferOriginId}
                      onChange={e => { setTransferOriginId(e.target.value); setFormErrors(prev => ({ ...prev, accountId: undefined })); }}
                      error={formErrors.accountId}
                    />
                    <Select
                      label="Conta de Destino"
                      required
                      options={accounts.map(a => ({ value: a.id, label: a.name }))}
                      value={transferDestId}
                      onChange={e => { setTransferDestId(e.target.value); setFormErrors(prev => ({ ...prev, accountId: undefined })); }}
                      error={formErrors.accountId}
                    />
                  </div>
                ) : (
                  <Select
                    label="Conta"
                    required
                    options={accounts.map(a => ({ value: a.id, label: a.name }))}
                    value={formData.accountId}
                    onChange={e => { setFormData({ ...formData, accountId: e.target.value }); setFormErrors(prev => ({ ...prev, accountId: undefined })); }}
                    error={formErrors.accountId}
                  />
                )}
              </div>

              {formData.type !== MovementType.TRANSFER && (
                <div className="relative">
                  <Input
                    label="Categoria"
                    required
                    value={categoryQuery}
                    onFocus={() => setCategoryOpen(true)}
                    onBlur={() => {
                      // Delay to allow click on dropdown item
                      setTimeout(() => setCategoryOpen(false), 200);
                    }}
                    onChange={e => {
                      const q = e.target.value;
                      setCategoryQuery(q);
                      setCategoryOpen(true);
                    }}
                    placeholder="Digite para buscar por nome ou código"
                    error={formErrors.categoryCode}
                  />
                  {categoryOpen && (
                    <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-glass bg-input shadow-lg">
                      {categorySuggestions.length > 0 ? (
                        categorySuggestions.map(s => (
                          <button
                            type="button"
                            key={s.id}
                            className="w-full text-left px-3 py-2 hover:bg-primary/10 text-sm text-textPrimary transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevent blur
                              setFormData({ ...formData, categoryCode: s.id });
                              setCategoryQuery(s.name);
                              setCategoryOpen(false);
                              setFormErrors(prev => ({ ...prev, categoryCode: undefined }));
                            }}
                          >
                            <div className="font-medium">{s.name}</div>
                            <div className="text-xs text-textSecondary opacity-70">{s.id}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-textSecondary">
                          Nenhuma categoria encontrada
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4"></div>

              <Input label="Descrição (opcional)" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Detalhes do lançamento" error={formErrors.description} />

              <div className="pt-4 flex gap-3">
                <Button type="submit" className="flex-1">Salvar</Button>
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

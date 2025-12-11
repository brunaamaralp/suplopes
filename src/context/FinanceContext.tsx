import React, { createContext, useContext, useEffect, useState } from 'react';
import { Account, Category, DailyBalanceCorrection, Transaction, TransactionType } from '../types';
import { DEFAULT_ACCOUNTS, INITIAL_CATEGORIES } from '../constants';
import { MOCK_TRANSACTIONS } from '../mockData';
import { StorageService } from '../services/storage';
import { listChart, seedChart, saveChartItem, updateChartItem, toggleActive } from '../services/domains/chartOfAccounts';
import { listAccounts, saveAccount, deleteAccount as deleteAccountApi } from '../services/domains/accounts';
import { listTransactions, saveTransaction, deleteTransaction as deleteTransactionApi } from '../services/domains/movements';
import { listCorrections, saveCorrection, updateCorrection } from '../services/domains/reconciliation';
import { getClosingDate, setClosingDate as setClosingDateApi } from '../services/domains/settings';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  categoriesOrigin: 'backend' | 'seed' | 'local';
  seedApplied: boolean;
  accounts: Account[];
  corrections: DailyBalanceCorrection[];
  closingDate: string | null; // Date string YYYY-MM-DD
  notifications: { id: string; type: 'success' | 'error'; message: string }[];
  addTransaction: (t: Transaction) => Promise<{ ok: boolean; errors?: { field: string; message: string }[] }>;
  updateTransaction: (t: Transaction) => Promise<{ ok: boolean; errors?: { field: string; message: string }[] }>;
  deleteTransaction: (id: string) => Promise<{ ok: boolean }>;
  addCategory: (c: Category) => Promise<{ ok: boolean; errors?: { field: string; message: string }[] }>;
  updateCategory: (c: Category) => Promise<{ ok: boolean; errors?: { field: string; message: string }[] }>;
  toggleCategoryStatus: (id: string) => Promise<{ ok: boolean }>;
  addAccount: (a: Account) => Promise<{ ok: boolean; errors?: { field: string; message: string }[] }>;
  updateAccount: (a: Account) => Promise<{ ok: boolean; errors?: { field: string; message: string }[] }>;
  deleteAccount: (id: string) => Promise<{ ok: boolean }>;
  updateAccountInitialBalance: (id: string, value: number) => Promise<{ ok: boolean }>;
  setCorrection: (c: DailyBalanceCorrection) => Promise<{ ok: boolean; errors?: { field: string; message: string }[] }>;
  setClosingDate: (date: string | null) => Promise<{ ok: boolean }>;
  notify: (type: 'success' | 'error', message: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesOrigin, setCategoriesOrigin] = useState<'backend' | 'seed' | 'local'>('local');
  const [seedApplied, setSeedApplied] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [corrections, setCorrections] = useState<DailyBalanceCorrection[]>([]);
  const [closingDate, setClosingDate] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; type: 'success' | 'error'; message: string }[]>([]);

  const notify = (type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const mapErrorMessage = (e: any, fallback: string) => {
    switch (e?.code) {
      case 'SYSTEM_ACCOUNT_LOCKED':
        return 'Conta padrão do sistema: só alternar ativo/inativo.';
      case 'SYSTEM_ACCOUNT_DELETE_FORBIDDEN':
        return 'Conta padrão do sistema não pode ser excluída.';
      case 'NOT_FOUND':
        return 'Recurso não encontrado.';
      case 'INTERNAL_ERROR':
        return 'Erro inesperado. Tente novamente.';
      default:
        return fallback;
    }
  };

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      // Load Accounts
      try {
        const accData = await listAccounts();
        if (Array.isArray(accData)) {
          setAccounts(accData.map(a => ({ id: a.id, name: a.name, initialBalance: a.initialBalance || 0 })));
          StorageService.save(StorageService.keys.ACCOUNTS, accData);
        }
      } catch (e) {
        console.warn("API Accounts failed, using cache", e);
        setAccounts(StorageService.load(StorageService.keys.ACCOUNTS, DEFAULT_ACCOUNTS));
      }

      // Load Categories
      try {
        const data = await listChart();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          setCategoriesOrigin('backend');
          setSeedApplied(false);
          StorageService.save(StorageService.keys.CATEGORIES, data);
        } else {
          // Backend empty: Seed with INITIAL_CATEGORIES
          const seedCats = INITIAL_CATEGORIES;
          setCategories(seedCats);
          setCategoriesOrigin('seed');
          setSeedApplied(true);

          // Try to seed backend
          try {
            await seedChart(seedCats);
            // Reload to get backend IDs
            const reloaded = await listChart();
            if (Array.isArray(reloaded) && reloaded.length > 0) {
              setCategories(reloaded);
              setCategoriesOrigin('backend');
              setSeedApplied(false);
              StorageService.save(StorageService.keys.CATEGORIES, reloaded);
            }
          } catch (e) {
            console.error("Failed to seed backend", e);
          }
        }
      } catch (e) {
        console.warn("API Categories failed, using cache", e);
        const localCats = StorageService.load(StorageService.keys.CATEGORIES, INITIAL_CATEGORIES);
        setCategories(localCats);
        setCategoriesOrigin('local');
      }

      // Load Transactions
      try {
        const txData = await listTransactions();
        if (Array.isArray(txData)) {
          setTransactions(txData);
          StorageService.save(StorageService.keys.TRANSACTIONS, txData);
        }
      } catch (e) {
        console.warn("API Transactions failed, using cache", e);
        setTransactions(StorageService.load(StorageService.keys.TRANSACTIONS, MOCK_TRANSACTIONS));
      }

      // Load Corrections from backend
      try {
        const corrData = await listCorrections();
        if (Array.isArray(corrData)) {
          const mapped = corrData.map((c: any) => ({
            ...c,
            id: c.id ? String(c.id) : undefined,
            bankAccountId: String(c.bankAccountId),
            date: typeof c.date === 'string' ? c.date.split('T')[0] : c.date,
          }));
          setCorrections(mapped);
          StorageService.save(StorageService.keys.BALANCE_CORRECTIONS, mapped);
        }
      } catch (e) {
        console.warn("API Corrections failed, using cache", e);
        setCorrections(StorageService.load(StorageService.keys.BALANCE_CORRECTIONS, []));
      }

      // Load Settings
      const settings = StorageService.load(StorageService.keys.SETTINGS, { closingDate: null });
      setClosingDate(settings.closingDate);
      try {
        const s = await getClosingDate();
        const cd = s && typeof s.closingDate !== 'undefined' ? s.closingDate : null;
        if (cd) setClosingDate(cd);
      } catch { }
    };

    loadData();
  }, []);

  // Persistence Effects
  useEffect(() => StorageService.save(StorageService.keys.TRANSACTIONS, transactions), [transactions]);
  useEffect(() => StorageService.save(StorageService.keys.CATEGORIES, categories), [categories]);
  useEffect(() => StorageService.save(StorageService.keys.ACCOUNTS, accounts), [accounts]);
  useEffect(() => StorageService.save(StorageService.keys.BALANCE_CORRECTIONS, corrections), [corrections]);
  useEffect(() => StorageService.save(StorageService.keys.SETTINGS, { closingDate }), [closingDate]);

  // Helper to check if date is locked
  const isDateLocked = (date: string) => {
    if (!closingDate) return false;
    return date <= closingDate;
  };

  const addTransaction = async (t: Transaction) => {
    if (isDateLocked(t.date)) {
      alert(`Não é possível adicionar lançamentos em períodos fechados (Trava: ${new Date(closingDate!).toLocaleDateString('pt-BR')}).`);
      return { ok: false };
    }

    try {
      const saved = await saveTransaction(t);
      // Use the returned object which has the real ID
      setTransactions(prev => [...prev, saved]);
      notify('success', 'Movimentação salva');
      return { ok: true };
    } catch (e: any) {
      notify('error', mapErrorMessage(e, 'Falha ao salvar movimentação'));
      return { ok: false, errors: e?.errors };
    }
  };

  const updateTransaction = async (t: Transaction) => {
    // Check both the new date and the original date of the transaction
    const original = transactions.find(tr => tr.id === t.id);

    if (original && isDateLocked(original.date)) {
      alert(`Não é possível editar lançamentos de um período fechado (Data original: ${new Date(original.date).toLocaleDateString('pt-BR')}).`);
      return { ok: false };
    }

    if (isDateLocked(t.date)) {
      alert(`Não é possível mover um lançamento para um período fechado (Trava: ${new Date(closingDate!).toLocaleDateString('pt-BR')}).`);
      return { ok: false };
    }

    try {
      const saved = await saveTransaction(t);
      setTransactions(prev => prev.map(item => item.id === t.id ? saved : item));
      notify('success', 'Movimentação atualizada');
      return { ok: true };
    } catch (e: any) {
      notify('error', mapErrorMessage(e, 'Falha ao atualizar movimentação'));
      return { ok: false, errors: e?.errors };
    }
  };

  const deleteTransaction = async (id: string) => {
    const original = transactions.find(tr => tr.id === id);
    if (original && isDateLocked(original.date)) {
      alert(`Não é possível excluir lançamentos de um período fechado (Trava: ${new Date(closingDate!).toLocaleDateString('pt-BR')}).`);
      return { ok: false };
    }
    try {
      await deleteTransactionApi(id);
      // Só remove do estado após confirmação da API
      setTransactions(prev => prev.filter(item => item.id !== id));
      notify('success', 'Movimentação excluída');
      return { ok: true };
    } catch (e) {
      notify('error', mapErrorMessage(e, 'Falha ao excluir movimentação'));
      return { ok: false };
    }
  };

  const addCategory = async (c: Category) => {
    try {
      const saved = await saveChartItem(c);
      setCategories(prev => [...prev, saved]);
      notify('success', 'Conta do plano salva');
      return { ok: true };
    } catch (e: any) {
      notify('error', mapErrorMessage(e, 'Falha ao salvar conta do plano'));
      return { ok: false, errors: e?.errors };
    }
  };

  const updateCategory = async (c: Category) => {
    try {
      const saved = await updateChartItem(c);
      // If updateChartItem returns the object, use it. If not, use 'c' but 'saved' is safer if API returns it.
      // My updateChartItem implementation returns put() result, which is the object.
      setCategories(prev => prev.map(item => item.id === c.id ? (saved || c) : item));
      notify('success', 'Conta do plano atualizada');
      return { ok: true };
    } catch (e: any) {
      notify('error', mapErrorMessage(e, 'Falha ao atualizar conta do plano'));
      return { ok: false, errors: e?.errors };
    }
  };

  const toggleCategoryStatus = async (id: string) => {
    const next = categories.find(c => c.id === id);
    const newStatus = next ? !next.isActive : true;
    setCategories(prev => prev.map(item => item.id === id ? { ...item, isActive: newStatus } : item));
    try {
      await toggleActive(id, newStatus);
      notify('success', newStatus ? 'Conta ativada' : 'Conta desativada');
      return { ok: true };
    } catch (e) {
      notify('error', mapErrorMessage(e, 'Falha ao alterar status da conta'));
      return { ok: false };
    }
  };

  const addAccount = async (a: Account) => {
    try {
      const saved = await saveAccount(a);
      setAccounts(prev => [...prev, saved]);
      notify('success', 'Conta adicionada');
      return { ok: true };
    } catch (e: any) {
      notify('error', mapErrorMessage(e, 'Falha ao adicionar conta'));
      return { ok: false, errors: e?.errors };
    }
  };

  const updateAccount = async (a: Account) => {
    try {
      const saved = await saveAccount(a);
      setAccounts(prev => prev.map(item => item.id === a.id ? saved : item));
      notify('success', 'Conta atualizada');
      return { ok: true };
    } catch (e: any) {
      notify('error', mapErrorMessage(e, 'Falha ao atualizar conta'));
      return { ok: false, errors: e?.errors };
    }
  };

  const deleteAccount = async (id: string) => {
    // Prevent delete if transactions exist
    const hasTransactions = transactions.some(t => t.accountId === id);
    if (hasTransactions) {
      alert("Não é possível excluir uma conta que possui movimentações vinculadas.");
      return { ok: false };
    }
    try {
      await deleteAccountApi(id);
      // Só remove do estado após confirmação da API
      setAccounts(prev => prev.filter(item => item.id !== id));
      notify('success', 'Conta excluída');
      return { ok: true };
    } catch (e) {
      notify('error', mapErrorMessage(e, 'Falha ao excluir conta'));
      return { ok: false };
    }
  };

  const updateAccountInitialBalance = async (id: string, value: number) => {
    setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, initialBalance: value } : acc));
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      try {
        await saveAccount({ id: acc.id, name: acc.name, initialBalance: value });
        notify('success', 'Saldo inicial atualizado');
        return { ok: true };
      } catch (e) {
        notify('error', mapErrorMessage(e, 'Falha ao atualizar saldo inicial'));
        return { ok: false };
      }
    }
    return { ok: false };
  };

  const setCorrection = async (c: DailyBalanceCorrection) => {
    setCorrections(prev => {
      const existing = prev.find(item => item.date === c.date && item.bankAccountId === c.bankAccountId);
      if (existing) {
        const next = { ...existing, ...c };
        return prev.map(item => (item.date === c.date && item.bankAccountId === c.bankAccountId) ? next : item);
      }
      return [...prev, c];
    });
    try {
      if (c.id) {
        await updateCorrection(c.id, c as any);
      } else {
        const saved = await saveCorrection(c as any);
        if (saved && saved.id) {
          setCorrections(prev => prev.map(item => (item.date === c.date && item.bankAccountId === c.bankAccountId) ? { ...item, id: saved.id } : item));
        }
      }
      notify('success', 'Conferência registrada');
      return { ok: true };
    } catch (e: any) {
      notify('error', mapErrorMessage(e, 'Falha ao registrar conferência'));
      return { ok: false, errors: e?.errors };
    }
  };

  const setClosingDateFn = async (date: string | null) => {
    setClosingDate(date);
    try {
      await setClosingDateApi(date);
      notify('success', 'Fechamento atualizado');
      return { ok: true };
    } catch (e) {
      notify('error', mapErrorMessage(e, 'Falha ao atualizar fechamento'));
      return { ok: false };
    }
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      categories,
      categoriesOrigin,
      seedApplied,
      accounts,
      corrections,
      closingDate,
      notifications,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      toggleCategoryStatus,
      addAccount,
      updateAccount,
      deleteAccount,
      updateAccountInitialBalance,
      setCorrection,
      setClosingDate: setClosingDateFn,
      notify
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
};

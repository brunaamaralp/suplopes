
export enum TransactionType {
  INCOME = 'Entrada',
  EXPENSE = 'Saída',
}

export enum MovementType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export const MOVEMENT_LABEL: Record<MovementType, string> = {
  [MovementType.INCOME]: 'Entrada',
  [MovementType.EXPENSE]: 'Saída',
  [MovementType.TRANSFER]: 'Transferência',
};

export enum Nature {
  CREDIT = 'C',
  DEBIT = 'D',
}

export enum AccountType {
  RECEITA = 'RECEITA',
  CUSTO = 'CUSTO',
  DESPESA_OPERACIONAL = 'DESPESA_OPERACIONAL',
  DESPESA_FINANCEIRA = 'DESPESA_FINANCEIRA',
  OPERACAO_PATRIMONIAL = 'OPERACAO_PATRIMONIAL',
  MOVIMENTACAO_COMPLEMENTAR = 'MOVIMENTACAO_COMPLEMENTAR',
  OPERACAO_PERMUTATIVA = 'OPERACAO_PERMUTATIVA',
}

export interface Category {
  id: string;
  code?: string; // Hierarchical code (e.g. 1.1.01)
  name: string;
  type: TransactionType;
  isActive: boolean;
  group?: string; // ID of the parent category
  nature?: Nature;
  level?: number;
  parentCode?: string | null;
  isSystem?: boolean;
  isEditable?: boolean;
  canDelete?: boolean;
  side?: 'RECEITA' | 'DESPESA/CUSTO';
  sortOrder?: number;
  accountType?: AccountType;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: MovementType;
  categoryCode: string;
  description: string;
  paymentMethod?: string;
  accountId: string;
  amount: number;
}

export interface Account {
  id: string;
  name: string;
  initialBalance: number; // Set per month conceptually, but simplified here
}

export type ReconciliationStatus = 'CONCILIATED' | 'PENDING';

export interface Reconciliation {
  id?: string;
  date: string; // YYYY-MM-DD
  bankAccountId: string;
  systemBalance: number;
  bankBalance: number;
  difference?: number;
  status?: ReconciliationStatus;
  notes?: string;
}

export type DailyBalanceCorrection = Reconciliation;

export type ViewState = 'DASHBOARD' | 'PLANO_CONTAS' | 'MOVIMENTACOES' | 'CONFERENCIA' | 'FLUXO_CAIXA' | 'CONTAS';

export const FORMAT_CURRENCY = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

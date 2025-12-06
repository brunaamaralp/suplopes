-- DDL para o banco fincontrol
-- Criar tabelas necessárias e popular dados mínimos

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  initial_balance NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  group_parent_id TEXT NULL
);

CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id TEXT,
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  nature CHAR(1) NOT NULL,
  level INTEGER NOT NULL,
  parent_code TEXT NULL,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_editable BOOLEAN NOT NULL DEFAULT TRUE,
  can_delete BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  side TEXT NOT NULL,
  sort_order BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  category_id TEXT,
  description TEXT,
  payment_method TEXT,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS balance_corrections (
  date DATE NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  real_balance NUMERIC NOT NULL,
  PRIMARY KEY (date, account_id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- Seed mínimo de contas
INSERT INTO accounts (id, name, initial_balance) VALUES
  ('cash', 'Caixa', 1000.00)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, initial_balance = EXCLUDED.initial_balance;

INSERT INTO accounts (id, name, initial_balance) VALUES
  ('bank', 'Banco Corrente', 5000.00)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, initial_balance = EXCLUDED.initial_balance;

-- Seed mínimo de plano de contas (exemplos)
INSERT INTO chart_of_accounts (id, code, name, account_type, nature, level, parent_code, is_system, is_editable, can_delete, is_active, side, sort_order)
VALUES ('1', '1', 'Receitas', 'RECEITA', 'C', 1, NULL, TRUE, FALSE, FALSE, TRUE, 'RECEITA', 1)
ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, account_type=EXCLUDED.account_type, nature=EXCLUDED.nature, level=EXCLUDED.level, parent_code=EXCLUDED.parent_code, is_system=EXCLUDED.is_system, is_editable=EXCLUDED.is_editable, can_delete=EXCLUDED.can_delete, is_active=EXCLUDED.is_active, side=EXCLUDED.side, sort_order=EXCLUDED.sort_order;

INSERT INTO chart_of_accounts (id, code, name, account_type, nature, level, parent_code, is_system, is_editable, can_delete, is_active, side, sort_order)
VALUES ('3', '3', 'Despesas', 'DESPESA_OPERACIONAL', 'D', 1, NULL, TRUE, FALSE, FALSE, TRUE, 'DESPESA/CUSTO', 3)
ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, account_type=EXCLUDED.account_type, nature=EXCLUDED.nature, level=EXCLUDED.level, parent_code=EXCLUDED.parent_code, is_system=EXCLUDED.is_system, is_editable=EXCLUDED.is_editable, can_delete=EXCLUDED.can_delete, is_active=EXCLUDED.is_active, side=EXCLUDED.side, sort_order=EXCLUDED.sort_order;

-- Seed mínimo de transações para testar Conferência
INSERT INTO transactions (id, date, type, category_id, description, payment_method, account_id, amount) VALUES
  ('tx-001', CURRENT_DATE - INTERVAL '5 day', 'INCOME', '1', 'Venda', 'PIX', 'bank', 1200.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO transactions (id, date, type, category_id, description, payment_method, account_id, amount) VALUES
  ('tx-002', CURRENT_DATE - INTERVAL '3 day', 'EXPENSE', '3', 'Fornecedor', 'TED', 'bank', 450.00)
ON CONFLICT (id) DO NOTHING;

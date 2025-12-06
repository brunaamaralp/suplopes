-- =====================================================
-- SCRIPT SQL PARA SUPABASE - Sistema Financeiro
-- Projeto: Sup. Lopes - Controle Financeiro
-- =====================================================

-- Habilitar extensão UUID (caso queira usar UUIDs no futuro)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: Account (Contas Bancárias / Caixas)
-- =====================================================
CREATE TABLE IF NOT EXISTS "Account" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'conta_corrente',
    balance DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índice para busca por nome
CREATE INDEX IF NOT EXISTS idx_account_name ON "Account" (name);

-- =====================================================
-- TABELA: Category (Plano de Contas)
-- =====================================================
CREATE TABLE IF NOT EXISTS "Category" (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "group" VARCHAR(50),
    nature VARCHAR(10),
    level INTEGER,
    "parentCode" VARCHAR(50),
    "isSystem" BOOLEAN NOT NULL DEFAULT FALSE,
    "isEditable" BOOLEAN NOT NULL DEFAULT TRUE,
    "canDelete" BOOLEAN NOT NULL DEFAULT TRUE,
    side VARCHAR(50),
    "sortOrder" INTEGER,
    "accountType" VARCHAR(100),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para Category
CREATE INDEX IF NOT EXISTS idx_category_code ON "Category" (code);
CREATE INDEX IF NOT EXISTS idx_category_type ON "Category" (type);
CREATE INDEX IF NOT EXISTS idx_category_is_active ON "Category" ("isActive");
CREATE INDEX IF NOT EXISTS idx_category_parent_code ON "Category" ("parentCode");
CREATE INDEX IF NOT EXISTS idx_category_sort_order ON "Category" ("sortOrder");

-- =====================================================
-- TABELA: Transaction (Movimentações Financeiras)
-- =====================================================
CREATE TABLE IF NOT EXISTS "Transaction" (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    amount DOUBLE PRECISION NOT NULL,
    type VARCHAR(50) NOT NULL,
    "accountId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Chaves estrangeiras
    CONSTRAINT fk_transaction_account 
        FOREIGN KEY ("accountId") 
        REFERENCES "Account" (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_transaction_category 
        FOREIGN KEY ("categoryId") 
        REFERENCES "Category" (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- Índices para Transaction
CREATE INDEX IF NOT EXISTS idx_transaction_date ON "Transaction" (date);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON "Transaction" (type);
CREATE INDEX IF NOT EXISTS idx_transaction_account_id ON "Transaction" ("accountId");
CREATE INDEX IF NOT EXISTS idx_transaction_category_id ON "Transaction" ("categoryId");
CREATE INDEX IF NOT EXISTS idx_transaction_date_account ON "Transaction" (date, "accountId");

-- =====================================================
-- TABELA: Reconciliation (Conferências de Saldo)
-- =====================================================
CREATE TABLE IF NOT EXISTS "Reconciliation" (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    "bankAccountId" INTEGER NOT NULL,
    "systemBalance" DOUBLE PRECISION NOT NULL,
    "bankBalance" DOUBLE PRECISION NOT NULL,
    difference DOUBLE PRECISION,
    status VARCHAR(50),
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Chave estrangeira
    CONSTRAINT fk_reconciliation_account 
        FOREIGN KEY ("bankAccountId") 
        REFERENCES "Account" (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- Índices para Reconciliation
CREATE INDEX IF NOT EXISTS idx_reconciliation_date ON "Reconciliation" (date);
CREATE INDEX IF NOT EXISTS idx_reconciliation_bank_account ON "Reconciliation" ("bankAccountId");
CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON "Reconciliation" (status);
CREATE INDEX IF NOT EXISTS idx_reconciliation_date_account ON "Reconciliation" (date, "bankAccountId");

-- Nota: Para evitar duplicação de conferência no mesmo dia/conta,
-- a validação será feita na aplicação

-- =====================================================
-- TABELA: Settings (Configurações do Sistema)
-- =====================================================
CREATE TABLE IF NOT EXISTS "Settings" (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índice para busca por chave
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_key ON "Settings" (key);

-- Inserir configuração padrão de fechamento
INSERT INTO "Settings" (key, value) 
VALUES ('closingDate', NULL) 
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- FUNÇÕES E TRIGGERS PARA UPDATED_AT AUTOMÁTICO
-- =====================================================

-- Função para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para Account
DROP TRIGGER IF EXISTS update_account_updated_at ON "Account";
CREATE TRIGGER update_account_updated_at
    BEFORE UPDATE ON "Account"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para Category
DROP TRIGGER IF EXISTS update_category_updated_at ON "Category";
CREATE TRIGGER update_category_updated_at
    BEFORE UPDATE ON "Category"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para Transaction
DROP TRIGGER IF EXISTS update_transaction_updated_at ON "Transaction";
CREATE TRIGGER update_transaction_updated_at
    BEFORE UPDATE ON "Transaction"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para Reconciliation
DROP TRIGGER IF EXISTS update_reconciliation_updated_at ON "Reconciliation";
CREATE TRIGGER update_reconciliation_updated_at
    BEFORE UPDATE ON "Reconciliation"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para Settings
DROP TRIGGER IF EXISTS update_settings_updated_at ON "Settings";
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON "Settings"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) - SUPABASE
-- =====================================================

-- Habilitar RLS nas tabelas (necessário para Supabase)
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reconciliation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Settings" ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (ajuste conforme necessidade de autenticação)
-- Por enquanto, permitir acesso total para usuários anônimos e autenticados

-- Account
CREATE POLICY "Allow all access to Account" ON "Account"
    FOR ALL USING (true) WITH CHECK (true);

-- Category
CREATE POLICY "Allow all access to Category" ON "Category"
    FOR ALL USING (true) WITH CHECK (true);

-- Transaction
CREATE POLICY "Allow all access to Transaction" ON "Transaction"
    FOR ALL USING (true) WITH CHECK (true);

-- Reconciliation
CREATE POLICY "Allow all access to Reconciliation" ON "Reconciliation"
    FOR ALL USING (true) WITH CHECK (true);

-- Settings
CREATE POLICY "Allow all access to Settings" ON "Settings"
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================


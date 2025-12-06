-- =====================================================
-- PARTE 2: CRIAR ÍNDICES E TRIGGERS
-- Execute este script DEPOIS da Parte 1
-- =====================================================

-- Índices para Account
CREATE INDEX idx_account_name ON "Account" (name);

-- Índices para Category
CREATE INDEX idx_category_code ON "Category" (code);
CREATE INDEX idx_category_type ON "Category" (type);
CREATE INDEX idx_category_is_active ON "Category" ("isActive");
CREATE INDEX idx_category_parent_code ON "Category" ("parentCode");
CREATE INDEX idx_category_sort_order ON "Category" ("sortOrder");

-- Índices para Transaction
CREATE INDEX idx_transaction_date ON "Transaction" (date);
CREATE INDEX idx_transaction_type ON "Transaction" (type);
CREATE INDEX idx_transaction_account_id ON "Transaction" ("accountId");
CREATE INDEX idx_transaction_category_id ON "Transaction" ("categoryId");

-- Índices para Reconciliation
CREATE INDEX idx_reconciliation_date ON "Reconciliation" (date);
CREATE INDEX idx_reconciliation_bank_account ON "Reconciliation" ("bankAccountId");
CREATE INDEX idx_reconciliation_status ON "Reconciliation" (status);

-- Função para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_account_updated_at
    BEFORE UPDATE ON "Account"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_updated_at
    BEFORE UPDATE ON "Category"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transaction_updated_at
    BEFORE UPDATE ON "Transaction"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reconciliation_updated_at
    BEFORE UPDATE ON "Reconciliation"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON "Settings"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


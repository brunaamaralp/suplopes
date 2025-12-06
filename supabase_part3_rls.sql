-- =====================================================
-- PARTE 3: ROW LEVEL SECURITY E POLÍTICAS
-- Execute este script DEPOIS da Parte 2
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reconciliation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Settings" ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir tudo por enquanto)
CREATE POLICY "Allow all access to Account" ON "Account"
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to Category" ON "Category"
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to Transaction" ON "Transaction"
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to Reconciliation" ON "Reconciliation"
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to Settings" ON "Settings"
    FOR ALL USING (true) WITH CHECK (true);


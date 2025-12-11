-- =====================================================
-- POLÍTICAS DE AUTENTICAÇÃO - Supabase Auth
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Remover políticas antigas (permissão total)
DROP POLICY IF EXISTS "Allow all access to Account" ON "Account";
DROP POLICY IF EXISTS "Allow all access to Category" ON "Category";
DROP POLICY IF EXISTS "Allow all access to Transaction" ON "Transaction";
DROP POLICY IF EXISTS "Allow all access to Reconciliation" ON "Reconciliation";
DROP POLICY IF EXISTS "Allow all access to Settings" ON "Settings";

-- =====================================================
-- NOVAS POLÍTICAS - Apenas usuários autenticados
-- =====================================================

-- Account: Apenas usuários logados podem ler/escrever
CREATE POLICY "Authenticated users can read accounts"
ON "Account" FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert accounts"
ON "Account" FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounts"
ON "Account" FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete accounts"
ON "Account" FOR DELETE
TO authenticated
USING (true);

-- Category: Apenas usuários logados podem ler/escrever
CREATE POLICY "Authenticated users can read categories"
ON "Category" FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert categories"
ON "Category" FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
ON "Category" FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
ON "Category" FOR DELETE
TO authenticated
USING (true);

-- Transaction: Apenas usuários logados podem ler/escrever
CREATE POLICY "Authenticated users can read transactions"
ON "Transaction" FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert transactions"
ON "Transaction" FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update transactions"
ON "Transaction" FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete transactions"
ON "Transaction" FOR DELETE
TO authenticated
USING (true);

-- Reconciliation: Apenas usuários logados podem ler/escrever
CREATE POLICY "Authenticated users can read reconciliations"
ON "Reconciliation" FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert reconciliations"
ON "Reconciliation" FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update reconciliations"
ON "Reconciliation" FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reconciliations"
ON "Reconciliation" FOR DELETE
TO authenticated
USING (true);

-- Settings: Apenas usuários logados podem ler/escrever
CREATE POLICY "Authenticated users can read settings"
ON "Settings" FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert settings"
ON "Settings" FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings"
ON "Settings" FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================



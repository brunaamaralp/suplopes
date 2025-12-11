-- Script de Migração: Adicionar userId, Settings e limpar dados
-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard/project/umwhpuladpvcsbuuqury/sql)

-- 1. Limpar todos os dados existentes (respeitar foreign keys)
TRUNCATE TABLE "Reconciliation" CASCADE;
TRUNCATE TABLE "Transaction" CASCADE;
TRUNCATE TABLE "Account" CASCADE;

-- 2. Adicionar coluna userId na tabela Account
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT '';

-- 3. Adicionar coluna userId na tabela Transaction
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT '';

-- 4. Adicionar coluna userId na tabela Reconciliation
ALTER TABLE "Reconciliation" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT '';

-- 5. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX IF NOT EXISTS "Reconciliation_userId_idx" ON "Reconciliation"("userId");

-- 6. Remover o default vazio (agora que não há dados)
ALTER TABLE "Account" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "Reconciliation" ALTER COLUMN "userId" DROP DEFAULT;

-- 7. Criar tabela Settings para persistir configurações por usuário
CREATE TABLE IF NOT EXISTS "Settings" (
  "id" SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "closingDate" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Settings_userId_idx" ON "Settings"("userId");

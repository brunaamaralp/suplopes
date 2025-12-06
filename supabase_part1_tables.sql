-- =====================================================
-- PARTE 1: CRIAR TABELAS
-- Execute este script primeiro
-- =====================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABELA: Account
CREATE TABLE "Account" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'conta_corrente',
    balance DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- TABELA: Category
CREATE TABLE "Category" (
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

-- TABELA: Transaction
CREATE TABLE "Transaction" (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    amount DOUBLE PRECISION NOT NULL,
    type VARCHAR(50) NOT NULL,
    "accountId" INTEGER NOT NULL REFERENCES "Account"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "categoryId" INTEGER NOT NULL REFERENCES "Category"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- TABELA: Reconciliation
CREATE TABLE "Reconciliation" (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    "bankAccountId" INTEGER NOT NULL REFERENCES "Account"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "systemBalance" DOUBLE PRECISION NOT NULL,
    "bankBalance" DOUBLE PRECISION NOT NULL,
    difference DOUBLE PRECISION,
    status VARCHAR(50),
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- TABELA: Settings
CREATE TABLE "Settings" (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO "Settings" (key, value) VALUES ('closingDate', NULL);


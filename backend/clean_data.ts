import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🗑️  Limpando dados existentes...')

    // Deletar na ordem correta (respeitar foreign keys)
    const deletedReconciliations = await prisma.reconciliation.deleteMany({})
    console.log(`  - Reconciliations: ${deletedReconciliations.count} registros deletados`)

    const deletedTransactions = await prisma.transaction.deleteMany({})
    console.log(`  - Transactions: ${deletedTransactions.count} registros deletados`)

    const deletedAccounts = await prisma.account.deleteMany({})
    console.log(`  - Accounts: ${deletedAccounts.count} registros deletados`)

    console.log('✅ Dados limpos com sucesso!')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())

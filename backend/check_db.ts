
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const accounts = await prisma.account.count();
        const transactions = await prisma.transaction.count();
        const categories = await prisma.category.count();
        console.log(`Accounts: ${accounts}`);
        console.log(`Transactions: ${transactions}`);
        console.log(`Categories: ${categories}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()

// Configuração do Prisma com Driver Adapter para PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Cliente Supabase para validação de tokens
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Interface para request autenticado
interface AuthenticatedRequest extends Request {
  user?: any
}

// Middleware de autenticação
const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  // Permitir requisições sem autenticação em ambiente de desenvolvimento
  if (process.env.NODE_ENV !== 'production' && !process.env.SUPABASE_URL) {
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' })
    return
  }

  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    res.status(401).json({ error: 'Token inválido' })
    return
  }

  req.user = user
  next()
}

app.use(cors())
app.use(express.json())

// Aplicar middleware de autenticação em todas as rotas /api
app.use('/api', authMiddleware)

// ----------------------
// ROTAS DE CONTAS
// ----------------------
app.get('/api/accounts', async (req: AuthenticatedRequest, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.user.id }
    })
    res.json(accounts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao buscar contas' })
  }
})

app.post('/api/accounts', async (req, res) => {
  try {
    const { name, type, initialBalance, balance } = req.body

    // Ensure balance is a number
    let finalBalance = 0;
    if (initialBalance !== undefined && initialBalance !== null && initialBalance !== '') {
      finalBalance = Number(initialBalance);
    } else if (balance !== undefined && balance !== null && balance !== '') {
      finalBalance = Number(balance);
    }

    const account = await prisma.account.create({
      data: {
        userId: (req as AuthenticatedRequest).user.id,
        name,
        type: type || 'conta_corrente',
        balance: isNaN(finalBalance) ? 0 : finalBalance
      },
    })
    res.status(201).json(account)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao criar conta' })
  }
})

app.put('/api/accounts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { name, type, initialBalance, balance } = req.body

    const data: any = { name }
    if (type) data.type = type

    // Ensure balance is a number
    let finalBalance: number | undefined;
    if (initialBalance !== undefined && initialBalance !== null && initialBalance !== '') {
      finalBalance = Number(initialBalance);
    } else if (balance !== undefined && balance !== null && balance !== '') {
      finalBalance = Number(balance);
    }

    if (typeof finalBalance === 'number' && !isNaN(finalBalance)) {
      data.balance = finalBalance;
    }

    const account = await prisma.account.update({
      where: { id, userId: (req as AuthenticatedRequest).user.id },
      data,
    })
    res.json(account)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao atualizar conta' })
  }
})

app.delete('/api/accounts/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id)
    await prisma.account.delete({ where: { id, userId: req.user.id } })
    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao deletar conta' })
  }
})

// ----------------------
// ROTAS DE CATEGORIAS
// ----------------------
app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany()
    res.json(categories)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao buscar categorias' })
  }
})

app.post('/api/categories', async (req, res) => {
  try {
    const { name, type, code, isActive, group, nature, level, parentCode, isSystem, isEditable, canDelete, side, sortOrder, accountType } = req.body
    const category = await prisma.category.create({
      data: {
        name,
        type,
        code,
        isActive: isActive ?? true,
        group,
        nature,
        level,
        parentCode,
        isSystem: isSystem ?? false,
        isEditable: isEditable ?? true,
        canDelete: canDelete ?? true,
        side,
        sortOrder,
        accountType
      },
    })
    res.status(201).json(category)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao criar categoria' })
  }
})

app.put('/api/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { name, type, code, isActive, group, nature, level, parentCode, isSystem, isEditable, canDelete, side, sortOrder, accountType } = req.body

    const data: any = {}
    if (name !== undefined) data.name = name
    if (type !== undefined) data.type = type
    if (code !== undefined) data.code = code
    if (isActive !== undefined) data.isActive = isActive
    if (group !== undefined) data.group = group
    if (nature !== undefined) data.nature = nature
    if (level !== undefined) data.level = level
    if (parentCode !== undefined) data.parentCode = parentCode
    if (isSystem !== undefined) data.isSystem = isSystem
    if (isEditable !== undefined) data.isEditable = isEditable
    if (canDelete !== undefined) data.canDelete = canDelete
    if (side !== undefined) data.side = side
    if (sortOrder !== undefined) data.sortOrder = sortOrder
    if (accountType !== undefined) data.accountType = accountType

    const category = await prisma.category.update({
      where: { id },
      data,
    })
    res.json(category)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao atualizar categoria' })
  }
})

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    await prisma.category.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao deletar categoria' })
  }
})

app.post('/api/categories/seed', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Body deve ser um array de categorias' });
    }

    // Using transaction for bulk insert with all category fields
    const created = await prisma.$transaction(
      items.map((item: any) =>
        prisma.category.create({
          data: {
            name: item.name,
            type: item.type,
            code: item.code,
            isActive: item.isActive ?? true,
            group: item.group,
            nature: item.nature,
            level: item.level,
            parentCode: item.parentCode,
            isSystem: item.isSystem ?? false,
            isEditable: item.isEditable ?? true,
            canDelete: item.canDelete ?? true,
            side: item.side,
            sortOrder: item.sortOrder,
            accountType: item.accountType
          }
        })
      )
    );

    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao semear categorias' });
  }
});

// ----------------------
// ROTAS DE TRANSAÇÕES
// ----------------------
app.get('/api/transactions', async (req: AuthenticatedRequest, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      include: { account: true, category: true },
    })
    res.json(transactions)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao buscar transações' })
  }
})

app.post('/api/transactions', async (req, res) => {
  try {
    const { date, description, amount, type, accountId, categoryId, categoryCode } = req.body

    // If categoryId is null but categoryCode is provided, try to find category by code
    let finalCategoryId = categoryId;
    if (!finalCategoryId && categoryCode) {
      const category = await prisma.category.findFirst({
        where: { code: categoryCode }
      });
      if (category) {
        finalCategoryId = category.id;
      }
    }

    if (!finalCategoryId) {
      return res.status(400).json({ error: 'Categoria não encontrada' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: (req as AuthenticatedRequest).user.id,
        date: new Date(date),
        description: description || '',
        amount,
        type,
        accountId,
        categoryId: finalCategoryId,
      },
    })

    res.status(201).json(transaction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao criar transação' })
  }
})

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { date, description, amount, type, accountId, categoryId, categoryCode } = req.body

    // If categoryId is null but categoryCode is provided, try to find category by code
    let finalCategoryId = categoryId;
    if (!finalCategoryId && categoryCode) {
      const category = await prisma.category.findFirst({
        where: { code: categoryCode }
      });
      if (category) {
        finalCategoryId = category.id;
      }
    }

    if (!finalCategoryId) {
      return res.status(400).json({ error: 'Categoria não encontrada' });
    }

    const transaction = await prisma.transaction.update({
      where: { id, userId: (req as AuthenticatedRequest).user.id },
      data: {
        date: new Date(date),
        description: description || '',
        amount,
        type,
        accountId,
        categoryId: finalCategoryId,
      },
    })

    res.json(transaction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao atualizar transação' })
  }
})

app.delete('/api/transactions/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id)
    await prisma.transaction.delete({ where: { id, userId: req.user.id } })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar transação' })
  }
})

// ----------------------
// ROTAS DE CONCILIAÇÃO
// ----------------------
app.get('/api/corrections', async (req: AuthenticatedRequest, res) => {
  try {
    const { bankAccountId, start, end } = req.query;
    const where: any = { userId: req.user.id };

    if (bankAccountId) where.bankAccountId = Number(bankAccountId);
    if (start && end) {
      where.date = {
        gte: new Date(start as string),
        lte: new Date(end as string),
      };
    }

    const corrections = await prisma.reconciliation.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    res.json(corrections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar conferências' });
  }
});

app.post('/api/corrections', async (req, res) => {
  try {
    const { date, bankAccountId, systemBalance, bankBalance, difference, status, notes } = req.body;

    const correction = await prisma.reconciliation.create({
      data: {
        userId: (req as AuthenticatedRequest).user.id,
        date: new Date(date),
        bankAccountId: Number(bankAccountId),
        systemBalance: Number(systemBalance),
        bankBalance: Number(bankBalance),
        difference: Number(difference),
        status,
        notes,
      },
    });
    res.status(201).json(correction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar conferência' });
  }
});

app.put('/api/corrections/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { date, bankAccountId, systemBalance, bankBalance, difference, status, notes } = req.body;

    const correction = await prisma.reconciliation.update({
      where: { id, userId: (req as AuthenticatedRequest).user.id },
      data: {
        date: new Date(date),
        bankAccountId: Number(bankAccountId),
        systemBalance: Number(systemBalance),
        bankBalance: Number(bankBalance),
        difference: Number(difference),
        status,
        notes,
      },
    });
    res.json(correction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar conferência' });
  }
});

// ----------------------
// ROTAS DE SETTINGS (In-Memory)
// ----------------------
let closingDate: string | null = null;

app.get('/api/settings/closingDate', (_req, res) => {
  res.json({ closingDate });
});

app.post('/api/settings/closingDate', (req, res) => {
  const { closingDate: newDate } = req.body;
  closingDate = newDate;
  res.json({ closingDate });
});

// ----------------------
// SUBIR SERVIDOR
// ----------------------
const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`)
})

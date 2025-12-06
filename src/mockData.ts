import { Transaction, MovementType } from './types';

// Helper to generate dates for the last 30 days
const generateDate = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

export const MOCK_TRANSACTIONS: Transaction[] = [
    // VENDAS - Últimos 30 dias
    { id: 't001', date: generateDate(0), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia - Dinheiro', paymentMethod: 'Dinheiro', accountId: 'acc_1', amount: 3450.80 },
    { id: 't002', date: generateDate(0), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia - PIX', paymentMethod: 'PIX', accountId: 'acc_2', amount: 5230.50 },
    { id: 't003', date: generateDate(0), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia - Cartão Débito', paymentMethod: 'Cartão de Débito', accountId: 'acc_2', amount: 4120.30 },
    { id: 't004', date: generateDate(0), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia - Cartão Crédito', paymentMethod: 'Cartão de Crédito', accountId: 'acc_2', amount: 6890.00 },

    { id: 't005', date: generateDate(1), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia - Dinheiro', paymentMethod: 'Dinheiro', accountId: 'acc_1', amount: 3120.00 },
    { id: 't006', date: generateDate(1), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia - PIX', paymentMethod: 'PIX', accountId: 'acc_2', amount: 4850.75 },
    { id: 't007', date: generateDate(1), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia - Cartão', paymentMethod: 'Cartão de Débito', accountId: 'acc_2', amount: 5670.20 },

    { id: 't008', date: generateDate(2), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia - Dinheiro', paymentMethod: 'Dinheiro', accountId: 'acc_1', amount: 2980.50 },
    { id: 't009', date: generateDate(2), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia - PIX', paymentMethod: 'PIX', accountId: 'acc_2', amount: 4320.00 },
    { id: 't010', date: generateDate(2), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia - Cartão', paymentMethod: 'Cartão de Crédito', accountId: 'acc_2', amount: 6120.80 },

    // COMPRAS DE FORNECEDORES
    { id: 't011', date: generateDate(3), type: MovementType.EXPENSE, categoryCode: '2.1.01.001', description: 'Atacadão - Compra de mercadorias', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 8500.00 },
    { id: 't012', date: generateDate(5), type: MovementType.EXPENSE, categoryCode: '2.1.01.001', description: 'Distribuidora Alimentos - Compra', paymentMethod: 'Boleto', accountId: 'acc_2', amount: 12300.50 },
    { id: 't013', date: generateDate(7), type: MovementType.EXPENSE, categoryCode: '2.1.01.001', description: 'Fornecedor Hortifruti', paymentMethod: 'PIX', accountId: 'acc_2', amount: 2450.00 },
    { id: 't014', date: generateDate(10), type: MovementType.EXPENSE, categoryCode: '2.1.01.001', description: 'Laticínios São Paulo', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 3890.75 },
    { id: 't015', date: generateDate(12), type: MovementType.EXPENSE, categoryCode: '2.1.01.001', description: 'Distribuidora Bebidas', paymentMethod: 'Boleto', accountId: 'acc_2', amount: 5670.00 },

    // DESPESAS OPERACIONAIS
    { id: 't016', date: generateDate(5), type: MovementType.EXPENSE, categoryCode: '3.1.01.003', description: 'Conta de Energia Elétrica', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 1850.40 },
    { id: 't017', date: generateDate(6), type: MovementType.EXPENSE, categoryCode: '3.1.01.001', description: 'Conta de Água', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 420.80 },
    { id: 't018', date: generateDate(7), type: MovementType.EXPENSE, categoryCode: '3.1.01.002', description: 'Aluguel do Imóvel', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 4500.00 },
    { id: 't019', date: generateDate(8), type: MovementType.EXPENSE, categoryCode: '3.1.01.007', description: 'Telefonia e Internet', paymentMethod: 'Cartão de Crédito', accountId: 'acc_3', amount: 380.00 },
    { id: 't020', date: generateDate(9), type: MovementType.EXPENSE, categoryCode: '3.1.08.002', description: 'Sistema de Gestão - Mensalidade', paymentMethod: 'Boleto', accountId: 'acc_2', amount: 250.00 },

    // FOLHA DE PAGAMENTO
    { id: 't021', date: generateDate(4), type: MovementType.EXPENSE, categoryCode: '3.1.02.007', description: 'Salários - Funcionários', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 15800.00 },
    { id: 't022', date: generateDate(4), type: MovementType.EXPENSE, categoryCode: '3.1.02.006', description: 'FGTS', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 1264.00 },
    { id: 't023', date: generateDate(4), type: MovementType.EXPENSE, categoryCode: '3.1.02.003', description: 'Vale Alimentação', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 2200.00 },

    // TAXAS E IMPOSTOS
    { id: 't024', date: generateDate(15), type: MovementType.EXPENSE, categoryCode: '2.1.03.001', description: 'Simples Nacional - Ref. Mês Anterior', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 3450.00 },
    { id: 't025', date: generateDate(10), type: MovementType.EXPENSE, categoryCode: '2.1.04.002', description: 'Taxa Adm Cartão Crédito', paymentMethod: 'Débito Automático', accountId: 'acc_2', amount: 890.50 },
    { id: 't026', date: generateDate(10), type: MovementType.EXPENSE, categoryCode: '2.1.04.003', description: 'Taxa Adm Cartão Débito', paymentMethod: 'Débito Automático', accountId: 'acc_2', amount: 320.40 },
    { id: 't027', date: generateDate(10), type: MovementType.EXPENSE, categoryCode: '2.1.04.004', description: 'Taxa PIX', paymentMethod: 'Débito Automático', accountId: 'acc_2', amount: 125.80 },

    // MANUTENÇÃO E LIMPEZA
    { id: 't028', date: generateDate(11), type: MovementType.EXPENSE, categoryCode: '3.1.01.005', description: 'Manutenção Geladeira', paymentMethod: 'Dinheiro', accountId: 'acc_1', amount: 450.00 },
    { id: 't029', date: generateDate(13), type: MovementType.EXPENSE, categoryCode: '3.1.01.006', description: 'Material de Limpeza', paymentMethod: 'PIX', accountId: 'acc_2', amount: 320.50 },
    { id: 't030', date: generateDate(14), type: MovementType.EXPENSE, categoryCode: '3.1.01.006', description: 'Material de Expediente', paymentMethod: 'Cartão de Crédito', accountId: 'acc_3', amount: 180.00 },

    // VEÍCULOS
    { id: 't031', date: generateDate(16), type: MovementType.EXPENSE, categoryCode: '3.1.06.006', description: 'Abastecimento - Caminhão Entregas', paymentMethod: 'Cartão de Débito', accountId: 'acc_2', amount: 350.00 },
    { id: 't032', date: generateDate(18), type: MovementType.EXPENSE, categoryCode: '3.1.06.003', description: 'Manutenção Caminhão', paymentMethod: 'PIX', accountId: 'acc_2', amount: 680.00 },

    // MARKETING
    { id: 't033', date: generateDate(20), type: MovementType.EXPENSE, categoryCode: '3.1.07.001', description: 'Panfletos e Propaganda', paymentMethod: 'PIX', accountId: 'acc_2', amount: 420.00 },
    { id: 't034', date: generateDate(22), type: MovementType.EXPENSE, categoryCode: '3.1.07.002', description: 'Promoção Aniversário Loja', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 1200.00 },

    // CONTABILIDADE
    { id: 't035', date: generateDate(25), type: MovementType.EXPENSE, categoryCode: '3.1.01.004', description: 'Honorários Contábeis', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 850.00 },

    // VENDAS ADICIONAIS (dias anteriores)
    { id: 't036', date: generateDate(3), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'Dinheiro', accountId: 'acc_1', amount: 3250.00 },
    { id: 't037', date: generateDate(3), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'PIX', accountId: 'acc_2', amount: 4890.50 },

    { id: 't038', date: generateDate(4), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'Dinheiro', accountId: 'acc_1', amount: 2980.00 },
    { id: 't039', date: generateDate(4), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'Cartão de Crédito', accountId: 'acc_2', amount: 5670.80 },

    { id: 't040', date: generateDate(5), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'Dinheiro', accountId: 'acc_1', amount: 3120.50 },
    { id: 't041', date: generateDate(5), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'PIX', accountId: 'acc_2', amount: 4560.00 },

    { id: 't042', date: generateDate(6), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'Dinheiro', accountId: 'acc_1', amount: 3450.00 },
    { id: 't043', date: generateDate(6), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'Cartão', accountId: 'acc_2', amount: 6230.75 },

    { id: 't044', date: generateDate(7), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'Dinheiro', accountId: 'acc_1', amount: 2890.00 },
    { id: 't045', date: generateDate(7), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'PIX', accountId: 'acc_2', amount: 5120.50 },

    { id: 't046', date: generateDate(8), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'Dinheiro', accountId: 'acc_1', amount: 3340.00 },
    { id: 't047', date: generateDate(8), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'Cartão', accountId: 'acc_2', amount: 5890.25 },

    { id: 't048', date: generateDate(9), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'Dinheiro', accountId: 'acc_1', amount: 3180.00 },
    { id: 't049', date: generateDate(9), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'PIX', accountId: 'acc_2', amount: 4760.50 },

    { id: 't050', date: generateDate(10), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'Dinheiro', accountId: 'acc_1', amount: 3520.00 },
    { id: 't051', date: generateDate(10), type: MovementType.INCOME, categoryCode: '1.1.01.001', description: 'Vendas do dia', paymentMethod: 'Cartão', accountId: 'acc_2', amount: 6450.80 },

    // PRO-LABORE
    { id: 't052', date: generateDate(4), type: MovementType.EXPENSE, categoryCode: '3.1.15.001', description: 'Pro-labore Sócio 1', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 5000.00 },
    { id: 't053', date: generateDate(4), type: MovementType.EXPENSE, categoryCode: '3.1.15.001', description: 'Pro-labore Sócio 2', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 5000.00 },

    // EMBALAGENS
    { id: 't054', date: generateDate(17), type: MovementType.EXPENSE, categoryCode: '2.1.01.002', description: 'Sacolas Plásticas', paymentMethod: 'PIX', accountId: 'acc_2', amount: 380.00 },
    { id: 't055', date: generateDate(19), type: MovementType.EXPENSE, categoryCode: '2.1.01.002', description: 'Caixas de Papelão', paymentMethod: 'Transferência Bancária', accountId: 'acc_2', amount: 520.00 },
];

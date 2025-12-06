
import { Account, Category, TransactionType, Nature, AccountType } from "./types";

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc_1', name: 'Caixa Loja', initialBalance: 5000.00 },
  { id: 'acc_2', name: 'Banco do Brasil', initialBalance: 25000.00 },
  { id: 'acc_3', name: 'Nubank', initialBalance: 10000.00 },
];

export const PAYMENT_METHODS = [
  'Dinheiro',
  'PIX',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Transferência Bancária',
  'Boleto',
  'Cheque',
];

const BASE_CATEGORIES: Category[] = [
  // 1. RECEITAS
  { id: '1', name: '1 - RECEITAS', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.1', name: '1.1 - RECEITAS OPERACIONAIS', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },

  { id: '1.1.01', name: '1.1.01 - VENDA DIRETA', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.1.01.001', name: '1.1.01.001 - VENDAS À VISTA', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.1.01.002', name: '1.1.01.002 - VENDAS A PRAZO', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.1.01.003', name: '1.1.01.003 - RECEBIMENTO DE VENDA A PRAZO', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.1.01.004', name: '1.1.01.004 - ESTORNO DE RECEBIMENTO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT }, // D
  { id: '1.1.01.005', name: '1.1.01.005 - DEVOLUÇÕES DE VENDAS À VISTA', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT }, // D
  { id: '1.1.01.006', name: '1.1.01.006 - DEVOLUÇÕES DE VENDAS A PRAZO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT }, // D

  { id: '1.1.02', name: '1.1.02 - FINANCEIRAS', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.1.02.001', name: '1.1.02.001 - CHEQUES DEVOLVIDOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT }, // D
  { id: '1.1.02.002', name: '1.1.02.002 - JUROS RECEBIDOS POR ATRASO DE PAGAMENTO', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.1.02.003', name: '1.1.02.003 - MULTAS RECEBIDAS POR ATRASO DE PAGAMENTO', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.1.02.004', name: '1.1.02.004 - RENDIMENTOS DE APLICAÇÕES FINANCEIRAS', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },

  { id: '1.1.03', name: '1.1.03 - OUTRAS RECEITAS', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.1.03.001', name: '1.1.03.001 - RECEITA COM ALUGUÉIS', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.1.03.002', name: '1.1.03.002 - RECEITA COM FRETE', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.1.03.003', name: '1.1.03.003 - OUTRAS RECEITAS EVENTUAIS', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.1.03.004', name: '1.1.03.004 - DIFERENÇA POSITIVA DE CAIXA', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },

  { id: '1.2', name: '1.2 - APLICATIVOS COMERCIAIS', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.2.01.001', name: '1.2.01.001 - VENDAS POR APLICATIVO', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },
  { id: '1.2.01.002', name: '1.2.01.002 - RECEBIMENTOS DE VENDAS POR APLICATIVO', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT },

  // 2. CUSTOS
  { id: '2', name: '2 - CUSTOS DE VENDA E SERVIÇOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1', name: '2.1 - CUSTOS OPERACIONAIS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },

  { id: '2.1.01', name: '2.1.01 - CUSTO DA MERCADORIA VENDIDA (CMV)', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.01.001', name: '2.1.01.001 - PAGAMENTO DE FORNECEDORES', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.01.002', name: '2.1.01.002 - EMBALAGEM', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.01.003', name: '2.1.01.003 - FRETE ENTREGA DE VENDAS/COMPRAS (CMV)', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.01.004', name: '2.1.01.004 - ESTORNO PAGAMENTO FORNECEDORES', type: TransactionType.INCOME, isActive: true }, // C

  { id: '2.1.02', name: '2.1.02 - CUSTO DO SERVICO PRESTADO (CSP)', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.02.001', name: '2.1.02.001 - FP-PRODUCAO - 13 SALARIO', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.02.002', name: '2.1.02.002 - FP-PRODUCAO - ACERTO TRABALHISTA', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.02.003', name: '2.1.02.003 - FP-PRODUÇÃO - ALIMENTAÇÃO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1.02.004', name: '2.1.02.004 - FP-PRODUÇÃO - COMISSÕES E GRATIFICAÇÕES', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1.02.005', name: '2.1.02.005 - FP-PRODUÇÃO - EXAMES ADMISSÃO/DEMISSÃO/PERIÓDICOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1.02.006', name: '2.1.02.006 - FP-PRODUÇÃO - FÉRIAS + 1/3 DE FÉRIAS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1.02.007', name: '2.1.02.007 - FP-PRODUÇÃO - OUTROS CUSTOS COM FOLHA', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1.02.008', name: '2.1.02.008 - FP-PRODUÇÃO - SALÁRIO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1.02.009', name: '2.1.02.009 - FP-PRODUÇÃO - UNIFORMES', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1.02.010', name: '2.1.02.010 - SERVIÇOS DE TERCEIROS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1.02.011', name: '2.1.02.011 - INSUMOS/MATERIAIS PARA PRESTAÇÃO DE SERVIÇOS', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.02.012', name: '2.1.02.012 - EQUIPAMENTOS EPI', type: TransactionType.EXPENSE, isActive: true },

  { id: '2.1.03', name: '2.1.03 - IMPOSTOS SOBRE VENDAS E SERVIÇOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1.03.001', name: '2.1.03.001 - SIMPLES NACIONAL', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1.03.002', name: '2.1.03.002 - ISS', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.03.003', name: '2.1.03.003 - ICMS / ICMS-ST', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.03.004', name: '2.1.03.004 - DIFERENCIAL DE ALÍQUOTA', type: TransactionType.EXPENSE, isActive: true },

  { id: '2.1.04', name: '2.1.04 - OUTROS CUSTOS VARIÁVEIS', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.04.001', name: '2.1.04.001 - COMISSÕES DE VENDEDORES', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.04.002', name: '2.1.04.002 - TAXA ADM CARTÃO CRÉDITO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1.04.003', name: '2.1.04.003 - TAXA ADM CARTÃO DÉBITO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '2.1.04.004', name: '2.1.04.004 - TAXA ADM PIX', type: TransactionType.EXPENSE, isActive: true },
  { id: '2.1.04.005', name: '2.1.04.005 - TAXA BOLETO', type: TransactionType.EXPENSE, isActive: true },

  // 3. DESPESAS
  { id: '3', name: '3 - DESPESAS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1', name: '3.1 - DESPESAS OPERACIONAIS', type: TransactionType.EXPENSE, isActive: true },

  { id: '3.1.01', name: '3.1.01 - MANUTENCAO DA OPERACAO', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.01.001', name: '3.1.01.001 - ÁGUA/ESGOTO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.01.002', name: '3.1.01.002 - ALUGUEL', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.01.003', name: '3.1.01.003 - ENERGIA ELÉTRICA', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.01.004', name: '3.1.01.004 - HONORÁRIOS CONTÁBEIS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.01.005', name: '3.1.01.005 - MANUTENÇÃO PREDIAL', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.01.006', name: '3.1.01.006 - MATERIAL DE EXPEDIENTE', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.01.007', name: '3.1.01.007 - TELEFONIA', type: TransactionType.EXPENSE, isActive: true },

  { id: '3.1.02', name: '3.1.02 - PESSOAL', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.02.001', name: '3.1.02.001 - 13º SALÁRIO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.02.002', name: '3.1.02.002 - ACERTO TRABALHISTA', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.02.003', name: '3.1.02.003 - ALIMENTAÇÃO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.02.004', name: '3.1.02.004 - EXAMES ADMISSÃO/DEMISSÃO/PERIÓDICOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.02.005', name: '3.1.02.005 - FÉRIAS + 1/3 DE FÉRIAS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.02.006', name: '3.1.02.006 - FGTS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.02.007', name: '3.1.02.007 - SALÁRIOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.02.008', name: '3.1.02.008 - UNIFORMES', type: TransactionType.EXPENSE, isActive: true },

  { id: '3.1.03', name: '3.1.03 - CONSULTORIA ESPECIALIZADA', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.03.001', name: '3.1.03.001 - CONSULTORIA ADMINISTRATIVA', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.03.002', name: '3.1.03.002 - CONSULTORIA CONTÁBIL', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },

  { id: '3.1.04', name: '3.1.04 - TRIBUTÁRIAS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.04.001', name: '3.1.04.001 - IMPOSTOS FEDERAIS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.04.002', name: '3.1.04.002 - IMPOSTOS ESTADUAIS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.04.003', name: '3.1.04.003 - IMPOSTOS MUNICIPAIS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.04.004', name: '3.1.04.004 - TAXAS FEDERAIS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.04.005', name: '3.1.04.005 - TAXAS ESTADUAIS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.04.006', name: '3.1.04.006 - TAXAS MUNICIPAIS', type: TransactionType.EXPENSE, isActive: true },

  { id: '3.1.05', name: '3.1.05 - PARCERIAS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.05.001', name: '3.1.05.001 - COMISSÕES PAGAS A PARCEIROS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },

  { id: '3.1.06', name: '3.1.06 - VEICULOS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.06.001', name: '3.1.06.001 - DOCUMENTAÇÃO DE VEÍCULOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.06.002', name: '3.1.06.002 - LAVAÇÃO DE VEÍCULOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.06.003', name: '3.1.06.003 - MANUTENÇÃO EM VEÍCULOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.06.004', name: '3.1.06.004 - MULTAS DE TRÂNSITO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.06.005', name: '3.1.06.005 - SEGURO DE VEÍCULOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.06.006', name: '3.1.06.006 - ABASTECIMENTO DE VEÍCULOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },

  { id: '3.1.07', name: '3.1.07 - MARKETING', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.07.001', name: '3.1.07.001 - AGENCIA DE MARKETING', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.07.002', name: '3.1.07.002 - ORGANIZAÇÃO DE EVENTOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.07.003', name: '3.1.07.003 - PATROCÍNIOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },

  { id: '3.1.08', name: '3.1.08 - TECNOLOGIA', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.08.001', name: '3.1.08.001 - LOCAÇÃO DE ARMAZENAMENTO EM NUVEM', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.08.002', name: '3.1.08.002 - SISTEMA DE GESTÃO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.08.003', name: '3.1.08.003 - PROVEDOR DE INTERNET', type: TransactionType.EXPENSE, isActive: true },

  { id: '3.1.09', name: '3.1.09 - BANCÁRIOS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.09.001', name: '3.1.09.001 - TARIFA DE COBRANÇA', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.09.002', name: '3.1.09.002 - ESTORNO DE TAXA BANCÁRIA', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT }, // C

  { id: '3.1.10', name: '3.1.10 - CARTÃO CRÉDITO / DÉBITO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.10.001', name: '3.1.10.001 - TAXA ANTECIPAÇÃO CARTÃO CRÉDITO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.10.002', name: '3.1.10.002 - ALUGUEL MÁQUINA CARTÃO CRÉDITO/DÉBITO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },

  { id: '3.1.11', name: '3.1.11 - FINANCEIROS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.11.001', name: '3.1.11.001 - IOF', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.11.002', name: '3.1.11.002 - SEGURO DE OPERAÇÕES FINANCEIRAS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.11.003', name: '3.1.11.003 - DIFERENÇA NEGATIVA DE CAIXA', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },

  { id: '3.1.12', name: '3.1.12 - VIAGENS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.12.001', name: '3.1.12.001 - COMBUSTÍVEL (VIAGENS)', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.12.002', name: '3.1.12.002 - HOSPEDAGEM/ALIMENTAÇÃO (VIAGENS)', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.12.003', name: '3.1.12.003 - OUTRAS DESPESAS DE VIAGENS', type: TransactionType.EXPENSE, isActive: true },

  { id: '3.1.13', name: '3.1.13 - APLICATIVOS COMERCIAIS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.13.001', name: '3.1.13.001 - FRETE / ENTREGA DE PEDIDOS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.13.002', name: '3.1.13.002 - TAXA DE SERVIÇO DO APLICATIVO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '3.1.13.003', name: '3.1.13.003 - COMISSÃO DO APLICATIVO', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.13.004', name: '3.1.13.004 - OUTRAS DESPESAS DO APLICATIVO', type: TransactionType.EXPENSE, isActive: true },

  { id: '3.1.14', name: '3.1.14 - EVENTUAIS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.14.001', name: '3.1.14.001 - CONFRATERNIZAÇÕES', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },

  { id: '3.1.15', name: '3.1.15 - SALARIO FIXO DOS SÓCIOS', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.15.001', name: '3.1.15.001 - PRO-LABORE', type: TransactionType.EXPENSE, isActive: true },
  { id: '3.1.15.002', name: '3.1.15.002 - SEGURO DE VIDA DOS SÓCIOS', type: TransactionType.EXPENSE, isActive: true },

  // 4. DESPESAS FINANCEIRAS NÃO OPERACIONAIS
  { id: '4', name: '4 - DESPESAS FINANCEIRAS NÃO OPERACIONAIS', type: TransactionType.EXPENSE, isActive: true },
  { id: '4.1', name: '4.1 - DESPESAS COM JUROS', type: TransactionType.EXPENSE, isActive: true },
  { id: '4.1.01', name: '4.1.01 - CUSTO COM JUROS', type: TransactionType.EXPENSE, isActive: true },
  { id: '4.1.01.001', name: '4.1.01.001 - JUROS DE EMPRESTIMOS', type: TransactionType.EXPENSE, isActive: true },
  { id: '4.1.01.002', name: '4.1.01.002 - JUROS DE ANTECIPAÇÃO DE RECEBÍVEIS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '4.1.01.003', name: '4.1.01.003 - JUROS PAGOS POR ATRASO DE PAGAMENTO', type: TransactionType.EXPENSE, isActive: true },
  { id: '4.1.01.004', name: '4.1.01.004 - PAGAMENTO DE JUROS CHEQUE ESPECIAL', type: TransactionType.EXPENSE, isActive: true },

  // 5. OPERAÇÕES PATRIMONIAIS
  { id: '5', name: '5 - OPERAÇÕES PATRIMONIAIS', type: TransactionType.EXPENSE, isActive: true },
  { id: '5.1', name: '5.1 - IMOBILIZACAO DE CAPITAL', type: TransactionType.EXPENSE, isActive: true },

  { id: '5.1.01', name: '5.1.01 - IMOBILIZADO', type: TransactionType.EXPENSE, isActive: true },
  { id: '5.1.01.001', name: '5.1.01.001 - MÓVEIS/EQUIPAMENTOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.1.01.002', name: '5.1.01.002 - REFORMAS/CONSTRUÇÃO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.1.01.003', name: '5.1.01.003 - IMÓVEIS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.1.01.004', name: '5.1.01.004 - VEÍCULOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },

  { id: '5.1.02', name: '5.1.02 - INVESTIMENTOS', type: TransactionType.EXPENSE, isActive: true },
  { id: '5.1.02.001', name: '5.1.02.001 - INVEST. IMÓVEIS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.1.02.002', name: '5.1.02.002 - INVEST. CONSÓRCIOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.1.02.004', name: '5.1.02.004 - OUTROS INVESTIMENTOS', type: TransactionType.EXPENSE, isActive: true },
  { id: '5.1.02.005', name: '5.1.02.005 - VENDA DE IMOBILIZADO DE USO', type: TransactionType.INCOME, isActive: true }, // C

  { id: '5.2', name: '5.2 - FINANCIAMENTO DA OPERAÇÃO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.2.01', name: '5.2.01 - TOMADA', type: TransactionType.INCOME, isActive: true }, // C
  { id: '5.2.01.001', name: '5.2.01.001 - TOMADA DE EMPRÉSTIMOS - ALAVANCAGEM', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT }, // C
  { id: '5.2.01.002', name: '5.2.01.002 - TOMADA DE EMPRÉSTIMOS - CONSUMO', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT }, // C

  { id: '5.2.02', name: '5.2.02 - PAGAMENTO', type: TransactionType.EXPENSE, isActive: true },
  { id: '5.2.02.001', name: '5.2.02.001 - PAGAMENTO DE EMPRÉSTIMOS - ALAVANCAGEM', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.2.02.002', name: '5.2.02.002 - PAGAMENTO DE EMPRÉSTIMOS - CONSUMO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.2.02.003', name: '5.2.02.003 - PAGAMENTO DE RECEBÍVEIS ANTECIPADOS', type: TransactionType.EXPENSE, isActive: true },

  { id: '5.3', name: '5.3 - OPERAÇÕES FINANCEIRAS NÃO ONEROSAS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.3.01', name: '5.3.01 - OPERAÇÕES FINANCEIRAS DO GRUPO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.3.01.001', name: '5.3.01.001 - TOMADA EMPRÉSTIMOS EMPRESAS DO GRUPO', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT }, // C
  { id: '5.3.01.002', name: '5.3.01.002 - PAGAMENTO EMPRÉSTIMOS EMPRESAS DO GRUPO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },

  { id: '5.4', name: '5.4 - MOVIMENTAÇÃO DOS SÓCIOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.4.01', name: '5.4.01 - DISTRIBUIÇÃO DE LUCROS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.4.01.001', name: '5.4.01.001 - RETIRADAS DOS SÓCIOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },

  { id: '5.4.02', name: '5.4.02 - CAPITALIZAÇÃO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.4.02.001', name: '5.4.02.001 - INJEÇÃO DE CAPITAL', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT }, // C

  { id: '5.4.03', name: '5.4.03 - OUTRAS MOVIMENTAÇÕES DOS SÓCIOS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '5.4.03.001', name: '5.4.03.001 - RELAÇÃO FINANCEIRA COM TERCEIROS (C)', type: TransactionType.INCOME, isActive: true, nature: Nature.CREDIT }, // C
  { id: '5.4.03.002', name: '5.4.03.002 - RELAÇÃO FINANCEIRA COM TERCEIROS (D)', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT }, // D
  { id: '5.4.03.003', name: '5.4.03.003 - RENDIMENTO FINANCEIRO PARTICULAR', type: TransactionType.INCOME, isActive: true }, // C

  // 8. MOVIMENTAÇÃO COMPLEMENTARES
  { id: '8', name: '8 - MOVIMENTAÇÃO COMPLEMENTARES', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '8.1', name: '8.1 - MOVIMENTAÇÃO NÃO OPERACIONAL', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '8.1.01', name: '8.1.01 - MOVIMENTAÇÃO DE TERCEIROS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '8.1.01.001', name: '8.1.01.001 - CRÉDITO DE TERCEIROS', type: TransactionType.INCOME, isActive: true }, // C
  { id: '8.1.01.002', name: '8.1.01.002 - DÉBITO DE TERCEIROS', type: TransactionType.EXPENSE, isActive: true }, // D

  // 9. OPERAÇÕES PERMUTATIVAS
  { id: '9', name: '9 - OPERAÇÕES PERMUTATIVAS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '9.2', name: '9.2 - OPERAÇÕES DE APOIO À OPERAÇÃO', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '9.2.01', name: '9.2.01 - TRANSFERÊNCIAS', type: TransactionType.EXPENSE, isActive: true, nature: Nature.DEBIT },
  { id: '9.2.01.001', name: '9.2.01.001 - TRANSFERENCIA CRÉDITO', type: TransactionType.INCOME, isActive: true }, // C
  { id: '9.2.01.002', name: '9.2.01.002 - TRANSFERENCIA DÉBITO', type: TransactionType.EXPENSE, isActive: true }, // D
];

const computeLevel = (id: string): number => id.split('.').length;
const computeParentCode = (id: string): string | null => {
  const parts = id.split('.');
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join('.');
};
const deriveAccountType = (id: string): AccountType => {
  const root = id.split('.')[0];
  switch (root) {
    case '1': return AccountType.RECEITA;
    case '2': return AccountType.CUSTO;
    case '3': return AccountType.DESPESA_OPERACIONAL;
    case '4': return AccountType.DESPESA_FINANCEIRA;
    case '5': return AccountType.OPERACAO_PATRIMONIAL;
    case '8': return AccountType.MOVIMENTACAO_COMPLEMENTAR;
    case '9': return AccountType.OPERACAO_PERMUTATIVA;
    default: return AccountType.DESPESA_OPERACIONAL;
  }
};
const deriveNature = (t: TransactionType): Nature => t === TransactionType.INCOME ? Nature.CREDIT : Nature.DEBIT;
const deriveSide = (n: Nature): 'RECEITA' | 'DESPESA/CUSTO' => n === Nature.CREDIT ? 'RECEITA' : 'DESPESA/CUSTO';
const isSystemNonEditableRoot = (id: string): boolean => {
  const rootsFixed = ['1', '2', '4', '5', '8', '9'];
  const root = id.split('.')[0];
  if (rootsFixed.includes(root)) return true;
  if (id === '3' || id === '3.1') return true;
  if (root === '3') return true;
  return false;
};
const enrichCategory = (c: Category): Category => {
  const level = computeLevel(c.id);
  const parentCode = computeParentCode(c.id);
  const nature = deriveNature(c.type);
  const side = deriveSide(nature);
  const accountType = deriveAccountType(c.id);
  const isSystem = isSystemNonEditableRoot(c.id);
  const isEditable = !isSystem;
  const canDelete = !isSystem;
  // Compute a smaller sortOrder that fits in INT range
  // Use a simpler calculation: level * 10000 + sequential number within level
  const parts = c.id.split('.');
  let sortOrder = 0;
  for (let i = 0; i < parts.length; i++) {
    const num = parseInt(parts[i].replace(/\D/g, '') || '0', 10);
    sortOrder = sortOrder * 100 + Math.min(num, 99); // Cap each part at 99
  }
  return {
    ...c,
    group: c.group ?? parentCode ?? undefined,
    level,
    parentCode,
    nature,
    side,
    accountType,
    isSystem,
    isEditable,
    canDelete,
    sortOrder,
  };
};

export const INITIAL_CATEGORIES: Category[] = BASE_CATEGORIES.map(enrichCategory);

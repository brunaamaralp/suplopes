import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umwhpuladpvcsbuuqury.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtd2hwdWxhZHB2Y3NidXVxdXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTgxMjMsImV4cCI6MjA4MDUzNDEyM30.IINJBtPWEfPGeHEqgxlMjUlqO033vzAOiGjK2uZxqog';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Plano de Contas Completo
const CATEGORIES = [
  // ========== RECEITAS ==========
  { code: '1', name: '1 - RECEITAS', type: 'Entrada', nature: 'C', level: 1, parentCode: null, isSystem: true, isEditable: false, canDelete: false, side: 'RECEITA', accountType: 'RECEITA' },
  
  { code: '1.1', name: '1.1 - RECEITAS OPERACIONAIS', type: 'Entrada', nature: 'C', level: 2, parentCode: '1', isSystem: true, isEditable: false, canDelete: false, side: 'RECEITA', accountType: 'RECEITA' },
  
  { code: '1.1.01', name: '1.1.01 - VENDAS', type: 'Entrada', nature: 'C', level: 3, parentCode: '1.1', isSystem: true, isEditable: false, canDelete: false, side: 'RECEITA', accountType: 'RECEITA' },
  { code: '1.1.01.001', name: '1.1.01.001 - VENDAS À VISTA', type: 'Entrada', nature: 'C', level: 4, parentCode: '1.1.01', isSystem: false, isEditable: true, canDelete: true, side: 'RECEITA', accountType: 'RECEITA' },
  { code: '1.1.01.003', name: '1.1.01.003 - RECEBIMENTO DE VENDA A PRAZO', type: 'Entrada', nature: 'C', level: 4, parentCode: '1.1.01', isSystem: false, isEditable: true, canDelete: true, side: 'RECEITA', accountType: 'RECEITA' },
  
  { code: '1.1.02', name: '1.1.02 - SERVIÇOS', type: 'Entrada', nature: 'C', level: 3, parentCode: '1.1', isSystem: true, isEditable: false, canDelete: false, side: 'RECEITA', accountType: 'RECEITA' },
  { code: '1.1.02.001', name: '1.1.02.001 - PRESTAÇÃO DE SERVIÇOS', type: 'Entrada', nature: 'C', level: 4, parentCode: '1.1.02', isSystem: false, isEditable: true, canDelete: true, side: 'RECEITA', accountType: 'RECEITA' },
  
  { code: '1.2', name: '1.2 - OUTRAS RECEITAS', type: 'Entrada', nature: 'C', level: 2, parentCode: '1', isSystem: true, isEditable: false, canDelete: false, side: 'RECEITA', accountType: 'RECEITA' },
  { code: '1.2.01', name: '1.2.01 - RECEITAS FINANCEIRAS', type: 'Entrada', nature: 'C', level: 3, parentCode: '1.2', isSystem: true, isEditable: false, canDelete: false, side: 'RECEITA', accountType: 'RECEITA' },
  { code: '1.2.01.001', name: '1.2.01.001 - JUROS RECEBIDOS', type: 'Entrada', nature: 'C', level: 4, parentCode: '1.2.01', isSystem: false, isEditable: true, canDelete: true, side: 'RECEITA', accountType: 'RECEITA' },
  { code: '1.2.01.002', name: '1.2.01.002 - RENDIMENTOS DE APLICAÇÕES', type: 'Entrada', nature: 'C', level: 4, parentCode: '1.2.01', isSystem: false, isEditable: true, canDelete: true, side: 'RECEITA', accountType: 'RECEITA' },
  
  { code: '1.2.02', name: '1.2.02 - RECEITAS DIVERSAS', type: 'Entrada', nature: 'C', level: 3, parentCode: '1.2', isSystem: true, isEditable: false, canDelete: false, side: 'RECEITA', accountType: 'RECEITA' },
  { code: '1.2.02.001', name: '1.2.02.001 - OUTRAS RECEITAS', type: 'Entrada', nature: 'C', level: 4, parentCode: '1.2.02', isSystem: false, isEditable: true, canDelete: true, side: 'RECEITA', accountType: 'RECEITA' },

  // ========== DESPESAS/CUSTOS ==========
  { code: '2', name: '2 - DESPESAS/CUSTOS', type: 'Saída', nature: 'D', level: 1, parentCode: null, isSystem: true, isEditable: false, canDelete: false, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  
  { code: '2.1', name: '2.1 - CUSTOS OPERACIONAIS', type: 'Saída', nature: 'D', level: 2, parentCode: '2', isSystem: true, isEditable: false, canDelete: false, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  
  { code: '2.1.01', name: '2.1.01 - COMPRAS', type: 'Saída', nature: 'D', level: 3, parentCode: '2.1', isSystem: true, isEditable: false, canDelete: false, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.1.01.001', name: '2.1.01.001 - COMPRAS DE MERCADORIA', type: 'Saída', nature: 'D', level: 4, parentCode: '2.1.01', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.1.01.002', name: '2.1.01.002 - FRETES E CARRETOS', type: 'Saída', nature: 'D', level: 4, parentCode: '2.1.01', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  
  { code: '2.2', name: '2.2 - DESPESAS OPERACIONAIS', type: 'Saída', nature: 'D', level: 2, parentCode: '2', isSystem: true, isEditable: false, canDelete: false, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  
  { code: '2.2.01', name: '2.2.01 - DESPESAS COM PESSOAL', type: 'Saída', nature: 'D', level: 3, parentCode: '2.2', isSystem: true, isEditable: false, canDelete: false, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.01.001', name: '2.2.01.001 - SALÁRIOS', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.01', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.01.002', name: '2.2.01.002 - ENCARGOS SOCIAIS (INSS/FGTS)', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.01', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.01.003', name: '2.2.01.003 - VALE TRANSPORTE', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.01', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.01.004', name: '2.2.01.004 - VALE ALIMENTAÇÃO', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.01', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.01.005', name: '2.2.01.005 - FÉRIAS E 13º SALÁRIO', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.01', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  
  { code: '2.2.02', name: '2.2.02 - DESPESAS ADMINISTRATIVAS', type: 'Saída', nature: 'D', level: 3, parentCode: '2.2', isSystem: true, isEditable: false, canDelete: false, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.02.001', name: '2.2.02.001 - ALUGUEL', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.02', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.02.002', name: '2.2.02.002 - ENERGIA ELÉTRICA', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.02', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.02.003', name: '2.2.02.003 - ÁGUA E ESGOTO', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.02', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.02.004', name: '2.2.02.004 - TELEFONE E INTERNET', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.02', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.02.005', name: '2.2.02.005 - MATERIAL DE ESCRITÓRIO', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.02', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.02.006', name: '2.2.02.006 - MATERIAL DE LIMPEZA', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.02', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.02.007', name: '2.2.02.007 - MANUTENÇÃO E REPAROS', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.02', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.02.008', name: '2.2.02.008 - SEGUROS', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.02', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.02.009', name: '2.2.02.009 - CONTABILIDADE', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.02', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  
  { code: '2.2.03', name: '2.2.03 - IMPOSTOS E TAXAS', type: 'Saída', nature: 'D', level: 3, parentCode: '2.2', isSystem: true, isEditable: false, canDelete: false, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.03.001', name: '2.2.03.001 - SIMPLES NACIONAL / DAS', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.03', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.03.002', name: '2.2.03.002 - IPTU', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.03', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.03.003', name: '2.2.03.003 - TAXAS E LICENÇAS', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.03', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  
  { code: '2.2.04', name: '2.2.04 - DESPESAS FINANCEIRAS', type: 'Saída', nature: 'D', level: 3, parentCode: '2.2', isSystem: true, isEditable: false, canDelete: false, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.04.001', name: '2.2.04.001 - JUROS PAGOS', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.04', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.04.002', name: '2.2.04.002 - TARIFAS BANCÁRIAS', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.04', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.04.003', name: '2.2.04.003 - TAXAS DE CARTÃO', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.04', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  
  { code: '2.2.05', name: '2.2.05 - DESPESAS COM VEÍCULOS', type: 'Saída', nature: 'D', level: 3, parentCode: '2.2', isSystem: true, isEditable: false, canDelete: false, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.05.001', name: '2.2.05.001 - COMBUSTÍVEL', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.05', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.05.002', name: '2.2.05.002 - MANUTENÇÃO DE VEÍCULOS', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.05', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.05.003', name: '2.2.05.003 - IPVA / LICENCIAMENTO', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.05', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  
  { code: '2.2.06', name: '2.2.06 - OUTRAS DESPESAS', type: 'Saída', nature: 'D', level: 3, parentCode: '2.2', isSystem: true, isEditable: false, canDelete: false, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.06.001', name: '2.2.06.001 - DESPESAS DIVERSAS', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.06', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
  { code: '2.2.06.002', name: '2.2.06.002 - PRÓ-LABORE', type: 'Saída', nature: 'D', level: 4, parentCode: '2.2.06', isSystem: false, isEditable: true, canDelete: true, side: 'DESPESA/CUSTO', accountType: 'DESPESA' },
];

// Calcular sortOrder baseado no código
function calculateSortOrder(code) {
  const parts = code.split('.');
  let sortOrder = 0;
  for (const part of parts) {
    const num = parseInt(part.replace(/\D/g, '') || '0', 10);
    sortOrder = sortOrder * 100 + Math.min(num, 99);
  }
  return sortOrder;
}

async function seedCategories() {
  console.log('🔄 Iniciando seed do Plano de Contas...\n');

  // Step 1: Delete existing categories
  console.log('🗑️  Limpando categorias existentes...');
  const { error: deleteError } = await supabase
    .from('Category')
    .delete()
    .neq('id', 0); // Delete all

  if (deleteError) {
    console.log('   ❌ Erro ao limpar:', deleteError.message);
    return;
  }
  console.log('   ✅ Categorias limpas!');

  // Step 2: Insert new categories
  console.log('\n📥 Inserindo Plano de Contas...');
  
  const payload = CATEGORIES.map(c => ({
    code: c.code,
    name: c.name,
    type: c.type,
    nature: c.nature,
    level: c.level,
    parentCode: c.parentCode,
    isSystem: c.isSystem,
    isEditable: c.isEditable,
    canDelete: c.canDelete,
    side: c.side,
    accountType: c.accountType,
    isActive: true,
    sortOrder: calculateSortOrder(c.code),
    group: c.parentCode,
  }));

  const { data, error: insertError } = await supabase
    .from('Category')
    .insert(payload)
    .select();

  if (insertError) {
    console.log('   ❌ Erro ao inserir:', insertError.message);
    return;
  }

  console.log(`   ✅ ${data.length} categorias inseridas!`);

  // Step 3: Show summary
  console.log('\n========================================');
  console.log('📊 RESUMO DO PLANO DE CONTAS');
  console.log('========================================');
  
  const receitas = data.filter(c => c.code.startsWith('1'));
  const despesas = data.filter(c => c.code.startsWith('2'));
  const analiticas = data.filter(c => c.level === 4);
  
  console.log(`   📈 Receitas: ${receitas.length} categorias`);
  console.log(`   📉 Despesas: ${despesas.length} categorias`);
  console.log(`   📋 Contas Analíticas: ${analiticas.length}`);
  
  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('========================================\n');
}

seedCategories();


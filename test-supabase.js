import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umwhpuladpvcsbuuqury.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtd2hwdWxhZHB2Y3NidXVxdXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTgxMjMsImV4cCI6MjA4MDUzNDEyM30.IINJBtPWEfPGeHEqgxlMjUlqO033vzAOiGjK2uZxqog';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔄 Testando conexão com Supabase...\n');

  // Test 1: List Accounts
  console.log('📋 1. Testando tabela Account...');
  const { data: accounts, error: accError } = await supabase
    .from('Account')
    .select('*')
    .limit(5);
  
  if (accError) {
    console.log('   ❌ Erro:', accError.message);
  } else {
    console.log('   ✅ OK! Encontradas', accounts.length, 'contas');
    if (accounts.length > 0) {
      console.log('   Exemplo:', accounts[0]);
    }
  }

  // Test 2: List Categories
  console.log('\n📋 2. Testando tabela Category...');
  const { data: categories, error: catError } = await supabase
    .from('Category')
    .select('*')
    .limit(5);
  
  if (catError) {
    console.log('   ❌ Erro:', catError.message);
  } else {
    console.log('   ✅ OK! Encontradas', categories.length, 'categorias');
    if (categories.length > 0) {
      console.log('   Exemplo:', categories[0]);
    }
  }

  // Test 3: List Transactions
  console.log('\n📋 3. Testando tabela Transaction...');
  const { data: transactions, error: txError } = await supabase
    .from('Transaction')
    .select('*')
    .limit(5);
  
  if (txError) {
    console.log('   ❌ Erro:', txError.message);
  } else {
    console.log('   ✅ OK! Encontradas', transactions.length, 'transações');
  }

  // Test 4: List Reconciliations
  console.log('\n📋 4. Testando tabela Reconciliation...');
  const { data: reconciliations, error: recError } = await supabase
    .from('Reconciliation')
    .select('*')
    .limit(5);
  
  if (recError) {
    console.log('   ❌ Erro:', recError.message);
  } else {
    console.log('   ✅ OK! Encontradas', reconciliations.length, 'conferências');
  }

  // Test 5: Settings
  console.log('\n📋 5. Testando tabela Settings...');
  const { data: settings, error: setError } = await supabase
    .from('Settings')
    .select('*');
  
  if (setError) {
    console.log('   ❌ Erro:', setError.message);
  } else {
    console.log('   ✅ OK! Configurações:', settings);
  }

  console.log('\n========================================');
  console.log('🎉 Teste de conexão finalizado!');
  console.log('========================================\n');
}

testConnection();


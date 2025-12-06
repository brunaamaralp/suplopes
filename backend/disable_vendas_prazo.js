const { Pool } = require('pg');

async function disableCategory() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:1218@localhost:5432/sup_lopes?schema=public'
  });
  
  try {
    // Desativar a categoria "Vendas a Prazo" (código 1.1.01.002)
    const result = await pool.query(
      'UPDATE "Category" SET "isActive" = false WHERE code = $1 RETURNING id, code, name, "isActive"',
      ['1.1.01.002']
    );
    
    if (result.rowCount > 0) {
      console.log('✅ Categoria desativada com sucesso:');
      console.log(result.rows[0]);
    } else {
      console.log('⚠️ Categoria não encontrada com o código 1.1.01.002');
      
      // Tentar buscar pelo nome
      const searchResult = await pool.query(
        'SELECT id, code, name, "isActive" FROM "Category" WHERE name ILIKE $1',
        ['%vendas a prazo%']
      );
      
      if (searchResult.rows.length > 0) {
        console.log('\nCategorias encontradas com "vendas a prazo" no nome:');
        console.log(searchResult.rows);
        
        // Desativar todas as encontradas
        for (const row of searchResult.rows) {
          await pool.query(
            'UPDATE "Category" SET "isActive" = false WHERE id = $1',
            [row.id]
          );
          console.log(`✅ Desativada: ${row.name}`);
        }
      }
    }
    
  } catch (e) {
    console.log('❌ Erro:', e.message);
  } finally {
    await pool.end();
  }
}

disableCategory();


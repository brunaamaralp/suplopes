const { Pool } = require('pg');

async function fix() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:1218@localhost:5432/sup_lopes?schema=public'
  });
  
  try {
    // Get all categories
    const result = await pool.query('SELECT id, name FROM "Category"');
    
    let updated = 0;
    for (const row of result.rows) {
      // Extract code from name (e.g., "1.1.01.001 - VENDAS À VISTA" -> "1.1.01.001")
      const match = row.name.match(/^([\d.]+)/);
      if (match) {
        const code = match[1];
        await pool.query('UPDATE "Category" SET code = $1 WHERE id = $2', [code, row.id]);
        updated++;
      }
    }
    
    console.log(`Atualizadas ${updated} categorias com o campo code.`);
    
    // Verify
    const sample = await pool.query('SELECT id, code, name FROM "Category" WHERE code IS NOT NULL LIMIT 5');
    console.log('Amostra após correção:', sample.rows);
  } catch (e) {
    console.log('Erro:', e.message);
  } finally {
    await pool.end();
  }
}

fix();


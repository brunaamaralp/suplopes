const { Pool } = require('pg');

async function check() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:1218@localhost:5432/sup_lopes?schema=public'
  });
  
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM "Category"');
    console.log('Categorias no banco:', result.rows[0].count);
    
    if (parseInt(result.rows[0].count) === 0) {
      console.log('Nenhuma categoria encontrada. As categorias precisam ser inseridas.');
    } else {
      const sample = await pool.query('SELECT id, code, name FROM "Category" LIMIT 5');
      console.log('Amostra:', sample.rows);
    }
  } catch (e) {
    console.log('Erro:', e.message);
  } finally {
    await pool.end();
  }
}

check();


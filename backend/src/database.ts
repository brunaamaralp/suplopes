import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuração da conexão usando variáveis de ambiente
export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fincontrol',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Teste de conexão
pool.on('connect', () => {
  console.log('Base de Dados conectada com sucesso!');
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente inativo', err);
  // Cast process to any to fix TS error regarding missing exit method on Process type
  (process as any).exit(-1);
});
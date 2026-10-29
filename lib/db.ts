import { Pool } from '@neondatabase/serverless';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const db = getPool();
  try {
    const result = await db.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

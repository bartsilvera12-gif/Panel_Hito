// Aplica migraciones (supabase/migrations/*.sql en orden) y opcionalmente el seed.
// Uso:  node scripts/apply-db.mjs [--seed]
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const url = process.env.SUPABASE_DB_URL;
if (!url) { console.error('Falta SUPABASE_DB_URL en .env.local'); process.exit(1); }

const runSeed = process.argv.includes('--seed');

const migDir = join(root, 'supabase', 'migrations');
const files = readdirSync(migDir).filter(f => f.endsWith('.sql')).sort();
if (runSeed) files.push('__SEED__');

const client = new pg.Client({ connectionString: url });

const run = async () => {
  await client.connect();
  for (const f of files) {
    const path = f === '__SEED__' ? join(root, 'supabase', 'seed.sql') : join(migDir, f);
    const label = f === '__SEED__' ? 'seed.sql' : f;
    const sql = readFileSync(path, 'utf8');
    process.stdout.write(`→ ${label} ... `);
    try {
      await client.query(sql);
      console.log('OK');
    } catch (e) {
      console.log('ERROR');
      console.error(`   ${e.message}`);
      throw e;
    }
  }
  await client.end();
  console.log('\n✔ Base actualizada.');
};

run().catch(e => { console.error('\n�‑ Falló:', e.message); process.exit(1); });

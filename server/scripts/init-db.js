require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const name = process.env.DB_NAME || 'reverse';
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${name}\``);
  await conn.query(fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8'));
  // Add columns introduced after the first version (safe to run many times)
  async function ensureColumn(table, column, ddl) {
    const [r] = await conn.query(
      'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?', [name, table, column]);
    if (!r.length) { await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN ${column} ${ddl}`); console.log(`Added ${table}.${column}`); }
  }
  await ensureColumn('users', 'is_admin', 'TINYINT(1) NOT NULL DEFAULT 0');
  await ensureColumn('companies', 'suspended', 'TINYINT(1) NOT NULL DEFAULT 0');
  console.log(`Database "${name}" is ready.`);
  await conn.end();
})().catch(e => { console.error(e.message); process.exit(1); });

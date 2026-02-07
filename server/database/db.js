import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'thisisrober.db');

let db;
let SQL;

// Initialize sql.js WASM and open/create the database
async function init() {
  if (db) return db;
  SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA foreign_keys = ON');
  return db;
}

// Save database to disk
export function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// Get the database instance (must call init() first at server startup)
export function getDB() {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
}

// Initialize database: load WASM, open DB, run schema
export async function initDB() {
  await init();
  const schema = fs.readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.run(schema);
  saveDB();
  return db;
}

// ---- Helpers wrapping sql.js into a better-sqlite3-like API ----

// Run a query that returns rows (SELECT). Returns array of objects.
export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Run a query that returns a single row. Returns object or undefined.
export function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0];
}

// Run a query that modifies data (INSERT/UPDATE/DELETE).
// Returns { changes, lastInsertRowid }.
export function run(sql, params = []) {
  db.run(sql, params);
  const changes = db.getRowsModified();
  const info = db.exec('SELECT last_insert_rowid() as id');
  const lastInsertRowid = info.length > 0 ? info[0].values[0][0] : 0;
  saveDB();
  return { changes, lastInsertRowid };
}

// Execute raw SQL (for schema creation, multiple statements)
export function exec(sql) {
  db.exec(sql);
  saveDB();
}

export default getDB;

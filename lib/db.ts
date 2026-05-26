import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export type Collection = 'uploads' | 'vouchers' | 'stockItems' | 'ledgerEntries' | 'taxRecords' | 'auditLog';

export interface DB {
  uploads: Record<string, unknown>[];
  vouchers: Record<string, unknown>[];
  stockItems: Record<string, unknown>[];
  ledgerEntries: Record<string, unknown>[];
  taxRecords: Record<string, unknown>[];
  auditLog: Record<string, unknown>[];
  _meta: Record<string, number>;
}

export function readDB(): DB {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as DB;
}

export function writeDB(db: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

export function nextId(db: DB, seqKey: string): string {
  db._meta[seqKey] = (db._meta[seqKey] ?? 0) + 1;
  return String(db._meta[seqKey]);
}

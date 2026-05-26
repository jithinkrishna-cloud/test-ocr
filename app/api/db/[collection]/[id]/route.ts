import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, Collection } from '@/lib/db';

const VALID: Collection[] = ['uploads', 'vouchers', 'stockItems', 'ledgerEntries', 'taxRecords', 'auditLog'];

function isValid(col: string): col is Collection {
  return VALID.includes(col as Collection);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await params;
  if (!isValid(collection)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const db = readDB();
  const item = (db[collection] as Record<string, unknown>[]).find(i => String(i.id) === id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await params;
  if (!isValid(collection)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const db = readDB();
  const body = await req.json() as Record<string, unknown>;
  const arr = db[collection] as Record<string, unknown>[];
  const idx = arr.findIndex(i => String(i.id) === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  arr[idx] = { ...arr[idx], ...body, id };
  writeDB(db);
  return NextResponse.json(arr[idx]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await params;
  if (!isValid(collection)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const db = readDB();
  const arr = db[collection] as Record<string, unknown>[];
  const idx = arr.findIndex(i => String(i.id) === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [deleted] = arr.splice(idx, 1);
  writeDB(db);
  return NextResponse.json(deleted);
}

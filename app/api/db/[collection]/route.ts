import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, nextId, Collection } from '@/lib/db';

const SEQ_KEYS: Record<string, string> = {
  uploads: 'lastUploadSeq',
  vouchers: 'lastVoucherSeq',
  stockItems: 'lastStockSeq',
  ledgerEntries: 'lastLedgerSeq',
  taxRecords: 'lastTaxSeq',
  auditLog: 'lastAuditSeq',
};

const VALID: Collection[] = ['uploads', 'vouchers', 'stockItems', 'ledgerEntries', 'taxRecords', 'auditLog'];

function isValid(col: string): col is Collection {
  return VALID.includes(col as Collection);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;
  if (!isValid(collection)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const db = readDB();
  const { searchParams } = new URL(req.url);

  let data = db[collection] as Record<string, unknown>[];

  // Filter by any query param (e.g. ?uploadId=1 or ?voucherNo=VCH-2024-001)
  for (const [key, value] of searchParams.entries()) {
    data = data.filter(item => String(item[key]) === value);
  }

  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;
  if (!isValid(collection)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const db = readDB();
  const body = await req.json() as Record<string, unknown>;

  const seqKey = SEQ_KEYS[collection];
  const id = body.id ? String(body.id) : nextId(db, seqKey);
  const item = { ...body, id };

  (db[collection] as Record<string, unknown>[]).push(item);
  writeDB(db);

  return NextResponse.json(item, { status: 201 });
}

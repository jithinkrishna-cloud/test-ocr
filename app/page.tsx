'use client';

import React, { useState } from 'react';
import {
  ChevronRight, Upload, FileText, Zap, CheckCircle, AlertCircle, Eye, Download,
  Plus, Filter, Clock, TrendingUp, Home, Settings, LogOut, Bell, User, Menu,
  Send, Copy, FileUp, AlertTriangle, CheckCheck, DollarSign, Package,
  Layers, FileCheck, Loader,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ==================== TYPES ====================
type ScreenType = 'home' | 'upload' | 'processing' | 'preview' | 'stock' | 'ledger' | 'tax' | 'approval' | 'final-review' | 'success';

interface VoucherData {
  voucherNo: string; invoiceNo: string; date: string; party: string;
  amount: number; cgst: number; sgst: number; igst: number; totalAmount: number;
}
interface StockItem {
  id: string; name: string; sku: string; hsn: string; qty: string;
  unit: string; rate: string; tax: string; amount: string; confidence: number;
}
interface LedgerEntry {
  account: string; debit: string; credit: string; group: string; confidence: number;
}
interface ProcessingStage {
  name: string; status: 'pending' | 'processing' | 'complete'; timestamp?: string;
}
interface UploadHistory {
  id: string; fileName: string; uploadDate: string; invoiceNo: string;
  amount: number; status: 'pending' | 'processed' | 'posted'; voucherNo?: string;
}

// ==================== DATA ====================
const dummyVoucherData: VoucherData = {
  voucherNo: 'VCH-2024-001', invoiceNo: 'INV-2024-5482', date: '2024-05-15',
  party: 'ABC Manufacturing Ltd.', amount: 45000, cgst: 4050, sgst: 4050,
  igst: 0, totalAmount: 53100,
};

const dummyStockItems: StockItem[] = [
  { id: '1', name: 'Industrial Motor 5HP', sku: 'MTR-001', hsn: '8501.40', qty: '2', unit: 'Pcs', rate: '12500', tax: '18%', amount: '25000', confidence: 95 },
  { id: '2', name: 'Control Panel Assembly', sku: 'CPL-045', hsn: '8535.30', qty: '1', unit: 'Pcs', rate: '8500', tax: '18%', amount: '8500', confidence: 88 },
  { id: '3', name: 'Copper Wire Coil', sku: 'CWC-102', hsn: '7408.11', qty: '5', unit: 'Kg', rate: '450', tax: '5%', amount: '2250', confidence: 92 },
];

const dummyLedgerEntries: LedgerEntry[] = [
  { account: 'Purchases A/c', debit: '45000', credit: '0', group: 'Purchases', confidence: 98 },
  { account: 'CGST Input Credit', debit: '4050', credit: '0', group: 'Tax', confidence: 92 },
  { account: 'SGST Input Credit', debit: '4050', credit: '0', group: 'Tax', confidence: 92 },
  { account: 'Creditors A/c', debit: '0', credit: '53100', group: 'Sundry Creditors', confidence: 95 },
];

const processingStages: ProcessingStage[] = [
  { name: 'Document Analysis', status: 'complete', timestamp: '10:15:32' },
  { name: 'Text Extraction', status: 'complete', timestamp: '10:16:08' },
  { name: 'Data Validation', status: 'complete', timestamp: '10:17:01' },
  { name: 'Field Recognition', status: 'complete', timestamp: '10:18:44' },
  { name: 'Tax Calculation', status: 'processing', timestamp: '10:19:20' },
  { name: 'Account Mapping', status: 'pending' },
  { name: 'Risk Assessment', status: 'pending' },
  { name: 'Quality Check', status: 'pending' },
];

const voucherTypes = [
  { id: 'sales', name: 'Sales', icon: TrendingUp, desc: 'Sales invoice', recommended: false },
  { id: 'purchase', name: 'Purchase', icon: Package, desc: 'Purchase invoice', recommended: true },
  { id: 'receipt', name: 'Receipt', icon: DollarSign, desc: 'Cash/Check receipt', recommended: false },
  { id: 'payment', name: 'Payment', icon: Send, desc: 'Payment voucher', recommended: false },
  { id: 'journal', name: 'Journal', icon: FileText, desc: 'Journal entry', recommended: false },
  { id: 'contra', name: 'Contra', icon: ChevronRight, desc: 'Bank transfer', recommended: false },
  { id: 'debit-note', name: 'Debit Note', icon: AlertTriangle, desc: 'Debit note', recommended: false },
];

// ==================== SHARED COMPONENTS ====================
const ConfidenceDot = ({ confidence }: { confidence: number }) => (
  <span className={`flex items-center gap-1.5 text-xs font-mono font-medium ${
    confidence >= 90 ? 'text-emerald-400' : confidence >= 75 ? 'text-accent' : 'text-destructive'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
      confidence >= 90 ? 'bg-emerald-400' : confidence >= 75 ? 'bg-accent' : 'bg-destructive'
    }`} />
    {confidence}%
  </span>
);

const StatusPill = ({ status }: { status: 'pending' | 'processed' | 'posted' }) => {
  const map = {
    posted: { color: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Posted' },
    processed: { color: 'text-primary', dot: 'bg-primary', label: 'Processed' },
    pending: { color: 'text-accent', dot: 'bg-accent', label: 'Pending' },
  };
  const s = map[status];
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
};

const SectionHeader = ({ label, sub }: { label: string; sub?: string }) => (
  <div className="mb-6">
    <h2 className="font-display text-xl font-bold uppercase tracking-[0.18em] text-foreground">{label}</h2>
    {sub && <p className="text-xs text-muted-foreground mt-1 tracking-wide">{sub}</p>}
  </div>
);

// ==================== SIDEBAR ====================
const Sidebar = ({ currentScreen, onNavigate, isMobile, isOpen, onClose }: {
  currentScreen: ScreenType; onNavigate: (s: ScreenType) => void;
  isMobile: boolean; isOpen: boolean; onClose: () => void;
}) => {
  const menuItems = [
    { id: 'home' as ScreenType, label: 'Dashboard', icon: Home },
    { id: 'upload' as ScreenType, label: 'New Upload', icon: FileUp },
    { id: 'preview' as ScreenType, label: 'Preview & Edit', icon: Eye },
    { id: 'stock' as ScreenType, label: 'Stock Mapping', icon: Package },
    { id: 'ledger' as ScreenType, label: 'Ledger', icon: Layers },
    { id: 'tax' as ScreenType, label: 'Tax', icon: DollarSign },
    { id: 'approval' as ScreenType, label: 'Approval', icon: CheckCheck },
    { id: 'final-review' as ScreenType, label: 'Final Review', icon: FileCheck },
  ];

  return (
    <div className={`${isMobile ? 'fixed inset-0 z-50 flex' : 'h-full'}`}>
      {isMobile && isOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      )}
      <div className={`w-56 h-full bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden transition-all duration-300 ${
        isMobile ? 'relative z-51' : ''
      } ${isMobile && !isOpen ? 'hidden' : ''}`}>

        {/* Logo */}
        <div className="relative p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-primary/50 bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-[13px] font-bold tracking-[0.28em] uppercase text-sidebar-foreground leading-none">
                ERP OCR
              </h1>
              <p className="text-[9px] tracking-[0.32em] uppercase text-muted-foreground mt-1">
                Accounting System
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 py-3 overflow-y-auto">
          {menuItems.map(item => {
            const active = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); if (isMobile) onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-all relative border-l-2 ${
                  active
                    ? 'border-l-primary bg-primary/10 text-primary'
                    : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="tracking-wide">{item.label}</span>
                {active && <span className="absolute right-3 w-1 h-1 rounded-full bg-primary" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative border-t border-sidebar-border py-2">
          {[
            { icon: Settings, label: 'Settings' },
            { icon: LogOut, label: 'Logout' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-muted-foreground hover:text-foreground border-l-2 border-l-transparent hover:bg-sidebar-accent/60 transition-all tracking-wide">
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== TOP NAV ====================
const TopNavbar = ({ onMenuClick, isMobile }: { onMenuClick: () => void; isMobile: boolean }) => (
  <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border h-13 flex items-center px-5 gap-4">
    {isMobile && (
      <button onClick={onMenuClick} className="p-1.5 hover:bg-muted rounded transition-colors">
        <Menu className="w-5 h-5 text-foreground" />
      </button>
    )}

    <div className="flex-1 flex items-center gap-2 text-[11px] tracking-wide min-w-0">
      <span className="text-muted-foreground uppercase tracking-[0.18em]">Accounting</span>
      <span className="text-border">/</span>
      <span className="text-foreground font-medium truncate">OCR Voucher Processing</span>
    </div>

    <div className="flex items-center gap-1">
      <div className="flex items-center gap-2 px-3 py-1.5 mr-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[9px] text-emerald-400 uppercase tracking-[0.22em] font-display font-semibold hidden sm:block">Live</span>
      </div>
      <button className="p-2 hover:bg-muted rounded transition-colors relative">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
      </button>
      <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded transition-colors">
        <div className="w-6 h-6 bg-primary/15 border border-primary/40 flex items-center justify-center">
          <User className="w-3 h-3 text-primary" />
        </div>
        <span className="text-xs font-medium text-foreground hidden sm:inline tracking-wide">Admin</span>
      </button>
    </div>
  </header>
);

// ==================== HOME ====================
const HomeScreen = ({
  onNavigate, uploadHistory, addedLedgerEntries,
}: {
  onNavigate: (s: ScreenType) => void;
  uploadHistory: UploadHistory[];
  addedLedgerEntries: Array<{ id: string; account: string; debit: string; credit: string; voucherNo: string; date: string }>;
}) => (
  <div className="space-y-6">
    {/* Stat cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: "Today's Vouchers", value: '24', icon: FileText, topColor: 'bg-primary', sub: 'Total processed' },
        { label: 'Processed', value: '18', icon: CheckCircle, topColor: 'bg-emerald-400', sub: 'Completed' },
        { label: 'Pending Review', value: '5', icon: Clock, topColor: 'bg-accent', sub: 'Awaiting action' },
        { label: 'Issues', value: '1', icon: AlertCircle, topColor: 'bg-destructive', sub: 'Needs attention' },
      ].map(({ label, value, icon: Icon, topColor, sub }) => (
        <Card key={label} className="p-5 relative overflow-hidden border border-border hover:border-border/80 transition-colors group bg-card">
          <div className={`absolute top-0 left-0 right-0 h-[2px] ${topColor}`} />
          <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-display font-semibold mb-3">{label}</p>
          <p className="font-mono text-3xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-[10px] text-muted-foreground mt-1 tracking-wide">{sub}</p>
          <Icon className="absolute bottom-3 right-3 w-10 h-10 text-foreground/5 group-hover:text-foreground/8 transition-colors" />
        </Card>
      ))}
    </div>

    {/* Quick actions */}
    <Card className="p-5 bg-card border border-border">
      <p className="text-[10px] font-display font-bold uppercase tracking-[0.22em] text-muted-foreground mb-4">Quick Actions</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('upload')}
          className="flex items-center gap-4 p-4 bg-primary/10 border border-primary/30 hover:bg-primary/15 hover:border-primary/50 transition-all rounded group"
        >
          <div className="w-9 h-9 bg-primary/20 border border-primary/50 flex items-center justify-center flex-shrink-0">
            <Upload className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Upload New Document</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">OCR extract invoice data</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </button>
        <button
          onClick={() => onNavigate('approval')}
          className="flex items-center gap-4 p-4 bg-accent/10 border border-accent/30 hover:bg-accent/15 hover:border-accent/50 transition-all rounded group"
        >
          <div className="w-9 h-9 bg-accent/20 border border-accent/50 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-accent" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Pending Approvals</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">5 vouchers awaiting review</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
        </button>
      </div>
    </Card>

    {/* Tables */}
    <Tabs defaultValue="history" className="w-full">
      <TabsList className="h-9 bg-muted/50 border border-border p-0.5 rounded">
        <TabsTrigger value="history" className="text-xs font-display font-semibold uppercase tracking-[0.15em] px-4">Upload History</TabsTrigger>
        <TabsTrigger value="ledger" className="text-xs font-display font-semibold uppercase tracking-[0.15em] px-4">Ledger Entries</TabsTrigger>
      </TabsList>

      <TabsContent value="history" className="mt-3">
        <Card className="border border-border overflow-hidden bg-card">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-muted-foreground">Recent Document Uploads</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  {['File Name', 'Invoice No.', 'Amount', 'Upload Date', 'Status', 'Voucher No.'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[9px] font-display font-bold uppercase tracking-[0.2em] text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uploadHistory.map((item, i) => (
                  <tr key={item.id} className={`border-b border-border/40 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-4 py-3 text-foreground font-medium text-xs">{item.fileName}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{item.invoiceNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-accent">₹{item.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-[10px]">{item.uploadDate}</td>
                    <td className="px-4 py-3"><StatusPill status={item.status} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{item.voucherNo || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="ledger" className="mt-3">
        <Card className="border border-border overflow-hidden bg-card">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-muted-foreground">Posted Ledger Entries</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  {['Account', 'Debit', 'Credit', 'Voucher No.', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[9px] font-display font-bold uppercase tracking-[0.2em] text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {addedLedgerEntries.map((entry, i) => (
                  <tr key={entry.id} className={`border-b border-border/40 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-4 py-3 text-foreground font-medium text-xs">{entry.account}</td>
                    <td className="px-4 py-3 font-mono text-xs text-accent">{entry.debit !== '0' ? `₹${parseFloat(entry.debit).toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-accent">{entry.credit !== '0' ? `₹${parseFloat(entry.credit).toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{entry.voucherNo}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

// ==================== UPLOAD ====================
const UploadScreen = ({ onNavigate, selectedSample, onSelectSample }: {
  onNavigate: (s: ScreenType) => void; selectedSample: string | null; onSelectSample: (s: string) => void;
}) => {
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);

  const canProceed = selectedSample && selectedVoucher;

  return (
  <div className="max-w-2xl mx-auto space-y-5">
    <SectionHeader label="Upload Document" sub="Drag and drop or select a file to begin OCR extraction" />

    {/* Step 1 — Drop zone */}
    <Card className="border-2 border-dashed border-border hover:border-primary/40 transition-colors bg-transparent">
      <div className="p-10 text-center space-y-4">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 border border-primary/25 rotate-45 scale-90" />
          <div className="relative h-full flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div>
          <p className="font-display font-bold uppercase tracking-[0.2em] text-sm text-foreground">Drop Invoice Here</p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse · PDF · PNG · JPG · max 50 MB</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/85 font-display uppercase tracking-[0.15em] text-xs h-9">
          Browse Files
        </Button>
      </div>
    </Card>

    {/* Step 2 — Sample documents */}
    <Card className="p-5 border border-border bg-card">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
        <p className="text-xs font-semibold text-foreground">Select a Document</p>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { key: 'sample-pdf.txt', fmt: 'PDF', file: 'sample-invoice.pdf', color: 'border-primary/40 hover:border-primary text-primary bg-primary/5 hover:bg-primary/10' },
          { key: 'sample-png.png', fmt: 'PNG', file: 'sample-invoice.png', color: 'border-emerald-400/40 hover:border-emerald-400 text-emerald-400 bg-emerald-400/5 hover:bg-emerald-400/10' },
          { key: 'sample-jpg.jpg', fmt: 'JPG', file: 'sample-invoice.jpg', color: 'border-accent/40 hover:border-accent text-accent bg-accent/5 hover:bg-accent/10' },
        ].map(({ key, fmt, file, color }) => (
          <button
            key={key}
            onClick={() => onSelectSample(key)}
            className={`p-3 border-2 transition-all rounded text-left ${
              selectedSample === key ? color.replace('hover:', '') : color
            }`}
          >
            <FileText className="w-4 h-4 mb-2" />
            <p className="text-[11px] font-display font-bold uppercase tracking-wider">{fmt} Format</p>
            <p className="text-[9px] font-mono text-muted-foreground mt-0.5 truncate">{file}</p>
          </button>
        ))}
      </div>
      {selectedSample && (
        <div className="mt-3 p-2.5 bg-emerald-400/10 border border-emerald-400/30 rounded flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-mono text-emerald-400">Selected: {selectedSample}</span>
        </div>
      )}
    </Card>

    {/* Step 3 — Voucher type (shown once file selected) */}
    {selectedSample && (
      <Card className="p-5 border border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>
          <p className="text-xs font-semibold text-foreground">Select Voucher Type</p>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-primary font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            AI suggests: Purchase (89%)
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {voucherTypes.map(vtype => (
            <button
              key={vtype.id}
              onClick={() => setSelectedVoucher(vtype.id)}
              className={`p-4 border-2 transition-all rounded text-left group relative ${
                selectedVoucher === vtype.id
                  ? 'border-primary bg-primary/8'
                  : vtype.recommended
                  ? 'border-accent/50 bg-accent/5 hover:border-accent'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              {vtype.recommended && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-accent text-accent-foreground text-[8px] font-display font-bold uppercase tracking-widest rounded-bl">
                  AI Pick
                </div>
              )}
              {selectedVoucher === vtype.id && (
                <CheckCircle className="absolute top-2 right-2 w-3.5 h-3.5 text-primary" />
              )}
              <vtype.icon className={`w-5 h-5 mb-2.5 ${selectedVoucher === vtype.id ? 'text-primary' : vtype.recommended ? 'text-accent' : 'text-muted-foreground group-hover:text-primary'} transition-colors`} />
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">{vtype.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{vtype.desc}</p>
            </button>
          ))}
        </div>
      </Card>
    )}

    {/* Step 4 — Proceed button */}
    {selectedSample && (
      <div className="flex items-center gap-3 pt-1">
        <Button
          onClick={() => onNavigate('processing')}
          disabled={!canProceed}
          className={`flex-1 h-11 text-sm font-display uppercase tracking-[0.18em] transition-all ${
            canProceed
              ? 'bg-primary text-primary-foreground hover:bg-primary/85'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {canProceed ? (
            <>Start Processing <ChevronRight className="w-4 h-4 ml-2" /></>
          ) : (
            'Select a voucher type to continue'
          )}
        </Button>
      </div>
    )}

    {/* Requirements */}
    <Card className="p-5 border border-border bg-card">
      <p className="text-[10px] font-display font-bold uppercase tracking-[0.22em] text-muted-foreground mb-3">Document Requirements</p>
      <div className="space-y-2">
        {[
          'Clear image with good lighting',
          'Document should be straight and not skewed',
          'All text must be clearly visible and legible',
        ].map(req => (
          <div key={req} className="flex items-center gap-2.5">
            <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
            <span className="text-xs text-muted-foreground">{req}</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
  );
};

// ==================== PROCESSING ====================
const ProcessingScreen = ({ onNavigate }: { onNavigate: (s: ScreenType) => void }) => {
  const completed = processingStages.filter(s => s.status === 'complete').length;
  const total = processingStages.length;
  const progressPct = Math.round((completed / total) * 100);
  const currentStage = processingStages.find(s => s.status === 'processing');

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.18em] text-foreground">Processing Document</h2>
        <p className="text-sm text-muted-foreground">AI is analysing and extracting data from your invoice</p>
      </div>

      {/* Progress overview card */}
      <Card className="border border-border bg-card overflow-hidden">
        <div className="p-6 flex items-center gap-6">
          {/* Circular progress */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="currentColor" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPct / 100)}`}
                className="text-primary transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold font-mono text-foreground">{progressPct}%</span>
            </div>
          </div>

          {/* Status text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {currentStage ? currentStage.name : 'Finalizing…'}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-mono">{completed}<span className="text-base text-muted-foreground font-normal"> / {total} stages</span></p>
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* ETA */}
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Est. time</p>
            <p className="text-2xl font-bold font-mono text-foreground">2<span className="text-sm font-normal text-muted-foreground">s</span></p>
          </div>
        </div>
      </Card>

      {/* Stage list */}
      <Card className="border border-border bg-card divide-y divide-border overflow-hidden">
        {processingStages.map((stage, idx) => (
          <div key={idx} className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
            stage.status === 'processing' ? 'bg-primary/5' :
            stage.status === 'complete' ? '' : 'opacity-50'
          }`}>
            {/* Icon */}
            <div className="flex-shrink-0">
              {stage.status === 'complete' ? (
                <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-accent" />
                </div>
              ) : stage.status === 'processing' ? (
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center">
                  <Loader className="w-4 h-4 text-primary animate-spin" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
                  <span className="text-xs font-mono text-muted-foreground">{idx + 1}</span>
                </div>
              )}
            </div>

            {/* Name + bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className={`text-sm font-medium ${
                  stage.status === 'complete' ? 'text-foreground' :
                  stage.status === 'processing' ? 'text-primary' :
                  'text-muted-foreground'
                }`}>{stage.name}</p>
                {stage.status === 'complete' && stage.timestamp && (
                  <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{stage.timestamp}</span>
                )}
                {stage.status === 'processing' && (
                  <span className="text-[10px] font-medium text-primary animate-pulse flex-shrink-0">Running…</span>
                )}
              </div>
              {/* Per-row progress bar */}
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${
                  stage.status === 'complete' ? 'w-full bg-accent' :
                  stage.status === 'processing' ? 'w-3/5 bg-primary animate-pulse' :
                  'w-0'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* CTA */}
      <div className="flex justify-center">
        <Button
          onClick={() => onNavigate('preview')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-display uppercase tracking-[0.18em] text-xs h-10 px-10"
        >
          Continue to Preview
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

    </div>
  );
};

// ==================== PREVIEW ====================
const PreviewScreen = ({ onNavigate }: { onNavigate: (s: ScreenType) => void }) => {
  const [editedData, setEditedData] = useState<VoucherData>(dummyVoucherData);
  const [voucherType, setVoucherType] = useState('purchase');
  const [reviewNote, setReviewNote] = useState('ABC Manufacturing Ltd. - Purchase Invoice');

  const ledgerEntries = [
    { ledger: 'Purchases A/c', debit: '45000', credit: '' },
    { ledger: 'CGST Input Credit', debit: '4050', credit: '' },
    { ledger: 'SGST Input Credit', debit: '4050', credit: '' },
    { ledger: 'ABC Manufacturing Ltd.', debit: '', credit: '53100' },
  ];
  const totalDebit = ledgerEntries.reduce((s, e) => s + (parseFloat(e.debit) || 0), 0);
  const totalCredit = ledgerEntries.reduce((s, e) => s + (parseFloat(e.credit) || 0), 0);
  const balanced = totalDebit === totalCredit;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('upload')} className="p-1.5 hover:bg-muted rounded transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground rotate-180" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">invoice-2024-001.pdf</span>
              <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded font-display uppercase tracking-wider">Invoice</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Review and approve extracted data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-8 text-xs border-destructive/50 text-destructive hover:bg-destructive/10 font-display uppercase tracking-[0.12em]">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
          </Button>
          <Button onClick={() => onNavigate('stock')} className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/85 font-display uppercase tracking-[0.12em]">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve as Invoice
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* ── Col 1: Original Document ── */}
        <div className="w-[280px] flex-shrink-0 border-r border-border flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2 flex-shrink-0">
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Original Document</span>
          </div>
          <div className="flex-1 min-h-0 bg-[#3c3c3c] overflow-y-auto flex flex-col items-center justify-start pt-4 pb-4 px-4">
            <div className="bg-white shadow-xl w-full p-5 space-y-3">
              <div className="border-b border-gray-200 pb-3">
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">ABC Manufacturing Ltd.</p>
                <p className="text-xl font-bold text-gray-900 mt-1">INVOICE</p>
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  ['Invoice No', 'INV-2024-5482'],
                  ['Date', '15-05-2024'],
                  ['GSTIN', '27AAJCA1234B1Z5'],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-gray-500">{l}:</span>
                    <span className="text-gray-800 font-medium text-right">{v}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-2 space-y-1 text-[11px]">
                {[
                  ['Industrial Motor 5HP', '2', '₹25,000'],
                  ['Control Panel Assembly', '1', '₹8,500'],
                  ['Copper Wire Coil', '5 Kg', '₹2,250'],
                ].map(([name, qty, amt]) => (
                  <div key={name} className="flex justify-between gap-1">
                    <span className="text-gray-600 truncate flex-1">{name}</span>
                    <span className="text-gray-500 text-center w-8">{qty}</span>
                    <span className="text-gray-800 font-medium text-right">{amt}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-2 space-y-1 text-xs">
                {[['Subtotal', '₹35,750'], ['CGST (9%)', '₹4,050'], ['SGST (9%)', '₹4,050']].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-gray-500">
                    <span>{l}</span><span>{v}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-orange-600">₹53,100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Col 2: Extracted Data ── */}
        <div className="w-[360px] flex-shrink-0 border-r border-border flex flex-col overflow-hidden bg-background">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Extracted Data</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
              <CheckCircle className="w-3 h-3" /> OCR Verified
            </span>
          </div>

          {/* Scrollable form */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-4 py-4 space-y-5">

              {/* Document Info */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Document Info</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">Party / Vendor Name</label>
                    <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">95%</span>
                  </div>
                  <Input value={editedData.party} onChange={e => setEditedData({ ...editedData, party: e.target.value })} className="h-8 text-xs bg-card border-border hover:border-primary/50 focus:border-primary transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">Invoice Number</label>
                    <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">98%</span>
                  </div>
                  <Input value={editedData.invoiceNo} onChange={e => setEditedData({ ...editedData, invoiceNo: e.target.value })} className="h-8 text-xs bg-card border-border font-mono hover:border-primary/50 focus:border-primary transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground">Invoice Date</label>
                      <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">99%</span>
                    </div>
                    <Input value={editedData.date} onChange={e => setEditedData({ ...editedData, date: e.target.value })} type="date" className="h-8 text-xs bg-card border-border font-mono hover:border-primary/50 focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Currency</label>
                    <Input defaultValue="INR" className="h-8 text-xs bg-card border-border font-mono hover:border-primary/50 focus:border-primary transition-colors" />
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Amount Breakdown */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Amount Breakdown</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">Net Amount</label>
                    <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">92%</span>
                  </div>
                  <Input value={editedData.amount} onChange={e => setEditedData({ ...editedData, amount: parseFloat(e.target.value) || 0 })} type="number" className="h-8 text-xs bg-card border-border font-mono hover:border-primary/50 focus:border-primary transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Tax Amount</label>
                    <div className="h-8 flex items-center px-3 rounded-md border border-border bg-muted/30 text-xs font-mono text-muted-foreground">
                      ₹{(editedData.cgst + editedData.sgst).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Total Amount</label>
                    <div className="h-8 flex items-center px-3 rounded-md border border-primary/40 bg-primary/5 text-xs font-mono font-bold text-primary">
                      ₹{editedData.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'CGST (9%)', value: `₹${editedData.cgst.toLocaleString()}` },
                    { label: 'SGST (9%)', value: `₹${editedData.sgst.toLocaleString()}` },
                    { label: 'IGST', value: '₹0' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col items-center py-2 px-2 rounded-md border border-border bg-muted/20 gap-0.5">
                      <span className="text-[9px] text-muted-foreground text-center">{label}</span>
                      <span className="text-xs font-mono font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Line Items */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Line Items</p>
                <div className="rounded-md border border-border overflow-hidden">
                  <div className="grid bg-muted/50 border-b border-border" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                    {['Description', 'Qty', 'Amount'].map(h => (
                      <div key={h} className="px-2 py-2">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</span>
                      </div>
                    ))}
                  </div>
                  {dummyStockItems.map((item, i) => (
                    <div key={item.id} className={`grid border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? 'bg-muted/10' : ''}`} style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                      <div className="px-2 py-2.5">
                        <span className="text-xs font-medium text-foreground block truncate">{item.name}</span>
                        <span className="text-[9px] text-muted-foreground">HSN: {item.hsn}</span>
                      </div>
                      <div className="px-2 py-2.5 flex items-center">
                        <span className="text-xs font-mono text-muted-foreground">{item.qty} {item.unit}</span>
                      </div>
                      <div className="px-2 py-2.5 flex items-center">
                        <span className="text-xs font-mono font-semibold text-accent">₹{parseInt(item.amount).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  <div className="grid bg-muted/30 border-t border-border" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                    <div className="px-2 py-2 col-span-2">
                      <span className="text-xs font-semibold text-foreground">Subtotal</span>
                    </div>
                    <div className="px-2 py-2 flex items-center">
                      <span className="text-xs font-mono font-bold text-accent">₹{dummyStockItems.reduce((s, i) => s + parseInt(i.amount), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Col 3: AI Classification + Ledger + Notes ── */}
        <div className="flex-1 overflow-y-auto bg-background border-l border-border">
          <div className="p-4 space-y-4">

            {/* AI Classification card */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              {/* Card header */}
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">AI Classification</span>
                </div>
                <span className="text-sm font-mono font-semibold text-emerald-500">98% confidence</span>
              </div>
              {/* Progress bar */}
              <div className="h-1 bg-muted">
                <div className="h-full bg-emerald-500 rounded-r-full transition-all" style={{ width: '98%' }} />
              </div>
              <div className="px-5 py-4 space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Extracted invoice data from PDF; identified party, amounts, GST components and line items. Categorised as a <span className="text-foreground font-medium">Purchase Invoice</span>.
                </p>

                {/* Voucher Type */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Voucher Type</label>
                  <Select value={voucherType} onValueChange={setVoucherType}>
                    <SelectTrigger className="h-9 text-sm bg-background border-border hover:border-primary/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      {[['purchase', 'Purchase'], ['sales', 'Sales'], ['receipt', 'Receipt'], ['payment', 'Payment'], ['journal', 'Journal']].map(([v, l]) => (
                        <SelectItem key={v} value={v} className="text-sm">{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ledger Entries */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Ledger Entries (Double Entry)</label>
                  <div className="rounded-md border border-border overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-3 bg-muted/50 border-b border-border">
                      {[
                        { label: 'Ledger Account', wide: true },
                        { label: 'Debit (₹)' },
                        { label: 'Credit (₹)' },
                      ].map(({ label }) => (
                        <div key={label} className="px-4 py-2.5">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
                        </div>
                      ))}
                    </div>
                    {/* Rows */}
                    {ledgerEntries.map((entry, i) => (
                      <div key={i} className="grid grid-cols-3 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                        <div className="px-4 py-3 flex items-center">
                          <span className="text-sm text-foreground">{entry.ledger}</span>
                        </div>
                        <div className="px-4 py-3 flex items-center">
                          <span className={`text-sm font-mono ${entry.debit ? 'text-foreground font-medium' : 'text-muted-foreground/30'}`}>
                            {entry.debit || '—'}
                          </span>
                        </div>
                        <div className="px-4 py-3 flex items-center">
                          <span className={`text-sm font-mono ${entry.credit ? 'text-foreground font-medium' : 'text-muted-foreground/30'}`}>
                            {entry.credit || '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {/* Total row */}
                    <div className="grid grid-cols-3 bg-muted/30 border-t border-border">
                      <div className="px-4 py-3">
                        <span className="text-sm font-semibold text-foreground">Total</span>
                      </div>
                      <div className="px-4 py-3">
                        <span className="text-sm font-mono font-semibold text-foreground">₹{totalDebit.toLocaleString()}</span>
                      </div>
                      <div className="px-4 py-3">
                        <span className="text-sm font-mono font-semibold text-foreground">₹{totalCredit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {/* Balanced indicator */}
                  {balanced && (
                    <div className="flex items-center gap-2 pt-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs text-emerald-500 font-medium">Entries are balanced</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Review Notes card */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Review Notes</span>
              </div>
              <div className="p-5">
                <textarea
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  rows={4}
                  className="w-full text-sm bg-background border border-border rounded-md px-3 py-2.5 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground leading-relaxed"
                  placeholder="Add review notes..."
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== STOCK ====================
const StockScreen = ({ onNavigate }: { onNavigate: (s: ScreenType) => void }) => {
  const [items, setItems] = useState(dummyStockItems);

  const totalAmount = items.reduce((s, i) => s + parseFloat(i.amount), 0);
  const totalTax = items.reduce((s, i) => s + (parseFloat(i.amount) * (parseFloat(i.tax) / 100)), 0);

  return (
    <div className="space-y-4">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Stock Item Mapping</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Review and confirm extracted line items before posting</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-8 text-xs border-border gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Filter
          </Button>
          <Button className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Line
          </Button>
        </div>
      </div>

      {/* Line items table — Zoho/QB style */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">

        {/* Table toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
          <span className="text-xs font-semibold text-foreground">{items.length} Line Items</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-accent font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              {items.filter(i => i.confidence >= 90).length} auto-matched
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              {items.filter(i => i.confidence < 90).length} needs review
            </span>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid border-b border-border bg-muted/20 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
          style={{ gridTemplateColumns: '2.5fr 1fr 1fr 0.8fr 0.8fr 1fr 1fr 1fr 80px' }}>
          {['Item & Description', 'SKU', 'HSN Code', 'Qty', 'Unit', 'Rate (₹)', 'Tax', 'Amount (₹)', 'Match'].map(h => (
            <div key={h} className="px-3 py-2.5">{h}</div>
          ))}
        </div>

        {/* Rows */}
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`grid border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors group ${i % 2 === 1 ? 'bg-muted/10' : ''}`}
            style={{ gridTemplateColumns: '2.5fr 1fr 1fr 0.8fr 0.8fr 1fr 1fr 1fr 80px' }}
          >
            {/* Item name + editable */}
            <div className="px-3 py-2.5">
              <Input
                value={item.name}
                onChange={e => setItems(items.map(it => it.id === item.id ? { ...it, name: e.target.value } : it))}
                className="h-8 text-xs font-medium border-transparent bg-transparent hover:border-border focus:border-primary focus:bg-card px-2 transition-colors w-full"
              />
            </div>
            {/* SKU */}
            <div className="px-3 py-2.5 flex items-center">
              <span className="text-[11px] font-mono text-muted-foreground">{item.sku}</span>
            </div>
            {/* HSN */}
            <div className="px-3 py-2.5 flex items-center">
              <span className="text-[11px] font-mono text-muted-foreground">{item.hsn}</span>
            </div>
            {/* Qty */}
            <div className="px-3 py-2.5">
              <Input
                value={item.qty}
                onChange={e => setItems(items.map(it => it.id === item.id ? { ...it, qty: e.target.value } : it))}
                className="h-8 text-xs font-mono border-transparent bg-transparent hover:border-border focus:border-primary focus:bg-card px-2 transition-colors w-full"
              />
            </div>
            {/* Unit */}
            <div className="px-3 py-2.5 flex items-center">
              <span className="text-[11px] text-muted-foreground">{item.unit}</span>
            </div>
            {/* Rate */}
            <div className="px-3 py-2.5">
              <Input
                value={item.rate}
                onChange={e => setItems(items.map(it => it.id === item.id ? { ...it, rate: e.target.value } : it))}
                className="h-8 text-xs font-mono border-transparent bg-transparent hover:border-border focus:border-primary focus:bg-card px-2 transition-colors w-full"
              />
            </div>
            {/* Tax */}
            <div className="px-3 py-2.5 flex items-center">
              <span className="text-[11px] font-mono text-muted-foreground">{item.tax}</span>
            </div>
            {/* Amount */}
            <div className="px-3 py-2.5 flex items-center">
              <span className="text-sm font-mono font-semibold text-foreground">
                ₹{parseFloat(item.amount).toLocaleString()}
              </span>
            </div>
            {/* Confidence */}
            <div className="px-3 py-2.5 flex items-center justify-center">
              {item.confidence >= 90 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> {item.confidence}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" /> {item.confidence}%
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Summary footer */}
        <div className="grid border-t-2 border-border bg-muted/30"
          style={{ gridTemplateColumns: '2.5fr 1fr 1fr 0.8fr 0.8fr 1fr 1fr 1fr 80px' }}>
          <div className="px-3 py-3 col-span-6 flex items-center">
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{items.length}</span> items ·
              Tax: <span className="font-semibold text-foreground">₹{totalTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </span>
          </div>
          <div className="px-3 py-3 col-span-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Subtotal</span>
            <span className="text-sm font-bold font-mono text-foreground pr-4">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* GST summary card */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Taxable Amount', value: `₹${totalAmount.toLocaleString()}`, sub: 'Before tax' },
          { label: 'Total Tax (GST)', value: `₹${totalTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'CGST + SGST' },
          { label: 'Invoice Total', value: `₹${(totalAmount + totalTax).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'Payable amount', highlight: true },
        ].map(({ label, value, sub, highlight }) => (
          <div key={label} className={`rounded-lg border px-4 py-3 ${highlight ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-xl font-bold font-mono ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Nav buttons */}
      <div className="flex gap-2.5 pt-1">
        <Button onClick={() => onNavigate('preview')} variant="outline" className="h-9 px-5 text-xs border-border">
          ← Back
        </Button>
        <Button onClick={() => onNavigate('ledger')} className="flex-1 h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
          Save & Continue to Ledger <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>

    </div>
  );
};

// ==================== LEDGER ====================
const LedgerScreen = ({ onNavigate }: { onNavigate: (s: ScreenType) => void }) => {
  const [entries, _setEntries] = useState(dummyLedgerEntries);

  const totalDebit = entries.reduce((s, e) => s + parseFloat(e.debit), 0);
  const totalCredit = entries.reduce((s, e) => s + parseFloat(e.credit), 0);
  const balance = totalDebit - totalCredit;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader label="Ledger Mapping" sub="Verify and adjust ledger allocations" />
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/85 text-xs font-display uppercase tracking-[0.15em] h-9 flex-shrink-0">
              <Plus className="w-3.5 h-3.5 mr-2" /> Add Ledger
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border border-border">
            <DialogHeader>
              <DialogTitle className="font-display uppercase tracking-[0.18em] text-sm">Add Ledger Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Select>
                <SelectTrigger className="bg-input border-border h-9 text-sm">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border">
                  <SelectItem value="purchase">Purchases A/c</SelectItem>
                  <SelectItem value="creditors">Creditors A/c</SelectItem>
                  <SelectItem value="cgst">CGST Input Credit</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Debit Amount" type="number" className="bg-input border-border h-9 font-mono text-sm" />
              <Input placeholder="Credit Amount" type="number" className="bg-input border-border h-9 font-mono text-sm" />
            </div>
            <DialogFooter>
              <Button className="bg-primary text-xs font-display uppercase tracking-[0.15em] h-9">Add Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                {['Account', 'Group', 'Debit', 'Credit', 'Match'].map(h => (
                  <th key={h} className={`px-4 py-2.5 text-[9px] font-display font-bold uppercase tracking-[0.2em] text-muted-foreground ${h === 'Debit' || h === 'Credit' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={i} className={`border-b border-border/40 hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? 'bg-muted/10' : ''}`}>
                  <td className="px-4 py-3 text-xs text-foreground font-medium">{entry.account}</td>
                  <td className="px-4 py-3 text-[10px] text-muted-foreground">{entry.group}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-accent">{entry.debit !== '0' ? `₹${parseFloat(entry.debit).toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-accent">{entry.credit !== '0' ? `₹${parseFloat(entry.credit).toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3"><ConfidenceDot confidence={entry.confidence} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-3 border-t border-border">
          {[
            { label: 'Total Debit', value: `₹${totalDebit.toLocaleString()}`, highlight: false },
            { label: 'Total Credit', value: `₹${totalCredit.toLocaleString()}`, highlight: false },
            { label: 'Balance', value: `₹${Math.abs(balance).toLocaleString()}`, highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="px-4 py-3 border-r border-border last:border-r-0">
              <p className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
              <p className={`font-mono text-base font-bold mt-1 ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-2.5">
        <Button onClick={() => onNavigate('stock')} variant="outline" className="h-9 text-xs font-display uppercase tracking-[0.15em] border-border">Back</Button>
        <Button onClick={() => onNavigate('tax')} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/85 h-9 text-xs font-display uppercase tracking-[0.15em]">
          Continue to Tax<ChevronRight className="w-3.5 h-3.5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// ==================== TAX ====================
const TaxScreen = ({ onNavigate }: { onNavigate: (s: ScreenType) => void }) => (
  <div className="space-y-5">
    <SectionHeader label="Tax Detection & Mapping" sub="Review and validate GST calculations" />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {[
        { label: 'CGST', value: '₹4,050', rate: '9% tax rate', conf: 95, color: 'border-t-primary' },
        { label: 'SGST', value: '₹4,050', rate: '9% tax rate', conf: 95, color: 'border-t-emerald-400' },
        { label: 'IGST', value: '₹0', rate: 'Not applicable', conf: null, color: 'border-t-border' },
      ].map(({ label, value, rate, conf, color }) => (
        <Card key={label} className={`p-5 border border-border relative overflow-hidden bg-card border-t-2 ${color}`}>
          <p className="text-[9px] font-display font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
          <p className="font-mono text-3xl font-bold text-foreground mt-3 mb-1">{value}</p>
          <p className="text-[10px] text-muted-foreground">{rate}</p>
          {conf && <div className="mt-3"><ConfidenceDot confidence={conf} /></div>}
        </Card>
      ))}
    </div>

    <Card className="border border-border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <p className="text-[10px] font-display font-bold uppercase tracking-[0.22em] text-muted-foreground">HSN-wise Tax Summary</p>
      </div>
      <div className="divide-y divide-border/40">
        {[
          { hsn: '8501.40', desc: 'Electrical Motors', amount: '₹25,000', gst: '18% GST' },
          { hsn: '8535.30', desc: 'Control Panels', amount: '₹8,500', gst: '18% GST' },
          { hsn: '7408.11', desc: 'Copper Wire', amount: '₹2,250', gst: '5% GST' },
        ].map(({ hsn, desc, amount, gst }) => (
          <div key={hsn} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5">{hsn}</span>
              <span className="text-sm text-foreground">{desc}</span>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-bold text-accent">{amount}</p>
              <p className="text-[10px] text-muted-foreground">{gst}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <div className="flex items-start gap-3 p-4 bg-emerald-400/10 border border-emerald-400/30 rounded">
      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-display font-bold uppercase tracking-[0.18em] text-emerald-400">Tax Validation Passed</p>
        <p className="text-xs text-muted-foreground mt-0.5">All GST calculations are valid. No mismatches detected.</p>
      </div>
    </div>

    <div className="flex gap-2.5">
      <Button onClick={() => onNavigate('ledger')} variant="outline" className="h-9 text-xs font-display uppercase tracking-[0.15em] border-border">Back</Button>
      <Button onClick={() => onNavigate('approval')} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/85 h-9 text-xs font-display uppercase tracking-[0.15em]">
        Continue to Approval<ChevronRight className="w-3.5 h-3.5 ml-2" />
      </Button>
    </div>
  </div>
);

// ==================== APPROVAL ====================
const ApprovalScreen = ({ onNavigate }: { onNavigate: (s: ScreenType) => void }) => (
  <div className="space-y-5">
    <SectionHeader label="Approval & Verification" sub="Final quality check before posting to ERP" />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {[
        { label: 'OCR Quality Score', value: '94%', sub: 'Excellent', color: 'border-t-primary' },
        { label: 'Corrected Fields', value: '2', sub: 'Minor adjustments', color: 'border-t-accent' },
        { label: 'Risk Alerts', value: '0', sub: 'No issues found', color: 'border-t-emerald-400' },
      ].map(({ label, value, sub, color }) => (
        <Card key={label} className={`p-5 border border-border bg-card border-t-2 ${color}`}>
          <p className="text-[9px] font-display font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
          <p className="font-mono text-3xl font-bold text-foreground mt-3">{value}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
        </Card>
      ))}
    </div>

    <Card className="border border-border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <p className="text-[10px] font-display font-bold uppercase tracking-[0.22em] text-muted-foreground">Audit Trail</p>
      </div>
      <div className="divide-y divide-border/40">
        {[
          { label: 'Document Extracted', time: '2024-05-26 · 10:15:32', by: null },
          { label: 'Fields Validated', time: '2024-05-26 · 10:16:15', by: null },
          { label: 'Manual Review', time: '2024-05-26 · 10:17:45', by: 'Admin' },
        ].map(({ label, time, by }) => (
          <div key={label} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors">
            <div className="w-5 h-5 bg-emerald-400/15 border border-emerald-400/40 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-foreground font-medium">{label}</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{time}{by ? ` · ${by}` : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <div className="flex gap-2.5">
      <Button onClick={() => onNavigate('tax')} variant="outline" className="h-9 text-xs font-display uppercase tracking-[0.15em] border-border">Back</Button>
      <Button onClick={() => onNavigate('final-review')} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/85 h-9 text-xs font-display uppercase tracking-[0.15em]">
        Ready for Final Review<ChevronRight className="w-3.5 h-3.5 ml-2" />
      </Button>
    </div>
  </div>
);

// ==================== FINAL REVIEW ====================
const FinalReviewScreen = ({ onNavigate }: { onNavigate: (s: ScreenType) => void }) => (
  <div className="space-y-5">
    <SectionHeader label="Final Voucher Review" sub="Comprehensive summary before posting" />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-[10px] font-display font-bold uppercase tracking-[0.22em] text-muted-foreground">Voucher Details</p>
        </div>
        <div className="p-5 space-y-2.5">
          {[
            ['Voucher Number', 'VCH-2024-001', true],
            ['Invoice Number', 'INV-2024-5482', true],
            ['Date', '2024-05-15', true],
            ['Party', 'ABC Manufacturing Ltd.', false],
          ].map(([label, value, mono]) => (
            <div key={String(label)} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-b-0">
              <span className="text-xs text-muted-foreground">{String(label)}</span>
              <span className={`text-xs font-medium text-foreground ${mono ? 'font-mono' : ''}`}>{String(value)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border border-border border-t-2 border-t-accent bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-[10px] font-display font-bold uppercase tracking-[0.22em] text-muted-foreground">Financial Summary</p>
        </div>
        <div className="p-5 space-y-2.5">
          {[
            ['Subtotal', '₹45,000'],
            ['CGST (9%)', '₹4,050'],
            ['SGST (9%)', '₹4,050'],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex items-center justify-between py-1.5 border-b border-border/30">
              <span className="text-xs text-muted-foreground">{String(label)}</span>
              <span className="font-mono text-xs text-foreground">{String(value)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-display font-bold uppercase tracking-[0.15em] text-foreground">Total Amount</span>
            <span className="font-mono text-xl font-bold text-accent">₹53,100</span>
          </div>
        </div>
      </Card>
    </div>

    <Card className="border border-border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <p className="text-[10px] font-display font-bold uppercase tracking-[0.22em] text-muted-foreground">Journal Entry</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              {['Account', 'Debit', 'Credit'].map(h => (
                <th key={h} className={`px-4 py-2.5 text-[9px] font-display font-bold uppercase tracking-[0.2em] text-muted-foreground ${h !== 'Account' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { account: 'Purchases A/c', debit: '₹45,000', credit: '—' },
              { account: 'CGST Input Credit', debit: '₹4,050', credit: '—' },
              { account: 'SGST Input Credit', debit: '₹4,050', credit: '—' },
              { account: 'Creditors A/c', debit: '—', credit: '₹53,100' },
            ].map((row, i) => (
              <tr key={row.account} className={`border-b border-border/40 hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? 'bg-muted/10' : ''}`}>
                <td className="px-4 py-3 text-xs text-foreground font-medium">{row.account}</td>
                <td className={`px-4 py-3 text-right font-mono text-xs ${row.debit !== '—' ? 'text-accent' : 'text-muted-foreground/40'}`}>{row.debit}</td>
                <td className={`px-4 py-3 text-right font-mono text-xs ${row.credit !== '—' ? 'text-accent font-bold' : 'text-muted-foreground/40'}`}>{row.credit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>

    <div className="flex items-start gap-3 p-4 bg-emerald-400/10 border border-emerald-400/30 rounded">
      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-display font-bold uppercase tracking-[0.18em] text-emerald-400">Ready to Post</p>
        <p className="text-xs text-muted-foreground mt-0.5">All validations passed. This voucher is ready to be posted to your ERP.</p>
      </div>
    </div>

    <div className="flex gap-2.5">
      <Button onClick={() => onNavigate('approval')} variant="outline" className="h-9 text-xs font-display uppercase tracking-[0.15em] border-border">Back</Button>
      <Button onClick={() => onNavigate('success')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-9 text-xs font-display uppercase tracking-[0.15em]">
        Post to ERP<ChevronRight className="w-3.5 h-3.5 ml-2" />
      </Button>
    </div>
  </div>
);

// ==================== SUCCESS ====================
const SuccessScreen = ({ onNavigate }: { onNavigate: (s: ScreenType) => void }) => (
  <div className="max-w-lg mx-auto">
    <Card className="p-10 border border-border bg-card text-center">
      {/* Animated ring */}
      <div className="relative w-20 h-20 mx-auto mb-8">
        <div className="absolute inset-0 border-2 border-emerald-400/30 rounded-full ring-expand" />
        <div className="relative w-20 h-20 border-2 border-emerald-400/60 rounded-full flex items-center justify-center bg-emerald-400/10">
          <CheckCircle className="w-9 h-9 text-emerald-400" />
        </div>
      </div>

      <p className="font-display text-2xl font-bold uppercase tracking-[0.18em] text-foreground mb-1">Posted Successfully</p>
      <p className="text-xs text-muted-foreground tracking-wide mb-8">Purchase voucher created in ERP</p>

      <div className="bg-muted/30 border border-border p-4 rounded mb-6 text-left space-y-2.5">
        <p className="text-[9px] font-display font-bold uppercase tracking-[0.22em] text-muted-foreground mb-3">Voucher Details</p>
        {[
          { label: 'Voucher Number', value: 'VCH-2024-001', mono: true },
          { label: 'Amount', value: '₹53,100', mono: true, highlight: true },
          { label: 'Posted At', value: '2024-05-26 · 10:22:18', mono: true },
        ].map(({ label, value, mono, highlight }) => (
          <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className={`text-xs font-medium ${mono ? 'font-mono' : ''} ${highlight ? 'text-accent text-base font-bold' : 'text-foreground'}`}>{value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
        <Button onClick={() => onNavigate('home')} variant="outline" className="flex-1 h-9 text-xs font-display uppercase tracking-[0.15em] border-border">
          Back to Dashboard
        </Button>
        <Button onClick={() => onNavigate('upload')} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/85 h-9 text-xs font-display uppercase tracking-[0.15em]">
          <Plus className="w-3.5 h-3.5 mr-2" /> Process Another
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
        {[
          { icon: Download, label: 'Download PDF' },
          { icon: Copy, label: 'Copy Voucher ID' },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="flex items-center justify-center gap-2 p-2.5 hover:bg-muted/40 rounded transition-colors">
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">{label}</span>
          </button>
        ))}
      </div>
    </Card>
  </div>
);

// ==================== MAIN APP ====================
export default function ERPOCRApp() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const [uploadHistory] = useState<UploadHistory[]>([
    { id: '1', fileName: 'invoice-2024-001.pdf', uploadDate: '2024-05-26 10:15 AM', invoiceNo: 'INV-2024-5482', amount: 53100, status: 'posted', voucherNo: 'VCH-2024-001' },
    { id: '2', fileName: 'invoice-2024-002.png', uploadDate: '2024-05-25 02:45 PM', invoiceNo: 'INV-2024-5481', amount: 28500, status: 'processed', voucherNo: 'VCH-2024-002' },
    { id: '3', fileName: 'purchase-bill-5.jpg', uploadDate: '2024-05-24 11:20 AM', invoiceNo: 'PB-2024-0015', amount: 12500, status: 'processed', voucherNo: 'VCH-2024-003' },
    { id: '4', fileName: 'invoice-2024-003.pdf', uploadDate: '2024-05-23 03:30 PM', invoiceNo: 'INV-2024-5480', amount: 67800, status: 'pending' },
  ]);

  const [addedLedgerEntries] = useState([
    { id: '1', account: 'Purchases A/c', debit: '45000', credit: '0', voucherNo: 'VCH-2024-001', date: '2024-05-26' },
    { id: '2', account: 'CGST Input Credit', debit: '4050', credit: '0', voucherNo: 'VCH-2024-001', date: '2024-05-26' },
    { id: '3', account: 'SGST Input Credit', debit: '4050', credit: '0', voucherNo: 'VCH-2024-001', date: '2024-05-26' },
    { id: '4', account: 'Creditors A/c', debit: '0', credit: '53100', voucherNo: 'VCH-2024-001', date: '2024-05-26' },
    { id: '5', account: 'Sales A/c', debit: '0', credit: '28500', voucherNo: 'VCH-2024-002', date: '2024-05-25' },
  ]);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const screens: Record<ScreenType, React.ReactNode> = {
    home: <HomeScreen onNavigate={setCurrentScreen} uploadHistory={uploadHistory} addedLedgerEntries={addedLedgerEntries} />,
    upload: <UploadScreen onNavigate={setCurrentScreen} selectedSample={selectedSample} onSelectSample={setSelectedSample} />,
    processing: <ProcessingScreen onNavigate={setCurrentScreen} />,
    preview: <PreviewScreen onNavigate={setCurrentScreen} />,
    stock: <StockScreen onNavigate={setCurrentScreen} />,
    ledger: <LedgerScreen onNavigate={setCurrentScreen} />,
    tax: <TaxScreen onNavigate={setCurrentScreen} />,
    approval: <ApprovalScreen onNavigate={setCurrentScreen} />,
    'final-review': <FinalReviewScreen onNavigate={setCurrentScreen} />,
    success: <SuccessScreen onNavigate={setCurrentScreen} />,
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {(!isMobile || sidebarOpen) && (
        <div className="h-full flex-shrink-0">
          <Sidebar
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            isMobile={isMobile}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} />
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className={currentScreen === 'preview' ? 'flex-1 min-h-0 overflow-hidden' : 'flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full'}>
            {screens[currentScreen]}
          </div>
        </main>
      </div>
    </div>
  );
}

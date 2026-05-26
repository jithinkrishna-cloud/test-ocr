'use client';

import React, { useState } from 'react';
import { ChevronRight, Upload, FileText, Zap, CheckCircle, AlertCircle, Eye, Download, Plus, Filter, ChevronDown, Clock, Users, TrendingUp, Home, Settings, LogOut, Bell, User, Menu, X, Send, Copy, FileUp, AlertTriangle, CheckCheck, Star, DollarSign, Package, Layers, FileCheck, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ==================== TYPE DEFINITIONS ====================
type ScreenType = 'home' | 'upload' | 'processing' | 'preview' | 'stock' | 'ledger' | 'tax' | 'approval' | 'final-review' | 'success';

interface VoucherData {
  voucherNo: string;
  invoiceNo: string;
  date: string;
  party: string;
  amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

interface StockItem {
  id: string;
  name: string;
  sku: string;
  hsn: string;
  qty: string;
  unit: string;
  rate: string;
  tax: string;
  amount: string;
  confidence: number;
}

interface LedgerEntry {
  account: string;
  debit: string;
  credit: string;
  group: string;
  confidence: number;
}

interface ProcessingStage {
  name: string;
  status: 'pending' | 'processing' | 'complete';
  timestamp?: string;
}

// ==================== DUMMY DATA ====================
const dummyVoucherData: VoucherData = {
  voucherNo: 'VCH-2024-001',
  invoiceNo: 'INV-2024-5482',
  date: '2024-05-15',
  party: 'ABC Manufacturing Ltd.',
  amount: 45000,
  cgst: 4050,
  sgst: 4050,
  igst: 0,
  totalAmount: 53100,
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
  { name: 'Document Analysis', status: 'complete', timestamp: '2024-05-26 10:15' },
  { name: 'Text Extraction', status: 'complete', timestamp: '2024-05-26 10:16' },
  { name: 'Data Validation', status: 'complete', timestamp: '2024-05-26 10:17' },
  { name: 'Field Recognition', status: 'complete', timestamp: '2024-05-26 10:18' },
  { name: 'Tax Calculation', status: 'processing', timestamp: '2024-05-26 10:19' },
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

// ==================== LAYOUT COMPONENTS ====================
const Sidebar = ({ currentScreen, onNavigate, isMobile, isOpen, onClose }: { 
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const menuItems = [
    { id: 'home' as ScreenType, label: 'Dashboard', icon: Home },
    { id: 'upload' as ScreenType, label: 'New Upload', icon: FileUp },
    { id: 'processing' as ScreenType, label: 'Processing', icon: Zap },
    { id: 'preview' as ScreenType, label: 'Preview & Edit', icon: Eye },
    { id: 'stock' as ScreenType, label: 'Stock Mapping', icon: Package },
    { id: 'ledger' as ScreenType, label: 'Ledger', icon: Layers },
    { id: 'tax' as ScreenType, label: 'Tax', icon: DollarSign },
    { id: 'approval' as ScreenType, label: 'Approval', icon: CheckCheck },
    { id: 'final-review' as ScreenType, label: 'Final Review', icon: FileCheck },
  ];

  return (
    <div className={`${isMobile ? 'fixed inset-0 z-50 flex' : ''}`}>
      {isMobile && isOpen && (
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      )}
      <div className={`w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
        isMobile ? 'relative z-51' : ''
      } ${isMobile && !isOpen ? 'hidden' : ''}`}>
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-lg text-sidebar-foreground">ERP OCR</h1>
          </div>
          <p className="text-xs text-muted-foreground">Accounting System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                if (isMobile) onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                currentScreen === item.id 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sm text-sidebar-foreground">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sm text-sidebar-foreground">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const TopNavbar = ({ onMenuClick, isMobile }: { onMenuClick: () => void; isMobile: boolean }) => (
  <header className="sticky top-0 z-40 bg-card border-b border-border h-16 flex items-center px-6 gap-4">
    {isMobile && (
      <button onClick={onMenuClick} className="p-2 hover:bg-accent rounded-lg">
        <Menu className="w-6 h-6 text-foreground" />
      </button>
    )}
    
    <div className="flex-1 flex items-center gap-8">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Accounting</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium text-foreground">OCR Voucher Processing</span>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-accent rounded-lg relative">
        <Bell className="w-5 h-5 text-foreground" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </button>
      <button className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-lg">
        <User className="w-5 h-5 text-foreground" />
        <span className="text-sm font-medium text-foreground hidden sm:inline">Admin</span>
      </button>
    </div>
  </header>
);

// ==================== SCREEN COMPONENTS ====================
const HomeScreen = ({ 
  onNavigate, 
  uploadHistory, 
  addedLedgerEntries 
}: { 
  onNavigate: (screen: ScreenType) => void;
  uploadHistory: UploadHistory[];
  addedLedgerEntries: Array<{id: string; account: string; debit: string; credit: string; voucherNo: string; date: string}>;
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Today's Vouchers</p>
            <p className="text-3xl font-bold text-foreground mt-2">24</p>
          </div>
          <FileText className="w-12 h-12 text-primary/30" />
        </div>
      </Card>
      <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Processed</p>
            <p className="text-3xl font-bold text-foreground mt-2">18</p>
          </div>
          <CheckCircle className="w-12 h-12 text-accent/30" />
        </div>
      </Card>
      <Card className="p-6 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Pending Review</p>
            <p className="text-3xl font-bold text-foreground mt-2">5</p>
          </div>
          <Clock className="w-12 h-12 text-yellow-500/30" />
        </div>
      </Card>
      <Card className="p-6 bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Issues</p>
            <p className="text-3xl font-bold text-foreground mt-2">1</p>
          </div>
          <AlertCircle className="w-12 h-12 text-red-500/30" />
        </div>
      </Card>
    </div>

    <Card className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('upload')}
          className="flex items-center gap-3 p-4 bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all font-medium"
        >
          <Upload className="w-5 h-5" />
          Upload New Document
        </button>
        <button
          onClick={() => onNavigate('approval')}
          className="flex items-center gap-3 p-4 bg-accent text-accent-foreground rounded-lg hover:shadow-lg hover:shadow-accent/20 transition-all font-medium"
        >
          <CheckCircle className="w-5 h-5" />
          Review Pending Approvals
        </button>
      </div>
    </Card>

    <Tabs defaultValue="history" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="history">Upload History</TabsTrigger>
        <TabsTrigger value="ledger">Ledger Entries</TabsTrigger>
      </TabsList>

      <TabsContent value="history" className="mt-4">
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-4">Recent Document Uploads</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium text-foreground">File Name</th>
                  <th className="text-left p-3 font-medium text-foreground">Invoice No.</th>
                  <th className="text-left p-3 font-medium text-foreground">Amount</th>
                  <th className="text-left p-3 font-medium text-foreground">Upload Date</th>
                  <th className="text-left p-3 font-medium text-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-foreground">Voucher No.</th>
                </tr>
              </thead>
              <tbody>
                {uploadHistory.map(item => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-foreground font-medium">{item.fileName}</td>
                    <td className="p-3 text-muted-foreground">{item.invoiceNo}</td>
                    <td className="p-3 text-foreground">₹{item.amount.toLocaleString()}</td>
                    <td className="p-3 text-muted-foreground text-xs">{item.uploadDate}</td>
                    <td className="p-3">
                      <Badge className={`${
                        item.status === 'posted' ? 'bg-green-500/20 text-green-700 border-green-500/30' :
                        item.status === 'processed' ? 'bg-blue-500/20 text-blue-700 border-blue-500/30' :
                        'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3 text-foreground font-medium">{item.voucherNo || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="ledger" className="mt-4">
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-4">Posted Ledger Entries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium text-foreground">Account</th>
                  <th className="text-right p-3 font-medium text-foreground">Debit</th>
                  <th className="text-right p-3 font-medium text-foreground">Credit</th>
                  <th className="text-left p-3 font-medium text-foreground">Voucher No.</th>
                  <th className="text-left p-3 font-medium text-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {addedLedgerEntries.map(entry => (
                  <tr key={entry.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-foreground font-medium">{entry.account}</td>
                    <td className="p-3 text-right text-foreground">{entry.debit !== '0' ? `₹${parseFloat(entry.debit).toLocaleString()}` : '-'}</td>
                    <td className="p-3 text-right text-foreground">{entry.credit !== '0' ? `₹${parseFloat(entry.credit).toLocaleString()}` : '-'}</td>
                    <td className="p-3 text-muted-foreground">{entry.voucherNo}</td>
                    <td className="p-3 text-muted-foreground text-xs">{entry.date}</td>
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

const UploadScreen = ({ onNavigate, selectedSample, onSelectSample }: { onNavigate: (screen: ScreenType) => void; selectedSample: string | null; onSelectSample: (sample: string) => void }) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <Card className="p-8 border-2 border-dashed border-primary/30 bg-primary/5 rounded-3xl">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Drag and drop your invoice</h3>
          <p className="text-muted-foreground text-sm">or click to select files</p>
          <p className="text-xs text-muted-foreground mt-2">Supports PDF, PNG, JPG (Max 50MB)</p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => onNavigate('voucher-type')} className="bg-primary">
            Select File
          </Button>
        </div>
      </div>
    </Card>

    <Card className="p-6 space-y-4">
      <h3 className="font-bold text-foreground">Try Sample Documents</h3>
      <p className="text-sm text-muted-foreground">Select a sample invoice to test the system workflow:</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onSelectSample('sample-pdf.txt')}
          className={`flex items-center justify-center gap-2 p-4 rounded-lg transition-all border-2 group ${
            selectedSample === 'sample-pdf.txt'
              ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
              : 'border-primary/30 hover:border-primary/60 hover:bg-primary/5'
          }`}
        >
          <FileText className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <p className="font-medium text-foreground text-sm">PDF Format</p>
            <p className="text-xs text-muted-foreground">sample-invoice.pdf</p>
          </div>
        </button>
        <button
          onClick={() => onSelectSample('sample-png.png')}
          className={`flex items-center justify-center gap-2 p-4 rounded-lg transition-all border-2 group ${
            selectedSample === 'sample-png.png'
              ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
              : 'border-accent/30 hover:border-accent/60 hover:bg-accent/5'
          }`}
        >
          <FileText className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <p className="font-medium text-foreground text-sm">PNG Format</p>
            <p className="text-xs text-muted-foreground">sample-invoice.png</p>
          </div>
        </button>
        <button
          onClick={() => onSelectSample('sample-jpg.jpg')}
          className={`flex items-center justify-center gap-2 p-4 rounded-lg transition-all border-2 group ${
            selectedSample === 'sample-jpg.jpg'
              ? 'border-yellow-600 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
              : 'border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/5'
          }`}
        >
          <FileText className="w-5 h-5 text-yellow-600 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <p className="font-medium text-foreground text-sm">JPG Format</p>
            <p className="text-xs text-muted-foreground">sample-invoice.jpg</p>
          </div>
        </button>
      </div>
      {selectedSample && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium text-green-700">Sample file selected: {selectedSample}</span>
        </div>
      )}
    </Card>

    {selectedSample && (
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-2">Select Voucher Type</h3>
          <p className="text-sm text-muted-foreground">AI detected this as a Purchase Invoice (89% confidence)</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {voucherTypes.map(vtype => (
            <Card
              key={vtype.id}
              onClick={() => onNavigate('processing')}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${vtype.recommended ? 'ring-2 ring-accent border-accent/50' : 'hover:border-primary/50'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <vtype.icon className={`w-8 h-8 ${vtype.recommended ? 'text-accent' : 'text-muted-foreground'}`} />
                {vtype.recommended && <Badge className="bg-accent text-accent-foreground">Recommended</Badge>}
              </div>
              <h3 className="font-bold text-foreground mb-1">{vtype.name}</h3>
              <p className="text-sm text-muted-foreground">{vtype.desc}</p>
            </Card>
          ))}
        </div>
      </Card>
    )}

    <Card className="p-6 space-y-4">
      <h3 className="font-bold text-foreground">Document Requirements</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <span className="text-foreground">Clear image with good lighting</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <span className="text-foreground">Document should be straight and not skewed</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <span className="text-foreground">All text must be clearly visible and legible</span>
        </div>
      </div>
    </Card>

    <Card className="p-6 bg-accent/10 border-accent/30">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">AI-Powered Processing</p>
          <p className="text-muted-foreground">Our advanced OCR system will automatically extract and validate all invoice details with 95%+ accuracy.</p>
        </div>
      </div>
    </Card>
  </div>
);

const ProcessingScreen = ({ onNavigate }: { onNavigate: (screen: ScreenType) => void }) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Processing Your Document</h2>
      <p className="text-muted-foreground">Estimated completion: 2-3 seconds</p>
    </div>

    <Card className="p-8 space-y-6">
      {processingStages.map((stage, idx) => (
        <div key={idx} className="flex items-start gap-4">
          <div className="flex-shrink-0 pt-1">
            {stage.status === 'complete' ? (
              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-accent-foreground" />
              </div>
            ) : stage.status === 'processing' ? (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                <Loader className="w-4 h-4 text-primary-foreground animate-spin" />
              </div>
            ) : (
              <div className="w-6 h-6 bg-muted rounded-full" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{stage.name}</h4>
            {stage.timestamp && <p className="text-xs text-muted-foreground">{stage.timestamp}</p>}
          </div>
        </div>
      ))}
    </Card>

    <div className="text-center pt-4">
      <Button
        onClick={() => onNavigate('preview')}
        className="bg-primary"
      >
        Continue to Preview
      </Button>
    </div>
  </div>
);

const PreviewScreen = ({ onNavigate }: { onNavigate: (screen: ScreenType) => void }) => {
  const [editedData, setEditedData] = useState<VoucherData>(dummyVoucherData);
  const [selectedTab, setSelectedTab] = useState('details');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Document Preview */}
      <div className="lg:col-span-1">
        <Card className="overflow-hidden sticky top-20">
          <div className="bg-white p-6 space-y-4 border-b">
            <div>
              <p className="text-xs text-muted-foreground font-medium">ABC Manufacturing Ltd.</p>
              <p className="text-lg font-bold text-foreground">INVOICE</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice No:</span>
                <span className="font-medium text-foreground">INV-2024-5482</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium text-foreground">15-05-2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium text-foreground">₹53,100</span>
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground font-medium mb-2">Items</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Industrial Motor 5HP</span>
                  <span className="font-medium">₹25,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Control Panel Assembly</span>
                  <span className="font-medium">₹8,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Copper Wire Coil</span>
                  <span className="font-medium">₹2,250</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">₹45,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CGST (9%):</span>
                <span className="font-medium">₹4,050</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SGST (9%):</span>
                <span className="font-medium">₹4,050</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total:</span>
                <span className="text-accent">₹53,100</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Panel - Editable Form */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Preview & Correct</h2>
          <p className="text-muted-foreground text-sm">Edit extracted data if needed</p>
        </div>

        <Card className="p-6 space-y-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Voucher Details</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b">
                  <label className="text-sm font-medium text-foreground">Voucher Number</label>
                  <Badge variant="outline" className="bg-accent/10 border-accent/50">95% confidence</Badge>
                </div>
                <Input
                  value={editedData.voucherNo}
                  onChange={e => setEditedData({ ...editedData, voucherNo: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b">
                  <label className="text-sm font-medium text-foreground">Invoice Number</label>
                  <Badge variant="outline" className="bg-accent/10 border-accent/50">92% confidence</Badge>
                </div>
                <Input
                  value={editedData.invoiceNo}
                  onChange={e => setEditedData({ ...editedData, invoiceNo: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Input
                    value={editedData.date}
                    onChange={e => setEditedData({ ...editedData, date: e.target.value })}
                    type="date"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Amount</label>
                  <Input
                    value={editedData.amount}
                    onChange={e => setEditedData({ ...editedData, amount: parseFloat(e.target.value) })}
                    type="number"
                    className="bg-input"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Party Name</label>
                <Input
                  value={editedData.party}
                  onChange={e => setEditedData({ ...editedData, party: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 bg-muted/50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">CGST</p>
                  <p className="font-bold text-foreground">₹{editedData.cgst}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SGST</p>
                  <p className="font-bold text-foreground">₹{editedData.sgst}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-bold text-accent">₹{editedData.totalAmount}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">Billing details extracted from document</p>
              <Input placeholder="Billing Address" defaultValue="Floor 3, Tech Park, Bangalore" className="bg-input" />
              <Input placeholder="Contact Number" defaultValue="+91-080-12345678" className="bg-input" />
              <Input placeholder="GST Number" defaultValue="18AAJCU5055K1Z0" className="bg-input" />
            </TabsContent>

            <TabsContent value="shipping" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">Shipping details (if applicable)</p>
              <Input placeholder="Shipping Address" className="bg-input" />
              <Input placeholder="Delivery Date" type="date" className="bg-input" />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 flex gap-3 pt-4 bg-background">
          <Button onClick={() => onNavigate('voucher-type')} variant="outline">
            Back
          </Button>
          <Button
            onClick={() => onNavigate('stock')}
            className="flex-1 bg-primary"
          >
            Continue to Stock Mapping
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const StockScreen = ({ onNavigate }: { onNavigate: (screen: ScreenType) => void }) => {
  const [items, setItems] = useState(dummyStockItems);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Stock Item Mapping</h2>
          <p className="text-muted-foreground text-sm">Match extracted items with your stock master</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Stock Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Item Name" />
              <Input placeholder="SKU" />
              <Input placeholder="HSN Code" />
              <Input placeholder="Unit" />
            </div>
            <DialogFooter>
              <Button className="bg-primary">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-input"
          />
          <Button variant="outline">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium text-foreground">Item Name</th>
                <th className="text-left p-3 font-medium text-foreground">SKU</th>
                <th className="text-left p-3 font-medium text-foreground">HSN</th>
                <th className="text-left p-3 font-medium text-foreground">Qty</th>
                <th className="text-left p-3 font-medium text-foreground">Unit</th>
                <th className="text-left p-3 font-medium text-foreground">Rate</th>
                <th className="text-left p-3 font-medium text-foreground">Amount</th>
                <th className="text-left p-3 font-medium text-foreground">Match %</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3 text-foreground">{item.name}</td>
                  <td className="p-3 text-muted-foreground">{item.sku}</td>
                  <td className="p-3 text-muted-foreground">{item.hsn}</td>
                  <td className="p-3 text-foreground font-medium">{item.qty}</td>
                  <td className="p-3 text-muted-foreground">{item.unit}</td>
                  <td className="p-3 text-foreground">₹{item.rate}</td>
                  <td className="p-3 text-foreground font-medium">₹{item.amount}</td>
                  <td className="p-3">
                    <Badge className={`${item.confidence >= 90 ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'}`}>
                      {item.confidence}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => onNavigate('preview')} variant="outline">Back</Button>
        <Button onClick={() => onNavigate('ledger')} className="flex-1 bg-primary">
          Continue to Ledger Mapping<ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const LedgerScreen = ({ onNavigate }: { onNavigate: (screen: ScreenType) => void }) => {
  const [entries, setEntries] = useState(dummyLedgerEntries);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ledger Account Mapping</h2>
          <p className="text-muted-foreground text-sm">Verify and adjust ledger allocations</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Ledger
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Ledger Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchases A/c</SelectItem>
                  <SelectItem value="creditors">Creditors A/c</SelectItem>
                  <SelectItem value="cgst">CGST Input Credit</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Debit Amount" type="number" />
              <Input placeholder="Credit Amount" type="number" />
            </div>
            <DialogFooter>
              <Button className="bg-primary">Add Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium text-foreground">Account</th>
                <th className="text-left p-3 font-medium text-foreground">Group</th>
                <th className="text-right p-3 font-medium text-foreground">Debit</th>
                <th className="text-right p-3 font-medium text-foreground">Credit</th>
                <th className="text-left p-3 font-medium text-foreground">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3 text-foreground font-medium">{entry.account}</td>
                  <td className="p-3 text-muted-foreground text-sm">{entry.group}</td>
                  <td className="p-3 text-right text-foreground">{entry.debit !== '0' ? `₹${entry.debit}` : '-'}</td>
                  <td className="p-3 text-right text-foreground">{entry.credit !== '0' ? `₹${entry.credit}` : '-'}</td>
                  <td className="p-3">
                    <Badge className={`${entry.confidence >= 95 ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'}`}>
                      {entry.confidence}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Total Debit</p>
            <p className="text-lg font-bold text-foreground">₹57,100</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Credit</p>
            <p className="text-lg font-bold text-foreground">₹53,100</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-lg font-bold text-accent">₹4,000</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => onNavigate('stock')} variant="outline">Back</Button>
        <Button onClick={() => onNavigate('tax')} className="flex-1 bg-primary">
          Continue to Tax<ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const TaxScreen = ({ onNavigate }: { onNavigate: (screen: ScreenType) => void }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-foreground">Tax Detection & Mapping</h2>
      <p className="text-muted-foreground text-sm">Review and validate GST calculations</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">CGST</p>
        <p className="text-3xl font-bold text-foreground mt-2">₹4,050</p>
        <p className="text-xs text-muted-foreground mt-2">9% tax rate</p>
        <Badge className="mt-3 bg-green-500/20 text-green-700 border-green-500/30">95% confidence</Badge>
      </Card>
      <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">SGST</p>
        <p className="text-3xl font-bold text-foreground mt-2">₹4,050</p>
        <p className="text-xs text-muted-foreground mt-2">9% tax rate</p>
        <Badge className="mt-3 bg-green-500/20 text-green-700 border-green-500/30">95% confidence</Badge>
      </Card>
      <Card className="p-6 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">IGST</p>
        <p className="text-3xl font-bold text-foreground mt-2">₹0</p>
        <p className="text-xs text-muted-foreground mt-2">Not Applicable</p>
      </Card>
    </div>

    <Card className="p-6 space-y-4">
      <h3 className="font-bold text-foreground">HSN-wise Tax Summary</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-foreground font-medium">8501.40 - Electrical Motors</span>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">₹25,000</p>
            <p className="text-xs text-muted-foreground">18% GST</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-foreground font-medium">8535.30 - Control Panels</span>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">₹8,500</p>
            <p className="text-xs text-muted-foreground">18% GST</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-foreground font-medium">7408.11 - Copper Wire</span>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">₹2,250</p>
            <p className="text-xs text-muted-foreground">5% GST</p>
          </div>
        </div>
      </div>
    </Card>

    <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-medium text-foreground mb-1">Tax Validation Successful</p>
        <p className="text-muted-foreground">All GST calculations are valid. No mismatches detected.</p>
      </div>
    </div>

    <div className="flex gap-3">
      <Button onClick={() => onNavigate('ledger')} variant="outline">Back</Button>
      <Button onClick={() => onNavigate('approval')} className="flex-1 bg-primary">
        Continue to Approval<ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  </div>
);

const ApprovalScreen = ({ onNavigate }: { onNavigate: (screen: ScreenType) => void }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-foreground">Approval & Verification</h2>
      <p className="text-muted-foreground text-sm">Final quality check before posting to ERP</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
        <p className="text-xs text-muted-foreground uppercase">OCR Quality Score</p>
        <p className="text-3xl font-bold text-accent mt-2">94%</p>
        <p className="text-xs text-muted-foreground mt-2">Excellent</p>
      </Card>
      <Card className="p-6">
        <p className="text-xs text-muted-foreground uppercase">Corrected Fields</p>
        <p className="text-3xl font-bold text-foreground mt-2">2</p>
        <p className="text-xs text-muted-foreground mt-2">Minor adjustments</p>
      </Card>
      <Card className="p-6">
        <p className="text-xs text-muted-foreground uppercase">Risk Alerts</p>
        <p className="text-3xl font-bold text-foreground mt-2">0</p>
        <p className="text-xs text-muted-foreground mt-2">No issues found</p>
      </Card>
    </div>

    <Card className="p-6 space-y-4">
      <h3 className="font-bold text-foreground">Audit Trail</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Document Extracted</p>
            <p className="text-xs text-muted-foreground">2024-05-26 10:15:32</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Fields Validated</p>
            <p className="text-xs text-muted-foreground">2024-05-26 10:16:15</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Manual Review</p>
            <p className="text-xs text-muted-foreground">2024-05-26 10:17:45 by Admin</p>
          </div>
        </div>
      </div>
    </Card>

    <div className="flex gap-3">
      <Button onClick={() => onNavigate('tax')} variant="outline">Back</Button>
      <Button onClick={() => onNavigate('final-review')} className="flex-1 bg-primary">
        Ready for Final Review<ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  </div>
);

const FinalReviewScreen = ({ onNavigate }: { onNavigate: (screen: ScreenType) => void }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-foreground">Final Voucher Review</h2>
      <p className="text-muted-foreground text-sm">Comprehensive summary before posting</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-foreground">Voucher Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Voucher Number</span>
            <span className="font-medium text-foreground">VCH-2024-001</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Invoice Number</span>
            <span className="font-medium text-foreground">INV-2024-5482</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium text-foreground">2024-05-15</span>
          </div>
          <div className="flex justify-between items-center border-t pt-3">
            <span className="text-muted-foreground">Party</span>
            <span className="font-medium text-foreground">ABC Manufacturing Ltd.</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4 bg-primary/5 border-primary/20">
        <h3 className="font-bold text-foreground">Financial Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">₹45,000</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">CGST (9%)</span>
            <span className="font-medium text-foreground">₹4,050</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">SGST (9%)</span>
            <span className="font-medium text-foreground">₹4,050</span>
          </div>
          <div className="flex justify-between items-center border-t pt-3">
            <span className="font-bold text-foreground">Total Amount</span>
            <span className="text-xl font-bold text-accent">₹53,100</span>
          </div>
        </div>
      </Card>
    </div>

    <Card className="p-6 space-y-4">
      <h3 className="font-bold text-foreground">Ledger Entries (Journal)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 font-medium text-foreground">Account</th>
              <th className="text-right p-3 font-medium text-foreground">Debit</th>
              <th className="text-right p-3 font-medium text-foreground">Credit</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border hover:bg-muted/30">
              <td className="p-3 text-foreground">Purchases A/c</td>
              <td className="p-3 text-right font-medium">₹45,000</td>
              <td className="p-3 text-right">-</td>
            </tr>
            <tr className="border-b border-border hover:bg-muted/30">
              <td className="p-3 text-foreground">CGST Input Credit</td>
              <td className="p-3 text-right font-medium">₹4,050</td>
              <td className="p-3 text-right">-</td>
            </tr>
            <tr className="border-b border-border hover:bg-muted/30">
              <td className="p-3 text-foreground">SGST Input Credit</td>
              <td className="p-3 text-right font-medium">₹4,050</td>
              <td className="p-3 text-right">-</td>
            </tr>
            <tr className="border-b border-border hover:bg-muted/30">
              <td className="p-3 text-foreground font-medium">Creditors A/c</td>
              <td className="p-3 text-right">-</td>
              <td className="p-3 text-right font-bold">₹53,100</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-medium text-foreground mb-1">Ready to Post</p>
        <p className="text-muted-foreground">All validations passed. This voucher is ready to be posted to your ERP.</p>
      </div>
    </div>

    <div className="flex gap-3">
      <Button onClick={() => onNavigate('approval')} variant="outline">Back</Button>
      <Button onClick={() => onNavigate('success')} className="flex-1 bg-green-600 hover:bg-green-700">
        Post to ERP<ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  </div>
);

const SuccessScreen = ({ onNavigate }: { onNavigate: (screen: ScreenType) => void }) => (
  <div className="max-w-2xl mx-auto">
    <Card className="p-12 text-center space-y-8">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle className="w-12 h-12 text-accent" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Voucher Posted Successfully!</h2>
        <p className="text-muted-foreground">Your purchase invoice has been created in the ERP system</p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3">
        <h3 className="font-bold text-foreground">Voucher Details</h3>
        <div className="space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Voucher Number:</span>
            <span className="font-mono font-bold text-foreground">VCH-2024-001</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="text-lg font-bold text-accent">₹53,100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Posted At:</span>
            <span className="font-medium text-foreground">2024-05-26 10:22:18</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => onNavigate('home')} variant="outline" className="flex-1">
          Back to Dashboard
        </Button>
        <Button onClick={() => onNavigate('upload')} className="flex-1 bg-primary">
          <Plus className="w-4 h-4 mr-2" />
          Process Another
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <button className="flex items-center justify-center gap-2 p-3 hover:bg-muted rounded-lg transition-colors">
          <Download className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Download PDF</span>
        </button>
        <button className="flex items-center justify-center gap-2 p-3 hover:bg-muted rounded-lg transition-colors">
          <Copy className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Copy Voucher ID</span>
        </button>
      </div>
    </Card>
  </div>
);

// ==================== MAIN APP ====================
interface UploadHistory {
  id: string;
  fileName: string;
  uploadDate: string;
  invoiceNo: string;
  amount: number;
  status: 'pending' | 'processed' | 'posted';
  voucherNo?: string;
}

export default function ERPOCRApp() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([
    { id: '1', fileName: 'invoice-2024-001.pdf', uploadDate: '2024-05-26 10:15 AM', invoiceNo: 'INV-2024-5482', amount: 53100, status: 'posted', voucherNo: 'VCH-2024-001' },
    { id: '2', fileName: 'invoice-2024-002.png', uploadDate: '2024-05-25 02:45 PM', invoiceNo: 'INV-2024-5481', amount: 28500, status: 'processed', voucherNo: 'VCH-2024-002' },
    { id: '3', fileName: 'purchase-bill-5.jpg', uploadDate: '2024-05-24 11:20 AM', invoiceNo: 'PB-2024-0015', amount: 12500, status: 'processed', voucherNo: 'VCH-2024-003' },
    { id: '4', fileName: 'invoice-2024-003.pdf', uploadDate: '2024-05-23 03:30 PM', invoiceNo: 'INV-2024-5480', amount: 67800, status: 'pending' },
  ]);
  const [addedLedgerEntries, setAddedLedgerEntries] = useState<Array<{id: string; account: string; debit: string; credit: string; voucherNo: string; date: string}>>([
    { id: '1', account: 'Purchases A/c', debit: '45000', credit: '0', voucherNo: 'VCH-2024-001', date: '2024-05-26' },
    { id: '2', account: 'CGST Input Credit', debit: '4050', credit: '0', voucherNo: 'VCH-2024-001', date: '2024-05-26' },
    { id: '3', account: 'SGST Input Credit', debit: '4050', credit: '0', voucherNo: 'VCH-2024-001', date: '2024-05-26' },
    { id: '4', account: 'Creditors A/c', debit: '0', credit: '53100', voucherNo: 'VCH-2024-001', date: '2024-05-26' },
    { id: '5', account: 'Sales A/c', debit: '0', credit: '28500', voucherNo: 'VCH-2024-002', date: '2024-05-25' },
  ]);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const screenComponents: Record<ScreenType, React.ReactNode> = {
    home: <HomeScreen onNavigate={setCurrentScreen} uploadHistory={uploadHistory} addedLedgerEntries={addedLedgerEntries} />,
    upload: <UploadScreen onNavigate={setCurrentScreen} selectedSample={selectedSample} onSelectSample={setSelectedSample} />,
    'processing': <ProcessingScreen onNavigate={setCurrentScreen} />,
    'preview': <PreviewScreen onNavigate={setCurrentScreen} />,
    'stock': <StockScreen onNavigate={setCurrentScreen} />,
    'ledger': <LedgerScreen onNavigate={setCurrentScreen} />,
    'tax': <TaxScreen onNavigate={setCurrentScreen} />,
    'approval': <ApprovalScreen onNavigate={setCurrentScreen} />,
    'final-review': <FinalReviewScreen onNavigate={setCurrentScreen} />,
    'success': <SuccessScreen onNavigate={setCurrentScreen} />,
  };

  return (
    <div className="flex h-screen bg-background">
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {(!isMobile || sidebarOpen) && (
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {screenComponents[currentScreen]}
          </div>
        </main>
      </div>
    </div>
  );
}

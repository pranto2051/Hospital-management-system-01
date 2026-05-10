import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CreditCard, 
  ArrowUpRight, 
  TrendingUp, 
  Search, 
  Download, 
  Clock, 
  Plus, 
  X,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { Invoice, InvoiceStatus, Payment, Expense, Patient } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ExpenseForm } from '../components/ExpenseForm';
import { PaymentRecordForm } from '../components/PaymentRecordForm';

// Local Mock Storage
let mockInvoices: Invoice[] = [
  { id: 'inv-1', patientId: 'p-1', amount: 1500, status: InvoiceStatus.PAID, dueDate: new Date('2026-06-01').getTime(), tenantId: 'MediCore Central', createdAt: Date.now(), items: [] },
  { id: 'inv-2', patientId: 'p-2', amount: 850, status: InvoiceStatus.UNPAID, dueDate: new Date('2026-06-05').getTime(), tenantId: 'MediCore Central', createdAt: Date.now(), items: [] }
];

let mockExpenses: Expense[] = [
  { id: 'exp-1', category: 'SUPPLIES', description: 'Medical Kits', amount: 450, date: new Date('2026-05-01').getTime(), recordedBy: 'u-1', recordedByName: 'Admin User', tenantId: 'MediCore Central' }
];

import { fetchWithFallback, saveToDatabase } from '../services/api';

export const Billing = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'INVOICES' | 'EXPENSES'>('INVOICES');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', user?.tenantId],
    queryFn: async () => {
      if (!user?.tenantId) return [];
      return fetchWithFallback('invoices', mockInvoices, user.tenantId);
    },
    enabled: !!user?.tenantId
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', user?.tenantId],
    queryFn: async () => {
      if (!user?.tenantId) return [];
      return fetchWithFallback('expenses', mockExpenses, user.tenantId);
    },
    enabled: !!user?.tenantId
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', user?.tenantId],
    queryFn: async () => {
      return fetchWithFallback('patients', [], user.tenantId);
    }
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!user?.tenantId) return;
      
      const newExpense: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        ...values,
        recordedBy: user.uid,
        recordedByName: user.name,
        tenantId: user.tenantId
      };
      
      await saveToDatabase('expenses', newExpense);
      mockExpenses.unshift(newExpense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsExpenseModalOpen(false);
    }
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!user?.tenantId || !selectedInvoice) return;
      
      // Mock update
      const idx = mockInvoices.findIndex(inv => inv.id === selectedInvoice.id);
      if (idx !== -1) {
        mockInvoices[idx].status = InvoiceStatus.PAID;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setSelectedInvoice(null);
    }
  });

  // Calculate Totals
  const totalRevenue = (invoices || [])
    .filter(inv => inv.status === InvoiceStatus.PAID)
    .reduce((acc, inv) => acc + inv.amount, 0);

  const pendingRevenue = (invoices || [])
    .filter(inv => inv.status !== InvoiceStatus.PAID)
    .reduce((acc, inv) => acc + inv.amount, 0);

  const totalExpenses = (expenses || [])
    .reduce((acc, exp) => acc + exp.amount, 0);

  const filteredInvoices = (invoices || []).filter(inv => {
    const patientName = patients?.find(p => p.id === inv.patientId)?.name || 'Unknown Patient';
    return inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           patientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Finance & Accounting</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Institutional Ledger Control — {user?.tenantId}</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'EXPENSES' && (
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              LOG EXPENSE
            </button>
          )}
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            FINANCIAL REPORT
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('INVOICES')}
          className={cn(
            "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
            activeTab === 'INVOICES' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Invoices & Revenue
        </button>
        <button
          onClick={() => setActiveTab('EXPENSES')}
          className={cn(
            "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
            activeTab === 'EXPENSES' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Expense Tracking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="card p-6 bg-gradient-to-br from-white to-emerald-50/30 border-l-4 border-emerald-500">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Revenue (MTD)</span>
               <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black mt-2 text-slate-900">${totalRevenue.toLocaleString()}</p>
            <p className="text-[9px] text-slate-400 mt-2 font-medium uppercase">Confirmed Collected Funds</p>
         </div>
         <div className="card p-6 bg-gradient-to-br from-white to-blue-50/30 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accounts Receivable</span>
               <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black mt-2 text-slate-900">${pendingRevenue.toLocaleString()}</p>
            <p className="text-[9px] text-slate-400 mt-2 font-medium uppercase">Unpaid or Partial Invoices</p>
         </div>
         <div className="card p-6 bg-gradient-to-br from-white to-rose-50/30 border-l-4 border-rose-500">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Expenses</span>
               <ArrowUpRight className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black mt-2 text-slate-900">${totalExpenses.toLocaleString()}</p>
            <p className="text-[9px] text-slate-400 mt-2 font-medium uppercase">Operating Costs (MTD)</p>
         </div>
      </div>

      {activeTab === 'INVOICES' ? (
        <div className="card border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500">Invoice Ledger</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">Tracking all patient obligations</p>
            </div>
            <div className="flex gap-4">
               <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search invoice or patient..." 
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all w-64 shadow-sm" 
                  />
               </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Financials</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const patient = patients?.find(p => p.id === inv.patientId);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-blue-500 transition-colors">#{inv.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                            {patient?.name.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 leading-none">{patient?.name || 'Unknown Patient'}</p>
                            <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Registered Entity</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-slate-900">${inv.amount.toLocaleString()}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Gross total</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-bold text-slate-600">{new Date(inv.dueDate).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest",
                          inv.status === InvoiceStatus.PAID ? "bg-emerald-100 text-emerald-700" :
                          inv.status === InvoiceStatus.PARTIAL ? "bg-amber-100 text-amber-700" :
                          "bg-rose-100 text-rose-700"
                        )}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                           {inv.status !== InvoiceStatus.PAID && (
                             <button 
                               onClick={() => setSelectedInvoice(inv)}
                               className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-sm"
                             >
                               Pay
                             </button>
                           )}
                           <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100">
                             <Download className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500">Operation Expenses</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">Tracking institutional outflows</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                  <th className="px-6 py-4">Expense ID</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Recorded By</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(expenses || []).map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-mono font-bold text-slate-400">#{exp.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase tracking-tight">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-slate-700">{exp.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-rose-600">-${exp.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase">
                         <div className="w-1 h-1 rounded-full bg-slate-300" />
                         {exp.recordedByName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-400">{new Date(exp.date).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpenseModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                   <h3 className="font-bold text-lg text-slate-800">Record Facility Outflow</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Expense Ledger</p>
                </div>
                <button 
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors font-bold text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <ExpenseForm 
                  onSubmit={async (values) => {
                    await addExpenseMutation.mutateAsync(values);
                  }}
                  onCancel={() => setIsExpenseModalOpen(false)}
                  isSubmitting={addExpenseMutation.isPending}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoice(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                   <h3 className="font-bold text-lg text-slate-800">Record Payment</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Invoice Settlement Portal</p>
                </div>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 hover:bg-white rounded-full transition-colors font-bold text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <PaymentRecordForm 
                  invoiceId={selectedInvoice.id}
                  totalAmount={selectedInvoice.amount}
                  remainingAmount={selectedInvoice.amount} // Simplify: assuming 0 paid for now, real app would sum payments
                  onSubmit={async (values) => {
                    await recordPaymentMutation.mutateAsync(values);
                  }}
                  onCancel={() => setSelectedInvoice(null)}
                  isSubmitting={recordPaymentMutation.isPending}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

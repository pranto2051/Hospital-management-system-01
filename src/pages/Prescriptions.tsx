import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Plus, 
  Search, 
  Lock, 
  ShieldCheck, 
  Clock, 
  Download,
  Loader2,
  X,
  Stethoscope,
  Pill
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { Prescription, PrescriptionStatus, InventoryItem, Patient } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { PrescriptionForm } from '../components/PrescriptionForm';
import { fetchWithFallback, saveToDatabase } from '../services/api';

export const Prescriptions = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchCategory, setSearchCategory] = React.useState<'NAME' | 'ID' | 'PHONE' | 'AGE' | 'BLOOD'>('NAME');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions', user?.tenantId],
    queryFn: async () => {
      return fetchWithFallback<Prescription>('prescriptions', [], user?.tenantId);
    },
    enabled: !!user?.tenantId
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', user?.tenantId],
    queryFn: async () => {
      return fetchWithFallback<Patient>('patients', [], user?.tenantId);
    },
    enabled: !!user?.tenantId
  });

  const addPrescriptionMutation = useMutation({
    mutationFn: async (values: any) => {
      const newRx: Prescription = {
        id: `rx-${Date.now()}`,
        ...values,
        date: Date.now(),
        createdAt: Date.now(),
        status: PrescriptionStatus.ACTIVE,
        tenantId: user?.tenantId || ''
      };
      return saveToDatabase('prescriptions', newRx);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      setIsModalOpen(false);
    }
  });

  const fulfillPrescriptionMutation = useMutation({
    mutationFn: async (rx: Prescription) => {
      const updatedRx = { ...rx, status: PrescriptionStatus.COMPLETED };
      return saveToDatabase('prescriptions', updatedRx);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    }
  });

  const filteredRX = (prescriptions || []).filter(rx => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    switch (searchCategory) {
      case 'NAME':
        return rx.patientName.toLowerCase().includes(term);
      case 'ID':
        return rx.id.toLowerCase().includes(term);
      case 'PHONE':
        return rx.patientPhone?.toLowerCase().includes(term) || false;
      case 'AGE':
        return rx.patientAge?.toLowerCase().includes(term) || false;
      case 'BLOOD':
        return rx.patientBloodGroup?.toLowerCase().includes(term) || false;
      default:
        return true;
    }
  });

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase flex items-center gap-2">
             <Pill className="w-5 h-5 text-blue-600" />
             Medication Fulfillment Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Prescription Issuance & Pharmacy Logistics Integration</p>
        </div>
        {user?.role !== 'PATIENT' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            NEW PRESCRIPTION
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-3 flex gap-3 items-center bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-1 px-2 border-r border-slate-100">
               <select 
                 value={searchCategory}
                 onChange={(e) => setSearchCategory(e.target.value as any)}
                 className="bg-slate-50 px-2 py-1.5 rounded-lg text-[9px] font-black text-blue-600 outline-none cursor-pointer uppercase tracking-widest border border-slate-100"
               >
                 <option value="NAME">NAME</option>
                 <option value="ID">RX ID</option>
                 <option value="PHONE">PHONE</option>
                 <option value="AGE">AGE</option>
                 <option value="BLOOD">BLOOD</option>
               </select>
            </div>
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder={`Search by ${searchCategory.toLowerCase()}...`} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-slate-100 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="card overflow-hidden bg-white border border-slate-100 shadow-sm">
             <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Clinical Order Stream</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{filteredRX.length} Active Orders</span>
             </div>
             <div className="divide-y divide-slate-100">
               {filteredRX.map((rx) => (
                 <div key={rx.id} className="p-4 hover:bg-slate-50/50 transition-colors group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                          <FileText className="w-5 h-5" />
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">#{rx.id.slice(0, 8)}</span>
                             <span className={cn(
                               "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                               rx.status === PrescriptionStatus.ACTIVE ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                             )}>{rx.status}</span>
                          </div>
                          <h4 className="font-black text-sm text-slate-800 mt-1 flex items-center gap-2">
                            {rx.patientName}
                            <span className="text-[9px] font-mono font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                              {rx.patientId || 'N/A'}
                            </span>
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                             {rx.patientAge && <span className="text-[9px] font-bold text-slate-500 px-1 bg-slate-100 rounded">{rx.patientAge}yrs</span>}
                             {rx.patientBloodGroup && <span className="text-[9px] font-bold text-rose-500 px-1 bg-rose-50 rounded border border-rose-100">{rx.patientBloodGroup}</span>}
                             {rx.patientPhone && <span className="text-[9px] text-slate-400">{rx.patientPhone}</span>}
                             <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                                <Stethoscope className="w-3 h-3" />
                                Auth: {rx.doctorName}
                             </span>
                          </div>
                          {rx.diagnosis && (
                            <p className="text-[10px] text-blue-600 font-medium mt-1 italic line-clamp-1">
                              Dx: {rx.diagnosis}
                            </p>
                          )}
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(rx.createdAt).toLocaleDateString()}</p>
                       <div className="flex gap-2">
                          {rx.status === PrescriptionStatus.ACTIVE && (user?.role === 'STAFF' || user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                            <button 
                              onClick={() => fulfillPrescriptionMutation.mutate(rx)}
                              disabled={fulfillPrescriptionMutation.isPending}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                            >
                              {fulfillPrescriptionMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Fulfill'}
                            </button>
                          )}
                          <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100">
                             <Download className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
               {filteredRX.length === 0 && (
                 <div className="p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No matching orders in repository</p>
                 </div>
               )}
             </div>
          </div>
        </div>

          <div className="space-y-6">
            <div className="card p-6 bg-white border border-slate-100 shadow-sm">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Pharmacy Queue
               </h3>
               <div className="space-y-6">
                  {[
                    { label: 'Pending Dispensing', val: prescriptions?.filter(r => r.status === PrescriptionStatus.ACTIVE).length || 0, color: 'bg-amber-500' },
                    { label: 'Completed Today', val: prescriptions?.filter(r => r.status === PrescriptionStatus.COMPLETED).length || 0, color: 'bg-emerald-500' },
                  ].map((stat, i) => (
                    <div key={i}>
                       <div className="flex justify-between text-[10px] font-black mb-2">
                          <span className="text-slate-400 uppercase tracking-widest">{stat.label}</span>
                          <span className="text-slate-900">{stat.val}</span>
                       </div>
                       <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all duration-1000", stat.color)} style={{ width: `${Math.min(100, (stat.val / 20) * 100)}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 custom-scrollbar"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                   <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">Issue Medical Order</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized Physician Prescription Portal</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                  <span className="p-1 px-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4 inline-block">Order Configuration</span>
                  <PrescriptionForm 
                    patients={patients || []}
                    onSubmit={async (values) => {
                      await addPrescriptionMutation.mutateAsync(values);
                    }}
                    onCancel={() => setIsModalOpen(false)}
                    isSubmitting={addPrescriptionMutation.isPending}
                  />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

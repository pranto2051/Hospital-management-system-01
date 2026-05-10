import React from 'react';
import { 
  FlaskConical, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Download,
  Microscope,
  Database,
  Activity,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LabReport, LabReportStatus, Patient } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


const labRequestSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  testName: z.string().min(2, 'Test name is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  priority: z.enum(['ROUTINE', 'URGENT', 'STAT']),
});

type LabRequestValues = z.infer<typeof labRequestSchema>;

import { fetchWithFallback, saveToDatabase } from '../services/api';

export const LabReports = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState<LabReport | null>(null);
  const [resultInput, setResultInput] = React.useState('');

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['lab_reports', user?.tenantId, user?.uid, user?.role],
    queryFn: async () => {
      if (!user?.tenantId) return [];
      
      return fetchWithFallback<LabReport>('lab_reports', [], user.tenantId, (q) => {
        if (user.role === 'PATIENT') return q.eq('patientId', user.uid);
        return q;
      });
    },
    enabled: !!user?.tenantId
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', user?.tenantId],
    queryFn: async () => {
      if (!user?.tenantId) return [];
      return fetchWithFallback<Patient>('patients', [], user.tenantId);
    },
    enabled: !!user?.tenantId
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LabRequestValues>({
    resolver: zodResolver(labRequestSchema),
    defaultValues: { priority: 'ROUTINE' }
  });

  const requestMutation = useMutation({
    mutationFn: async (values: LabRequestValues) => {
      if (!user?.tenantId) throw new Error('Tenant missing');
      
      const newReport: LabReport = {
        id: Math.random().toString(36).substr(2, 9),
        patientId: values.patientId,
        patientName: values.patientName,
        testName: values.testName,
        specialization: values.specialization,
        status: LabReportStatus.PENDING,
        tenantId: user.tenantId,
        date: new Date().toISOString(),
        technicianId: user.uid,
        technicianName: user.name,
        createdAt: Date.now()
      };

      return saveToDatabase('lab_reports', newReport);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab_reports'] });
      setIsModalOpen(false);
    }
  });

  const updateResultMutation = useMutation({
    mutationFn: async () => {
      if (!selectedReport) return;
      
      const updatedReport = {
        ...selectedReport,
        result: resultInput,
        status: LabReportStatus.COMPLETED
      };

      await saveToDatabase('lab_reports', updatedReport);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab_reports'] });
      setSelectedReport(null);
      setResultInput('');
    }
  });

  const filteredReports = reports.filter(r => 
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Pending', count: reports.filter(r => r.status === LabReportStatus.PENDING).length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Analyzing', count: reports.filter(r => r.status === LabReportStatus.IN_PROGRESS).length, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Completed', count: reports.filter(r => r.status === LabReportStatus.COMPLETED).length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Logs', count: reports.length, icon: Database, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-600" />
            Diagnostic Analysis Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Bio-Clinical Stream & Diagnostic Reconciliation</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
           >
              <Microscope className="w-3.5 h-3.5" />
              NEW INVESTIGATION
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="card p-4 flex items-center gap-4 bg-white border border-slate-100 shadow-sm">
             <div className={cn("p-2.5 rounded-xl", stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 mt-0.5 font-mono">{stat.count}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden bg-white border border-slate-100">
        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by patient or test signature..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left order-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/10">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Reference</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Signature</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Entity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center">
                         <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-all" />
                      </div>
                      <p className="text-[10px] font-mono font-black text-slate-400 group-hover:text-blue-500 transition-colors uppercase">#{report.id.slice(0, 8)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                       <p className="text-xs font-black text-slate-800">{report.testName}</p>
                       <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter mt-1">{report.specialization}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-black text-slate-700 leading-none">{report.patientName}</p>
                    <p className="text-[9px] text-blue-600 font-bold uppercase mt-1">{report.patientId}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Reg: {new Date(report.date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                      report.status === LabReportStatus.COMPLETED ? "bg-emerald-100 text-emerald-700" :
                      report.status === LabReportStatus.PENDING ? "bg-amber-100 text-amber-700" :
                      report.status === LabReportStatus.IN_PROGRESS ? "bg-blue-100 text-blue-700" :
                      report.status === LabReportStatus.REVIEWED ? "bg-purple-100 text-purple-700" :
                      "bg-slate-100 text-slate-500"
                    )}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       {report.status === LabReportStatus.PENDING && (user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') && (
                          <button 
                            onClick={() => setSelectedReport(report)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest"
                          >
                             LOG RESULT
                          </button>
                       )}
                       <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100">
                          <Download className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">Bio-Diagnostics Request</h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit((val) => requestMutation.mutate(val))} className="p-6 space-y-4">
                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select from Registry (Optional)</label>
                        <select 
                          onChange={(e) => {
                            const p = patients.find(p => p.id === e.target.value);
                            if (p) {
                              setValue('patientId', p.id);
                              setValue('patientName', p.name);
                            }
                          }}
                          className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-black text-blue-700"
                        >
                           <option key="default-patient" value="">-- Choose registered patient --</option>
                           {patients.map(p => (
                             <option key={p.id} value={p.id} className="font-mono">
                               [{p.id}] {p.name}
                             </option>
                           ))}
                        </select>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patient ID</label>
                           <input 
                             {...register('patientId')}
                             placeholder="e.g. PID-1001"
                             className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                           />
                           {errors.patientId && <p className="text-[9px] text-rose-500 font-bold">{errors.patientId.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patient Name</label>
                           <input 
                             {...register('patientName')}
                             placeholder="Enter full name"
                             className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                           />
                           {errors.patientName && <p className="text-[9px] text-rose-500 font-bold">{errors.patientName.message}</p>}
                        </div>
                     </div>
                  </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Test Name</label>
                    <input {...register('testName')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. CBC, Liver Function" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specialization</label>
                    <input {...register('specialization')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Hematology" />
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest">Discard</button>
                    <button type="submit" disabled={requestMutation.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                       {requestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Dispatch Request'}
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Result Entry Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedReport(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                    <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">Record Diagnostic Result</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Test: {selectedReport.testName}</p>
                 </div>
                 <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all rounded-xl">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Findings & Clinical Values</label>
                    <textarea 
                      value={resultInput}
                      onChange={(e) => setResultInput(e.target.value)}
                      rows={6}
                      placeholder="Enter lab findings, reference ranges, and technician observations..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none shadow-inner"
                    />
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setSelectedReport(null)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Cancel</button>
                    <button 
                      onClick={() => updateResultMutation.mutate()}
                      disabled={updateResultMutation.isPending || !resultInput}
                      className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50 transition-all"
                    >
                       {updateResultMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalize Analysis'}
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { Appointment, AppointmentStatus, Patient, Doctor } from '../types';
import { Calendar, Plus, Search, Clock, MoreVertical, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AppointmentForm } from '../components/AppointmentForm';
import { fetchWithFallback, saveToDatabase } from '../services/api';

export const Appointments = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'list' | 'timeline'>('list');
  const [queueFilter, setQueueFilter] = React.useState<'Today' | 'Tomorrow' | 'This Week'>('Today');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);

  const { data: doctors } = useQuery({
    queryKey: ['doctors', user?.tenantId],
    queryFn: async () => {
      return fetchWithFallback<Doctor>('doctors', [], user?.tenantId);
    }
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', user?.tenantId],
    queryFn: async () => {
      return fetchWithFallback<Patient>('patients', [], user?.tenantId);
    }
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', user?.tenantId, user?.uid, user?.role],
    queryFn: async () => {
      if (!user?.tenantId) return [];

      return fetchWithFallback<Appointment>('appointments', [], user.tenantId, (q) => {
        if (user.role === 'DOCTOR') return q.eq('doctorId', user.uid);
        if (user.role === 'PATIENT') return q.eq('patientId', user.uid);
        return q;
      });
    },
    enabled: !!user?.tenantId,
    staleTime: 1000
  });

  const counts = React.useMemo(() => {
    if (!appointments) return { confirmed: 0, pending: 0, completed: 0, cancelled: 0 };
    return {
      confirmed: appointments.filter(a => (a.status === AppointmentStatus.CONFIRMED || a.status === AppointmentStatus.PENDING)).length,
      pending: appointments.filter(a => a.status === AppointmentStatus.PENDING).length,
      completed: appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length,
      cancelled: appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length
    };
  }, [appointments]);

  const filteredAppointments = React.useMemo(() => {
    if (!appointments) return [];
    
    let filtered = [...appointments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        (a.patientName || '').toLowerCase().includes(query) || 
        a.id.toLowerCase().includes(query)
      );
    }

    const now = new Date();
    
    const getLocalDateString = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const today = getLocalDateString(now);
    
    if (queueFilter === 'Today') {
      filtered = filtered.filter(a => a.date === today);
    } else if (queueFilter === 'Tomorrow') {
      const tomorrowDate = new Date(now);
      tomorrowDate.setDate(now.getDate() + 1);
      const tomorrowStr = getLocalDateString(tomorrowDate);
      filtered = filtered.filter(a => a.date === tomorrowStr);
    } else if (queueFilter === 'This Week') {
      const nextWeekDate = new Date(now);
      nextWeekDate.setDate(now.getDate() + 7);
      const nextWeekStr = getLocalDateString(nextWeekDate);
      filtered = filtered.filter(a => a.date >= today && a.date <= nextWeekStr);
    }

    return filtered.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
    });
  }, [appointments, queueFilter, searchQuery]);

  const bookMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!user?.tenantId) throw new Error('Tenant missing');
      
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        patientName: values.patientName,
        patientAge: values.patientAge,
        doctorId: values.doctorId,
        date: values.date,
        time: values.time,
        reason: values.reason,
        notes: values.notes,
        status: AppointmentStatus.CONFIRMED,
        tenantId: user.tenantId,
        createdAt: Date.now()
      };
      
      return saveToDatabase('appointments', newAppointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsAddModalOpen(false);
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const record = appointments?.find(a => a.id === id);
      if (!record) throw new Error('Appointment not found');
      
      const updated = { ...record, status: AppointmentStatus.CANCELLED };
      return saveToDatabase('appointments', updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setMenuOpenId(null);
    }
  });

  // Remove the old counts query as we're deriving it now

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Appointment Hub</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Live Scheduling & Queue Management</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'timeline' : 'list')}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm",
              viewMode === 'timeline' ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
           >
            <Clock className="w-3.5 h-3.5" />
            {viewMode === 'timeline' ? 'LIST VIEW' : 'TIMELINE VIEW'}
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            BOOK NEW
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="card p-3 border-l-4 border-blue-600">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Confirmed</p>
          <p className="text-lg font-bold mt-1">{counts?.confirmed || 0}</p>
        </div>
        <div className="card p-3 border-l-4 border-amber-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pending</p>
          <p className="text-lg font-bold mt-1">{counts?.pending || 0}</p>
        </div>
        <div className="card p-3 border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Completed</p>
          <p className="text-lg font-bold mt-1">{counts?.completed || 0}</p>
        </div>
        <div className="card p-3 border-l-4 border-rose-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Cancelled</p>
          <p className="text-lg font-bold mt-1">{counts?.cancelled || 0}</p>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-4">
               <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Scheduled Queue</h3>
               <div className="flex gap-2">
                  {(['Today', 'Tomorrow', 'This Week'] as const).map(filter => (
                    <button 
                      key={filter} 
                      onClick={() => setQueueFilter(filter)}
                      className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded border transition-all uppercase tracking-wider leading-[1]",
                        filter === queueFilter ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400 hover:border-blue-200"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
               </div>
            </div>
            <div className="relative group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
              <input 
                type="text" 
                placeholder="Quick find..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded text-[10px] focus:ring-1 focus:ring-blue-500/20 outline-none" 
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-4 py-2 border-b-2 border-slate-200">Ref ID</th>
                  <th className="px-4 py-2 border-b-2 border-slate-200">Patient</th>
                  <th className="px-4 py-2 border-b-2 border-slate-200">Staff Assigned</th>
                  <th className="px-4 py-2 border-b-2 border-slate-200">Schedule</th>
                  <th className="px-4 py-2 border-b-2 border-slate-200">Status</th>
                  <th className="px-4 py-2 border-b-2 border-slate-200"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length > 0 ? filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3 text-[10px] font-mono text-slate-400">#{app.id.slice(0, 6)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 overflow-hidden border border-slate-200 uppercase">
                          {app.patientName?.[0] || 'P'}
                        </div>
                        <div>
                           <span className="text-xs font-bold text-slate-700 block leading-none">{app.patientName}</span>
                           <div className="flex items-center gap-2 mt-1">
                             <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter block">ID: {patients?.find(p => p.name === app.patientName)?.id || 'REGULAR'}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter block">{app.patientAge} Yrs</span>
                           </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                       <span className="text-xs text-slate-600 font-bold uppercase tracking-tight">
                         {doctors?.find(d => d.userId === app.doctorId)?.name || 'Processing...'}
                       </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                         <span className="text-[11px] font-bold text-slate-700">{app.date}</span>
                         <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">{app.time}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                         <div className={cn(
                           "w-1.5 h-1.5 rounded-full",
                           app.status === 'CONFIRMED' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                           app.status === 'PENDING' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" :
                           "bg-slate-400"
                         )} />
                         <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{app.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {app.status !== 'CANCELLED' ? (
                          <>
                             <div className="relative">
                              <button 
                                onClick={() => setMenuOpenId(menuOpenId === app.id ? null : app.id)}
                                className={cn(
                                  "p-1.5 rounded-lg transition-all",
                                  menuOpenId === app.id ? "bg-blue-50 text-blue-800" : "text-slate-300 hover:text-slate-600 hover:bg-slate-50"
                                )}
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              <AnimatePresence>
                                {menuOpenId === app.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.95, x: 10 }}
                                      animate={{ opacity: 1, scale: 1, x: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, x: 10 }}
                                      className="absolute right-full mr-2 top-0 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 overflow-hidden"
                                    >
                                      <button className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest text-left">
                                         Patient Profile
                                      </button>
                                      <button className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest text-left">
                                         Reschedule
                                      </button>
                                      <div className="h-px bg-slate-100 my-1" />
                                      <button 
                                        onClick={() => {
                                          if (confirm('Permanently cancel this appointment?')) {
                                            cancelMutation.mutate(app.id);
                                          }
                                        }}
                                        disabled={cancelMutation.isPending}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black text-rose-600 hover:bg-rose-50 transition-colors uppercase tracking-widest text-left disabled:opacity-50"
                                      >
                                         {cancelMutation.isPending ? 'Processing...' : '⚠️ Cancel Appointment'}
                                      </button>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </>
                        ) : (
                          <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest px-2 py-1 bg-rose-50 rounded">Cancelled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      <Calendar className="w-10 h-10 mx-auto mb-4 opacity-10" />
                      <p className="text-xs font-bold uppercase tracking-widest">No Active Scheduling Hits</p>
                      <p className="text-[10px] font-mono mt-1 opacity-60">Try adjusting filters or wait for sync...</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-6 bg-slate-50/50 overflow-x-auto min-w-full">
           <div className="min-w-[800px]">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Operational Pulse — Timeline</h3>
                <div className="flex flex-1 justify-around ml-32">
                   {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(h => (
                     <span key={h} className="text-[9px] font-mono font-bold text-slate-300 w-full text-center border-l border-slate-100">{h}:00</span>
                   ))}
                </div>
             </div>
             
             <div className="space-y-4">
                {doctors?.map(doc => {
                  const docAppointments = filteredAppointments.filter(a => a.doctorId === doc.userId);
                  return (
                    <div key={doc.id} className="relative h-14 flex items-center group">
                      <div className="absolute left-0 w-32 pr-4 text-right border-r-2 border-slate-200 z-10 flex flex-col justify-center h-full">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight block truncate leading-none">{doc.name}</span>
                         <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest mt-1">{doc.specialization}</span>
                      </div>
                      <div className="ml-32 flex-1 relative h-10 bg-white rounded-xl border border-slate-100 shadow-sm group-hover:bg-slate-50 transition-colors">
                         {/* Time Grid Lines */}
                         <div className="absolute inset-0 flex justify-around pointer-events-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
                              <div key={i} className="h-full border-l border-slate-50" />
                            ))}
                         </div>
                         
                         {docAppointments.map(app => {
                           const [hours, minutes] = app.time.split(':').map(Number);
                           // Normalized position (8 AM to 8 PM range = 12 hours)
                           const totalRangeHours = 12;
                           const startHour = 8;
                           const left = ((hours - startHour) * 60 + minutes) / (totalRangeHours * 60) * 100;
                           
                           return (
                             <motion.div 
                               key={app.id}
                               initial={{ scale: 0.8, opacity: 0 }}
                               animate={{ scale: 1, opacity: 1 }}
                               className="absolute h-8 top-1 min-w-[80px] bg-white border border-blue-100 rounded-lg shadow-sm flex flex-col justify-center px-2 overflow-hidden z-20 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group/item"
                               style={{ left: `${left}%` }}
                             >
                               <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                               <span className="text-[8px] font-black text-slate-800 uppercase truncate leading-none">{app.patientName}</span>
                               <span className="text-[7px] font-bold text-blue-600 mt-0.5">{app.time}</span>
                               
                               <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover/item:opacity-5 transition-opacity" />
                             </motion.div>
                           );
                         })}
                      </div>
                    </div>
                  );
                })}
             </div>
           </div>
        </div>
      )}
      
      {/* Appointment Booking Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                   <h3 className="font-bold text-lg text-slate-800 tracking-tight">Schedule New Consultation</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">MedCore Integrated Scheduler</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6">
                <AppointmentForm 
                  doctors={doctors || []}
                  patients={patients || []}
                  onSubmit={async (values) => {
                    await bookMutation.mutateAsync(values);
                  }}
                  onCancel={() => setIsAddModalOpen(false)}
                  isSubmitting={bookMutation.isPending}
                  defaultDoctorId={user?.role === 'DOCTOR' ? user.uid : undefined}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


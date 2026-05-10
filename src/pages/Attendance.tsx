import React from 'react';
import { Clock, LogIn, LogOut, CheckCircle, Calendar, Loader2, Search, Filter, UserCheck, UserMinus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Attendance } from '../types';
import { cn } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithFallback, saveToDatabase } from '../services/api';
import { mockAttendance } from '../services/dataStorage';

export const AttendancePage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  const today = new Date().toISOString().split('T')[0];

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['attendance', user?.tenantId],
    queryFn: async () => {
      return fetchWithFallback('attendance', mockAttendance, user?.tenantId);
    },
    enabled: !!user?.tenantId
  });

  const todayRecord = attendance.find(r => r.date === today && r.userId === user?.uid);

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const now = new Date();
      const checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      
      // Determine if late (e.g., after 9:00 AM)
      const hours = now.getHours();
      const status = hours >= 9 && now.getMinutes() > 0 ? 'LATE' : 'PRESENT';

      const newRecord: Attendance = {
        id: `att-${Date.now()}`,
        userId: user.uid,
        userName: user.name,
        date: today,
        checkIn: checkInTime,
        status,
        tenantId: user.tenantId
      };

      return saveToDatabase('attendance', newRecord, mockAttendance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: async (id: string) => {
      const record = attendance.find(a => a.id === id);
      if (!record) throw new Error('Record not found');

      const checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      const updatedRecord = { ...record, checkOut: checkOutTime };
      
      return saveToDatabase('attendance', updatedRecord, mockAttendance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    }
  });

  const filteredAttendance = attendance.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSearch = a.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    present: attendance.filter(a => a.date === today && a.status === 'PRESENT').length,
    late: attendance.filter(a => a.date === today && a.status === 'LATE').length,
    onLeave: attendance.filter(a => a.date === today && a.status === 'ON_LEAVE').length,
    totalToday: attendance.filter(a => a.date === today).length
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Attendance Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Presence Monitoring</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Operational status for {user?.tenantId}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-black text-blue-700 uppercase">{stats.present} Present</span>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] font-black text-amber-700 uppercase">{stats.late} Late</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-in Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card h-full flex flex-col justify-center items-center p-8 text-center bg-white border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6 shadow-2xl shadow-slate-900/20">
                <Clock className="w-10 h-10 text-white" />
             </div>
             <h2 className="text-lg font-black text-slate-900 mb-1">Time Control</h2>
             <p className="text-[10px] text-slate-500 mb-8 uppercase tracking-widest font-bold">
               {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </p>
             
             {!todayRecord ? (
                <div className="space-y-4 w-full">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Current Time</p>
                    <p className="text-2xl font-black text-slate-700 font-mono tracking-tighter">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <button 
                    onClick={() => checkInMutation.mutate()}
                    disabled={checkInMutation.isPending}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
                  >
                     {checkInMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                     Punch In
                  </button>
                </div>
             ) : !todayRecord.checkOut ? (
                <div className="space-y-4 w-full">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Punched In At</p>
                    <p className="text-2xl font-black text-blue-700 font-mono tracking-tighter">{todayRecord.checkIn}</p>
                    <p className="text-[9px] font-bold text-blue-500 uppercase mt-2 tracking-widest flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> Shift Active
                    </p>
                  </div>
                  <button 
                    onClick={() => checkOutMutation.mutate(todayRecord.id)}
                    disabled={checkOutMutation.isPending}
                    className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 active:scale-95 disabled:opacity-50"
                  >
                     {checkOutMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                     Punch Out
                  </button>
                </div>
             ) : (
                <div className="w-full space-y-4">
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-black text-emerald-700 text-sm uppercase tracking-widest">Shift Completed</p>
                    <div className="grid grid-cols-2 gap-8 w-full mt-6 pt-6 border-t border-emerald-100">
                      <div>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase">In</p>
                        <p className="text-sm font-black text-emerald-800 font-mono">{todayRecord.checkIn}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase">Out</p>
                        <p className="text-sm font-black text-emerald-800 font-mono">{todayRecord.checkOut}</p>
                      </div>
                    </div>
                  </div>
                </div>
             )}
          </div>
        </div>

        {/* History / Management Table */}
        <div className="lg:col-span-2 space-y-4">
           <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                 <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {['ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(user?.role || '') ? 'Global Attendance Log' : 'Personal Performance'}
                 </h3>
                 <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="Search employee..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>
                    <div className="relative flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2">
                       <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
                       <select
                         value={statusFilter}
                         onChange={(e) => setStatusFilter(e.target.value)}
                         className="bg-transparent text-[10px] font-black text-slate-600 outline-none appearance-none cursor-pointer uppercase tracking-tight focus:ring-0"
                       >
                         <option value="ALL">Status: All</option>
                         <option value="PRESENT">Present</option>
                         <option value="LATE">Late</option>
                         <option value="ON_LEAVE">On Leave</option>
                       </select>
                    </div>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-slate-100 uppercase">
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 tracking-widest">Employee Profile</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 tracking-widest">Date</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 tracking-widest">Punches</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 tracking-widest">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredAttendance.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className={cn(
                                     "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ring-2 ring-white shadow-sm",
                                     record.userId === user?.uid ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                                   )}>
                                      {record.userName.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-700 leading-none">{record.userName}</p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">
                                        ID: {record.userId.slice(0, 8)}
                                      </p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2 py-1 rounded-md text-[10px] font-black font-mono",
                                  record.date === today ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"
                                )}>
                                  {record.date}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                   <div className="flex flex-col">
                                      <span className="text-[8px] font-bold text-slate-400 uppercase">Input</span>
                                      <span className="text-[11px] font-mono font-black text-slate-700">{record.checkIn}</span>
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-[8px] font-bold text-slate-400 uppercase">Output</span>
                                      <span className="text-[11px] font-mono font-black text-slate-700">{record.checkOut || '--:--'}</span>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <span className={cn(
                                   "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                   record.status === 'PRESENT' ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                                   record.status === 'LATE' ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                   record.status === 'ABSENT' ? "bg-rose-100 text-rose-700 border border-rose-200" :
                                   record.status === 'ON_LEAVE' ? "bg-purple-100 text-purple-700 border border-purple-200" :
                                   "bg-slate-100 text-slate-500"
                                )}>
                                   {record.status}
                                </span>
                             </td>
                          </tr>
                       ))}
                       {filteredAttendance.length === 0 && (
                          <tr>
                             <td colSpan={5} className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <UserMinus className="w-8 h-8 text-slate-200" />
                                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No Attendance Logs Synchronized</p>
                                </div>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

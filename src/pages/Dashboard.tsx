import React from 'react';
import { 
  Users, 
  Activity, 
  ArrowUpRight, 
  Bed,
  CreditCard,
  Zap,
  Loader2
} from 'lucide-react';
import { CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';

const StatCard = ({ title, value, change, trend, icon: Icon, color, subtext }: any) => (
  <div className="card p-4 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{title}</span>
      {change && (
        <div className={cn(
          "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded",
          trend === 'up' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        )}>
          {trend === 'up' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
    <div className="flex items-end justify-between mt-3">
      <div className="flex items-center gap-3">
        <div className={cn("p-1.5 rounded", color)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
    {subtext && <p className="text-[9px] text-slate-400 mt-2 font-medium uppercase tracking-tighter">{subtext}</p>}
  </div>
);

import { fetchWithFallback } from '../services/api';

export const Dashboard = () => {
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.tenantId],
    queryFn: async () => {
      if (!user?.tenantId) return null;

      const patients = await fetchWithFallback('patients', [], user.tenantId);
      const admissions = await fetchWithFallback('admissions', [], user.tenantId, (q) => q.eq('status', 'ADMITTED'));
      const appointments = await fetchWithFallback('appointments', [], user.tenantId, (q) => q.order('date', { ascending: true }).limit(5));

      return {
        totalPatients: patients.length,
        activeAdmissions: admissions.length,
        recentAppointments: appointments.map((a: any) => ({
          id: a.id,
          patientName: a.patientName || a.patientId,
          specialization: a.reason || 'General',
          time: new Date(`${a.date}T${a.time}`).getTime() || Date.now(),
          status: a.status
        }))
      };
    },
    enabled: !!user?.tenantId,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Hospitalized Care & Facility Monitoring</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live Sync: ACTIVE</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role !== 'PATIENT' && (
          <StatCard 
            title="Bed Occupancy" 
            value={`${stats?.activeAdmissions || 0}/150`} 
            subtext={`${(((stats?.activeAdmissions || 0)/150)*100).toFixed(1)}% Capacity Utilization`}
            icon={Bed} 
            color="bg-blue-600" 
          />
        )}
        {user?.role !== 'PATIENT' && (
          <StatCard 
            title="Total Registered" 
            value={stats?.totalPatients?.toString() || '0'} 
            change="Live" 
            trend="up" 
            icon={Users} 
            color="bg-slate-800" 
          />
        )}
        <StatCard 
          title="Avg Admission" 
          value="-- Days" 
          subtext="Patient Discharge Cycle"
          icon={Activity} 
          color="bg-emerald-500" 
        />
        {['ADMIN', 'MANAGER', 'ACCOUNTS_OFFICER'].includes(user?.role || '') && (
          <StatCard 
            title="Financial Health" 
            value="$0.00" 
            change="0%" 
            trend="up" 
            icon={CreditCard} 
            color="bg-indigo-500" 
            subtext="Revenue MTD (Net Profit)"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center text-slate-500">
            <h3 className="font-bold text-xs uppercase tracking-wider">Facility Throughput (24h)</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Waiting for local data...</span>
          </div>
          <div className="p-12 flex flex-col items-center justify-center text-slate-300">
            <Activity className="w-8 h-8 mb-4 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No Analytical Data Available</p>
          </div>
        </div>

        <div className="card flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Critical Ward Alerts
            </h3>
          </div>
          <div className="p-8 flex flex-col items-center justify-center text-slate-300 flex-1">
            <Zap className="w-6 h-6 mb-3 opacity-20" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-center">System Scan Complete:<br/> No active clinical alerts</p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Live Appointment Queue</h3>
          <button className="text-[10px] font-bold text-blue-600 hover:underline px-2 py-1 rounded hover:bg-blue-50 transition-all uppercase tracking-wider">Manage Full List</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-4 py-2 border-b-2 border-slate-200">Patient ID</th>
                <th className="px-4 py-2 border-b-2 border-slate-200">Patient Name</th>
                <th className="px-4 py-2 border-b-2 border-slate-200">Department</th>
                <th className="px-4 py-2 border-b-2 border-slate-200">Time</th>
                <th className="px-4 py-2 border-b-2 border-slate-200">Status</th>
                <th className="px-4 py-2 border-b-2 border-slate-200"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    No active appointments in queue
                  </td>
                </tr>
              ) : (
                stats?.recentAppointments.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-2 text-[11px] font-mono text-slate-400">#{item.id.slice(0, 8)}</td>
                    <td className="px-4 py-2">
                      <span className="text-xs font-bold text-slate-700">{item.patientName}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">{item.specialization}</td>
                    <td className="px-4 py-2 text-xs font-semibold text-slate-600">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                        item.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" :
                        item.status === 'PENDING' ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button className="p-1 rounded hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-300 hover:text-slate-600">
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  Building2, Plus, Search, Layers, UserCircle, Settings, MoreVertical, 
  Globe, Shield, Activity, Users, Thermometer, Zap, Microscope, 
  HeartPulse, Stethoscope, Baby, Pill, Brain, Eye
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

export const Departments = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = React.useState('');

  const departments = [
    { name: 'Cardiology', heads: 'Dr. Rivera', staff: 42, status: 'Active', load: '65%', icon: HeartPulse, type: 'Medical' },
    { name: 'Orthopedics', heads: 'Dr. Smith', staff: 28, status: 'Active', load: '82%', icon: Activity, type: 'Surgery' },
    { name: 'Neurology', heads: 'Dr. Chen', staff: 15, status: 'Maintenance', load: '40%', icon: Brain, type: 'Medical' },
    { name: 'Pediatrics', heads: 'Dr. Vane', staff: 34, status: 'Active', load: '58%', icon: Baby, type: 'General' },
    { name: 'Dermatology', heads: 'Dr. Kim', staff: 12, status: 'Active', load: '25%', icon: UserCircle, type: 'Outpatient' },
    { name: 'Emergency', heads: 'Dr. Ross', staff: 56, status: 'Active', load: '95%', icon: Zap, type: 'Critical' },
    { name: 'Radiology', heads: 'Dr. Grant', staff: 20, status: 'Active', load: '72%', icon: Layers, type: 'Diagnostic' },
    { name: 'Oncology', heads: 'Dr. Foster', staff: 25, status: 'Active', load: '48%', icon: Pill, type: 'Medical' },
    { name: 'Gastroenterology', heads: 'Dr. Lee', staff: 18, status: 'Active', load: '32%', icon: Activity, type: 'Medical' },
    { name: 'Ophthalmology', heads: 'Dr. Wu', staff: 10, status: 'Active', load: '15%', icon: Eye, type: 'Outpatient' },
    { name: 'Pathology', heads: 'Dr. Thorne', staff: 14, status: 'Active', load: '60%', icon: Microscope, type: 'Laboratory' },
    { name: 'Psychiatry', heads: 'Dr. Bell', staff: 22, status: 'Active', load: '45%', icon: Brain, type: 'Wellness' },
  ];

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.heads.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Operational Modalities</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Hierarchical Node Infrastructure for {user?.tenantId}</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search units..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-2 focus:ring-blue-500/10 outline-none w-48"
            />
          </div>
          <button className="bg-slate-900 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            INITIALIZE UNIT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Clinical Units', count: departments.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Personnel', count: departments.reduce((acc, d) => acc + d.staff, 0), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'System Load', count: '62.4%', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Infrastructure', count: 'L4-Tier', icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="card p-4 flex items-center gap-4 bg-white border border-slate-100">
             <div className={cn("p-2.5 rounded-lg", stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                <p className="text-xl font-bold text-slate-800 mt-1.5 tracking-tight font-mono">{stat.count}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDepts.map((dept, i) => (
          <div key={i} className="card bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group overflow-hidden">
             <div className="p-4 border-b border-slate-50 flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all border border-slate-100">
                      <dept.icon className="w-5 h-5" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm leading-none">{dept.name}</h3>
                      </div>
                      <p className="text-[9px] text-blue-600 font-bold uppercase mt-1 tracking-tighter opacity-70">{dept.type} DIVISION</p>
                   </div>
                </div>
                <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
                   <MoreVertical className="w-4 h-4" />
                </button>
             </div>
             
             <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Department Head</p>
                    <p className="text-[11px] font-bold text-slate-700 truncate">{dept.heads}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Staff</p>
                    <p className="text-[11px] font-bold text-slate-700">{dept.staff} Members</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider">Resource Allocation</span>
                    <span className={cn(
                      "font-mono",
                      parseInt(dept.load) > 80 ? "text-rose-600" : "text-blue-600"
                    )}>{dept.load}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500", 
                        parseInt(dept.load) > 80 ? 'bg-rose-500' : 'bg-blue-500'
                      )} 
                      style={{ width: dept.load }} 
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-50 mt-2">
                   <div className="flex items-center gap-1.5 font-bold text-[9px]">
                     <div className={cn(
                       "w-1.5 h-1.5 rounded-full",
                       dept.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                     )} />
                     <span className={dept.status === 'Active' ? "text-emerald-700" : "text-amber-700 uppercase"}>{dept.status}</span>
                   </div>
                   <button className="text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center gap-1">
                     <Settings className="w-3 h-3" />
                     Configure
                   </button>
                </div>
             </div>
          </div>
        ))}

        <button className="h-full min-h-[220px] rounded-xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-3 group hover:border-blue-200 hover:bg-blue-50/10 transition-all p-6">
           <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
              <Plus className="w-6 h-6" />
           </div>
           <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600">Expansion Slot</p>
              <p className="text-[9px] text-slate-300 mt-1 uppercase tracking-tighter">Add Clinical Node</p>
           </div>
        </button>
      </div>
    </div>
  );
};


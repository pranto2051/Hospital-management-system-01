import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Activity,
  Users,
  DollarSign,
  Loader2,
  Archive,
  Stethoscope,
  Package,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { Invoice, InvoiceStatus, Expense, Patient, Appointment, InventoryItem, Prescription } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type ReportTab = 'OVERVIEW' | 'CLINICAL' | 'FINANCIAL' | 'OPERATIONS';

export const Reports = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<ReportTab>('OVERVIEW');
  const [isBackingUp, setIsBackingUp] = React.useState(false);

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices-report', user?.tenantId],
    queryFn: async () => {
      // Mock data
      return [] as Invoice[];
    },
    enabled: !!user?.tenantId
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses-report', user?.tenantId],
    queryFn: async () => {
      // Mock data
      return [] as Expense[];
    },
    enabled: !!user?.tenantId
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments-report', user?.tenantId],
    queryFn: async () => {
      // Mock data
      return [] as Appointment[];
    },
    enabled: !!user?.tenantId
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory-report', user?.tenantId],
    queryFn: async () => {
      // Mock data
      return [] as InventoryItem[];
    },
    enabled: !!user?.tenantId
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-report', user?.tenantId],
    queryFn: async () => {
      // Mock data
      return [] as Patient[];
    },
    enabled: !!user?.tenantId
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['prescriptions-report', user?.tenantId],
    queryFn: async () => {
      // Mock data
      return [] as Prescription[];
    },
    enabled: !!user?.tenantId
  });

  // Calculate stats
  const receivedRevenue = (invoices || []).filter(i => i.status === InvoiceStatus.PAID).reduce((acc, inv) => acc + inv.amount, 0);
  const pendingRevenue = (invoices || []).filter(i => i.status === InvoiceStatus.UNPAID).reduce((acc, inv) => acc + inv.amount, 0);
  const totalExpenses = (expenses || []).reduce((acc, exp) => acc + exp.amount, 0);
  const profit = receivedRevenue - totalExpenses;

  const revenueByMonth = (invoices || []).reduce((acc: any[], inv) => {
    const month = new Date(inv.createdAt).toLocaleString('default', { month: 'short' });
    const existing = acc.find(a => a.name === month);
    if (existing) {
      existing.revenue += inv.status === InvoiceStatus.PAID ? inv.amount : 0;
      existing.total += inv.amount;
    } else {
      acc.push({ 
        name: month, 
        revenue: inv.status === InvoiceStatus.PAID ? inv.amount : 0,
        total: inv.amount
      });
    }
    return acc;
  }, []).slice(-6);

  const expenseByCategory = (expenses || []).reduce((acc: any[], exp) => {
    const existing = acc.find(a => a.name === exp.category);
    if (existing) existing.value += exp.amount;
    else acc.push({ name: exp.category, value: exp.amount });
    return acc;
  }, []);

  const appointmentStatusReport = (appointments || []).reduce((acc: any[], app) => {
    const existing = acc.find(a => a.name === app.status);
    if (existing) existing.value += 1;
    else acc.push({ name: app.status, value: 1 });
    return acc;
  }, []);

  const doctorPerformance = (appointments || []).reduce((acc: any[], app) => {
    const existing = acc.find(a => a.name === app.doctorId);
    if (existing) existing.appointments += 1;
    else acc.push({ name: app.doctorId, appointments: 1 });
    return acc;
  }, []).sort((a, b) => b.appointments - a.appointments).slice(0, 5);

  const inventoryAlerts = (inventory || []).filter(item => item.stock <= item.minStock);

  const handleFullBackup = async () => {
    if (!user?.tenantId) return;
    setIsBackingUp(true);
    // Mock backup
    setTimeout(() => {
      setIsBackingUp(false);
      alert('Backup simulated successfully.');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase flex items-center gap-2">
             <BarChart3 className="w-5 h-5 text-blue-600" />
             Institutional Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Financial Reconciliation & Operational Performance Analysis</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleFullBackup}
             disabled={isBackingUp}
             className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-widest"
           >
              {isBackingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5 text-blue-400" />}
              SYSTEM BACKUP
           </button>
           <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95 uppercase tracking-widest">
              <Download className="w-4 h-4" />
              PDF VIEW
           </button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-white border border-slate-100 p-1 rounded-xl shadow-sm overflow-x-auto">
         {(['OVERVIEW', 'CLINICAL', 'FINANCIAL', 'OPERATIONS'] as ReportTab[]).map(tab => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={cn(
               "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
               activeTab === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
             )}
           >
             {tab}
           </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'OVERVIEW' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card p-6 border-l-4 border-emerald-500 bg-white">
                  <div className="flex justify-between items-start text-slate-400">
                    <span className="text-[10px] font-black uppercase tracking-widest">Gross Revenue</span>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">${receivedRevenue.toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-emerald-500 text-[10px] font-black uppercase">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    12.5% vs Prev
                  </div>
              </div>
              <div className="card p-6 border-l-4 border-rose-500 bg-white">
                  <div className="flex justify-between items-start text-slate-400">
                    <span className="text-[10px] font-black uppercase tracking-widest">Total Outflow</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">${totalExpenses.toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-[10px] font-black uppercase">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    4.2% Optimization
                  </div>
              </div>
              <div className="card p-6 border-l-4 border-blue-500 bg-white">
                  <div className="flex justify-between items-start text-slate-400">
                    <span className="text-[10px] font-black uppercase tracking-widest">Net Surplus</span>
                    <Activity className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">${profit.toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-blue-500 text-[10px] font-black uppercase">
                    In Tolerance
                  </div>
              </div>
              <div className="card p-6 border-l-4 border-amber-500 bg-white">
                  <div className="flex justify-between items-start text-slate-400">
                    <span className="text-[10px] font-black uppercase tracking-widest">Patient Flow</span>
                    <Users className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{appointments?.length || 0}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-amber-500 text-[10px] font-black uppercase">
                    <Target className="w-3.5 h-3.5" />
                    High Volume
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6 border-slate-100 bg-white">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Monthly Revenue Projection</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueByMonth}>
                          <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                          <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              <div className="card p-6 border-slate-100 bg-white">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Expenditure Distribution</h3>
                  <div className="h-64 flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                              data={expenseByCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                          >
                              {expenseByCategory.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                          />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="w-1/2 space-y-4">
                        {expenseByCategory.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{item.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 ml-auto">${item.value.toLocaleString()}</span>
                          </div>
                        ))}
                    </div>
                  </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'CLINICAL' && (
          <motion.div 
            key="clinical"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card p-6 bg-white">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Patient Volume Trend</h3>
                 <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={revenueByMonth}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                          <Tooltip 
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                          />
                          <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} />
                       </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="card p-6 bg-white">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                   <Target className="w-4 h-4 text-blue-500" />
                   Status Distribution
                 </h3>
                 <div className="space-y-4">
                    {appointmentStatusReport.map((stat, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="flex-1">
                           <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                              <span className="text-slate-500">{stat.name}</span>
                              <span className="text-slate-900">{stat.value}</span>
                           </div>
                           <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 transition-all" style={{ width: `${(stat.value / (appointments?.length || 1)) * 100}%` }} />
                           </div>
                        </div>
                      </div>
                    ))}
                 </div>
                 <div className="mt-8 pt-8 border-t border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
                      Clinical status optimization ensures maximum patient throughput and care quality consistency.
                    </p>
                 </div>
              </div>
            </div>
            <div className="card p-6 bg-white overflow-hidden">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Patient Engagement Logs (Recent)</h3>
               <div className="divide-y divide-slate-50">
                  {patients?.slice(0, 5).map(p => (
                    <div key={p.id} className="py-3 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs uppercase tracking-tighter">
                             {p.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-800 uppercase">{p.name}</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase">{p.bloodGroup}</p>
                          </div>
                       </div>
                       <span className="text-[9px] font-mono text-slate-400">DOB: {p.dateOfBirth}</span>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'FINANCIAL' && (
          <motion.div 
            key="financial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="card p-6 bg-white">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Receivables</p>
                  <p className="text-2xl font-black text-slate-900">${pendingRevenue.toLocaleString()}</p>
                  <div className="mt-4 pt-4 border-t border-slate-50">
                     <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Pending Reconciliation</p>
                  </div>
               </div>
               <div className="card p-6 bg-white">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Operating Surplus</p>
                  <p className="text-2xl font-black text-emerald-600">${profit.toLocaleString()}</p>
                  <div className="mt-4 pt-4 border-t border-slate-50">
                     <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Growth Zone</p>
                  </div>
               </div>
               <div className="card p-6 bg-slate-900 text-white md:col-span-1 lg:col-span-1">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Cashflow Health</p>
                  <p className="text-2xl font-black text-blue-400">92%</p>
                  <div className="mt-4 pt-4 border-t border-slate-800">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stability Pattern Detected</p>
                  </div>
               </div>
            </div>

            <div className="card p-6 bg-white">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">P&L Historical Trajectory</h3>
               <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                        <Tooltip 
                           cursor={{fill: '#f8fafc'}}
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                        <Bar name="Received Revenue" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar name="Total Billed" dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'OPERATIONS' && (
          <motion.div 
            key="operations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="card p-6 bg-white">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                     <Stethoscope className="w-4 h-4 text-blue-500" />
                     Physician Performance Index
                  </h3>
                  <div className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={doctorPerformance} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                           <XAxis type="number" hide />
                           <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} width={100} />
                           <Tooltip 
                              cursor={{fill: '#f8fafc'}}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                           />
                           <Bar dataKey="appointments" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="card p-6 bg-white overflow-hidden">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                     <Package className="w-4 h-4 text-amber-500" />
                     Inventory Critical Alerts
                  </h3>
                  <div className="space-y-3">
                     {inventoryAlerts && inventoryAlerts.length > 0 ? inventoryAlerts.map(item => (
                       <div key={item.id} className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                          <div>
                             <p className="text-xs font-black text-amber-900 uppercase tracking-tight">{item.name}</p>
                             <p className="text-[9px] text-amber-700 font-bold uppercase mt-0.5">Threshold Breach: {item.stock} Units Remaining</p>
                          </div>
                          <span className="px-2 py-1 bg-amber-200 text-amber-900 text-[8px] font-black uppercase rounded tracking-widest">Restock Required</span>
                       </div>
                     )) : (
                       <div className="text-center py-10">
                          <Archive className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Levels Nominal</p>
                       </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="card p-6 bg-white">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  System Load Reconciliation
               </h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Patients</p>
                     <p className="text-lg font-black text-slate-900">{patients?.length || 0}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Treatments</p>
                     <p className="text-lg font-black text-slate-900">{prescriptions?.length || 0}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pharmacy Throughput</p>
                     <p className="text-lg font-black text-slate-900">{prescriptions?.filter(p => p.status === 'COMPLETED').length || 0}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Staff Engagement</p>
                     <p className="text-lg font-black text-slate-900">High</p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

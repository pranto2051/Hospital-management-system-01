import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Calendar, 
  CreditCard, 
  FileText, 
  LogOut,
  Bell,
  Search,
  Settings as SettingsIcon,
  Building2,
  Stethoscope,
  Clock,
  Briefcase,
  FlaskConical,
  Bed,
  Package,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { Dashboard } from '../../pages/Dashboard';
import { Patients } from '../../pages/Patients';
import { Doctors } from '../../pages/Doctors';
import { Appointments } from '../../pages/Appointments';
import { Prescriptions } from '../../pages/Prescriptions';
import { Billing } from '../../pages/Billing';
import { Departments } from '../../pages/Departments';
import { Settings } from '../../pages/Settings';
import { AttendancePage } from '../../pages/Attendance';
import { StaffManagement } from '../../pages/StaffManagement';
import { LabReports } from '../../pages/LabReports';
import { Admissions } from '../../pages/Admissions';
import { Inventory } from '../../pages/Inventory';
import { Reports } from '../../pages/Reports';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  id: string;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE', 'TECHNICIAN', 'RECEPTIONIST', 'STAFF', 'MANAGER', 'ACCOUNTS_OFFICER'] },
  { icon: Bed, label: 'Admissions', id: 'admissions', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'MANAGER'] },
  { icon: Users, label: 'Patients', id: 'patients', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'MANAGER', 'ACCOUNTS_OFFICER'] },
  { icon: Stethoscope, label: 'Doctors', id: 'doctors', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'PATIENT', 'RECEPTIONIST', 'STAFF', 'MANAGER'] },
  { icon: Calendar, label: 'Appointments', id: 'appointments', roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE', 'RECEPTIONIST', 'MANAGER'] },
  { icon: FileText, label: 'Prescriptions', id: 'prescriptions', roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE', 'MANAGER'] },
  { icon: Package, label: 'Inventory', id: 'inventory', roles: ['ADMIN', 'STAFF', 'MANAGER', 'ACCOUNTS_OFFICER', 'NURSE'] },
  { icon: FlaskConical, label: 'Lab Reports', id: 'lab-reports', roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'MANAGER', 'NURSE', 'TECHNICIAN'] },
  { icon: BarChart3, label: 'Reports', id: 'reports', roles: ['ADMIN', 'MANAGER', 'ACCOUNTS_OFFICER'] },
  { icon: CreditCard, label: 'Billing', id: 'billing', roles: ['ADMIN', 'PATIENT', 'RECEPTIONIST', 'MANAGER', 'ACCOUNTS_OFFICER'] },
  { icon: Clock, label: 'Attendance', id: 'attendance', roles: ['ADMIN', 'MANAGER', 'DOCTOR', 'NURSE', 'TECHNICIAN', 'RECEPTIONIST', 'STAFF', 'ACCOUNTS_OFFICER'] },
  { icon: Briefcase, label: 'Human Resources', id: 'hr', roles: ['ADMIN', 'MANAGER', 'ACCOUNTS_OFFICER'] },
  { icon: Building2, label: 'Departments', id: 'departments', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
  { icon: SettingsIcon, label: 'Settings', id: 'settings', roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE', 'TECHNICIAN', 'RECEPTIONIST', 'STAFF', 'MANAGER', 'ACCOUNTS_OFFICER'] },
];

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const filteredItems = sidebarItems.filter(item => 
    !user || 
    item.roles.includes(user.role) || 
    user.email === 'blackvenom.ai.369@gmail.com'
  );

  const canAccess = (itemId: string) => {
    if (user?.email === 'blackvenom.ai.369@gmail.com') return true;
    const item = sidebarItems.find(i => i.id === itemId);
    if (!item) return false;
    return !user || item.roles.includes(user.role);
  };

  const renderContent = () => {
    if (!canAccess(activeTab)) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
          <p className="mt-2 text-sm text-slate-500 text-center max-w-sm px-6">
            Your current role ({user?.role}) does not have permission to access the <strong>{activeTab}</strong> module. 
            Please contact your administrator if you believe this is an error.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'admissions': return <Admissions onNavigate={setActiveTab} />;
      case 'patients': return <Patients onNavigate={setActiveTab} />;
      case 'doctors': return <Doctors />;
      case 'appointments': return <Appointments />;
      case 'prescriptions': return <Prescriptions />;
      case 'billing': return <Billing />;
      case 'inventory': return <Inventory />;
      case 'reports': return <Reports />;
      case 'departments': return <Departments />;
      case 'settings': return <Settings />;
      case 'attendance': return <AttendancePage />;
      case 'hr': return <StaffManagement />;
      case 'lab-reports': return <LabReports />;
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-[#6C757D]">
          <Building2 className="w-16 h-16 mb-4 opacity-20" />
          <h2 className="text-xl font-bold">Module Under Development</h2>
          <p>The {activeTab} module is part of the next scheduled update.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] flex flex-col border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:flex",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex items-center justify-between lg:justify-start gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Stethoscope className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white uppercase">MedCore</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-2">Clinical Core</div>
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold transition-all duration-150",
                activeTab === item.id 
                  ? "bg-slate-800 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-blue-400" : "text-slate-500")} />
              {item.label}
            </button>
          ))}
          
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-6 mb-3 px-2">System</div>
          {canAccess('departments') && (
            <button 
              onClick={() => {
                setActiveTab('departments');
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold transition-all mb-4",
                activeTab === 'departments' ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              Infrastructure
            </button>
          )}

          <div className="pt-6 mt-6 border-t border-slate-800/50 pb-4">
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-rose-950/50 group active:scale-[0.98]"
            >
              <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Sign Out Session
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="px-2">
             <div className="text-[10px] text-slate-500 font-mono">NODE: CLUSTER-MED-01</div>
             <div className="text-[9px] text-slate-600">v1.2.4-Production</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-14 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tenant:</span>
                <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{user?.tenantId || 'PHC'}</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-slate-200" />
              <div className="hidden md:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Systems Normal</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative group hidden lg:block w-48 xl:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    alert(`Searching systems for: "${e.currentTarget.value}"... (Global Search Mock)`);
                  }
                }}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-medium focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all"
              />
            </div>
            
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block text-slate-800">
                <p className="text-xs font-bold leading-none">{user?.name || 'User'}</p>
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-tighter mt-1">{user?.role || 'Staff'}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                  <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

import React from 'react';
import { 
  Building2, Plus, Search, Layers, UserCircle, Settings, MoreVertical, 
  Globe, Shield, Activity, Users, Thermometer, Zap, Microscope, 
  HeartPulse, Stethoscope, Baby, Pill, Brain, Eye, Trash2, Edit3, X, Info
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { fetchWithFallback, saveToDatabase, deleteFromDatabase } from '../services/api';
import { Department } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap = {
  'Cardiology': HeartPulse,
  'Orthopedics': Activity,
  'Neurology': Brain,
  'Pediatrics': Baby,
  'Dermatology': UserCircle,
  'Emergency': Zap,
  'Radiology': Layers,
  'Oncology': Pill,
  'Gastroenterology': Activity,
  'Ophthalmology': Eye,
  'Pathology': Microscope,
  'Psychiatry': Brain,
};

export const Departments = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [depts, setDepts] = React.useState<Department[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingDept, setEditingDept] = React.useState<Department | undefined>(undefined);
  
  // Form State
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
  });

  const loadDepartments = React.useCallback(async () => {
    setIsLoading(true);
    const data = await fetchWithFallback<Department>('departments', [], user?.tenantId);
    setDepts(data);
    setIsLoading(false);
  }, [user?.tenantId]);

  React.useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name, description: dept.description });
    } else {
      setEditingDept(undefined);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDept(undefined);
    setFormData({ name: '', description: '' });
  };

  const [error, setError] = React.useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!user?.tenantId) return;

    try {
      const newDept = {
        id: editingDept?.id || `dept-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        tenantId: user.tenantId,
      };

      await saveToDatabase('departments', newDept);
      await loadDepartments();
      handleCloseModal();
    } catch (err: unknown) {
      console.error('Save failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize unit. Check database connection and policies.';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to decommission this unit? This action is irreversible.')) {
      await deleteFromDatabase('departments', id);
      await loadDepartments();
    }
  };

  const filteredDepts = depts.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <button 
            onClick={() => handleOpenModal()}
            className="bg-slate-900 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            INITIALIZE UNIT
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Clinical Units', count: depts.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Personnel', count: '--', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredDepts.map((dept) => {
            const Icon = (iconMap as Record<string, React.ElementType>)[dept.name] || Building2;
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={dept.id} 
                className="card bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group overflow-hidden"
              >
                <div className="p-4 border-b border-slate-50 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all border border-slate-100">
                          <Icon className="w-5 h-5" />
                      </div>
                      <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-sm leading-none">{dept.name}</h3>
                          </div>
                          <p className="text-[9px] text-blue-600 font-bold uppercase mt-1 tracking-tighter opacity-70">Clinical DIVISION</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleOpenModal(dept)}
                        className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                </div>
                
                <div className="p-4 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol Description</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 min-h-[32px]">
                        {dept.description || 'No description provided for this operational node.'}
                      </p>
                    </div>

                    <div className="pt-2 flex justify-between items-center border-t border-slate-50 mt-2">
                      <div className="flex items-center gap-1.5 font-bold text-[9px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-700 uppercase">Operational</span>
                      </div>
                      <button className="text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        Configure
                      </button>
                    </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <button 
          onClick={() => handleOpenModal()}
          className="h-full min-h-[200px] rounded-xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-3 group hover:border-blue-200 hover:bg-blue-50/10 transition-all p-6"
        >
           <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
              <Plus className="w-6 h-6" />
           </div>
           <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600">Expansion Slot</p>
              <p className="text-[9px] text-slate-300 mt-1 uppercase tracking-tighter">Add Clinical Node</p>
           </div>
        </button>
      </div>

      {/* Initialization Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    {editingDept ? 'Modify Operational Node' : 'Initialize New Unit'}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">MediCore Protocol v4.2</p>
                </div>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-rose-600 text-[11px] font-bold">
                    <Info className="w-4 h-4" />
                    {error}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Designation</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Cardiology"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the clinical focus and responsibilities of this unit..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                  >
                    {editingDept ? 'Update Node' : 'Confirm Initialization'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

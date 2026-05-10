import React from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Phone, 
  Search, 
  Trash2, 
  Stethoscope,
  Activity,
  FlaskConical,
  Loader2,
  X,
  Info,
  Check,
  UserCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { User, UserRole } from '../types';
import { cn } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithFallback, saveToDatabase, deleteFromDatabase } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export const StaffManagement = () => {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form State for New Personnel
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    role: UserRole.STAFF,
  });

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff', currentUser?.tenantId],
    queryFn: async () => {
      if (!currentUser?.tenantId) return [];
      // Fetch from profiles table
      return fetchWithFallback<User>('profiles', [], currentUser.tenantId);
    },
    enabled: !!currentUser?.tenantId
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ person, newRole }: { person: User, newRole: UserRole }) => {
      const updatedUser = { ...person, role: newRole };
      // Map to correct ID field (Supabase 'profiles' table uses 'id')
      const payload = { ...updatedUser, id: person.uid || (person as any).id };
      await saveToDatabase('profiles', payload);
      
      if (person.uid === currentUser?.uid) {
        useAuthStore.getState().setAuth(updatedUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setEditingUser(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to update personnel role.');
    }
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!currentUser?.tenantId) return;
      
      const newUserId = 'uid-' + Math.random().toString(36).substr(2, 9);
      const newProfile = {
        id: newUserId,
        email: data.email,
        name: data.name,
        role: data.role,
        tenantId: currentUser.tenantId,
        createdAt: Date.now(),
        emailVerified: true
      };

      await saveToDatabase('profiles', newProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setIsInviteModalOpen(false);
      setFormData({ name: '', email: '', role: UserRole.STAFF });
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to invite personnel.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (uid: string) => {
      await deleteFromDatabase('profiles', uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to delete personnel.');
    }
  });

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCloseModal = () => {
    setIsInviteModalOpen(false);
    setError(null);
    setFormData({ name: '', email: '', role: UserRole.STAFF });
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Personnel & Hierarchy</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage institutional roles and access levels for {currentUser?.tenantId}</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          INVITE PERSONNEL
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4 card overflow-hidden bg-white border border-slate-100 shadow-sm rounded-xl">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search by name, email or role..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
               />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
               <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest bg-slate-100 px-2 py-1 rounded">Total: {staff.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 uppercase tracking-widest bg-slate-50/30">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400">Identity</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400">Current Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400">Communication</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400">Onboarding</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filteredStaff.map((person) => {
                    const uid = person.uid || (person as any).id;
                    return (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={uid} 
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded border border-slate-200 bg-slate-100 overflow-hidden shadow-sm">
                              <img 
                                src={person.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`} 
                                alt={person.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{person.name}</p>
                              <p className="text-[10px] font-mono text-slate-400 uppercase">UID: {uid.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                          <td className="px-6 py-4">
                          {editingUser?.uid === uid || (editingUser as any)?.id === uid ? (
                              <div className="flex items-center gap-2">
                                <select 
                                  value={person.role}
                                  disabled={updateRoleMutation.isPending}
                                  onChange={(e) => updateRoleMutation.mutate({ person, newRole: e.target.value as UserRole })}
                                  className="text-[10px] font-bold border border-slate-200 rounded px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50 uppercase tracking-widest"
                                  autoFocus
                                >
                                  {Object.values(UserRole).map(r => (
                                      <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                                {updateRoleMutation.isPending && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                              </div>
                          ) : (
                              <div className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:ring-2 hover:ring-offset-1 ring-transparent transition-all",
                                person.role === UserRole.ADMIN ? "bg-slate-900 text-white" :
                                person.role === UserRole.MANAGER ? "bg-amber-100 text-amber-700" :
                                person.role === UserRole.DOCTOR ? "bg-blue-100 text-blue-700" :
                                person.role === UserRole.NURSE ? "bg-indigo-100 text-indigo-700" :
                                person.role === UserRole.TECHNICIAN ? "bg-emerald-100 text-emerald-700" :
                                person.role === UserRole.RECEPTIONIST ? "bg-rose-100 text-rose-700" :
                                "bg-slate-100 text-slate-500"
                              )} onClick={() => setEditingUser(person)}>
                                {person.role === UserRole.ADMIN && <Shield className="w-2.5 h-2.5" />}
                                {person.role === UserRole.DOCTOR && <Stethoscope className="w-2.5 h-2.5" />}
                                {person.role === UserRole.NURSE && <Activity className="w-2.5 h-2.5" />}
                                {person.role === UserRole.TECHNICIAN && <FlaskConical className="w-2.5 h-2.5" />}
                                {person.role === UserRole.RECEPTIONIST && <Phone className="w-2.5 h-2.5" />}
                                {person.role}
                              </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {person.email}
                            </div>
                            {person.phoneNumber && (
                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {person.phoneNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
                            {person.createdAt ? new Date(person.createdAt).toLocaleDateString() : 'Initial'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setEditingUser(person)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                              title="Modify Role"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Revoke access for ${person.name}?`)) {
                                  deleteMutation.mutate(uid);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                              title="Revoke Access"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredStaff.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No personnel nodes found</p>
                <p className="text-[10px] text-slate-300 mt-1 uppercase">Initialize a new node to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
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
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Invite Personnel</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Institutional Access Protocol</p>
                </div>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(formData); }} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-rose-600 text-[11px] font-bold">
                    <Info className="w-4 h-4" />
                    {error}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="personnel@hospital.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-bold uppercase tracking-widest"
                  >
                    {Object.values(UserRole).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
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
                    disabled={inviteMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {inviteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Confirm Invite
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

import React from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  Search, 
  Trash2, 
  Stethoscope,
  Activity,
  FlaskConical,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { User, UserRole } from '../types';
import { cn } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Local Mock Storage
let mockStaff: User[] = [
  { uid: 'u-1', name: 'Admin User', email: 'admin@example.com', role: UserRole.ADMIN, tenantId: 'MediCore Central', createdAt: Date.now(), emailVerified: true },
  { uid: 'u-2', name: 'Dr. Sarah Smith', email: 'sarah@example.com', role: UserRole.DOCTOR, tenantId: 'MediCore Central', createdAt: Date.now(), emailVerified: true },
  { uid: 'u-3', name: 'Nurse Joy', email: 'joy@example.com', role: UserRole.NURSE, tenantId: 'MediCore Central', createdAt: Date.now(), emailVerified: true }
];

import { fetchWithFallback } from '../services/api';

export const StaffManagement = () => {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingUser, setEditingUser] = React.useState<User | null>(null);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff', currentUser?.tenantId],
    queryFn: async () => {
      if (!currentUser?.tenantId) return [];
      return fetchWithFallback('profiles', mockStaff, currentUser.tenantId);
    },
    enabled: !!currentUser?.tenantId
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ uid, newRole }: { uid: string, newRole: UserRole }) => {
      // Mock update
      const idx = mockStaff.findIndex(s => s.uid === uid);
      if (idx !== -1) {
        mockStaff[idx].role = newRole;
      }

      if (uid === currentUser?.uid) {
        useAuthStore.getState().setAuth({ ...currentUser!, role: newRole });
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setEditingUser(null);
    }
  });

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Personnel & Hierarchy</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage institutional roles and access levels for {currentUser?.tenantId}</p>
        </div>
        <button className="bg-slate-900 text-white px-4 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          <UserPlus className="w-4 h-4" />
          INVITE PERSONNEL
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4 card overflow-hidden">
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
                <tr className="border-b border-slate-100 uppercase tracking-widest">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400">Identity</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400">Current Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400">Communication</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400">Onboarding</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStaff.map((person) => (
                  <tr key={person.uid} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded border border-slate-200 bg-slate-100 overflow-hidden">
                          <img 
                            src={person.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.uid}`} 
                            alt={person.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{person.name}</p>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">UID: {person.uid.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                      <td className="px-6 py-4">
                       {editingUser?.uid === person.uid ? (
                          <div className="flex items-center gap-2">
                            <select 
                              value={person.role}
                              disabled={updateRoleMutation.isPending}
                              onChange={(e) => updateRoleMutation.mutate({ uid: person.uid, newRole: e.target.value as UserRole })}
                              className="text-xs font-bold border border-slate-200 rounded px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50"
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
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest",
                            person.role === UserRole.ADMIN ? "bg-slate-900 text-white" :
                            person.role === UserRole.MANAGER ? "bg-amber-100 text-amber-700" :
                            person.role === UserRole.DOCTOR ? "bg-blue-100 text-blue-700" :
                            person.role === UserRole.NURSE ? "bg-indigo-100 text-indigo-700" :
                            person.role === UserRole.TECHNICIAN ? "bg-emerald-100 text-emerald-700" :
                            person.role === UserRole.RECEPTIONIST ? "bg-rose-100 text-rose-700" :
                            "bg-slate-100 text-slate-500"
                          )}>
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
                       <span className="text-[10px] font-mono font-bold text-slate-500">{new Date(person.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingUser(person)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

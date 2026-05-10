import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Bed, 
  User, 
  Calendar, 
  CheckCircle2, 
  LogOut, 
  Loader2, 
  Activity
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Admission, AdmissionStatus, Patient, ClinicalObservation } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithFallback, saveToDatabase } from '../services/api';
import { mockAdmissions } from '../services/dataStorage';

export const Admissions = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchCategory, setSearchCategory] = React.useState<'NAME' | 'PHONE' | 'ROOM' | 'AGE' | 'BLOOD' | 'ID'>('NAME');
  const [statusFilter, setStatusFilter] = React.useState<AdmissionStatus | 'ALL'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedAdmission, setSelectedAdmission] = React.useState<Admission | null>(null);
  
  // Form State for Admission
  const [patientName, setPatientName] = React.useState('');
  const [patientId, setPatientId] = React.useState('');
  const [patientAge, setPatientAge] = React.useState('');
  const [patientPhone, setPatientPhone] = React.useState('');
  const [patientBloodGroup, setPatientBloodGroup] = React.useState('');
  const [roomNumber, setRoomNumber] = React.useState('');
  const [bedNumber, setBedNumber] = React.useState('');
  const [reason, setReason] = React.useState('');

  // Form State for Observation
  const [obsNote, setObsNote] = React.useState('');
  const [obsStatus, setObsStatus] = React.useState<'STABLE' | 'UNSTABLE' | 'CRITICAL' | 'RECOVERING'>('STABLE');

  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ['admissions', user?.tenantId],
    queryFn: async () => {
      if (!user?.tenantId) return [];
      return fetchWithFallback('admissions', mockAdmissions, user.tenantId);
    },
    enabled: !!user?.tenantId
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', user?.tenantId],
    queryFn: async () => {
      return fetchWithFallback('patients', [], user?.tenantId);
    },
    enabled: !!user?.tenantId
  });

  const admitMutation = useMutation({
    mutationFn: async (newAdmission: Omit<Admission, 'id'>) => {
      if (!user?.tenantId) throw new Error('Tenant missing');
      
      const admission: Admission = {
        id: `adm-${Date.now()}`,
        ...newAdmission,
        admittedAt: Date.now()
      };
      
      return saveToDatabase('admissions', admission, mockAdmissions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      setIsAddModalOpen(false);
      setPatientName('');
      setPatientId('');
      setPatientAge('');
      setPatientPhone('');
      setPatientBloodGroup('');
      setRoomNumber('');
      setBedNumber('');
      setReason('');
    }
  });

  const observationMutation = useMutation({
    mutationFn: async ({ admissionId, observation }: { admissionId: string, observation: ClinicalObservation }) => {
      const record = admissions.find(a => a.id === admissionId);
      if (record) {
        const updatedAdmission = { 
          ...record, 
          observations: [...(record.observations || []), observation] 
        };
        return saveToDatabase('admissions', updatedAdmission, mockAdmissions);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      setObsNote('');
      setSelectedAdmission(null);
    }
  });
  const dischargeMutation = useMutation({
    mutationFn: async (id: string) => {
      const record = admissions.find(a => a.id === id);
      if (record) {
        const updatedAdmission = {
          ...record,
          status: AdmissionStatus.DISCHARGED,
          dischargedAt: Date.now()
        };
        return saveToDatabase('admissions', updatedAdmission, mockAdmissions);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
    }
  });
  const filteredAdmissions = admissions.filter(a => {
    if (!searchTerm) {
      return statusFilter === 'ALL' || a.status === statusFilter;
    }

    const term = searchTerm.toLowerCase();
    let matchesCategory = false;

    switch (searchCategory) {
      case 'NAME':
        matchesCategory = a.patientName.toLowerCase().includes(term);
        break;
      case 'PHONE':
        matchesCategory = a.patientPhone?.toLowerCase().includes(term) || false;
        break;
      case 'ROOM':
        matchesCategory = a.roomNumber.toLowerCase().includes(term);
        break;
      case 'AGE':
        matchesCategory = a.patientAge?.toLowerCase().includes(term) || false;
        break;
      case 'BLOOD':
        matchesCategory = a.patientBloodGroup?.toLowerCase().includes(term) || false;
        break;
      case 'ID':
        matchesCategory = a.id.toLowerCase().includes(term);
        break;
    }

    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const activeAdmissionsCount = admissions.filter(a => a.status === AdmissionStatus.ADMITTED).length;

  if (isLoading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Ward Management</h1>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Bed Occupancy & Live Admissions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-lg shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-tight">{activeAdmissionsCount} Active Patients</span>
          </div>
          {['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'].includes(user?.role || '') && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Plus className="w-4 h-4" /> Admit Patient
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="flex items-center gap-1 px-2 border-r border-slate-100">
          <select 
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value as any)}
            className="bg-slate-50 px-2 py-1.5 rounded-lg text-[10px] font-black text-blue-600 outline-none cursor-pointer uppercase tracking-widest border border-slate-100"
          >
            <option value="NAME">NAME</option>
            <option value="PHONE">PHONE</option>
            <option value="ROOM">ROOM</option>
            <option value="AGE">AGE</option>
            <option value="BLOOD">BLOOD</option>
            <option value="ID">ADMISSION ID</option>
          </select>
        </div>
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder={`Search by ${searchCategory.toLowerCase()}...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent rounded-lg text-[11px] font-medium outline-none focus:bg-white focus:border-slate-200 transition-all font-bold"
          />
        </div>
        <div className="flex items-center gap-2 px-3 border-l border-slate-100">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer uppercase tracking-tight py-1.5"
          >
            <option key="all" value="ALL">All Status</option>
            <option key="admitted" value={AdmissionStatus.ADMITTED}>In Ward</option>
            <option key="discharged" value={AdmissionStatus.DISCHARGED}>Discharged</option>
            <option key="observation" value={AdmissionStatus.OBSERVATION}>Observation</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Localization</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timeline</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Problem / Condition</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAdmissions.map((admission) => (
                <tr key={admission.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                        <User className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{admission.patientName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[9px] text-slate-400 font-mono">#{admission.id.slice(0, 8).toUpperCase()}</span>
                           {admission.patientAge && <span className="text-[9px] font-bold text-slate-500 px-1 bg-slate-100 rounded">{admission.patientAge}yrs</span>}
                           {admission.patientBloodGroup && <span className="text-[9px] font-bold text-rose-500 px-1 bg-rose-50 rounded border border-rose-100">{admission.patientBloodGroup}</span>}
                           {admission.patientPhone && <span className="text-[9px] text-slate-400">{admission.patientPhone}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                       <Bed className="w-3.5 h-3.5 text-slate-400" />
                       <span>Room {admission.roomNumber} - Bed {admission.bedNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {admission.admittedAt ? format(new Date(admission.admittedAt), 'MMM dd, HH:mm') : 'N/A'}
                      </div>
                      {admission.dischargedAt && (
                        <div className="flex items-center gap-2 text-[10px] font-medium text-rose-500">
                          <LogOut className="w-3 h-3" />
                          Discharged: {format(new Date(admission.dischargedAt), 'MMM dd, HH:mm')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest",
                          admission.status === AdmissionStatus.ADMITTED ? "bg-emerald-100 text-emerald-700" :
                          admission.status === AdmissionStatus.DISCHARGED ? "bg-slate-100 text-slate-500" :
                          "bg-amber-100 text-amber-700"
                        )}>
                          {admission.status === AdmissionStatus.ADMITTED && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {admission.status}
                        </span>
                        {admission.observations && admission.observations.length > 0 && (
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase",
                            admission.observations[admission.observations.length - 1].status === 'CRITICAL' ? 'bg-rose-600 text-white animate-pulse' :
                            admission.observations[admission.observations.length - 1].status === 'UNSTABLE' ? 'bg-amber-500 text-white' :
                            'bg-blue-100 text-blue-700'
                          )}>
                            {admission.observations[admission.observations.length - 1].status}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 italic line-clamp-1">
                        {admission.observations && admission.observations.length > 0 
                          ? admission.observations[admission.observations.length - 1].note 
                          : admission.reason}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                       {admission.status === AdmissionStatus.ADMITTED && ['ADMIN', 'NURSE', 'DOCTOR'].includes(user?.role || '') && (
                         <button 
                           onClick={() => setSelectedAdmission(admission)}
                           className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                           title="Log Observation"
                         >
                           <Activity className="w-4 h-4" />
                         </button>
                       )}
                       {admission.status === AdmissionStatus.ADMITTED && ['ADMIN', 'RECEPTIONIST', 'MANAGER'].includes(user?.role || '') && (
                        <button 
                          onClick={() => dischargeMutation.mutate(admission.id)}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Discharge Patient"
                        >
                          {dischargeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAdmissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <Bed className="w-12 h-12 mb-3 text-slate-300" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Ward Records Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-slate-800">
                <div>
                  <h3 className="font-bold text-lg tracking-tight">Patient Admission</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Record Entry</p>
                </div>
                <button 
                   onClick={() => setIsAddModalOpen(false)}
                   className="p-2 hover:bg-white rounded-full transition-colors font-bold"
                >
                  &times;
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  admitMutation.mutate({
                    patientId: patientId || ('manual-' + Date.now()),
                    patientName,
                    patientAge,
                    patientPhone,
                    patientBloodGroup,
                    roomNumber,
                    bedNumber,
                    reason,
                    admittedAt: 0,
                    status: AdmissionStatus.ADMITTED,
                    doctorInChargeId: user?.uid || '',
                    doctorInChargeName: user?.name || '',
                    tenantId: user?.tenantId || '',
                    observations: []
                  });
                }} 
                className="p-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Patient from Registry (Optional)</label>
                    <select 
                      onChange={(e) => {
                        const p = patients.find(p => p.id === e.target.value);
                        if (p) {
                          setPatientId(p.id);
                          setPatientName(p.name);
                          setPatientAge(p.age?.toString() || '');
                          setPatientPhone(p.phone || '');
                          setPatientBloodGroup(p.bloodGroup || '');
                        }
                      }}
                      className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-black text-blue-700"
                    >
                      <option value="">-- Choose registered patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          [{p.id}] {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patient ID</label>
                    <input 
                      type="text" 
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      required
                      placeholder="e.g. PID-1001"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      placeholder="Enter patient name..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Age</label>
                    <input 
                      type="text" 
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      required
                      placeholder="e.g. 35"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile Number</label>
                    <input 
                      type="text" 
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      required
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Blood Group</label>
                    <select 
                      value={patientBloodGroup}
                      onChange={(e) => setPatientBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">Unknown</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Room Number</label>
                    <input 
                      type="text" 
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      required
                      placeholder="e.g. 302"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bed Number</label>
                    <input 
                      type="text" 
                      value={bedNumber}
                      onChange={(e) => setBedNumber(e.target.value)}
                      required
                      placeholder="e.g. A-12"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clinical Problem / Reason</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows={3}
                    placeholder="Enter patient condition or diagnosis..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none shadow-inner"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={admitMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    {admitMutation.isPending ? <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-b-white"></span> : 'Admit Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Observation Logging Modal */}
      <AnimatePresence>
        {selectedAdmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAdmission(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 tracking-tight">Log Clinical Update</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedAdmission.patientName}</p>
                </div>
                <button onClick={() => setSelectedAdmission(null)} className="p-2 hover:bg-white rounded-full transition-colors">&times;</button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedAdmission) return;
                  observationMutation.mutate({
                    admissionId: selectedAdmission.id,
                    observation: {
                      id: Math.random().toString(36).substr(2, 9),
                      note: obsNote,
                      status: obsStatus,
                      recordedAt: Date.now(),
                      staffName: user?.name || ''
                    }
                  });
                }} 
                className="p-6 space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Condition</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['STABLE', 'UNSTABLE', 'CRITICAL', 'RECOVERING'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setObsStatus(lvl as any)}
                        className={cn(
                          "px-2 py-2 rounded-lg text-[9px] font-bold border transition-all uppercase tracking-tighter",
                          obsStatus === lvl 
                            ? "bg-slate-900 text-white border-slate-900" 
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nursing Observation Note</label>
                  <textarea 
                    value={obsNote}
                    onChange={(e) => setObsNote(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe clinical changes, vital stats, or nursing care provided..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none shadow-inner"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setSelectedAdmission(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={observationMutation.isPending || !obsNote}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {observationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Update'}
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

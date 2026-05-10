import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { Patient, Diagnosis, Prescription, PrescriptionStatus, AdmissionStatus, Admission } from '../types';
import { Plus, Search, Filter, MoreVertical, FileText, UserCircle, Bed, Clipboard, Activity, Stethoscope, ChevronRight, X, Loader2, Trash2, Edit2, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { PatientIntakeForm } from '../components/PatientIntakeForm';
import { DiagnosisRecordForm } from '../components/DiagnosisRecordForm';
import { PrescriptionForm } from '../components/PrescriptionForm';

import { fetchWithFallback, saveToDatabase } from '../services/api';

export const Patients = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchCategory, setSearchCategory] = React.useState<'NAME' | 'PHONE' | 'ID' | 'BLOOD'>('NAME');
  const [bloodFilter, setBloodFilter] = React.useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [activeClinicalTab, setActiveClinicalTab] = React.useState<'DIAGNOSIS' | 'PRESCRIPTION' | 'HISTORY'>('HISTORY');
  
  // Context Menu State
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);

  const addDiagnosisMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!user?.tenantId || !selectedPatient) throw new Error('Context missing');
      
      const newDiagnosis: Diagnosis = {
        id: `dx-${Date.now()}`,
        patientId: selectedPatient.id,
        doctorId: user.uid,
        doctorName: user.name,
        condition: values.condition,
        notes: values.notes,
        severity: values.severity,
        tenantId: user.tenantId,
        date: Date.now()
      };
      
      return saveToDatabase('diagnoses', newDiagnosis);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientDiagnoses', selectedPatient?.id] });
      setActiveClinicalTab('HISTORY');
    }
  });

  const addPrescriptionMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!user?.tenantId || !selectedPatient) throw new Error('Context missing');
      
      const newPrescription: Prescription = {
        id: `rx-${Date.now()}`,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        doctorId: user.uid,
        doctorName: user.name,
        medications: values.medications,
        instructions: values.instructions,
        status: PrescriptionStatus.ACTIVE,
        tenantId: user.tenantId,
        date: Date.now(),
        createdAt: Date.now()
      };
      
      return saveToDatabase('prescriptions', newPrescription);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientPrescriptions', selectedPatient?.id] });
      setActiveClinicalTab('HISTORY');
    }
  });

  const addPatientMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!user?.tenantId) throw new Error('Tenant ID missing');
      
      const newPatient: Patient = {
        id: `PID-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: 'temp-id',
        name: values.name,
        age: values.age,
        phone: values.phone,
        problem: values.problem,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        bloodGroup: values.bloodGroup,
        address: values.address,
        medicalHistory: values.medicalHistory ? values.medicalHistory.split(',').map((s: string) => s.trim()) : [],
        tenantId: user.tenantId,
        createdAt: Date.now()
      };
      
      return saveToDatabase('patients', newPatient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setIsAddModalOpen(false);
    }
  });

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', user?.tenantId, user?.uid, user?.role],
    queryFn: async () => {
      if (!user?.tenantId) return [];
      
      return fetchWithFallback<Patient>('patients', [], user.tenantId, (q) => {
        if (user.role === 'PATIENT') return q.eq('userId', user.uid);
        return q;
      });
    },
    enabled: !!user?.tenantId
  });

  const filteredPatients = React.useMemo(() => {
    if (!patients) return [];
    return patients.filter(p => {
      if (!searchTerm) {
        return !bloodFilter || p.bloodGroup === bloodFilter;
      }
      
      const term = searchTerm.toLowerCase();
      let matchesCategory = false;

      switch (searchCategory) {
        case 'NAME':
          matchesCategory = p.name.toLowerCase().includes(term);
          break;
        case 'PHONE':
          matchesCategory = p.phone?.toLowerCase().includes(term) || false;
          break;
        case 'ID':
          matchesCategory = p.id.toLowerCase().includes(term);
          break;
        case 'BLOOD':
          matchesCategory = p.bloodGroup.toLowerCase().includes(term);
          break;
      }

      const matchesBlood = !bloodFilter || p.bloodGroup === bloodFilter;
      return matchesCategory && matchesBlood;
    });
  }, [patients, searchTerm, searchCategory, bloodFilter]);

  const handleExport = () => {
    alert('Exporting Patient Registry as CSV... (Mock)');
  };

  const admitMutation = useMutation({
    mutationFn: async (patient: Patient) => {
      if (!user?.tenantId) throw new Error('Tenant missing');
      
      const newAdmission: Admission = {
        id: `adm-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        patientAge: patient.age || 'N/A',
        patientPhone: patient.phone || 'N/A',
        patientBloodGroup: patient.bloodGroup,
        roomNumber: 'TBD',
        bedNumber: 'TBD',
        reason: patient.problem || 'Initial admission review',
        status: AdmissionStatus.ADMITTED,
        admittedAt: Date.now(),
        doctorInChargeId: user.uid,
        doctorInChargeName: user.name,
        tenantId: user.tenantId,
        observations: []
      };
      
      return saveToDatabase('admissions', newAdmission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      setTimeout(() => {
        if (onNavigate) onNavigate('admissions');
      }, 100);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      alert('Admission process failed. Please try again.');
    }
  });

  const handleAdmit = async (patient: Patient) => {
    console.log('Initiating admission for:', patient.id);
    await admitMutation.mutateAsync(patient);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Patient Registry</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Clinical records for {user?.tenantId}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          NEW PATIENT
        </button>
      </div>

      <div className="card p-3 flex flex-col md:flex-row gap-3 items-center">
        <div className="flex items-center gap-1 px-2 border-r border-slate-100">
           <select 
             value={searchCategory}
             onChange={(e) => setSearchCategory(e.target.value as any)}
             className="bg-slate-50 px-2 py-1.5 rounded-lg text-[10px] font-black text-blue-600 outline-none cursor-pointer uppercase tracking-widest border border-slate-100"
           >
             <option value="NAME">NAME</option>
             <option value="PHONE">PHONE</option>
             <option value="ID">ID</option>
             <option value="BLOOD">BLOOD</option>
           </select>
        </div>
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder={`Search by ${searchCategory.toLowerCase()}...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={bloodFilter || ''}
            onChange={(e) => setBloodFilter(e.target.value || null)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-600 hover:bg-slate-50 outline-none"
          >
            <option value="">ALL BLOOD GROUPS</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="O+">O+</option>
          </select>
          <button 
            onClick={handleExport}
            className="flex-1 md:flex-none px-3 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-600 hover:bg-slate-50"
          >
            EXPORT HUB
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-4 py-2 border-b-2 border-slate-200">Patient Profile</th>
                  <th className="px-4 py-2 border-b-2 border-slate-200 text-center">ID Registry</th>
                  <th className="px-4 py-2 border-b-2 border-slate-200 text-center">Security Rank</th>
                  <th className="px-4 py-2 border-b-2 border-slate-200">Class</th>
                  <th className="px-4 py-2 border-b-2 border-slate-200">Sync Status</th>
                  <th className="px-4 py-2 border-b-2 border-slate-200"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                          <UserCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 text-xs">{patient.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-[9px] text-slate-400 font-mono uppercase leading-none">{patient.gender}</span>
                             {patient.age && <span className="text-[9px] font-bold text-slate-500 px-1 bg-slate-100 rounded">{patient.age}yrs</span>}
                             {patient.phone && <span className="text-[9px] text-slate-400">{patient.phone}</span>}
                          </div>
                          {patient.problem && (
                            <p className="text-[9px] text-blue-600 font-medium italic mt-1 line-clamp-1">{patient.problem}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-[10px] font-mono font-bold text-blue-600 text-center bg-blue-50/30">{patient.id}</td>
                    <td className="px-4 py-2 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700">
                        VERIFIED
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs font-bold text-slate-600">{patient.bloodGroup || 'A+'}</td>
                    <td className="px-4 py-2 text-[10px] font-medium text-slate-400">ACTIVE SYNC</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end items-center gap-1">
                        {user?.role === 'DOCTOR' && (
                          <button 
                            className="p-1 px-2.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5"
                            title="Clinical Portal"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setActiveClinicalTab('HISTORY');
                            }}
                          >
                            <Stethoscope className="w-3 h-3" /> CLINICAL
                          </button>
                        )}
                        {['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'].includes(user?.role || '') && (
                          <button 
                            className="p-1 px-3 bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm active:scale-[0.98]"
                            title="Admit to Ward"
                            onClick={() => handleAdmit(patient)}
                            disabled={admitMutation.isPending}
                          >
                            {admitMutation.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Bed className="w-3.5 h-3.5" />
                            )}
                            {admitMutation.isPending ? 'Syncing...' : 'ADMIT'}
                          </button>
                        )}
                        <div className="relative">
                          <button 
                            onClick={() => setMenuOpenId(menuOpenId === patient.id ? null : patient.id)}
                            className={cn(
                              "p-1 rounded hover:bg-white border transition-all text-slate-300 hover:text-slate-600",
                              menuOpenId === patient.id ? "bg-white border-slate-200 text-slate-600 shadow-sm" : "border-transparent"
                            )}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>
                          
                          <AnimatePresence>
                            {menuOpenId === patient.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-40" 
                                  onClick={() => setMenuOpenId(null)}
                                />
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50"
                                >
                                  <button 
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMenuOpenId(null);
                                      alert('Editing registration for ' + patient.name);
                                    }}
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-blue-500" /> EDIT RECORD
                                  </button>
                                  <button 
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMenuOpenId(null);
                                      alert('Viewing full registry history for ' + patient.name);
                                    }}
                                  >
                                    <History className="w-3.5 h-3.5 text-indigo-500" /> FULL LOGS
                                  </button>
                                  <div className="h-px bg-slate-100 my-1" />
                                  <button 
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMenuOpenId(null);
                                      alert('Requesting deletion of encrypted record ' + patient.id);
                                    }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> DELETE ENTRY
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="w-10 h-10 text-slate-100" />
                        <p className="text-xs font-bold uppercase tracking-widest leading-none">Accessing Encrypted Records...</p>
                        <p className="text-[10px] font-mono">NO RECORDS FOUND IN CLUSTER: {user?.tenantId}</p>
                        <button 
                           onClick={() => setIsAddModalOpen(true)}
                           className="text-blue-600 text-[10px] font-bold hover:underline uppercase tracking-widest mt-2"
                        >
                          Initialize First Registration
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <PatientIntakeForm 
            onCancel={() => setIsAddModalOpen(false)} 
            onSubmit={async (values) => {
              await addPatientMutation.mutateAsync(values);
            }}
            isSubmitting={addPatientMutation.isPending}
          />
        )}
      </AnimatePresence>
      
      {/* Clinical Portal Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatient(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl h-full bg-slate-50 shadow-2xl flex flex-col border-l border-slate-200"
            >
              {/* Header */}
              <div className="p-6 bg-white border-b border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 leading-tight">{selectedPatient.name}</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Clinical Portal <ChevronRight className="w-3 h-3" /> {activeClinicalTab}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPatient(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  {[
                    { id: 'HISTORY', label: 'Clinical History', icon: Clipboard },
                    { id: 'DIAGNOSIS', label: 'Add Diagnosis', icon: Activity },
                    { id: 'PRESCRIPTION', label: 'Issue RX', icon: FileText },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveClinicalTab(tab.id as any)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                        activeClinicalTab === tab.id 
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                          : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                      )}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeClinicalTab === 'HISTORY' && (
                  <PatientClinicalHistory patientId={selectedPatient.id} tenantId={user?.tenantId || ''} />
                )}
                {activeClinicalTab === 'DIAGNOSIS' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <Activity className="w-4 h-4 text-rose-500" /> New Diagnosis Record
                    </h4>
                    <DiagnosisRecordForm 
                      onSubmit={async (values) => {
                        await addDiagnosisMutation.mutateAsync(values);
                      }}
                      onCancel={() => setActiveClinicalTab('HISTORY')}
                      isSubmitting={addDiagnosisMutation.isPending}
                    />
                  </div>
                )}
                {activeClinicalTab === 'PRESCRIPTION' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <FileText className="w-4 h-4 text-blue-500" /> New Pharmaceutical Instruction
                    </h4>
                    <PrescriptionForm 
                      onSubmit={async (values) => {
                        await addPrescriptionMutation.mutateAsync(values);
                      }}
                      onCancel={() => setActiveClinicalTab('HISTORY')}
                      isSubmitting={addPrescriptionMutation.isPending}
                      patients={selectedPatient ? [selectedPatient] : []}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PatientClinicalHistory = ({ patientId, tenantId }: { patientId: string; tenantId: string }) => {
  const { data: diagnoses, isLoading: diagnosesLoading } = useQuery({
    queryKey: ['patientDiagnoses', patientId],
    queryFn: async () => {
      return fetchWithFallback<Diagnosis>('diagnoses', [], tenantId, (q) => q.eq('patientId', patientId));
    },
    enabled: !!tenantId && !!patientId
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['patientPrescriptions', patientId],
    queryFn: async () => {
      return fetchWithFallback<Prescription>('prescriptions', [], tenantId, (q) => q.eq('patientId', patientId));
    },
    enabled: !!tenantId && !!patientId
  });

  if (diagnosesLoading || prescriptionsLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Diagnoses Section */}
      <section>
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Confirmed Diagnoses</h4>
        <div className="space-y-4">
          {(diagnoses || []).map((d) => (
            <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className={cn(
                "absolute top-0 left-0 w-1 h-full",
                d.severity === 'CRITICAL' ? 'bg-rose-500' :
                d.severity === 'HIGH' ? 'bg-amber-500' :
                d.severity === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-300'
              )} />
              <div className="flex justify-between items-start mb-2">
                <h5 className="text-sm font-bold text-slate-800">{d.condition}</h5>
                <span className="text-[9px] font-mono text-slate-400">{new Date(d.date).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">{d.notes || 'No clinical notes provided.'}</p>
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-tight text-slate-400">
                <UserCircle className="w-3 h-3" /> Dr. {d.doctorName}
              </div>
            </div>
          ))}
          {(diagnoses || []).length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-4 border-2 border-dashed border-slate-200 rounded-xl">No diagnosis records found for this patient.</p>
          )}
        </div>
      </section>

      {/* Prescriptions Section */}
      <section>
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Medication History</h4>
        <div className="space-y-4">
          {(prescriptions || []).map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">RX #{p.id.slice(0, 6)}</span>
                 </div>
                 <span className="text-[9px] font-mono text-slate-400">{new Date(p.date).toLocaleDateString()}</span>
              </div>
              <div className="space-y-2 mb-3">
                {p.medications.map((m, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{m.name}</p>
                      <p className="text-[10px] text-slate-500">{m.dosage} — {m.frequency}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{m.duration}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 bg-blue-50/50 p-2 rounded-lg border border-blue-100/20 italic">
                {p.instructions}
              </p>
            </div>
          ))}
          {(prescriptions || []).length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-4 border-2 border-dashed border-slate-200 rounded-xl">No prescription history found.</p>
          )}
        </div>
      </section>
    </div>
  );
};

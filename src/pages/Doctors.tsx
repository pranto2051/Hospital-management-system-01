import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { Doctor, DoctorAvailability } from '../types';
import { mockDoctors, mockDepartments } from '../services/dataStorage';
import { Stethoscope, Plus, Search, Filter, MoreVertical, Star, X, Calendar, Clock, DollarSign, Award, AtSign, Loader2, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { saveToDatabase, fetchWithFallback } from '../services/api';

const doctorSchema = z.object({
  name: z.string().min(2, 'Name required'),
  photoURL: z.string().url('Invalid photo URL').or(z.string().length(0)),
  specialization: z.string().min(2, 'Specialty required'),
  departmentId: z.string().min(1, 'Department required'),
  licenseNumber: z.string().min(3, 'License required'),
  experience: z.string().min(1, 'Experience required'),
  consultationFee: z.string().min(1, 'Fee required'),
  bio: z.string().min(10, 'Bio too short'),
  tags: z.string().optional()
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export const Doctors = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSpecialization, setSelectedSpecialization] = React.useState('All');
  const [isOnboardModalOpen, setIsOnboardModalOpen] = React.useState(false);
  const [selectedAvailabilityDoc, setSelectedAvailabilityDoc] = React.useState<Doctor | null>(null);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors', user?.tenantId],
    queryFn: async () => {
      if (!user?.tenantId) return [];
      return fetchWithFallback('doctors', mockDoctors, user.tenantId);
    },
    enabled: !!user?.tenantId
  });

  const onboardMutation = useMutation({
    mutationFn: async (values: DoctorFormValues) => {
      if (!user?.tenantId) throw new Error('Context missing');
      const newDoctor: Doctor = {
        id: Math.random().toString(36).substr(2, 9),
        userId: 'temp-' + Date.now(),
        name: values.name,
        photoURL: values.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.name}`,
        specialization: values.specialization.toUpperCase(),
        departmentId: values.departmentId,
        licenseNumber: values.licenseNumber,
        bio: values.bio,
        experience: parseInt(values.experience),
        consultationFee: parseInt(values.consultationFee),
        rating: 5.0, // Initial rating
        tags: values.tags ? values.tags.split(',').map(t => t.trim().toUpperCase()) : ['OPD'],
        availability: [
          { day: 'monday', slots: [{ start: '09:00', end: '17:00' }] },
          { day: 'tuesday', slots: [{ start: '09:00', end: '17:00' }] },
          { day: 'wednesday', slots: [{ start: '09:00', end: '17:00' }] },
          { day: 'thursday', slots: [{ start: '09:00', end: '17:00' }] },
          { day: 'friday', slots: [{ start: '09:00', end: '17:00' }] }
        ],
        tenantId: user.tenantId
      };
      
      await saveToDatabase('doctors', newDoctor);
      mockDoctors.unshift(newDoctor);
      return newDoctor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setIsOnboardModalOpen(false);
      reset();
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema)
  });

  // Context Menu State
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);

  const specializations = React.useMemo(() => {
    return ['All', ...mockDepartments.map(d => d.name)];
  }, []);

  const filteredDoctors = React.useMemo(() => {
    if (!doctors) return [];
    return doctors.filter(doc => {
      const matchesSearch = 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpec = selectedSpecialization === 'All' || doc.specialization === selectedSpecialization;
      
      return matchesSearch && matchesSpec;
    });
  }, [doctors, searchTerm, selectedSpecialization]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Clinical Staff Registry</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Verified Medical Professionals for {user?.tenantId}</p>
        </div>
        <button 
          onClick={() => setIsOnboardModalOpen(true)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          ONBOARD DOCTOR
        </button>
      </div>

      <div className="card p-3 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by license, name, or specialization..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:inline">Filter Specialty:</span>
          <div className="relative flex items-center bg-white border border-slate-200 rounded px-2 min-w-[160px]">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full pl-2 pr-4 py-1.5 bg-transparent text-[11px] font-bold text-slate-600 outline-none appearance-none cursor-pointer uppercase tracking-tight focus:ring-0"
            >
              <option key="all-specs" value="All">All Specialties</option>
              {specializations.filter(s => s !== 'All').map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <div key={doc.id} className="card p-4 hover:border-blue-200 transition-all group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-blue-500 overflow-hidden border border-slate-100 group-hover:border-blue-200 transition-all">
                    {doc.photoURL ? (
                      <img src={doc.photoURL} alt={doc.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="w-8 h-8 opacity-20" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-none">{doc.name}</h3>
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1.5">{doc.specialization}</p>
                  </div>
                </div>
                  <div className="relative">
                    <button 
                      onClick={() => setMenuOpenId(menuOpenId === doc.id ? null : doc.id)}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        menuOpenId === doc.id ? "bg-slate-100 text-slate-800" : "text-slate-300 hover:text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    <AnimatePresence>
                      {menuOpenId === doc.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 overflow-hidden"
                          >
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest">
                               Edit Profile
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest">
                               Schedule
                            </button>
                            <div className="h-px bg-slate-100 my-1" />
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black text-rose-600 hover:bg-rose-50 transition-colors uppercase tracking-widest">
                               Offboard
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <div className="space-y-1">
                     <span className="text-slate-400 font-mono tracking-tighter uppercase block">LICENSE: {doc.licenseNumber}</span>
                     <span className="text-slate-500 font-bold block">{doc.experience || '5'}+ YRS EXP</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1 text-amber-500 font-black text-xs">
                      <Star className="w-3 h-3 fill-current" /> {doc.rating?.toFixed(1) || '5.0'}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">${doc.consultationFee || '50'}/VISIT</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                   {(doc.tags || ['OPD']).map(tag => (
                     <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 border border-slate-200 font-bold text-[9px] uppercase tracking-tighter">{tag}</span>
                   ))}
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedAvailabilityDoc(doc)}
                className="w-full mt-4 bg-white border border-slate-200 text-slate-600 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-[0.98]"
              >
                View Availability
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full card p-12 text-center text-slate-400">
            <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-xs font-bold uppercase tracking-widest">No Clinicians Mapped to Cluster</p>
            <p className="text-[10px] font-mono mt-1">Tenant ID: {user?.tenantId}</p>
          </div>
        )}
      </div>

      {/* Onboard Modal */}
      <AnimatePresence>
        {isOnboardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOnboardModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                   <div className="p-2 bg-blue-100 rounded-lg">
                      <Plus className="w-4 h-4 text-blue-600" />
                   </div>
                   <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Clinical Onboarding</h2>
                </div>
                <button onClick={() => setIsOnboardModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit((data) => onboardMutation.mutate(data))} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <UserCircle className="w-3 h-3 text-blue-500" /> Professional Name
                    </label>
                    <input 
                      {...register('name')} 
                      placeholder="e.g. Dr. Sarah Smith"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                    />
                    {errors.name && <p className="text-[9px] text-rose-500 font-bold uppercase">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <AtSign className="w-3 h-3 text-blue-500" /> Profile Photo URL
                    </label>
                    <input 
                      {...register('photoURL')} 
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Award className="w-3 h-3 text-amber-500" /> Specialization
                    </label>
                    <input 
                      {...register('specialization')} 
                      placeholder="e.g. Cardiology"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Filter className="w-3 h-3 text-slate-500" /> Department
                    </label>
                    <select 
                      {...register('departmentId')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                    >
                      <option value="">Select Dept</option>
                      {mockDepartments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">License Number</label>
                    <input {...register('licenseNumber')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-mono" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Experience (Years)</label>
                    <input type="number" {...register('experience')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-blue-600" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-emerald-500" /> Consultation Fee
                    </label>
                    <input type="number" {...register('consultationFee')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-emerald-600" />
                  </div>

                   <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tags (Comma Sep)</label>
                    <input {...register('tags')} placeholder="OPD, SURG" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Professional Bio</label>
                  <textarea 
                    {...register('bio')} 
                    rows={3} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button 
                  disabled={onboardMutation.isPending}
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {onboardMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Finalize Onboarding
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Availability Modal */}
      <AnimatePresence>
        {selectedAvailabilityDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAvailabilityDoc(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                 <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">{selectedAvailabilityDoc.name}</h3>
                    <p className="text-[9px] font-bold text-slate-400">PRACTICE AVAILABILITY LOGS</p>
                 </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  {selectedAvailabilityDoc.availability.length > 0 ? (
                    selectedAvailabilityDoc.availability.map((avail, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{avail.day}</span>
                         <div className="space-y-1">
                            {avail.slots.map((slot, sidx) => (
                              <div key={sidx} className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                                 <Clock className="w-3 h-3" />
                                 <span>{slot.start} - {slot.end}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <Clock className="w-10 h-10 mx-auto mb-2 opacity-10" />
                      <p className="text-[10px] font-bold uppercase italic">No active availability records found</p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedAvailabilityDoc(null)}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Close Schedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

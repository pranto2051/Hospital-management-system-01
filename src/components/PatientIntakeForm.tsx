import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User, Calendar, MapPin, Activity, Droplets, Phone, Stethoscope } from 'lucide-react';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.string().min(1, 'Age is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  problem: z.string().min(2, 'Current problem/status is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  medicalHistory: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientIntakeFormProps {
  onSubmit: (values: PatientFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const PatientIntakeForm: React.FC<PatientIntakeFormProps> = ({ 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: 'MALE',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <User className="w-3 h-3 text-blue-500" /> Full Name
          </label>
          <input
            {...register('name')}
            placeholder="Manual entry of full name..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          {errors.name && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.name.message}</p>
          )}
        </div>

        {/* Age */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3 text-emerald-500" /> Age
          </label>
          <input
            {...register('age')}
            placeholder="e.g. 35"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          {errors.age && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.age.message}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Phone className="w-3 h-3 text-blue-500" /> Mobile Number
          </label>
          <input
            {...register('phone')}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          {errors.phone && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.phone.message}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Date of Birth
          </label>
          <input
            {...register('dateOfBirth')}
            type="date"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          {errors.dateOfBirth && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* Problem */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Stethoscope className="w-3 h-3 text-rose-500" /> Clinical Problem / Status
          </label>
          <input
            {...register('problem')}
            placeholder="Primary reason for registration or current condition..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
          />
          {errors.problem && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.problem.message}</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3 h-3" /> Gender
          </label>
          <select
            {...register('gender')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.gender && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.gender.message}</p>
          )}
        </div>

        {/* Blood Group */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Droplets className="w-3 h-3" /> Blood Group
          </label>
          <select
            {...register('bloodGroup')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Select Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          {errors.bloodGroup && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.bloodGroup.message}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <MapPin className="w-3 h-3" /> Residential Address
        </label>
        <textarea
          {...register('address')}
          rows={2}
          placeholder="Enter full address..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
        />
        {errors.address && (
          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.address.message}</p>
        )}
      </div>

      {/* Medical History */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <FileTextIcon className="w-3 h-3" /> Medical History (comma separated)
        </label>
        <textarea
          {...register('medicalHistory')}
          rows={2}
          placeholder="e.g. Hypertension, Diabetes, Allergies..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Patient'}
        </button>
      </div>
    </form>
  );
};

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);

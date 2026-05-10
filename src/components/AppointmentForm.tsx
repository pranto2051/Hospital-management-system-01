import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User, Calendar, Clock, ClipboardList, Stethoscope, Filter } from 'lucide-react';
import { Patient, Doctor, AppointmentStatus } from '../types';

const appointmentSchema = z.object({
  patientId: z.string().optional(),
  patientName: z.string().min(2, 'Patient name is required'),
  patientAge: z.string().min(1, 'Patient age is required'),
  doctorId: z.string().min(1, 'Doctor selection is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  doctors: Doctor[];
  patients: Patient[];
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultDoctorId?: string;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  doctors,
  patients,
  onSubmit, 
  onCancel,
  isSubmitting = false,
  defaultDoctorId
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: defaultDoctorId || '',
    }
  });

  const [selectedDepartment, setSelectedDepartment] = React.useState<string>('All');

  const departments = React.useMemo(() => {
    const deps = new Set(doctors.map(d => d.specialization));
    return ['All', ...Array.from(deps)];
  }, [doctors]);

  const filteredDoctors = React.useMemo(() => {
    if (selectedDepartment === 'All') return doctors;
    return doctors.filter(d => d.specialization === selectedDepartment);
  }, [doctors, selectedDepartment]);

  const selectedDoctorId = watch('doctorId');
  const selectedDate = watch('date');

  const checkAvailability = () => {
    if (!selectedDoctorId || !selectedDate) return true;
    
    const doctor = doctors.find(d => d.userId === selectedDoctorId);
    if (!doctor) return true;

    // Use UTC to avoid timezone issues with date strings like '2023-10-27'
    const dateParts = selectedDate.split('-').map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const isAvailable = doctor.availability.some(a => a.day.toLowerCase() === dayOfWeek);
    
    return isAvailable;
  };

  const isDoctorAvailable = checkAvailability();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Patient Selection Helper */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Filter className="w-3 h-3 text-blue-500" /> Registry Helper (Optional)
          </label>
          <select
            onChange={(e) => {
              const patient = patients.find(p => p.id === e.target.value);
              if (patient) {
                setValue('patientId', patient.id);
                setValue('patientName', patient.name);
                setValue('patientAge', patient.age?.toString() || '');
              }
            }}
            className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-black text-blue-700"
          >
            <option value="">Quick fill from registry...</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                [{p.id}] {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Manual Patient Data Inputs */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <User className="w-3 h-3" /> Patient ID
          </label>
          <input
            {...register('patientId')}
            placeholder="e.g. PID-1001"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono font-bold"
          />
          {errors.patientId && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.patientId.message}</p>
          )}
        </div>

        <div className="space-y-1.5 text-slate-400">
           {/* spacer or placeholder for alignment */}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <User className="w-3 h-3" /> Full Name
          </label>
          <input
            {...register('patientName')}
            placeholder="Enter patient name..."
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold"
          />
          {errors.patientName && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.patientName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <User className="w-3 h-3" /> Age
          </label>
          <input
            {...register('patientAge')}
            placeholder="Age"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold"
          />
          {errors.patientAge && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.patientAge.message}</p>
          )}
        </div>

        {/* Department Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Filter className="w-3 h-3" /> Filter Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => {
                const newDep = e.target.value;
                setSelectedDepartment(newDep);
                
                // If current doctor is not in new department, reset selection
                if (newDep !== 'All') {
                  const currentDoc = filteredDoctors.find(d => d.userId === watch('doctorId'));
                  if (currentDoc && currentDoc.specialization !== newDep) {
                    setValue('doctorId', '');
                  }
                }
            }}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer font-bold"
          >
            {departments.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>

        {/* Doctor Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Stethoscope className="w-3 h-3" /> Assign Doctor
          </label>
          <select
            {...register('doctorId')}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer font-bold"
          >
            <option key="placeholder-doc" value="">Select a practitioner...</option>
            {filteredDoctors.map(d => (
              <option key={d.id} value={d.userId}>{d.name} — {d.specialization}</option>
            ))}
          </select>
          {errors.doctorId && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.doctorId.message}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Consultation Date
          </label>
          <input
            {...register('date')}
            type="date"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold"
          />
          {errors.date && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.date.message}</p>
          )}
        </div>

        {/* Doctor Availability Warning */}
        {selectedDate && selectedDoctorId && !isDoctorAvailable && (
          <div className="col-span-2 p-2 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
             <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight">Doctor is not available on this day</p>
          </div>
        )}

        {/* Time */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-3 h-3" /> Slot Time
          </label>
          <input
            {...register('time')}
            type="time"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          {errors.time && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.time.message}</p>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <ClipboardList className="w-3 h-3" /> Reason for Visit
        </label>
        <textarea
          {...register('reason')}
          rows={2}
          placeholder="e.g. Routine follow-up, acute chest pain, etc..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none shadow-inner"
        />
        {errors.reason && (
          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.reason.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
};

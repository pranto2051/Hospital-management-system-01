import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Loader2, 
  Pill, 
  Plus, 
  Trash2, 
  ClipboardList, 
  User, 
  Search,
  MessageSquare,
  Clock,
  Activity,
  Phone,
  Calendar,
  Stethoscope,
  Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency (times per day) is required'),
  duration: z.string().min(1, 'Duration (days/weeks) is required'),
});

const prescriptionSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  patientId: z.string().optional(),
  patientAge: z.string().min(1, 'Patient age is required'),
  patientPhone: z.string().min(10, 'Valid phone number is required'),
  patientBloodGroup: z.string().optional(),
  diagnosis: z.string().min(1, 'Current complaint/diagnosis is required'),
  medications: z.array(medicationSchema).min(1, 'Prescribe at least one medication'),
  instructions: z.string().min(2, 'Clinic/Pharmacist instructions are required'),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  onSubmit: (values: PrescriptionFormValues) => Promise<void>;
  onCancel: () => void;
  patients?: { id: string, name: string }[];
  isSubmitting?: boolean;
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ 
  onSubmit, 
  onCancel,
  patients = [],
  isSubmitting = false 
}) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      instructions: '',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* section: Patient Identification */}
      <div className="space-y-4">
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block flex items-center gap-2">
            <User className="w-3 h-3 text-blue-500" /> 01. Patient Profile
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                Select Patient Record
              </label>
              <select
                onChange={(e) => {
                  const p = patients.find(p => p.id === e.target.value);
                  if (p) {
                    setValue('patientId', p.id);
                    setValue('patientName', p.name);
                    setValue('patientAge', (p as any).age || '');
                    setValue('patientPhone', (p as any).phone || '');
                    setValue('patientBloodGroup', (p as any).bloodGroup || '');
                  }
                }}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none transition-all"
              >
                <option value="">-- Manual Entry / Choose Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.id}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                Full Name
              </label>
              <input
                {...register('patientName')}
                placeholder="Enter patient name..."
                className={cn(
                  "w-full px-4 py-2.5 bg-white border rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-all font-black text-slate-700",
                  errors.patientName ? "border-rose-200 ring-4 ring-rose-500/5" : "border-slate-200 focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5"
                )}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                Patient ID
              </label>
              <input
                {...register('patientId')}
                placeholder="PID-XXXX"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none transition-all font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Age
                </label>
                <input
                  {...register('patientAge')}
                  placeholder="e.g. 28"
                  className={cn(
                    "w-full px-4 py-2.5 bg-white border rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-all",
                    errors.patientAge ? "border-rose-200 ring-4 ring-rose-500/5" : "border-slate-200 focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5"
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> Contact
                </label>
                <input
                  {...register('patientPhone')}
                  placeholder="Phone number"
                  className={cn(
                    "w-full px-4 py-2.5 bg-white border rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-all",
                    errors.patientPhone ? "border-rose-200 ring-4 ring-rose-500/5" : "border-slate-200 focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5"
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Droplets className="w-3 h-3 text-rose-500" /> Blood Group
                </label>
                <select
                  {...register('patientBloodGroup')}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none transition-all"
                >
                  <option value="">Unknown</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 opacity-0 pointer-events-none md:block hidden" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Stethoscope className="w-3 h-3" /> Chief Complaint / Diagnosis
            </label>
            <input
              {...register('diagnosis')}
              placeholder="Primary reason for visit or clinical findings..."
              className={cn(
                "w-full px-4 py-2.5 bg-white border rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-all",
                errors.diagnosis ? "border-rose-200 ring-4 ring-rose-500/5" : "border-slate-200 focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5"
              )}
            />
          </div>
        </div>

        {/* section: Medication Protocol */}
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Pill className="w-4 h-4 text-blue-500" /> 02. Pharmaceutical Protocol
                </h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Specify drug interactions and dosage</p>
             </div>
             <button
               type="button"
               onClick={() => append({ name: '', dosage: '', frequency: '', duration: '' })}
               className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
             >
               <Plus className="w-3 h-3" /> ADD DRUG
             </button>
          </div>

          <div className="space-y-4 pr-1">
            <AnimatePresence initial={false}>
              {fields.map((field, index) => (
                <motion.div 
                  key={field.id}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 relative group hover:border-blue-200 transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Activity className="w-3 h-3" /> Drug / Compound
                      </label>
                      <input
                        {...register(`medications.${index}.name`)}
                        placeholder="e.g. Paracetamol"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Pill className="w-3 h-3" /> Concentration / Size
                      </label>
                      <input
                        {...register(`medications.${index}.dosage`)}
                        placeholder="e.g. 500 MG"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Frequency (Cycle)
                      </label>
                      <input
                        {...register(`medications.${index}.frequency`)}
                        placeholder="e.g. 8H Cycle (TID)"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" /> Duration
                      </label>
                      <input
                        {...register(`medications.${index}.duration`)}
                        placeholder="e.g. 7 Days"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-rose-100 text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-md group-hover:scale-110"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {errors.medications && (
              <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight ml-4">{errors.medications.message}</p>
            )}
          </div>
        </div>

        {/* section: Pharmacist Instructions */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-500" /> 03. Pharmacist Directives
          </label>
          <div className="relative group">
            <textarea
              {...register('instructions')}
              rows={3}
              placeholder="Enter specific handling or patient monitoring instructions..."
              className={cn(
                "w-full px-5 py-4 bg-white border rounded-2xl text-xs font-bold font-mono placeholder:text-slate-300 outline-none transition-all resize-none",
                errors.instructions ? "border-rose-200 ring-4 ring-rose-500/5 text-rose-600" : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-700 shadow-inner"
              )}
            />
            {errors.instructions && (
              <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight mt-1 ml-4">{errors.instructions.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-100 items-center">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          DISCARD
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? (
             <>
               <Loader2 className="w-4 h-4 animate-spin" />
               AUTHORIZING...
             </>
          ) : (
             <>
               <ShieldCheck className="w-4 h-4" />
               ISSUE CLINICAL ORDER
             </>
          )}
        </button>
      </div>
    </form>
  );
};

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);


import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Activity, MessageSquare, AlertTriangle } from 'lucide-react';

const diagnosisSchema = z.object({
  condition: z.string().min(3, 'Condition must be at least 3 characters'),
  notes: z.string().min(10, 'Clinical notes must be detailed (min 10 chars)'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

type DiagnosisFormValues = z.infer<typeof diagnosisSchema>;

interface DiagnosisRecordFormProps {
  onSubmit: (values: DiagnosisFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const DiagnosisRecordForm: React.FC<DiagnosisRecordFormProps> = ({ 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      severity: 'MEDIUM',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-4">
        {/* Condition */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3 h-3" /> Clinical Diagnosis / Condition
          </label>
          <input
            {...register('condition')}
            placeholder="e.g. Type 2 Diabetes Mellitus"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          {errors.condition && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.condition.message}</p>
          )}
        </div>

        {/* Severity */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" /> Severity Classification
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((level) => (
              <label key={level} className="relative cursor-pointer">
                <input
                  type="radio"
                  value={level}
                  {...register('severity')}
                  className="peer sr-only"
                />
                <div className="px-1 py-2 text-[9px] font-bold text-center border border-slate-200 rounded-lg peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 transition-all uppercase tracking-tighter">
                  {level}
                </div>
              </label>
            ))}
          </div>
          {errors.severity && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.severity.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="w-3 h-3" /> Professional Notes & Observations
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            placeholder="Describe clinical findings, symptoms, and recommended follow-up..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none shadow-inner"
          />
          {errors.notes && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.notes.message}</p>
          )}
        </div>
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
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalize Diagnosis'}
        </button>
      </div>
    </form>
  );
};

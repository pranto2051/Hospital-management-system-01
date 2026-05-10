import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, CreditCard, DollarSign, Calendar, Wallet } from 'lucide-react';

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.enum(['CASH', 'CARD', 'UPI', 'INSURANCE']),
  date: z.string().min(1, 'Date is required'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentRecordFormProps {
  invoiceId: string;
  totalAmount: number;
  remainingAmount: number;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const PaymentRecordForm: React.FC<PaymentRecordFormProps> = ({ 
  invoiceId,
  totalAmount,
  remainingAmount,
  onSubmit, 
  onCancel,
  isSubmitting = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingAmount,
      method: 'CASH',
      date: new Date().toISOString().split('T')[0],
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Invoice Context */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center mb-2">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoicing Ref:</span>
           <span className="text-[10px] font-mono font-bold text-slate-900">#{invoiceId.slice(0, 8)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
           <span className="font-medium text-slate-600">Outstanding Balance:</span>
           <span className="font-black text-slate-900">${remainingAmount.toFixed(2)}</span>
        </div>
        <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
           <div 
             className="h-full bg-blue-500" 
             style={{ width: `${(remainingAmount/totalAmount)*100}%` }}
           />
        </div>
      </div>

      <div className="space-y-4">
        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <DollarSign className="w-3 h-3 text-emerald-500" /> Payment Amount
          </label>
          <input
            {...register('amount', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
          />
          {errors.amount && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.amount.message}</p>
          )}
        </div>

        {/* Method */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Wallet className="w-3 h-3 text-blue-500" /> Transaction Method
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['CASH', 'CARD', 'UPI', 'INSURANCE'].map((m) => (
              <label key={m} className="relative cursor-pointer">
                <input
                  type="radio"
                  value={m}
                  {...register('method')}
                  className="peer sr-only"
                />
                <div className="px-1 py-2.5 text-[9px] font-bold text-center border border-slate-200 rounded-lg bg-white peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 transition-all uppercase tracking-tighter shadow-sm">
                  {m}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3 text-slate-400" /> Processing Date
          </label>
          <input
            {...register('date')}
            type="date"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Payment'}
        </button>
      </div>
    </form>
  );
};

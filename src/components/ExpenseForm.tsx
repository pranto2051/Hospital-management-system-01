import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, DollarSign, Tag, Calendar, MessageSquare } from 'lucide-react';

const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSubmit: (values: ExpenseFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CATEGORIES = [
  'Medical Supplies',
  'Pharmacy Stock',
  'Equipment Maintenance',
  'Utilities',
  'Facility Rent',
  'Staff Payroll',
  'Marketing',
  'IT & Infrastructure',
  'Other'
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: 0
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Tag className="w-3 h-3 text-blue-500" /> Category
          </label>
          <select
            {...register('category')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
          >
            <option key="placeholder" value="">Select Category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.category.message}</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <DollarSign className="w-3 h-3 text-emerald-500" /> Amount (USD)
          </label>
          <input
            {...register('amount', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          {errors.amount && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.amount.message}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3 text-slate-400" /> Date of Expense
          </label>
          <input
            {...register('date')}
            type="date"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          {errors.date && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.date.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="w-3 h-3 text-slate-400" /> Detailed Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Brief explanation for this financial entry..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none shadow-inner"
          />
          {errors.description && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{errors.description.message}</p>
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
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record Expense'}
        </button>
      </div>
    </form>
  );
};

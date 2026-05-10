import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Search, Plus, AlertTriangle, Archive, TrendingUp, MinusCircle, PlusCircle, Loader2, X, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { InventoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const itemSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  category: z.enum(['MEDICINE', 'EQUIPMENT', 'SUPPLY']),
  stock: z.number().min(0),
  unit: z.string().min(1, 'Unit is required (e.g., vials, boxes)'),
  minStock: z.number().min(0),
});

type ItemFormValues = z.infer<typeof itemSchema>;

import { fetchWithFallback, saveToDatabase } from '../services/api';

export const Inventory = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory', user?.tenantId],
    queryFn: async () => {
      if (!user?.tenantId) return [];
      return fetchWithFallback<InventoryItem>('inventory', [], user.tenantId);
    },
    enabled: !!user?.tenantId
  });

  const addItemMutation = useMutation({
    mutationFn: async (values: ItemFormValues) => {
      if (!user?.tenantId) throw new Error('Tenant ID missing');
      
      const newItem: InventoryItem = {
        id: `i-${Date.now()}`,
        ...values,
        tenantId: user.tenantId
      };
      
      return saveToDatabase('inventory', newItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsModalOpen(false);
    }
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, newStock }: { id: string; newStock: number }) => {
      const record = items?.find(i => i.id === id);
      if (record) {
        const updatedItem = { ...record, stock: newStock };
        return saveToDatabase('inventory', updatedItem);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] })
  });

  const filteredItems = (items || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = (items || []).filter(item => item.stock <= item.minStock);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
       stock: 0,
       minStock: 10,
       category: 'MEDICINE'
    }
  });

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Inventory & Supply Chain
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Medical Logistics & Pharmacy Stock Control</p>
        </div>
        <button 
          onClick={() => { reset(); setIsModalOpen(true); }}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          ADD ITEM
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="card p-6 bg-white border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total SKU Count</span>
               <Archive className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black mt-2 text-slate-900">{items?.length || 0}</p>
         </div>
         <div className="card p-6 bg-rose-50 border border-rose-100 shadow-sm">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Low Stock Alerts</span>
               <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black mt-2 text-rose-900">{lowStockItems.length}</p>
            <p className="text-[9px] text-rose-400 mt-2 font-bold uppercase">Requires immediate procurement</p>
         </div>
         <div className="card p-6 bg-emerald-50 border border-emerald-100 shadow-sm">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Stock Value</span>
               <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black mt-2 text-emerald-900">Calculated</p>
            <p className="text-[9px] text-emerald-400 mt-2 font-bold uppercase">Real-time valuation</p>
         </div>
      </div>

      <div className="card overflow-hidden bg-white border border-slate-100">
         <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search medicine or equipment..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
               />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <select 
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value)}
                 className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest outline-none cursor-pointer"
               >
                  <option value="ALL">All Categories</option>
                  <option value="MEDICINE">Medicine</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="SUPPLY">Supplies</option>
               </select>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[9px] uppercase tracking-widest font-black">
                     <th className="px-6 py-4">Item Identity</th>
                     <th className="px-6 py-4">Category</th>
                     <th className="px-6 py-4">Current Stock</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Adjust Stock</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-6 py-4">
                          <p className="text-xs font-black text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter mt-1">{item.unit}</p>
                       </td>
                       <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-widest">
                             {item.category}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <p className="text-sm font-black text-slate-900">{item.stock}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Min: {item.minStock}</p>
                       </td>
                       <td className="px-6 py-4">
                          {item.stock <= item.minStock ? (
                            <span className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold uppercase">
                               <AlertTriangle className="w-3.5 h-3.5" />
                               Low Stock
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase">
                               <CheckCircle2 className="w-3.5 h-3.5" />
                               Optimal
                            </span>
                          )}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                             <button 
                               onClick={() => updateStockMutation.mutate({ id: item.id, newStock: Math.max(0, item.stock - 1) })}
                               className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"
                             >
                                <MinusCircle className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => updateStockMutation.mutate({ id: item.id, newStock: item.stock + 1 })}
                               className="p-1.5 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-all"
                             >
                                <PlusCircle className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-lg text-slate-800">Add Inventory Item</h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit((val) => addItemMutation.mutate(val))} className="p-6 space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Item Name</label>
                    <input {...register('name')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    {errors.name && <p className="text-[10px] text-rose-500">{errors.name.message}</p>}
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                       <select {...register('category')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                          <option value="MEDICINE">Medicine</option>
                          <option value="EQUIPMENT">Equipment</option>
                          <option value="SUPPLY">Supply</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unit</label>
                       <input {...register('unit')} placeholder="e.g. Boxes, Vials" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Initial Stock</label>
                       <input type="number" {...register('stock', { valueAsNumber: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Min Stock Limit</label>
                       <input type="number" {...register('minStock', { valueAsNumber: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest">Cancel</button>
                    <button type="submit" disabled={addItemMutation.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                       {addItemMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Item'}
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

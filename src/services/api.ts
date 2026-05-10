import { supabase } from '../lib/supabase';

// Generic helper for fetching data using Supabase with Fallbacks
export async function fetchWithFallback<T>(
  table: string, 
  mockData: T[], 
  tenantId?: string,
  _filter?: (query: any) => any
): Promise<T[]> {
  try {
    // Attempt Supabase Fetch
    if (import.meta.env.VITE_SUPABASE_URL) {
      let query = supabase.from(table).select('*');
      if (tenantId) query = query.eq('tenantId', tenantId);
      
      const { data, error } = await query;
      
      if (!error && data && data.length > 0) {
        return data as T[];
      }
      if (error) console.warn('Supabase fetch error:', error);
    }

    // Attempt Express Local API Fallback
    const url = new URL(`/api/${table}`, window.location.origin);
    if (tenantId) url.searchParams.set('tenantId', tenantId);
    
    const response = await fetch(url.toString());
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) return data;
    }
    
    // Final Fallback to Mocks
    return [...mockData];
  } catch (error) {
    console.warn(`Falling back to mocks for ${table}:`, error);
    return [...mockData];
  }
}

// Save helper using Supabase (Generic for any DB)
export async function saveToDatabase<T extends { id: string }>(
  table: string, 
  item: T, 
  mockStore?: T[]
): Promise<T> {
  try {
    // Attempt Supabase Save
    if (import.meta.env.VITE_SUPABASE_URL) {
      const { data, error } = await supabase
        .from(table)
        .upsert(item)
        .select()
        .single();
        
      if (!error && data) return data as T;
      if (error) console.warn('Supabase save error:', error);
    }

    // Attempt Express Local API Fallback
    const response = await fetch(`/api/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    
    if (response.ok) return await response.json();
    
    throw new Error('All save attempts failed');
  } catch (error) {
    console.warn(`Falling back to local mock store for ${table}:`, error);
    if (mockStore) {
      const existingIndex = mockStore.findIndex(i => i.id === item.id);
      if (existingIndex !== -1) {
        mockStore[existingIndex] = { ...item };
      } else {
        mockStore.unshift({ ...item });
      }
    }
    return item;
  }
}

// Delete helper 
export async function deleteFromDatabase(table: string, id: string) {
  try {
    if (import.meta.env.VITE_SUPABASE_URL) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) return;
    }
    // Future: Add Express delete route if needed
  } catch (error) {
    console.error('Delete failed:', error);
  }
}

// Real-time listener helper
export function subscribeToCollection<T>(
  table: string,
  tenantId: string | undefined,
  onData: (data: T[]) => void,
  _onError?: (error: Error) => void
) {
  if (import.meta.env.VITE_SUPABASE_URL) {
    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        // Refresh data on any change
        fetchWithFallback(table, [], tenantId).then(onData);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
  
  return () => {}; 
}


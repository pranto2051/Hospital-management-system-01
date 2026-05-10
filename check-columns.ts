import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_columns', { table_name: 'departments' });
  // Since I don't have that RPC, I'll try a simpler way: fetch one row and check keys
  const { data: rows, error: err } = await supabase.from('departments').select('*').limit(1);
  
  if (err) {
     // If select * fails, maybe the table doesn't exist?
     console.error('Error fetching departments:', err);
  } else if (rows && rows.length > 0) {
     console.log('Columns found:', Object.keys(rows[0]));
  } else {
     // Try to insert a dummy row with lowercase 'tenantid' to see if it works
     console.log('No rows found. Attempting insert with lowercase "tenantid"...');
     const { error: insErr } = await supabase.from('departments').insert({
        id: 'temp-1',
        name: 'Temp',
        description: 'Temp',
        tenantid: 'MediCore Central'
     });
     
     if (insErr) {
        console.error('Insert with lowercase failed:', insErr);
     } else {
        console.log('✅ Insert with lowercase "tenantid" succeeded!');
        await supabase.from('departments').delete().eq('id', 'temp-1');
     }
  }
}

checkColumns();

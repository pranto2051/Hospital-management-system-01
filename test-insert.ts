import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const id = `test-${Date.now()}`;
  console.log('Attempting to insert test record:', id);
  
  const { data, error } = await supabase
    .from('departments')
    .upsert({
      id: id,
      name: 'Test Dept',
      description: 'Test description',
      tenantId: 'MediCore Central'
    })
    .select();
    
  if (error) {
    console.error('❌ Insert failed:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);
  } else {
    console.log('✅ Insert successful!');
    console.log('Data:', data);
    
    // Now try to delete it
    await supabase.from('departments').delete().eq('id', id);
    console.log('✅ Cleaned up test record.');
  }
}

testInsert();

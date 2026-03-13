import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  console.log('--- Checking columns of "tasks" ---');
  const { data, error } = await supabase.from('tasks').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    // Try to insert a dummy to see columns if empty
    console.log('Table empty, trying to insert dummy...');
    const { error: insError } = await supabase.from('tasks').insert({ id: 'temp-check', title: 'temp' });
    if (insError) console.error('Insert error:', insError.message);
    const { data: data2 } = await supabase.from('tasks').select('*').limit(1);
    if (data2 && data2.length > 0) console.log('Columns:', Object.keys(data2[0]));
    await supabase.from('tasks').delete().eq('id', 'temp-check');
  }
}

checkColumns();

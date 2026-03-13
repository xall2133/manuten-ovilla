import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTrash() {
  console.log('--- Checking if "trash" table exists ---');
  const { error } = await supabase.from('trash').select('*').limit(1);
  if (error) {
    console.error('Trash table error:', error.message);
  } else {
    console.log('Trash table exists!');
  }
}

checkTrash();

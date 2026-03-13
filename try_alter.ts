import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function tryAlter() {
  console.log('--- Trying to add column "is_deleted" to tasks ---');
  // This is a long shot, usually only works if a specific RPC is set up
  const { error } = await (supabase as any).rpc('exec_sql', { sql: 'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;' });
  if (error) {
    console.error('Alter error:', error.message);
  } else {
    console.log('Alter success!');
  }
}

tryAlter();

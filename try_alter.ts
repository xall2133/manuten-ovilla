import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ifbjgcbaejzvfqpfwzla.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYmpnY2JhZWp6dmZxcGZ3emxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxOTczMTEsImV4cCI6MjA4MDc3MzMxMX0.lNvvvSy7GJ9edUaN0s1l78mS_rUJOqTfnkQjelsGsLs';

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

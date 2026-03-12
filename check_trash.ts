import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ifbjgcbaejzvfqpfwzla.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYmpnY2JhZWp6dmZxcGZ3emxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxOTczMTEsImV4cCI6MjA4MDc3MzMxMX0.lNvvvSy7GJ9edUaN0s1l78mS_rUJOqTfnkQjelsGsLs';

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

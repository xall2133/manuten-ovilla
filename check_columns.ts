import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ifbjgcbaejzvfqpfwzla.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYmpnY2JhZWp6dmZxcGZ3emxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxOTczMTEsImV4cCI6MjA4MDc3MzMxMX0.lNvvvSy7GJ9edUaN0s1l78mS_rUJOqTfnkQjelsGsLs';

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

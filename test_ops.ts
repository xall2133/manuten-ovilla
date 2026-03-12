import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ifbjgcbaejzvfqpfwzla.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYmpnY2JhZWp6dmZxcGZ3emxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxOTczMTEsImV4cCI6MjA4MDc3MzMxMX0.lNvvvSy7GJ9edUaN0s1l78mS_rUJOqTfnkQjelsGsLs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAllTables() {
  const tables = ['tasks', 'visits', 'third_party_schedule', 'painting_projects', 'purchases', 'schedule', 'monthly_schedule'];
  
  for (const table of tables) {
    const testId = 'TEST-' + Math.random().toString(36).substr(2, 9);
    console.log(`--- Testing ${table} ---`);
    
    // Create a dummy object based on table
    const dummy: any = { id: testId };
    if (table === 'tasks') dummy.title = 'Test';
    if (table === 'visits') { dummy.tower = 'T1'; dummy.unit = '101'; }
    if (table === 'third_party_schedule') { dummy.company = 'Test'; dummy.service = 'Test'; dummy.frequency = 'Mensal'; }
    if (table === 'painting_projects') { dummy.tower = 'T1'; dummy.local = 'Test'; }
    if (table === 'purchases') { dummy.quantity = 1; dummy.description = 'Test'; }
    if (table === 'schedule') { dummy.shift = 'Manhã'; }
    if (table === 'monthly_schedule') { dummy.shift = 'Manhã'; }

    const { error: insertError } = await supabase.from(table).insert(dummy);
    if (insertError) {
      console.error(`${table} Insert Error:`, insertError.message);
    } else {
      console.log(`${table} Insert Success`);
      const { error: deleteError, count } = await supabase.from(table).delete({ count: 'exact' }).eq('id', testId);
      if (deleteError) {
        console.error(`${table} Delete Error:`, deleteError.message);
      } else {
        console.log(`${table} Delete Success. Count:`, count);
      }
    }
  }
}

testAllTables();

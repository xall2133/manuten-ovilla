import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ifbjgcbaejzvfqpfwzla.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYmpnY2JhZWp6dmZxcGZ3emxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxOTczMTEsImV4cCI6MjA4MDc3MzMxMX0.lNvvvSy7GJ9edUaN0s1l78mS_rUJOqTfnkQjelsGsLs';

export const supabase = createClient(supabaseUrl, supabaseKey);

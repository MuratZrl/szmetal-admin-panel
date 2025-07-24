// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zofgtjswwjikwhdirvpa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZmd0anN3d2ppa3doZGlydnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODAzMTcsImV4cCI6MjA2ODA1NjMxN30.20tBzg6tXjuZcXtR1fMhPRoDBx7YXfiZfxNvQBRgOqA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://umwhpuladpvcsbuuqury.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtd2hwdWxhZHB2Y3NidXVxdXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTgxMjMsImV4cCI6MjA4MDUzNDEyM30.IINJBtPWEfPGeHEqgxlMjUlqO033vzAOiGjK2uZxqog';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


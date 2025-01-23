import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tvytydguhbrnkcflhmnw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2eXR5ZGd1aGJybmtjZmxobW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNDcxNzIsImV4cCI6MjA0ODYyMzE3Mn0.4IY2Im2O6Yau8_k5S2_bFH3dMCq58Vgf_k-TWtzZoe0";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
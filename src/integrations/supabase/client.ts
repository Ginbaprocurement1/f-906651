// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tvytydguhbrnkcflhmnw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2eXR5ZGd1aGJybmtjZmxobW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNDcxNzIsImV4cCI6MjA0ODYyMzE3Mn0.4IY2Im2O6Yau8_k5S2_bFH3dMCq58Vgf_k-TWtzZoe0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// This client bypasses Row Level Security (RLS)
// NEVER use this on the client-side
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

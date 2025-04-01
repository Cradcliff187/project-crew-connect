
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const DOCUMENTS_BUCKET_ID = 'construction_documents';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

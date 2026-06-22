import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qmubwsojrctuttgzhdhv.supabase.co'
const supabaseAnonKey = 'sb_publishable_5oehGo1ctq9G3onyPIAjGQ_fyN2-5MP'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
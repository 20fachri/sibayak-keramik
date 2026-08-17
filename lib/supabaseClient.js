import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Peringatan ini muncul kalau .env.local belum diisi (normal untuk sekarang,
// kita akan isi kredensialnya di Tahap 2 setelah project Supabase dibuat).
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

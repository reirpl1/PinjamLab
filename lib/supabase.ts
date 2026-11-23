import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

// Client untuk publik (hanya bisa akses data yang diizinkan RLS / tabel ruang)
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Client untuk admin / server-side (bypass RLS menggunakan secret key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);

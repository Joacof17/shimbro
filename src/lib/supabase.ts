// Cliente de Supabase. Si no hay variables de entorno configuradas, queda en null y la
// app sigue funcionando 100% local (los usuarios que ya se manejan local no cambian).
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Supabase ahora usa la publishable key (sb_publishable_…) para el cliente;
// dejamos fallback a la vieja anon key por si el proyecto es anterior al cambio.
const key =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// true cuando el proyecto tiene las credenciales (la publishable key es pública por diseño).
export const supabaseConfigurado = !!(url && key);

export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(url as string, key as string, {
      auth: {
        storage: AsyncStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        // En web, Supabase lee el token del hash del redirect de OAuth.
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;

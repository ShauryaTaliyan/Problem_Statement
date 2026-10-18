// ============================================================================
// MSOT Clubs — Supabase Client & Configuration Boundary
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Read environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
) as string | undefined;

/**
 * Checks whether Supabase environment credentials are validly provided.
 * Rejects undefined, empty, or unconfigured template placeholders.
 */
export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabasePublishableKey) return false;
  if (
    supabaseUrl.includes('your-project-id') ||
    supabaseUrl.includes('placeholder') ||
    supabasePublishableKey.includes('your_supabase') ||
    supabasePublishableKey.length < 10
  ) {
    return false;
  }
  try {
    const parsed = new URL(supabaseUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Singleton Supabase client instance.
 * When real credentials are not supplied, provides a safe non-throwing dummy client
 * to prevent startup crashes while the user operates in Demo Mode.
 */
export const supabase: SupabaseClient<Database> = isSupabaseConfigured()
  ? createClient<Database>(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient<Database>(
      'https://msot-demo-unconfigured.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_unconfigured_demo_environment_only',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

export interface SupabaseConfigStatus {
  configured: boolean;
  url: string | null;
  hasKey: boolean;
  missingMessage: string | null;
}

/**
 * Demo mode is permitted ONLY in development when Supabase credentials are missing.
 * Production builds are NEVER allowed to run in demo mode.
 */
export function isDemoModeAllowed(): boolean {
  return !import.meta.env.PROD && !isSupabaseConfigured();
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const configured = isSupabaseConfigured();
  let missingMessage: string | null = null;

  if (!configured) {
    if (import.meta.env.PROD) {
      missingMessage =
        'FATAL CONFIGURATION ERROR: Supabase credentials are missing in production. Live backend connection is strictly required. Demo mode is disabled in production builds.';
    } else {
      missingMessage =
        'Supabase credentials are not yet configured in .env.local. The application is running in Development / Demo Mode with seeded mock data. To connect a live Supabase backend, set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.';
    }
  }

  return {
    configured,
    url: configured ? supabaseUrl! : null,
    hasKey: !!supabasePublishableKey && !supabasePublishableKey.includes('your_supabase'),
    missingMessage,
  };
}

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { withTimeout } from './withTimeout';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const AUTH_TIMEOUT_MS = 15_000;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase が未設定です。.env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。',
    );
  }

  if (!client) {
    client = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}

function mapAuthError(error: { message: string }): Error {
  const message = error.message.toLowerCase();

  if (message.includes('anonymous') && message.includes('disabled')) {
    return new Error(
      '匿名ログインが無効です。Supabase → Authentication → Sign In / Providers → Anonymous Sign-Ins を ON にしてください。',
    );
  }

  if (message.includes('invalid api key') || message.includes('invalid jwt')) {
    return new Error('.env の VITE_SUPABASE_ANON_KEY が正しくありません。');
  }

  return new Error(error.message);
}

export async function ensureAnonymousAuth(): Promise<string> {
  const supabase = getSupabase();

  const sessionResult = await withTimeout(
    supabase.auth.getSession(),
    AUTH_TIMEOUT_MS,
    'Supabase への接続がタイムアウトしました。ネットワークまたは Supabase の状態を確認してください。',
  );

  if (sessionResult.data.session?.user.id) {
    return sessionResult.data.session.user.id;
  }

  const signInResult = await withTimeout(
    supabase.auth.signInAnonymously(),
    AUTH_TIMEOUT_MS,
    '匿名ログインがタイムアウトしました。Supabase の Anonymous Sign-Ins が ON か確認してください。',
  );

  if (signInResult.error) throw mapAuthError(signInResult.error);
  if (!signInResult.data.user?.id) throw new Error('匿名ログインに失敗しました');

  return signInResult.data.user.id;
}

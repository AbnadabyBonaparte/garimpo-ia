/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_STRIPE_CHECKOUT_API_URL: string;
  readonly VITE_RUN_AI_ANALYSIS_API_URL: string;
  readonly VITE_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

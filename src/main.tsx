import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';

const root = document.getElementById('root')!;

function EnvErrorScreen({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-background-deep p-6 font-body text-foreground"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <h1 className="mb-4 font-display text-xl font-bold text-amber">
        Configuração necessária
      </h1>
      <p className="mb-6 max-w-md text-center text-foreground-muted">
        {message}
      </p>
      <p className="text-sm text-foreground-muted">
        No Vercel: Project → Settings → Environment Variables. Adicione:
      </p>
      <ul className="mt-2 list-inside list-disc text-left text-sm text-foreground-muted">
        <li>VITE_SUPABASE_URL</li>
        <li>VITE_SUPABASE_ANON_KEY</li>
        <li>VITE_GEMINI_API_KEY</li>
        <li>VITE_STRIPE_PUBLIC_KEY</li>
        <li>VITE_APP_URL (opcional, ex: https://seu-dominio.vercel.app)</li>
      </ul>
    </div>
  );
}

async function bootstrap() {
  try {
    const { App } = await import('./App');
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Variáveis de ambiente inválidas ou ausentes.';
    createRoot(root).render(
      <StrictMode>
        <EnvErrorScreen message={message} />
      </StrictMode>,
    );
  }
}

bootstrap();

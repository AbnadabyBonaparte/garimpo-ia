import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';

const root = document.getElementById('root')!;

async function bootstrap() {
  try {
    const { App } = await import('./App');
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (err) {
    const { EnvErrorScreen } = await import('./components/layout/EnvErrorScreen');
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

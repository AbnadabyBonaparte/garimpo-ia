/**
 * GARIMPO IA™ — Header Component
 * LEI 4 ALSHAM: Theme toggle integrado.
 */

import { Sun, Moon, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/contexts/AppContext';

export function Header() {
  const { theme, toggleTheme, isAuthenticated } = useApp();

  return (
    <header className="bg-background-surface/80 sticky top-0 z-[var(--z-sticky)] border-b border-border backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* ── Logo ── */}
        <a href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-foreground">
            GARIMPO <span className="text-cyan">IA</span>
          </span>
        </a>

        {/* ── Navigation ── */}
        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="/"
            className="font-body text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            Feed
          </a>
          <a
            href="/alerts"
            className="font-body text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            Alertas
          </a>
          <a
            href="/analytics"
            className="font-body text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            Analytics
          </a>
        </nav>

        {/* ── Actions ── */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" asChild>
              <a href="/login">Entrar</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

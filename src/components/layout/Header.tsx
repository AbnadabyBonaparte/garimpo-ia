/**
 * GARIMPO IA™ — Header Component
 * LEI 4 ALSHAM: Theme toggle integrado. Notificações in-app via useAlerts.
 */

import { Link } from 'react-router-dom';
import { Sun, Moon, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/contexts/AppContext';
import { useAlerts } from '@/hooks/useAlerts';

export function Header() {
  const { theme, toggleTheme, isAuthenticated } = useApp();
  const { unreadCount } = useAlerts();

  return (
    <header className="bg-background-surface/80 sticky top-0 z-[var(--z-sticky)] border-b border-border backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-foreground">
            GARIMPO <span className="text-cyan">IA</span>
          </span>
        </Link>

        {/* ── Navigation ── */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="font-body text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            Feed
          </Link>
          <Link
            to="/alerts"
            className="font-body text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            Alertas
          </Link>
          <Link
            to="/analytics"
            className="font-body text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            Analytics
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="font-body text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              Painel
            </Link>
          )}
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
              <Button variant="ghost" size="icon" asChild>
                <Link to="/alerts" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

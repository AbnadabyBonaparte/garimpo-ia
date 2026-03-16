/**
 * GARIMPO IA™ — Header Component (updated)
 * LEI 4: Theme toggle. Alerts badge. Profile dropdown. Admin link.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, User, Star, LogOut, Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { Avatar } from '@/components/ui/Avatar';
import { useApp } from '@/contexts/AppContext';
import { useAlerts } from '@/hooks/useAlerts';
import { cn } from '@/lib/utils';

export function Header() {
  const { theme, toggleTheme, isAuthenticated, profile, signOut } = useApp();
  const { unreadCount } = useAlerts();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  async function handleSignOut() {
    setDropdownOpen(false);
    await signOut();
    navigate('/', { replace: true });
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <header className="bg-background-surface/80 sticky top-0 z-[var(--z-sticky)] border-b border-border backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* ── Logo ── */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="font-display text-xl font-bold text-foreground">
            GARIMPO{' '}
            <span className="relative text-cyan">
              IA
              <span className="absolute -right-1.5 -top-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
            </span>
          </span>
        </Link>

        {/* ── Navigation ── */}
        <nav className="hidden items-center gap-5 md:flex">
          {[
            { to: '/', label: 'Feed' },
            { to: '/alerts', label: 'Alertas' },
            { to: '/analytics', label: 'Analytics' },
            { to: '/pricing', label: 'Planos' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-body text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/watchlist"
              className="flex items-center gap-1 font-body text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              <Star className="h-3.5 w-3.5" /> Watchlist
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/opportunities"
              className="flex items-center gap-1 font-body text-xs text-foreground-muted transition-colors hover:text-amber"
            >
              <Shield className="h-3 w-3" /> Admin
            </Link>
          )}
        </nav>

        {/* ── Actions ── */}
        <div className="flex items-center gap-1.5">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {isAuthenticated ? (
            <>
              {/* Alerts bell */}
              <Button variant="ghost" size="icon" asChild>
                <Link to="/alerts" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="font-mono-data absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan px-1 text-[10px] font-bold text-background-deep">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-background-surface-alt"
                >
                  <Avatar name={profile?.full_name} src={profile?.avatar_url} size="sm" />
                  <span className="hidden max-w-[80px] truncate font-body text-xs text-foreground-muted md:block">
                    {profile?.full_name?.split(' ')[0] ?? 'Perfil'}
                  </span>
                </button>

                {dropdownOpen && (
                  <div
                    className={cn(
                      'absolute right-0 top-full z-[var(--z-dropdown)] mt-2 w-52 rounded-lg border border-border bg-background-surface py-1 shadow-elevation-2',
                    )}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 font-body text-sm text-foreground hover:bg-background-surface-alt"
                    >
                      <User className="h-4 w-4 text-foreground-muted" /> Meu perfil
                    </Link>
                    <Link
                      to="/watchlist"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 font-body text-sm text-foreground hover:bg-background-surface-alt"
                    >
                      <Star className="h-4 w-4 text-foreground-muted" /> Watchlist
                    </Link>
                    <Link
                      to="/pricing"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 font-body text-sm text-foreground hover:bg-background-surface-alt"
                    >
                      <Settings className="h-4 w-4 text-foreground-muted" /> Planos
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/opportunities"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 font-body text-sm text-amber hover:bg-background-surface-alt"
                      >
                        <Shield className="h-4 w-4" /> Admin
                      </Link>
                    )}
                    <div className="my-1 h-px bg-border" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 px-4 py-2 font-body text-sm text-foreground-muted transition-colors hover:bg-background-surface-alt hover:text-red"
                    >
                      <LogOut className="h-4 w-4" /> Sair
                    </button>
                  </div>
                )}
              </div>
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

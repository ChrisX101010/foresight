'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamic so SSR doesn't try to evaluate the wallet hooks on the server.
const WalletButton = dynamic(
  () => import('./WalletButton').then((m) => m.WalletButton),
  { ssr: false },
);

const links = [
  { href: '/markets', label: 'Markets' },
  { href: '/vault', label: 'Vault' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/docs', label: 'Docs' },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-ink-900/70 border-b border-ink-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/*
          Logo → always routes to landing page. Applies to both desktop
          and mobile because this <Link> is rendered once for both layouts.
          (Obligo needs the same treatment — that's our next patch target.)
        */}
        <Link
          href="/"
          className="flex items-center gap-2 group transition-opacity hover:opacity-80"
          onClick={close}
          aria-label="Foresight home"
        >
          <svg viewBox="0 0 32 32" className="w-7 h-7 text-plasma flex-shrink-0" aria-hidden>
            <rect x="2" y="2" width="28" height="28" rx="6" fill="currentColor" />
            <path
              d="M 9 10 L 23 10 M 9 16 L 19 16 M 9 22 L 9 10"
              stroke="#0A0B0F"
              strokeWidth="2.5"
              strokeLinecap="square"
              fill="none"
            />
          </svg>
          <span className="display text-xl tracking-tight">Foresight</span>
          <span className="mono text-[10px] text-fog border border-ink-500 rounded px-1.5 py-0.5 ml-1 hidden sm:inline-block">
            BETA
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {links.map((l) => {
            const active = pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'px-3 py-2 text-sm rounded-md transition-colors',
                  active
                    ? 'text-plasma'
                    : 'text-fog hover:text-chalk hover:bg-ink-700',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <WalletButton />
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-md text-fog hover:text-chalk hover:bg-ink-700 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="md:hidden border-t border-ink-600 bg-ink-900/95 backdrop-blur-md"
          onClick={close}
          aria-label="Mobile"
        >
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {links.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'px-3 py-3 text-base rounded-md transition-colors',
                    active
                      ? 'text-plasma bg-plasma/5'
                      : 'text-fog hover:text-chalk hover:bg-ink-700',
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

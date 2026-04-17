'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false }
);
import { cn } from '@/lib/utils';

const links = [
  { href: '/markets', label: 'Markets' },
  { href: '/vault', label: 'Vault' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/docs', label: 'Docs' },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-ink-900/70 border-b border-ink-600">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          {/* Monogram — two interlocking Fs forming the shape of an eye */}
          <svg viewBox="0 0 32 32" className="w-7 h-7 text-plasma">
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
          <span className="mono text-[10px] text-fog border border-ink-500 rounded px-1.5 py-0.5 ml-1">
            BETA
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
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
                    : 'text-fog hover:text-chalk hover:bg-ink-700'
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}

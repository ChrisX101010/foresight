'use client';

// ────────────────────────────────────────────────────────────────────────
// Custom wallet button.
//
// Replaces @solana/wallet-adapter-react-ui's <WalletMultiButton/> because:
//   1. The adapter dropdown is pinned to the button's right edge — we want
//      it centered under the trigger, per the design.
//   2. The adapter's post-disconnect copy is inconsistent across versions
//      (some show "Connected: …" even after disconnect). We control it.
//   3. We want to show the Solflare icon when connected via Solflare as
//      part of the bounty-sponsor polish.
//
// Still uses the adapter's WalletModal for *selection*; we only replace
// the connected-state button + dropdown.
// ────────────────────────────────────────────────────────────────────────

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Copy, LogOut, Wallet as WalletIcon, ChevronDown, RefreshCw } from 'lucide-react';
import { cn, shortAddr } from '@/lib/utils';

export function WalletButton() {
  const { publicKey, wallet, connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape. Both are required for a11y.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleCopy = useCallback(async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey.toBase58());
      toast.success('Address copied');
    } catch {
      toast.error('Could not copy address');
    }
    setOpen(false);
  }, [publicKey]);

  const handleChange = useCallback(async () => {
    setOpen(false);
    try {
      await disconnect();
    } catch {
      /* ignore; modal will still open */
    }
    setVisible(true);
  }, [disconnect, setVisible]);

  const handleDisconnect = useCallback(async () => {
    setOpen(false);
    try {
      await disconnect();
      // No toast here — Providers.tsx / WalletStatusWatcher fires the single
      // "Wallet disconnected" toast on the connected→disconnected transition.
    } catch (err) {
      toast.error('Could not disconnect', {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }, [disconnect]);

  // Not connected → show Connect CTA that opens the adapter modal.
  if (!connected || !publicKey) {
    return (
      <button
        type="button"
        onClick={() => setVisible(true)}
        disabled={connecting}
        className={cn(
          'flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition min-w-[168px]',
          'bg-plasma text-ink-900 hover:bg-plasma/90',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      >
        <WalletIcon className="w-4 h-4" />
        {connecting ? 'Connecting…' : 'Connect wallet'}
      </button>
    );
  }

  const addr = publicKey.toBase58();
  const walletIconUrl = wallet?.adapter.icon;

  return (
    // relative parent — the absolute dropdown positions against this.
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex items-center justify-center gap-2 rounded-full px-3.5 py-2 transition min-w-[168px]',
          'bg-plasma text-ink-900 hover:bg-plasma/90',
          'mono text-xs font-medium',
        )}
      >
        {walletIconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={walletIconUrl}
            alt=""
            width={16}
            height={16}
            className="rounded-sm"
          />
        ) : (
          <WalletIcon className="w-4 h-4" />
        )}
        <span>{shortAddr(addr, 4)}</span>
        <ChevronDown
          className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        // 🔑 CENTERING:
        //   left-1/2 + -translate-x-1/2 centers the menu horizontally
        //   under the trigger, independent of trigger width.
        //   top-full + mt-2 sits it below with breathing room.
        //   min-w ensures it doesn't collapse narrower than it needs.
        <div
          role="menu"
          className={cn(
            'absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2',
            'min-w-[220px] rounded-2xl bg-ink-800 p-1.5 shadow-2xl',
            'ring-1 ring-ink-500',
          )}
        >
          {/* Address preview header */}
          <div className="px-3 py-2 border-b border-ink-600 mb-1">
            <div className="mono text-[10px] uppercase tracking-wider text-fog mb-0.5">
              {wallet?.adapter.name ?? 'Wallet'}
            </div>
            <div className="mono text-xs text-chalk truncate">{shortAddr(addr, 6)}</div>
          </div>

          <MenuItem onClick={handleCopy} icon={<Copy className="w-3.5 h-3.5" />}>
            Copy address
          </MenuItem>
          <MenuItem onClick={handleChange} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Change wallet
          </MenuItem>
          <MenuItem
            onClick={handleDisconnect}
            icon={<LogOut className="w-3.5 h-3.5" />}
            danger
          >
            Disconnect
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  children,
  icon,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition',
        'hover:bg-ink-700',
        danger ? 'text-rose-400 hover:text-rose-300' : 'text-chalk',
      )}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

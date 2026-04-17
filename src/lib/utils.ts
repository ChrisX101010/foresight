import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Number formatting ────────────────────────────────────────────────────

const usdFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFmt = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatUsd(n: number): string {
  if (!Number.isFinite(n)) return '$0.00';
  return usdFmt.format(n);
}

export function formatCompactUsd(n: number): string {
  if (!Number.isFinite(n)) return '$0';
  return '$' + compactFmt.format(n);
}

export function formatPct(n: number, decimals = 1): string {
  if (!Number.isFinite(n)) return '0%';
  return `${(n * 100).toFixed(decimals)}%`;
}

export function formatImpliedProb(price: number): string {
  // DFlow / Kalshi prices are in 0..1 space. Show as integer cents.
  return `${Math.round(price * 100)}¢`;
}

// ─── Time ────────────────────────────────────────────────────────────────

export function timeUntil(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'closed';
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  return `${hours}h ${mins}m`;
}

// ─── Address helpers ─────────────────────────────────────────────────────

export function shortAddr(addr: string, chars = 4): string {
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`;
}

// ─── Safe fetch with JSON + error surfacing ──────────────────────────────

export async function jsonFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Fetch ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

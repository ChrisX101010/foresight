'use client';

import { redirect } from 'next/navigation';

// /vault is an alias for the markets terminal — keeps the deposit-focused
// CTA discoverable from the nav.
export default function VaultRedirect() {
  redirect('/markets');
}

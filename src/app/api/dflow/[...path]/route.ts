// ────────────────────────────────────────────────────────────────────────
// Server-side proxy to DFlow's Metadata API.
//
// Default upstream is the dev endpoint (key-less, rate-limited).
// Set DFLOW_METADATA_BASE + DFLOW_API_KEY in .env.local for production.
// ────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';

const DFLOW_BASE =
  process.env.DFLOW_METADATA_BASE ?? 'https://dev-prediction-markets-api.dflow.net';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const subPath = params.path.join('/');
  const search = req.nextUrl.search;
  const upstream = `${DFLOW_BASE}/api/v1/${subPath}${search}`;

  const headers: Record<string, string> = { accept: 'application/json' };
  if (process.env.DFLOW_API_KEY) {
    headers['x-api-key'] = process.env.DFLOW_API_KEY;
  }

  try {
    const res = await fetch(upstream, { headers, next: { revalidate: 15 } });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        'content-type': res.headers.get('content-type') ?? 'application/json',
        'cache-control': 'public, s-maxage=15, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'DFlow upstream unreachable', detail: String(err) },
      { status: 502 }
    );
  }
}

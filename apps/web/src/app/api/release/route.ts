import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Cross-provider release identity for Render and Netlify.

export function GET() {
  const commit =
    process.env.RENDER_GIT_COMMIT ||
    process.env.COMMIT_REF ||
    process.env.GITHUB_SHA ||
    process.env.DELTA_BUILD_COMMIT ||
    null;
  const provider = process.env.RENDER_GIT_COMMIT
    ? 'render'
    : process.env.COMMIT_REF
      ? 'netlify'
      : process.env.GITHUB_SHA
        ? 'github'
        : process.env.DELTA_BUILD_PROVIDER || 'unknown';

  return NextResponse.json(
    {
      service: 'delta-travel-web',
      commit,
      provider,
      environment: process.env.CONTEXT ?? process.env.NODE_ENV ?? null,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}

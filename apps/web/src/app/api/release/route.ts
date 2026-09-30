import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    {
      service: 'delta-travel-web',
      commit:
        process.env.RENDER_GIT_COMMIT ?? process.env.COMMIT_REF ?? process.env.GITHUB_SHA ?? null,
      provider: process.env.RENDER_GIT_COMMIT
        ? 'render'
        : process.env.COMMIT_REF
          ? 'netlify'
          : process.env.GITHUB_SHA
            ? 'github'
            : 'unknown',
      environment: process.env.CONTEXT ?? process.env.NODE_ENV ?? null,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}

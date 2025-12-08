import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // OG image generation removed - we no longer cache images
  // Return a simple 404 or placeholder
  return new Response('OG image not available', { status: 404 });
}


import { env } from '@shared/env.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';

const ALLOWED_METHODS = 'GET, POST, OPTIONS';
const ALLOWED_HEADERS = 'Authorization, Content-Type, x-client-info, apikey';

function getAllowedOrigins(): string[] {
  return env.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function getAllowedOrigin(req?: Request): string {
  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.includes('*')) {
    return '*';
  }

  const requestOrigin = req?.headers.get('Origin');

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0] ?? '';
}

export function corsHeaders(req?: Request): HeadersInit {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(req),
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    Vary: 'Origin',
  };
}

export function handleCorsPreflight(req: Request): Response | null {
  if (req.method !== 'OPTIONS') {
    return null;
  }

  return new Response(null, {
    status: HTTP_STATUS.OK,
    headers: corsHeaders(req),
  });
}

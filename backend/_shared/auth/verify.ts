import { createClient } from '@supabase/supabase-js';

import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';

export interface AuthContext {
  userId: string;
  jwt: string;
}

export class AuthError extends Error {
  readonly code = ERROR_CODES.UNAUTHORIZED;
  readonly status = HTTP_STATUS.UNAUTHORIZED;

  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message);
    this.name = 'AuthError';
  }
}

function extractBearerToken(req: Request): string | null {
  const authorization = req.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

export async function verifyAuth(req: Request): Promise<AuthContext | null> {
  const jwt = extractBearerToken(req);

  if (!jwt) {
    return null;
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  });

  try {
    const { data, error } = await supabase.auth.getUser(jwt);

    if (error || !data.user) {
      return null;
    }

    return {
      userId: data.user.id,
      jwt,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request): Promise<AuthContext> {
  const auth = await verifyAuth(req);

  if (!auth) {
    throw new AuthError();
  }

  return auth;
}

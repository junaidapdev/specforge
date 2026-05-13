import { env } from '@/config/env';

export type EdgeResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export async function callEdgeFunction<T>(
  name: string,
  body: unknown,
  accessToken: string,
): Promise<T> {
  const response = await window.fetch(`${env.VITE_SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  let json: EdgeResult<T> | null = null;

  try {
    json = (await response.json()) as EdgeResult<T>;
  } catch {
    throw new Error('UNKNOWN');
  }

  if (!response.ok || !json.ok) {
    throw new Error(json.ok ? 'UNKNOWN' : json.error.code);
  }

  return json.data;
}

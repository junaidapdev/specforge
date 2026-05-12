import { HTTP_STATUS } from '@shared/constants/http.ts';
import { corsHeaders } from '@shared/http/cors.ts';

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiError = { ok: false; error: { code: string; message: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

function jsonResponse<T>(body: ApiResponse<T>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
    },
  });
}

export function ok<T>(data: T, status: number = HTTP_STATUS.OK): Response {
  return jsonResponse({ ok: true, data }, status);
}

export function created<T>(data: T): Response {
  return ok(data, HTTP_STATUS.CREATED);
}

export function fail(code: string, message: string, status: number): Response {
  return jsonResponse({ ok: false, error: { code, message } }, status);
}

import type { AuthError } from '@supabase/supabase-js';

import { ERROR_MESSAGES } from '@/constants/errors';

export const AUTH_MESSAGES = {
  SIGN_IN_TITLE: 'Sign in to SpecForge',
  SIGN_IN_SUBTITLE: 'Welcome back. Pick up where you left off.',
  SIGN_UP_TITLE: 'Create your SpecForge account',
  SIGN_UP_SUBTITLE: 'Start turning ideas into shippable specs.',
  EMAIL_LABEL: 'Email',
  PASSWORD_LABEL: 'Password',
  DISPLAY_NAME_LABEL: 'Name (optional)',
  SIGN_IN_BUTTON: 'Sign in',
  SIGN_UP_BUTTON: 'Create account',
  GOOGLE_BUTTON: 'Continue with Google',
  OR_DIVIDER: 'or',
  TO_SIGN_UP: "Don't have an account?",
  TO_SIGN_UP_LINK: 'Create one',
  TO_SIGN_IN: 'Already have an account?',
  TO_SIGN_IN_LINK: 'Sign in',
  EMAIL_SENT_TITLE: 'Check your email',
  EMAIL_SENT_BODY: 'We sent you a confirmation link. Click it to finish setting up your account.',
  CONFIRM_SUCCESS: 'Email confirmed. You are signed in.',
  CONFIRM_FAILED: 'We could not confirm your email. The link may have expired.',
  OAUTH_PROCESSING: 'Finishing sign-in...',
  OAUTH_FAILED: 'Sign-in did not complete. Try again.',
  SIGN_OUT_BUTTON: 'Sign out',
} as const;

export function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) {
    return ERROR_MESSAGES.GENERIC;
  }

  const normalized = `${error.code ?? ''} ${error.message}`.toLowerCase();

  if (
    normalized.includes('invalid login') ||
    normalized.includes('invalid credentials') ||
    normalized.includes('invalid_grant')
  ) {
    return ERROR_MESSAGES.INVALID_CREDENTIALS;
  }

  if (normalized.includes('email not confirmed') || normalized.includes('not confirmed')) {
    return ERROR_MESSAGES.EMAIL_NOT_CONFIRMED;
  }

  if (
    normalized.includes('already registered') ||
    normalized.includes('already exists') ||
    normalized.includes('user already')
  ) {
    return ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED;
  }

  if (normalized.includes('weak password') || normalized.includes('password')) {
    return ERROR_MESSAGES.WEAK_PASSWORD;
  }

  if (
    normalized.includes('oauth') ||
    normalized.includes('provider') ||
    normalized.includes('redirect')
  ) {
    return ERROR_MESSAGES.OAUTH_UNAVAILABLE;
  }

  return ERROR_MESSAGES.GENERIC;
}

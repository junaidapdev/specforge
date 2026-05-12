import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { getAuthErrorMessage, AUTH_MESSAGES } from './messages';
import { useAuth } from './useAuth';

type GoogleSignInButtonProps = {
  onError?: (message: string) => void;
};

export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  async function handleClick(): Promise<void> {
    setIsLoading(true);
    onError?.('');

    const { error } = await signInWithGoogle();

    if (error) {
      onError?.(getAuthErrorMessage(error));
      setIsLoading(false);
    }
  }

  return (
    <Button
      className="w-full"
      disabled={isLoading}
      type="button"
      variant="outline"
      onClick={() => {
        void handleClick();
      }}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon className="mr-2 h-4 w-4" />
      )}
      {AUTH_MESSAGES.GOOGLE_BUTTON}
    </Button>
  );
}

type GoogleIconProps = {
  className?: string;
};

function GoogleIcon({ className }: GoogleIconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <path
        d="M21.35 11.1h-9.18v2.94h5.29c-.23 1.24-.93 2.29-1.98 2.99v2.48h3.2c1.87-1.72 2.95-4.25 2.95-7.24 0-.41-.04-.79-.11-1.17z"
        fill="#4285F4"
      />
      <path
        d="M12.17 21.6c2.67 0 4.91-.88 6.55-2.39l-3.2-2.48c-.89.6-2.03.95-3.35.95-2.58 0-4.76-1.74-5.54-4.08h-3.3v2.56a9.88 9.88 0 0 0 8.84 5.44z"
        fill="#34A853"
      />
      <path d="M6.63 13.6a5.94 5.94 0 0 1 0-3.8V7.24h-3.3a9.9 9.9 0 0 0 0 8.92z" fill="#FBBC05" />
      <path
        d="M12.17 5.72c1.45 0 2.75.5 3.78 1.48l2.83-2.83A9.5 9.5 0 0 0 12.17 1.8a9.88 9.88 0 0 0-8.84 5.44l3.3 2.56c.78-2.34 2.96-4.08 5.54-4.08z"
        fill="#EA4335"
      />
    </svg>
  );
}

import { Globe, Loader2 } from 'lucide-react';
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
        <Globe className="mr-2 h-4 w-4" aria-hidden="true" />
      )}
      {AUTH_MESSAGES.GOOGLE_BUTTON}
    </Button>
  );
}

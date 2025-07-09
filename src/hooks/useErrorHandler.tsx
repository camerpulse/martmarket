import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

interface ErrorHandlerOptions {
  title?: string;
  showToast?: boolean;
  logError?: boolean;
}

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      title = "Error",
      showToast = true,
      logError = true
    } = options;

    let errorMessage = "An unexpected error occurred";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }

    if (logError) {
      console.error('Error handled:', { error, errorMessage, options });
    }

    if (showToast) {
      toast({
        title,
        description: errorMessage,
        variant: "destructive",
      });
    }

    return { errorMessage, originalError: error };
  }, [toast]);

  return { handleError };
}
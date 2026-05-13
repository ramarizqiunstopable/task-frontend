'use client';

import { useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center space-y-4 px-4 text-center">
      <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md">
        We encountered an error while trying to load the user profile. This could be due to a network issue or an invalid user ID.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="outline">Try again</Button>
        <Link href="/users" className={buttonVariants({ variant: 'default' })}>
          Return to Users List
        </Link>
      </div>
    </div>
  );
}

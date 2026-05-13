import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';

export default function UserNotFound() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center space-y-4 px-4 text-center">
      <div className="bg-muted p-4 rounded-full mb-4">
        <UserX className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">User Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        The user you are looking for does not exist or has been removed.
      </p>
      <Button >
        <Link href="/users">Return to Users List</Link>
      </Button>
    </div>
  );
}

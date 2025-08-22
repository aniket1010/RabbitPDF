'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { Button } from './ui/button';
import { LogIn, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ClientOnly from './ClientOnly';

function AuthButtonContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <Button variant="ghost" disabled>
        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
        Loading...
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">{session.user.name || session.user.email}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => router.push('/sign-in')}
      className="flex items-center gap-2"
    >
      <LogIn className="h-4 w-4" />
      Sign In
    </Button>
  );
}

export default function AuthButton() {
  return (
    <ClientOnly
      fallback={
        <Button variant="ghost" disabled>
          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
          Loading...
        </Button>
      }
    >
      <AuthButtonContent />
    </ClientOnly>
  );
} 
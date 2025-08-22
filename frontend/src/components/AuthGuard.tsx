'use client';

import { useSession } from '@/lib/auth-client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthButton from './AuthButton';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated and not loading, redirect to home
    if (!isPending && !session?.user) {
      router.push('/');
    }
    // If authenticated but email not verified, redirect to verify page notice
    if (!isPending && session?.user && (session.user as any).emailVerified === false) {
      router.push('/verify-email');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    // Return null while redirecting to prevent flash of fallback content
    return null;
  }

  return <>{children}</>;
} 
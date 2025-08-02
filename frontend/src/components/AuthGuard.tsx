'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import AuthButton from './AuthButton';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
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
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to ChatPDF
            </h1>
            <p className="text-gray-600 mb-6">
              Sign in to upload PDFs and start chatting with your documents
            </p>
            <AuthButton />
            <div className="mt-6 text-sm text-gray-500">
              <p>Choose from Google, GitHub, or Email authentication</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 
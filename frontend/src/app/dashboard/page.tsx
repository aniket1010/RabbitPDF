'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Spinner from '@/components/Spinner';

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Welcome to ChatPDF!</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
          <p className="text-gray-600 mb-4">
            Hello, {session.user.name || session.user.email}! You're successfully signed in.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Upload PDF</h3>
              <p className="text-blue-700 text-sm">Start by uploading a PDF document</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Chat with AI</h3>
              <p className="text-green-700 text-sm">Ask questions about your documents</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">View History</h3>
              <p className="text-purple-700 text-sm">Access your previous conversations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

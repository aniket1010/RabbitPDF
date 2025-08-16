'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components';
import { getConversationDetails } from '@/services/api';
import AuthGuard from '@/components/AuthGuard';

interface ConversationDetails {
  id: string;
  title: string;
  filePath: string;
  createdAt: string;
}

interface PageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default function ConversationPage({ params }: PageProps) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string>('');
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ conversationId }) => {
      setConversationId(conversationId);
    });
  }, [params]);

  useEffect(() => {
    if (!conversationId) return;

    const loadConversation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading conversation details for ID:', conversationId);
        const details = await getConversationDetails(conversationId);
        console.log('Conversation details loaded:', details);
        setConversationDetails(details);
        
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !conversationDetails) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {error || 'Conversation Not Found'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            There was an error loading the conversation. Please try again.
          </p>
          
          <button 
            onClick={handleBackToHome}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <MainLayout
        filePath={conversationDetails.filePath}
        conversationId={conversationDetails.id}
      />
    </AuthGuard>
  );
}
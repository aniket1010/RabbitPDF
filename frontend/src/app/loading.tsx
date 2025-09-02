import Spinner from '@/components/Spinner';

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800">
      <div className="text-center">
        <Spinner size={40} className="mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
} 
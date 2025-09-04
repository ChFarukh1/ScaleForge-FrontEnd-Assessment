'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard by default
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to ScaleForge
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Redirecting to dashboard...
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}

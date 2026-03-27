'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      console.log('No session, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('Session found:', { user: session.user.email, role: session.user.role });

    // Redirect to role-specific dashboard
    if (session.user.role === 'STUDENT') {
      console.log('Redirecting to student dashboard');
      router.push('/dashboard/student');
    } else if (session.user.role === 'TEACHER') {
      console.log('Redirecting to teacher dashboard');
      router.push('/dashboard/teacher');
    } else if (session.user.role === 'PARENT') {
      console.log('Redirecting to parent portal');
      router.push('/parent-portal');
    } else {
      console.log('Unknown role, redirecting to student dashboard');
      router.push('/dashboard/student');
    }
  }, [session, status, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
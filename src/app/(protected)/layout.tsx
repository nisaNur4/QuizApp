'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedLayoutProps {
  children: ReactNode;
  requireTeacher?: boolean;
  requireStudent?: boolean;
}

export default function ProtectedLayout({
  children,
  requireTeacher = false,
  requireStudent = false,
}: ProtectedLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if ((requireTeacher && user.role !== 'teacher') || 
          (requireStudent && user.role !== 'student')) {
        const redirectPath = user.role === 'teacher' 
          ? '/instructor/dashboard' 
          : '/student/dashboard';
        router.push(redirectPath);
      }
    }
  }, [user, loading, requireTeacher, requireStudent, router]);
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return <>{children}</>;
}

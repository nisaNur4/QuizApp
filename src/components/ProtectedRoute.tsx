"use client";

import { useEffect, ReactNode, FC, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;

  requireTeacher?: boolean;
  requireStudent?: boolean;
  redirectTo?: string;
  onUnauthenticated?: () => void;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  requireAuth,
  requireTeacher = false,
  requireStudent = false,
  redirectTo,
  onUnauthenticated
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (requireAuth && !user) {
      if (onUnauthenticated) {
        onUnauthenticated();
      }
      const callbackUrl = encodeURIComponent(pathname);
      router.push(redirectTo || `/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (requireAuth === false && user) {
      router.push(redirectTo || (user.role === 'teacher' ? "/instructor/dashboard" : "/student/dashboard"));
      return;
    }

    if (user) {
      if (requireTeacher && user.role !== 'teacher') {
        router.push(redirectTo || "/");
        return;
      }
      if (requireStudent && user.role !== 'student') {
        router.push(redirectTo || "/");
        return;
      }
      if ('is_active' in user && user.is_active === false) {
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/login?error=account_inactive');
        return;
      }
    }
    
    setChecking(false);
  }, [user, loading, router, requireAuth, requireTeacher, requireStudent, redirectTo]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if ((requireAuth && user) || requireAuth === false || requireAuth === undefined) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erişim Reddedildi</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.
        </p>
      </div>
    </div>
  );

  return null;
};

export default ProtectedRoute;

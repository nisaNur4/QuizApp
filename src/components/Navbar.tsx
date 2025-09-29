"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  const isTeacher = user.is_teacher;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-blue-700 dark:text-blue-300">
              QuizApp
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {isTeacher ? (
              <>
                <Link 
                  href="/instructor/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Ana Sayfa
                </Link>
                <Link 
                  href="/instructor/quizzes"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Sınavlarım
                </Link>
                <Link 
                  href="/instructor/quizzes/new"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Yeni Sınav
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/student/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Ana Sayfa
                </Link>
                <Link 
                  href="/student/quizzes"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Sınavlar
                </Link>
                <Link 
                  href="/student/result"
                  className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                >
                  Sonuçlarım
                </Link>
              </>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {user.name}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Çıkış Yap
                </button>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Ayarlar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isTeacher ? (
            <>
              <Link 
                href="/dashboard"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/instructor/quizzes"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Quizlerim
              </Link>
              <Link 
                href="/instructor/create-quiz"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Yeni Quiz
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/dashboard"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-300"
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/student/quizzes"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-300"
              >
                Quizler
              </Link>
              <Link 
                href="/student/result"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-300"
              >
                Sonuçlarım
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

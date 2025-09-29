'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/Card';
import Button from '@/components/ui/Button';
import apiService from '@/mock/apiClient';

interface Quiz {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function StudentDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();
  const { user, token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push('/login');
      } else if (user?.is_teacher) {
        router.push('/instructor/dashboard');
      }
    }
  }, [token, user, authLoading, router]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!token || !user || user.is_teacher) return;
      
      try {
        setLoading(true);
        const response = await apiService.getQuizzes();
        
        if (!response.success) {
          if (response.error?.status_code === 401) {
            router.push('/login');
            return;
          }
          throw new Error(response.error?.message || 'Sınavlar yüklenirken bir hata oluştu');
        }

        setQuizzes(response.data || []);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        const errorMessage = error instanceof Error ? error.message : 'Sınavlar yüklenirken bir hata oluştu';
        toast.showToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (token && user && !user.is_teacher) {
      fetchQuizzes();
    }
  }, [token, user, router, toast]);

  const handleStartQuiz = (quizId: number) => {
    router.push(`/student/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Öğrenci Paneli</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{quiz.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{quiz.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(quiz.created_at).toLocaleDateString()}
              </span>
              <Button 
                onClick={() => handleStartQuiz(quiz.id)}
                variant="primary"
              >
                Sınava Başla
              </Button>
            </div>
          </Card>
        ))}
        
        {quizzes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Henüz hiç sınav bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}

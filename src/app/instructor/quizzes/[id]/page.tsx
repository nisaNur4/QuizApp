'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import QuizForm, { Question as FormQuestion, QuizFormData } from '@/components/quiz/QuizForm';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import apiService from '@/mock/apiClient';

type ApiQuestion = {
  id?: string;
  type?: 'multiple_choice' | 'true_false' | 'short_answer';
  content?: string;
  options?: string[];
  correct_answer?: string | string[];
  points?: number;
  [key: string]: any; 
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: FormQuestion[];
  created_at: string;
  updated_at: string;
};

const transformApiQuestion = (q: ApiQuestion): FormQuestion => {
  const questionId = q.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const questionType = (q.type && ['multiple_choice', 'true_false', 'short_answer'].includes(q.type))
    ? q.type as 'multiple_choice' | 'true_false' | 'short_answer'
    : 'multiple_choice';
  
  const options = Array.isArray(q.options) ? q.options : [];
  let correctAnswer: string | string[] = [];
  if (q.correct_answer) {
    correctAnswer = Array.isArray(q.correct_answer) 
      ? q.correct_answer 
      : [q.correct_answer];
  }
  
  return {
    id: questionId,
    type: questionType,
    content: q.content || '',
    options: options,
    correctAnswer: correctAnswer,
    points: typeof q.points === 'number' && q.points >= 0 ? q.points : 1
  };
};

export default function EditQuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const quizId = Array.isArray(id) ? id[0] : id;
        if (!quizId) {
          throw new Error('Geçersiz sınav ID\'si');
        }

        const response = await apiService.getQuizById(Number(quizId));
        if (!response.success || !response.data) {
          toast.showToast('Sınav bulunamadı', 'error');
          router.push('/instructor/dashboard');
          return;
        }
        const data = response.data;
        
        if (!isMounted) return;
        
        const transformedData: Quiz = {
          id: data.id || quizId,
          title: data.title || '',
          description: data.description || '',
          timeLimit: typeof data.timeLimit === 'number' ? data.timeLimit : 30,
          passingScore: typeof data.passingScore === 'number' ? data.passingScore : 70,
          questions: Array.isArray(data.questions) 
            ? data.questions.map(transformApiQuestion)
            : [],
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString()
        };

        setQuiz(transformedData);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        if (!isMounted) return;
        
        toast.showToast('Sınav yüklenirken bir hata oluştu', 'error');
        router.push('/instructor/dashboard');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    if (id) {
      fetchQuiz();
    }
    
    return () => {
      isMounted = false;
    };
  }, [id, router, toast]);

  const handleUpdateQuiz = async (formData: QuizFormData): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const quizId = Array.isArray(id) ? id[0] : id;
      if (!quizId) {
        throw new Error('Geçersiz sınav ID\'si');
      }

      const apiData = {
        ...formData,
        id: undefined,
        questions: formData.questions.map(q => {
          const questionData: any = {
            id: q.id,
            type: q.type,
            content: q.content,
            points: q.points,
            options: q.options || []
          };
          
          if (q.type === 'multiple_choice' || q.type === 'true_false') {
            questionData.correct_answer = Array.isArray(q.correctAnswer) 
              ? q.correctAnswer[0] || ''
              : q.correctAnswer || '';
          } else {
            questionData.correct_answer = q.correctAnswer || '';
          }
          
          return questionData;
        })
      };

      const response = await apiService.updateQuiz(Number(quizId), apiData);
      if (!response.success) {
        const errorMessage = response.error?.message || 'Sınav güncellenirken bir hata oluştu';
        throw new Error(errorMessage);
      }

      toast.showToast('Sınav başarıyla güncellendi', 'success');
      router.push('/instructor/dashboard');
    } catch (error) {
      console.error('Error updating quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      toast.showToast(`Sınav güncellenirken bir hata oluştu: ${errorMessage}`, 'error');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu sınavı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      const quizId = Array.isArray(id) ? Number(id[0]) : Number(id);
      const response = await apiService.deleteQuiz(quizId);
      if (response.success) {
        toast.showToast('Sınav başarıyla silindi', 'success');
        router.push('/instructor/dashboard');
      } else {
        throw new Error(response.error?.message || 'Sınav silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.showToast('Sınav silinirken bir hata oluştu', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Sınav yüklenirken bir hata oluştu.</p>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sınavı Düzenle</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Aşağıdaki formu kullanarak sınav bilgilerini güncelleyebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Sınavı Sil
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <QuizForm 
            initialData={{
              title: quiz.title,
              description: quiz.description,
              timeLimit: quiz.timeLimit,
              passingScore: quiz.passingScore,
              questions: quiz.questions.map(q => ({
                ...q,
                options: Array.isArray(q.options) ? q.options : [],
                correctAnswer: Array.isArray(q.correctAnswer) 
                  ? q.correctAnswer 
                  : q.correctAnswer ? [q.correctAnswer] : []
              }))
            }}
            isEditing={true}
            onSubmit={handleUpdateQuiz}
          />
        </div>
      </div>
    </div>
  );
}
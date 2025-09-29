"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import apiService from "@/mock/apiClient";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from "next/navigation";
import Card from '@/components/Card';
import Button from '@/components/ui/Button';
import { FeedbackResponse } from '@/components/ai-feedback';

interface Answer {
  id: number;
  question_id: number;
  selected_option: string;
  is_correct: boolean;
  score: number;
  question: {
    text: string;
    correct_option: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
  };
}

interface QuizResults {
  total_score: number;
  answers: Answer[];
}

export default function StudentResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResults>({
    total_score: 0,
    answers: [],
  });
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const fetchFeedback = async (answerId: number): Promise<FeedbackResponse> => {
    const response = await apiService.getAIFeedback(answerId);
    if (response.success && response.data) {
      return response.data as FeedbackResponse;
    }
    throw new Error('Feedback alınamadı');
  };

  useEffect(() => {
    if (!user) return;
    const fetchResults = async () => {
      try {
        const response = await apiService.getStudentResults(user.id);
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Sonuçlar alınamadı');
        }
        
        const data: QuizResults = response.data as QuizResults;
        setResults(data);
        const feedbackPromises = data.answers
          .filter((ans) => !ans.is_correct && ans.id)
          .map(async (ans) => {
            try {
              const feedbackResponse = await fetchFeedback(ans.id);
              return { 
                answerId: ans.id, 
                feedback: feedbackResponse.explanation || 'Geri bildirim bulunamadı' 
              };
            } catch (error) {
              console.error('Feedback yüklenirken hata:', error);
              return null;
            }
          });
          
        const feedbackResults = await Promise.all(feedbackPromises);
        const feedbacksMap = feedbackResults.reduce((acc, curr) => {
          if (curr) {
            acc[curr.answerId] = curr.feedback;
          }
          return acc;
        }, {} as Record<number, string>);
        
        setFeedbacks(feedbacksMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  if (loading) return <LoadingSpinner size={48} />;
  if (error) return <div className="text-center text-red-600">{error}</div>;
  if (!results.answers.length) return <div className="text-center">Sonuç bulunamadı</div>;

  const totalQuestions = results.answers.length;
  const correctAnswers = results.answers.filter(a => a.is_correct).length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const isPassed = score >= 60; 
  const timeSpent = '5:24';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="p-8 text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200 dark:text-gray-700"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={`${isPassed ? 'text-green-500' : 'text-red-500'}`}
                  strokeWidth="10"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  strokeDasharray={`${(correctAnswers / totalQuestions) * 251.2} 251.2`}
                  transform="rotate(-90 50 50)"
                />
                <text
                  x="50"
                  y="55"
                  className="text-2xl font-bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {score}%
                </text>
              </svg>
            </div>

            <h1 className={`text-3xl font-bold mb-2 ${isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPassed ? 'Tebrikler! 🎉' : 'Daha Çok Çalışmalısın! 💪'}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
              {isPassed 
                ? `Harika iş çıkardın! ${correctAnswers} sorudan ${totalQuestions} tanesini doğru yanıtladın.`
                : `Toplam ${correctAnswers} doğru yanıtın var. Başarıya çok yakınsın, biraz daha çalışmalısın.`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{correctAnswers}</div>
                <div className="text-gray-600 dark:text-gray-300">Doğru Cevap</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{totalQuestions - correctAnswers}</div>
                <div className="text-gray-600 dark:text-gray-300">Yanlış Cevap</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{timeSpent}</div>
                <div className="text-gray-600 dark:text-gray-300">Geçen Süre</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/student/quizzes")}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Ana Sayfaya Dön
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Tekrar Dene
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Detaylı Sonuçlar</h2>
            <div className="space-y-4">
              {results.answers.map((ans, index) => {
                const selectedOptionKey = `option_${ans.selected_option.toLowerCase()}` as keyof typeof ans.question;
                const correctOptionKey = `option_${ans.question.correct_option.toLowerCase()}` as keyof typeof ans.question;
                const isCorrect = ans.is_correct;
                
                return (
                  <Card 
                    key={ans.id}
                    className={`overflow-hidden ${isCorrect ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mb-3">
                            Soru {index + 1}
                          </span>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                            {ans.question.text}
                          </h3>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          isCorrect 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {isCorrect ? 'Doğru' : 'Yanlış'}
                        </span>
                      </div>

                      <div className="space-y-3 mt-4">
                        <div className={`p-3 rounded-lg border ${
                          isCorrect 
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                        }`}>
                          <div className="font-medium text-gray-700 dark:text-gray-200 mb-1">Senin Cevabın:</div>
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5 ${
                              isCorrect 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'
                            }`}>
                              {String.fromCharCode(65 + (ans.selected_option?.charCodeAt(0) - 65) || 0)}
                            </div>
                            <span>{ans.question[selectedOptionKey] || 'Cevap verilmedi'}</span>
                          </div>
                        </div>

                        {!isCorrect && (
                          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                            <div className="font-medium text-gray-700 dark:text-gray-200 mb-1">Doğru Cevap:</div>
                            <div className="flex items-start">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-2 mt-0.5">
                                {ans.question.correct_option}
                              </div>
                              <span>{ans.question[correctOptionKey]}</span>
                            </div>
                          </div>
                        )}

                        {!isCorrect && feedbacks[ans.id] && (
                          <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500 rounded-r">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">İpucu</h3>
                                <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                  {feedbacks[ans.id]}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sıradaki Adımlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Eksiklerini Gider</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Yanlış yaptığın konuları tekrar et ve öğrenmeye devam et.</p>
                <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Sonuçları İncele
                </Button>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Yeni Bir Quiz Çöz</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Bilgini test etmek için yeni bir quiz seç.</p>
                <Button variant="primary" size="sm" onClick={() => router.push('/student/quizzes')}>
                  Quizlere Göz At
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
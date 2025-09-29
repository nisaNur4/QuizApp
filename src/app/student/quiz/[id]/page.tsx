"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import LoadingSpinner from '../../../../components/LoadingSpinner';
import Card from '../../../../components/Card';
import Button from '../../../../components/ui/Button';
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import apiService from "@/mock/apiClient";

type User = {
  id: number;
  email: string;
  role: string;
};

type ToastType = {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
};

interface Quiz {
  id: number;
  title: string;
  description: string;
  time_limit: number;
  category: string;
}

interface Question {
  id: number;
  text: string;
  options: string[];
}

function generateMockQuestions(quizId: number, count = 5): Question[] {
  const base = [
    {
      text: "JavaScript'te değişken tanımlama anahtar kelimeleri hangileridir?",
      options: ["var, let, const", "int, char, float", "define, declare, const", "make, set, assign"],
    },
    {
      text: "React'ta bir Hook örneği hangisidir?",
      options: ["render()", "componentWillMount", "useEffect", "getDerivedStateFromProps"],
    },
    {
      text: "TypeScript'te bir temel tip hangisidir?",
      options: ["number", "decimal", "real", "numeric"],
    },
    {
      text: "CSS'te rengi mavi yapmak için hangisi doğrudur?",
      options: ["color: red;", "background: blue;", "color: blue;", "font-color: blue;"],
    },
    {
      text: "HTTP hangi portu varsayılan olarak kullanır?",
      options: ["21", "25", "80", "443"],
    },
  ];
  return Array.from({ length: count }).map((_, i) => ({
    id: quizId * 100 + i + 1,
    text: base[i % base.length].text,
    options: base[i % base.length].options,
  }));
}

export default function QuizSolvePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { user } = useAuth() as { user: User | null };
  const toast = useToast() as ToastType;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const handleQuizComplete = useCallback(async () => {
    if (quizCompleted || !id) return;
    
    setSubmitting(true);
    setQuizCompleted(true);
    
    try {
      router.push(`/student/result/${id}`);
      
    } catch (error) {
      console.error('Cevaplar kaydedilirken hata oluştu:', error);
      toast.showToast('Cevaplar kaydedilirken bir hata oluştu', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [answers, id, quizCompleted, router, toast]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const quizId = Number(id);
        const quizResp = await apiService.getQuizById(quizId);
        if (!quizResp.success || !quizResp.data) {
          throw new Error('Quiz bulunamadı');
        }
        const quizData = {
          id: quizResp.data.id,
          title: quizResp.data.title,
          description: quizResp.data.description,
          time_limit: quizResp.data.time_limit || 30,
          category: quizResp.data.category || 'General',
        } as Quiz;
        setQuiz(quizData);
        setTimeLeft((quizData.time_limit || 30) * 60);
        const q = generateMockQuestions(quizId, Math.max(5, quizResp.data.questions_count || 5));
        setQuestions(q);
        
      } catch (error) {
        console.error('Quiz yüklenirken hata:', error);
        toast.showToast('Quiz yüklenirken bir hata oluştu', 'error');
        router.push('/student/quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [id, router, toast]);

  useEffect(() => {
    if (!timeLeft || quizCompleted) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, quizCompleted, handleQuizComplete]);

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
  };

  const handlePrevious = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size={48} />
        </div>
      </ProtectedRoute>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Quiz bulunamadı</h2>
            <Button onClick={() => router.push('/student/quizzes')}>
              Quizlere Dön
            </Button>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const currentQuestion = questions[current];
  const selectedOption = answers[currentQuestion.id];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const progress = Math.round(((current + 1) / questions.length) * 100);
  const answeredQuestions = Object.keys(answers).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300">{quiz.title}</h1>
                {quiz.description && (
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-1">{quiz.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Kategori: {quiz.category}</span>
                  <span>•</span>
                  <span>{questions.length} Soru</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-2xl font-mono font-bold text-red-600 dark:text-red-400">
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Kalan Süre</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>İlerleme</span>
                <span>%{progress}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="h-2.5 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: timeLeft < 60 ? '#ef4444' : '#2563eb' // Red if less than 1 minute left
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Soru {current + 1} / {questions.length}</span>
                <span>{answeredQuestions} / {questions.length} cevaplandı</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mb-4">
                Soru {current + 1}
              </span>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                {currentQuestion.text}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  return (
                    <div 
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-700'
                      }`}
                      onClick={() => handleOptionSelect(currentQuestion.id, index)}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                          isSelected 
                            ? 'bg-blue-500 text-white' 
                            : 'border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-gray-800 dark:text-gray-200">{option}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <Button 
                  onClick={handlePrevious}
                  disabled={current === 0}
                  variant="outline"
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  Önceki Soru
                </Button>
                
                <Button 
                  onClick={handleNext}
                  disabled={current >= questions.length - 1}
                  variant="outline"
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  Sonraki Soru
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    const confirmSubmit = window.confirm('Sınavı tamamlamak istediğinize emin misiniz?');
                    if (confirmSubmit) {
                      handleQuizComplete();
                    }
                  }}
                  disabled={submitting || quizCompleted}
                  variant="primary"
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gönderiliyor...
                    </span>
                  ) : 'Sınavı Tamamla'}
                </Button>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sorulara Git</h3>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {questions.map((q, index) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = index === current;
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`w-full aspect-square rounded flex items-center justify-center text-sm font-medium transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-2 ring-offset-2 ring-blue-500 scale-105'
                        : isAnswered
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title={`Soru ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/50"></span>
                <span>Cevaplandı</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700"></span>
                <span>Cevaplanmadı</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>Geçerli Soru</span>
              </div>
            </div>
          </Card>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">İlerleme Durumu</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{answeredQuestions}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Cevaplanan</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {questions.length - answeredQuestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Kalan</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((answeredQuestions / questions.length) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Tamamlanma</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Kalan Süre</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
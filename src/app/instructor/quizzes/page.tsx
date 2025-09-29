'use client';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import apiService from "@/mock/apiClient";
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/Card';
import Button from '@/components/ui/Button';

interface StudentResult {
  studentName: string;
  score: number;
  completedAt: string;
}
interface Quiz {
  id: number;
  title: string;
  description: string;
  created_at: string;
  questions_count?: number;
  results?: StudentResult[];
}

type SortOption = "created_at" | "title";

export default function InstructorQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("created_at");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await apiService.getMyQuizzes();
        const data = response.success ? response.data || [] : [];
        setQuizzes(data);
      } catch (error) {
        console.error("Quiz verileri çekilirken bir hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, []);

  const sortedAndFilteredQuizzes = useMemo(() => {
    const filtered = quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortOption === "title") {
        return a.title.localeCompare(b.title);
      }
      return new Date(b[sortOption]).getTime() - new Date(a[sortOption]).getTime();
    });
  }, [quizzes, sortOption, searchTerm]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300 text-center sm:text-left">Oluşturduğunuz Quizler</h2>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/instructor/create-quiz")}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              + Yeni Quiz Oluştur
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Quiz ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="created_at">En Yeni</option>
              <option value="title">Alfabetik (A-Z)</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size={48} /></div>
          ) : sortedAndFilteredQuizzes.length === 0 ? (
            <Card className="flex flex-col items-center text-center py-12 px-6">
              <div className="text-4xl text-gray-400 dark:text-gray-500 mb-4">✨</div>
              <div className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">
                Henüz oluşturulmuş bir quiz yok.
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push("/instructor/create-quiz")}
              >
                Quiz Oluştur
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortedAndFilteredQuizzes.map(quiz => (
                <Card
                  key={quiz.id}
                  className="group cursor-pointer hover:scale-[1.03] hover:shadow-xl transition-all duration-300 border border-blue-200 dark:border-gray-700 p-6 flex flex-col gap-3 rounded-xl shadow-md bg-white dark:bg-gray-800"
                  onClick={() => router.push(`/instructor/quizzes/${quiz.id}`)}
                >
                  <div className="font-bold text-xl text-blue-700 dark:text-blue-300 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">
                    {quiz.title}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {quiz.description}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div className="flex items-center gap-2">
                      <span>Oluşturulma: {new Date(quiz.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Sorular: {quiz.questions_count || 0}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <span>Çözen Öğrenciler: {quiz.results?.length || 0}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import apiService from "@/mock/apiClient";

interface Option {
  value: string;
  label: string;
}

interface Question {
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  category: string;
}

interface QuizData {
  title: string;
  description: string;
  category: string;
  time_limit: number;
  questions: Question[];
}

const categories: Option[] = [
  { value: "mathematics", label: "Matematik" },
  { value: "science", label: "Fen Bilimleri" },
  { value: "history", label: "Tarih" },
  { value: "geography", label: "Coğrafya" },
  { value: "literature", label: "Edebiyat" },
  { value: "language", label: "Yabancı Dil" },
  { value: "other", label: "Diğer" },
];

const timeLimits: Option[] = [
  { value: "5", label: "5 dakika" },
  { value: "10", label: "10 dakika" },
  { value: "15", label: "15 dakika" },
  { value: "20", label: "20 dakika" },
  { value: "30", label: "30 dakika" },
  { value: "45", label: "45 dakika" },
  { value: "60", label: "1 saat" },
  { value: "90", label: "1.5 saat" },
  { value: "120", label: "2 saat" },
];

const difficulties = [
  { value: 'easy', label: 'Kolay' },
  { value: 'medium', label: 'Orta' },
  { value: 'hard', label: 'Zor' }
];

export default function CreateQuizPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState(difficulties[1].value);
  const [questionCount, setQuestionCount] = useState(5);
  const [category, setCategory] = useState(categories[0].value);
  const [timeLimit, setTimeLimit] = useState(Number(timeLimits[0].value));
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<{
    question_text: string;
    options: string[];
    correct_answer: number;
    explanation: string;
    category: string;
  }>({
    question_text: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    explanation: "",
    category: category,
  });
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<QuizData | null>(null);
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('ai');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== "teacher") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleGeneratePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'manual') {
      if (!title.trim()) {
        setError("Lütfen bir quiz başlığı girin.");
        return;
      }

      if (questions.length === 0) {
        setError("Lütfen en az bir soru ekleyin.");
        return;
      }

      setPreview({
        title,
        description,
        category,
        time_limit: timeLimit,
        questions,
      });
      return;
    }
    
    setLoading(true);
    setAiGenerating(true);
    setError("");

    try {
      if (!topic.trim()) {
        throw new Error("Lütfen bir konu girin.");
      }

      const generated: QuizData = {
        title: title || `${topic} Quiz`,
        description: description || `A ${difficulty} level quiz about ${topic}`,
        category,
        time_limit: timeLimit,
        questions: Array.from({ length: questionCount }).map((_, i) => ({
          question_text: `${topic} hakkında soru ${i + 1}`,
          options: ["A", "B", "C", "D"].map((o) => `${o} seçeneği`),
          correct_answer: 0,
          explanation: "",
          category,
        })),
      };
      setPreview(generated);
      if (!title) setTitle(generated.title);
      if (!description) setDescription(generated.description);
    } catch (error) {
      console.error("Error generating quiz:", error);
      setError(error instanceof Error ? error.message : "Quiz oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
      setAiGenerating(false);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question_text.trim() || currentQuestion.options.some(opt => !opt.trim())) {
      setError("Lütfen soru metni ve tüm seçenekleri doldurun.");
      return;
    }

    const newQuestion: Question = {
      ...currentQuestion,
      options: [...currentQuestion.options],
      category: category
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      question_text: "",
      options: ["", "", "", ""],
      correct_answer: 0,
      explanation: "",
      category: category,
    });
    setError("");
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Lütfen bir başlık girin.");
      return;
    }

    if (questions.length === 0) {
      setError("Lütfen en az bir soru ekleyin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formattedQuestions = questions.map(q => ({
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || "",
        category: q.category || category
      }));

      const quizData = {
        title: title.trim(),
        description: description.trim(),
        category: category,
        time_limit: timeLimit,
        questions: formattedQuestions,
      };

      console.log("Mock saving quiz data:", quizData);

      const response = await apiService.createQuiz(quizData);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Quiz kaydedilirken bir hata oluştu.");
      }
      setPreview(quizData);
      setError("");
      
      setTitle("");
      setDescription("");
      setQuestions([]);
      router.push("/instructor/quizzes");
    } catch (error) {
      console.error("Error saving quiz:", error);
      setError(error instanceof Error ? error.message : "Quiz kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yeni Quiz Oluştur</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Aşağıdaki formu doldurarak yeni bir quiz oluşturabilirsiniz.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`${activeTab === 'ai' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  AI ile Oluştur
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`${activeTab === 'manual' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Manuel Oluştur
                </button>
              </nav>
            </div>

            {activeTab === 'ai' && (
              <form onSubmit={handleGeneratePreview} className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">AI ile Hızlı Quiz Oluştur</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Sadece bir konu yazın, AI sizin için özelleştirilmiş bir quiz oluştursun.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Konu *
                    </label>
                    <input
                      type="text"
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Örn: Osmanlı Tarihi, Fotosentez, İngilizce Zamanlar"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Zorluk Seviyesi
                      </label>
                      <select
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {difficulties.map((diff) => (
                          <option key={diff.value} value={diff.value}>
                            {diff.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Soru Sayısı: {questionCount}
                      </label>
                      <input
                        type="range"
                        id="questionCount"
                        min="3"
                        max="20"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>3</span>
                        <span>10</span>
                        <span>20</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">İsteğe Bağlı Ayarlar</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Özel Başlık (Boş bırakılırsa otomatik oluşturulur)
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Özel bir başlık girin"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Açıklama
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Quiz hakkında kısa bir açıklama"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Kategori
                        </label>
                        <select
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Süre Sınırı
                        </label>
                        <select
                          id="timeLimit"
                          value={timeLimit}
                          onChange={(e) => setTimeLimit(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          {timeLimits.map((time) => (
                            <option key={time.value} value={time.value}>
                              {time.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading || !topic.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Quiz Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        Quiz Oluştur
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'manual' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quiz Başlığı *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Quiz başlığını girin"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Quiz hakkında kısa bir açıklama"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Kategori
                      </label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Süre Sınırı
                      </label>
                      <select
                        id="timeLimit"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {timeLimits.map((time) => (
                          <option key={time.value} value={time.value}>
                            {time.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Soru Ekle</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="question-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Soru Metni *
                      </label>
                      <input
                        type="text"
                        id="question-text"
                        value={currentQuestion.question_text}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, question_text: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Soru metnini girin"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Seçenekler *
                      </label>
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="radio"
                              name="correct-option"
                              checked={currentQuestion.correct_answer === index}
                              onChange={() => setCurrentQuestion({...currentQuestion, correct_answer: index})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...currentQuestion.options];
                                newOptions[index] = e.target.value;
                                setCurrentQuestion({...currentQuestion, options: newOptions});
                              }}
                              className="ml-2 flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              placeholder={`Seçenek ${index + 1}`}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Açıklama (Opsiyonel)
                      </label>
                      <textarea
                        id="explanation"
                        value={currentQuestion.explanation}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Açıklama girin (isteğe bağlı)"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        disabled={!currentQuestion.question_text.trim() || currentQuestion.options.some(opt => !opt.trim())}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Soruyu Ekle
                      </button>
                    </div>
                  </div>
                </div>

                {questions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Eklenen Sorular ({questions.length})</h3>
                    <div className="space-y-4">
                      {questions.map((q, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{index + 1}. {q.question_text}</p>
                              <ul className="mt-2 space-y-1">
                                {q.options.map((opt, optIndex) => (
                                  <li 
                                    key={optIndex} 
                                    className={`text-sm ${q.correct_answer === optIndex ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                                  >
                                    {String.fromCharCode(65 + optIndex)}. {opt}
                                  </li>
                                ))}
                              </ul>
                              {q.explanation && (
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-medium">Açıklama:</span> {q.explanation}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newQuestions = [...questions];
                                newQuestions.splice(index, 1);
                                setQuestions(newQuestions);
                              }}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleSaveQuiz}
                    disabled={loading || !title.trim() || questions.length === 0}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Kaydediliyor...
                      </>
                    ) : (
                      'Quizi Kaydet'
                    )}
                  </button>
                </div>
              </div>
            )}

            {preview && (
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Önizleme</h2>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveQuiz}
                      disabled={loading}
                      className="px-4 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      {preview.title}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                      {preview.description || 'Açıklama yok'}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <dl>
                      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Kategori</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          {categories.find(c => c.value === preview.category)?.label || preview.category}
                        </dd>
                      </div>
                      <div className="bg-white dark:bg-gray-800 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Süre Sınırı</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          {timeLimits.find(t => t.value === String(preview.time_limit))?.label || `${preview.time_limit} dakika`}
                        </dd>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Soru Sayısı</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          {preview.questions.length} soru
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div className="px-4 py-5 sm:px-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Sorular</h4>
                    <div className="space-y-6">
                      {preview.questions.map((q, qIndex) => (
                        <div key={qIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <p className="font-medium text-gray-900 dark:text-white">{qIndex + 1}. {q.question_text}</p>
                          <div className="mt-3 space-y-2">
                            {q.options.map((opt, optIndex) => (
                              <div 
                                key={optIndex}
                                className={`p-2 rounded ${optIndex === q.correct_answer 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
                                  : 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {opt}
                                {optIndex === q.correct_answer && (
                                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Doğru Cevap)</span>
                                )}
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
                              <span className="font-medium">Açıklama:</span> {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
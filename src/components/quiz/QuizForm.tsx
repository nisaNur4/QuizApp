'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';

type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface QuizFormData {
  id?: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: Question[];
}

interface QuizFormProps {
  initialData?: QuizFormData;
  isEditing?: boolean;
  onSubmit: (data: QuizFormData) => Promise<void>;
}

export default function QuizForm({ initialData, isEditing = false, onSubmit }: QuizFormProps) {
  const router = useRouter();
  const toast = useToast();
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit || 30);
  const [passingScore, setPassingScore] = useState(initialData?.passingScore || 70);
  const [questions, setQuestions] = useState<Question[]>(initialData?.questions || [
    {
      id: Date.now().toString(),
      type: 'multiple_choice',
      content: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        type: 'multiple_choice',
        content: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.showToast('Lütfen bir sınav başlığı girin', 'error');
      return false;
    }

    if (questions.length === 0) {
      toast.showToast('En az bir soru eklemelisiniz', 'error');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content.trim()) {
        toast.showToast(`${i + 1}. soru için içerik girin`, 'error');
        return false;
      }

      if (q.type !== 'short_answer' && q.options.some(opt => !opt.trim())) {
        toast.showToast(`${i + 1}. soru için tüm seçenekleri doldurun`, 'error');
        return false;
      }

      if (!q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)) {
        toast.showToast(`${i + 1}. soru için doğru cevap seçin`, 'error');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formData: QuizFormData = {
        title: title.trim(),
        description: description.trim(),
        timeLimit: Number(timeLimit) || 30,
        passingScore: Number(passingScore) || 70,
        questions: questions.map(q => ({
          id: q.id,
          type: q.type,
          content: q.content.trim(),
          options: q.options.map(opt => opt.trim()).filter(opt => opt !== ''),
          correctAnswer: Array.isArray(q.correctAnswer) 
            ? q.correctAnswer.map(ca => ca.toString())
            : q.correctAnswer.toString(),
          points: Number(q.points) || 1
        }))
      };
      
      await onSubmit(formData);
      
      if (!isEditing) {
        toast.showToast('Sınav başarıyla oluşturuldu', 'success');
        router.push('/instructor/dashboard');
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu';
      toast.showToast(
        isEditing 
          ? `Sınav güncellenirken bir hata oluştu: ${errorMessage}`
          : `Sınav oluşturulurken bir hata oluştu: ${errorMessage}`,
        'error'
      );
      throw error; 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          Sınav Bilgileri
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sınav Başlığı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Örnek: Matematik 101 Ara Sınavı"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Sınav hakkında kısa bir açıklama..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sınav Süresi (dakika)
              </label>
              <input
                type="number"
                id="timeLimit"
                min="1"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Geçme Notu (%)
              </label>
              <input
                type="number"
                id="passingScore"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Sorular
          </h2>
          <Button
            type="button"
            onClick={addQuestion}
            variant="outline"
            className="flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Yeni Soru Ekle
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">Henüz hiç soru eklenmedi</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                    Soru {qIndex + 1}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Soruyu Sil"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Soru İçeriği <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={question.content}
                      onChange={(e) => updateQuestion(qIndex, 'content', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Soruyu buraya yazın..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Soru Türü
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(qIndex, 'type', e.target.value as QuestionType)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="multiple_choice">Çoktan Seçmeli</option>
                      <option value="true_false">Doğru/Yanlış</option>
                      <option value="short_answer">Kısa Cevap</option>
                    </select>
                  </div>

                  {question.type !== 'short_answer' && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Seçenekler <span className="text-red-500">*</span>
                        </label>
                        {question.type !== 'true_false' && (
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Seçenek Ekle
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center">
                            <input
                              type={question.type === 'multiple_choice' ? 'radio' : 'checkbox'}
                              name={`question-${qIndex}`}
                              checked={
                                question.type === 'multiple_choice'
                                  ? question.correctAnswer === option
                                  : Array.isArray(question.correctAnswer) && 
                                    question.correctAnswer.includes(option)
                              }
                              onChange={() => {
                                if (question.type === 'multiple_choice') {
                                  updateQuestion(qIndex, 'correctAnswer', option);
                                } else {
                                  const currentAnswers = Array.isArray(question.correctAnswer) 
                                    ? [...question.correctAnswer] 
                                    : [];
                                  
                                  if (currentAnswers.includes(option)) {
                                    updateQuestion(
                                      qIndex, 
                                      'correctAnswer', 
                                      currentAnswers.filter(a => a !== option)
                                    );
                                  } else {
                                    updateQuestion(
                                      qIndex, 
                                      'correctAnswer', 
                                      [...currentAnswers, option]
                                    );
                                  }
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="ml-2 flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              placeholder={`Seçenek ${oIndex + 1}`}
                              required
                            />
                            {question.type !== 'true_false' && question.options.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                title="Seçeneği Sil"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Puan
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/instructor/dashboard')}
          disabled={isSubmitting}
        >
          İptal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Kaydediliyor...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              {isEditing ? 'Güncelle' : 'Sınavı Oluştur'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/Card';
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import apiService from "@/mock/apiClient";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentProps<typeof SelectPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentProps<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentProps<typeof SelectPrimitive.Trigger> & { placeholder?: string }
>(({ className, children, placeholder, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children || <span className="text-muted-foreground">{placeholder}</span>}
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectValue = SelectPrimitive.Value;
import { Search, Filter, Clock, CheckCircle, BarChart2, ArrowUpDown } from "lucide-react";

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'questions-asc' | 'questions-desc';
const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}sa ${mins > 0 ? `${mins}d` : ''}`.trim();
};

interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  time_limit: number;
  is_completed?: boolean;
  my_last_score?: number;
  completed_at?: string;
  questions_count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  created_at: string;
  avg_score?: number;
  attempts_count?: number;
}

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const router = useRouter();

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getQuizzes();
        
        if (response.success && response.data) {
          setQuizzes(response.data);
        } else {
          console.error('Quizler yüklenirken hata oluştu:', response.error);
        }
      } catch (error) {
        console.error("Quiz verileri çekilirken bir hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizData();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    quizzes.forEach(quiz => {
      if (quiz.category) {
        cats.add(quiz.category);
      }
    });
    return Array.from(cats);
  }, [quizzes]);
  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter(quiz => {
        const matchesSearch = 
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = 
          selectedCategory === 'all' || 
          quiz.category === selectedCategory;
        
        const matchesDifficulty = 
          difficultyFilter === 'all' || 
          quiz.difficulty === difficultyFilter;
        
        return matchesSearch && matchesCategory && matchesDifficulty;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          case 'questions-asc':
            return (a.questions_count || 0) - (b.questions_count || 0);
          case 'questions-desc':
            return (b.questions_count || 0) - (a.questions_count || 0);
          default:
            return 0;
        }
      });
  }, [quizzes, searchTerm, selectedCategory, difficultyFilter, sortBy]);

  const handleQuizClick = (quizId: number) => {
    router.push(`/student/quiz/${quizId}`);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Çözülebilecek Quizler</h1>
        
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Quiz ara..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger 
                className="w-[180px]"
                placeholder={selectedCategory === 'all' ? 'Kategori seçin' : selectedCategory}
              >
                <Filter className="mr-2 h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as SortOption)}>
              <SelectTrigger 
                className="w-[180px]"
                placeholder={
                  sortBy === 'newest' ? 'En Yeni' : 
                  sortBy === 'oldest' ? 'En Eski' :
                  sortBy === 'title-asc' ? 'Başlık (A-Z)' :
                  sortBy === 'title-desc' ? 'Başlık (Z-A)' :
                  sortBy === 'questions-asc' ? 'Soru Sayısı (Azalan)' :
                  'Soru Sayısı (Artan)'
                }
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">En Yeni</SelectItem>
                <SelectItem value="oldest">En Eski</SelectItem>
                <SelectItem value="title-asc">Başlık (A-Z)</SelectItem>
                <SelectItem value="title-desc">Başlık (Z-A)</SelectItem>
                <SelectItem value="questions-asc">Soru Sayısı (Azalan)</SelectItem>
                <SelectItem value="questions-desc">Soru Sayısı (Artan)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger 
                className="w-[150px]"
                placeholder={
                  difficultyFilter === 'all' ? 'Zorluk' : 
                  difficultyFilter === 'easy' ? 'Kolay' :
                  difficultyFilter === 'medium' ? 'Orta' : 'Zor'
                }
              >
                <BarChart2 className="mr-2 h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Seviyeler</SelectItem>
                <SelectItem value="easy">Kolay</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="hard">Zor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{quiz.title}</h3>
                  {quiz.is_completed && (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Tamamlandı
                    </Badge>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">
                  {quiz.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{quiz.category}</Badge>
                  {quiz.difficulty && (
                    <Badge 
                      variant={quiz.difficulty === 'easy' ? 'outline' : 
                              quiz.difficulty === 'medium' ? 'secondary' : 'danger'}
                      className="capitalize"
                    >
                      {quiz.difficulty}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(quiz.time_limit)}
                  </Badge>
                  <Badge variant="outline">{quiz.questions_count || 0} Soru</Badge>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  {quiz.is_completed ? (
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        Son Puan: <span className="font-medium">{quiz.my_last_score}%</span>
                        {quiz.avg_score && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Ortalama: {quiz.avg_score}%)
                          </span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {quiz.attempts_count || 0} kişi çözdü
                      {quiz.avg_score && ` • Ortalama: ${quiz.avg_score}%`}
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => router.push(`/student/quiz/${quiz.id}`)}
                    variant={quiz.is_completed ? 'outline' : 'primary'}
                    size="sm"
                  >
                    {quiz.is_completed ? 'Tekrar Çöz' : 'Quizi Başlat'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aradığınız kriterlere uygun quiz bulunamadı.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setDifficultyFilter('all');
              }}
            >
              Filtreleri Temizle
            </Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

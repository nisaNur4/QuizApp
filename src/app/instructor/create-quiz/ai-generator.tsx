'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface QuestionOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuestionOption[];
  correctAnswer: string;
}

export interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  category: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
}

interface AIGeneratorProps {
  onQuizGenerated: (quiz: QuizData) => void;
}

export default function AIGenerator({ onQuizGenerated }: AIGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('general');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const categories = [
    'Matematik', 'Fen Bilimleri', 'Türkçe', 'Tarih', 'Coğrafya', 
    'Yabancı Dil', 'Genel Kültür', 'Bilgisayar', 'Diğer'
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir konu giriniz.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          category,
          difficulty,
          numQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error('Quiz oluşturulurken bir hata oluştu');
      }

      const data = await response.json();
      onQuizGenerated(data);
      
      toast({
        title: 'Başarılı',
        description: 'Quiz başarıyla oluşturuldu!',
      });
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: 'Hata',
        description: 'Quiz oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Yapay Zeka ile Quiz Oluştur</h3>
        <p className="text-sm text-muted-foreground">
          Bir konu girerek otomatik olarak quiz soruları oluşturabilirsiniz.
        </p>
      </div>
      
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Konu *</Label>
          <Textarea
            id="topic"
            placeholder="Örnek: İkinci Dünya Savaşı, Fotosentez, Python Programlama Dili..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isGenerating}
            className="min-h-[100px]"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select 
              value={category} 
              onValueChange={(value) => setCategory(value)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <span>{category || 'Kategori seçiniz'}</span>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase().replace(/\s+/g, '-')}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="difficulty">Zorluk Seviyesi</Label>
            <Select 
              value={difficulty} 
              onValueChange={setDifficulty}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <span>{difficulty === 'easy' ? 'Kolay' : difficulty === 'medium' ? 'Orta' : 'Zor'}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Kolay</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="hard">Zor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="numQuestions">Soru Sayısı</Label>
            <Input
              id="numQuestions"
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
              disabled={isGenerating}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isGenerating || !topic.trim()}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Quiz Oluştur
              </>
            )}
          </Button>
        </div>
      </form>
      
      <div className="text-xs text-muted-foreground">
        <p>Not: Yapay zeka tarafından oluşturulan soruları gözden geçirmeniz önerilir.</p>
      </div>
    </div>
  );
}

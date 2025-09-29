'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/mock/apiClient';

export interface FeedbackResponse {
  answerId: number;
  questionId: number;
  explanation: string;
  cached: boolean;
  timestamp: number;
}

interface AIFeedbackProps {
  answerId: number;
  onFeedbackGenerated?: (feedback: FeedbackResponse) => void;
  className?: string;
  showLoadingState?: boolean;
}

export function AIFeedback({
  answerId,
  onFeedbackGenerated,
  className = '',
  showLoadingState = true,
}: AIFeedbackProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetFeedback = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const resp = await apiService.getAIFeedback(answerId);
      if (!resp.success || !resp.data) {
        throw new Error(resp.error?.message || 'Failed to generate feedback');
      }
      setFeedback(resp.data);
      onFeedbackGenerated?.(resp.data);
    } catch (error) {
      console.error('Error generating feedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Button
        onClick={handleGetFeedback}
        disabled={isLoading}
        variant="outline"
        className="w-full md:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Feedback...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Get AI Feedback
          </>
        )}
      </Button>

      {error && (
        <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {feedback && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>AI Feedback</CardTitle>
              {feedback.cached && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full">
                  Cached
                </span>
              )}
            </div>
            {showLoadingState && feedback.cached && (
              <CardDescription className="text-xs">
                Last updated: {new Date(feedback.timestamp * 1000).toLocaleString()}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p>{feedback.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

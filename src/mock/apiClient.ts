export type ApiResponse<T>= {
  success: boolean;
  data?: T;
  error?:{ message: string; status_code?: number };
};
export type User={
  id: number;
  name:string;
  email:string;
  role: 'student' | 'teacher';
  is_teacher?: boolean;
};

function createDemoJwt(days=365): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'demo-user',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * days,
  };
  const base64url= (obj: any) => {
    const json= JSON.stringify(obj);
    let b64: string;
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      b64= window.btoa(unescape(encodeURIComponent(json)));
    } else {
      const buf= Buffer.from(json, 'utf8');
      b64 = buf.toString('base64');
    }
    return b64.replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };
  return `${base64url(header)}.${base64url(payload)}.demo-signature`;
}

function delay(ms=400) {
  return new Promise((res)=> setTimeout(res, ms));
}
const STORAGE_KEYS = {
  user: 'demo_user',
  token: 'token',
  quizzes: 'demo_quizzes',
  results: 'demo_results',
};

function getSeededQuizzes() {
  const existing= typeof window !== 'undefined'? localStorage.getItem(STORAGE_KEYS.quizzes): null;
  if (existing) return JSON.parse(existing);
  const sample= [
    { id: 1, title: 'JavaScript Temelleri', description: 'Değişkenler, fonksiyonlar ve döngüler', questions_count: 10, created_at: new Date().toISOString(), category: 'Web', time_limit: 30, difficulty: 'easy' },
    { id: 2, title: 'React 18', description: 'Hooks, Context ve Concurrent özellikleri', questions_count: 12, created_at: new Date().toISOString(), category: 'Frontend', time_limit: 40, difficulty: 'medium' },
    { id: 3, title: 'TypeScript', description: 'Tipler, generics ve gelişmiş patternler', questions_count: 8, created_at: new Date().toISOString(), category: 'Language', time_limit: 25, difficulty: 'hard' },
  ];
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.quizzes, JSON.stringify(sample));
  return sample;
}

function getSeededResults(userId:number) {
  const existing=typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.results):null;
  if (existing) return JSON.parse(existing);
  const sample= [
    { id: 101, user_id: userId, quiz_id: 1, score: 85, taken_at: new Date().toISOString() },
    { id: 102, user_id: userId, quiz_id: 2, score: 72, taken_at: new Date().toISOString() },
  ];
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.results, JSON.stringify(sample));
  return sample;
}

const mockUsers: Record<string, User & { password: string }> = {
  'teacher@example.com':{ id: 1, name: 'Öğretmen', email: 'teacher@example.com', role: 'teacher', is_teacher: true, password: '123456' },
  'student@example.com':{ id: 2, name: 'Öğrenci', email: 'student@example.com', role: 'student', is_teacher: false, password: '123456' },
};

const apiService = {
  async login({ email, password }: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay();
    const found = mockUsers[email];
    if (!found || found.password !== password) {
      return { success: false, error: { message: 'Geçersiz e-posta veya şifre', status_code: 401 } };
    }
    const { password: _pw, ...user } = found;
    (user as any).is_teacher = user.role === 'teacher';
    const token = createDemoJwt();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.token, token);
      getSeededQuizzes();
      getSeededResults(user.id);
    }
    return { success: true, data: { user, token } };
  },

  async register(userData: { name?: string; full_name?: string; email: string; password: string; role: 'student' | 'teacher' }): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay();
    const name = userData.name || userData.full_name || 'Kullanıcı';
    const newUser: User = {
      id: Math.floor(Math.random() * 10000) + 3,
      name,
      email: userData.email,
      role: userData.role,
      is_teacher: userData.role === 'teacher',
    };
    mockUsers[userData.email] = { ...newUser, password: userData.password } as any;
    const token = createDemoJwt();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEYS.token, token);
      getSeededQuizzes();
      getSeededResults(newUser.id);
    }
    return { success: true, data: { user: newUser, token } };
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    await delay(200);
    if (typeof window === 'undefined') return { success: false, error: { message: 'No window' } };
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return { success: false, error: { message: 'Not authenticated', status_code: 401 } };
    return { success: true, data: JSON.parse(raw) };
  },
  async getQuizzes(): Promise<ApiResponse<any[]>> {
    await delay(300);
    return { success: true, data: getSeededQuizzes() };
  },
  async getMyQuizzes(): Promise<ApiResponse<any[]>> {
    await delay(300);
    return { success: true, data: getSeededQuizzes() };
  },
  async getQuizById(id: number): Promise<ApiResponse<any>> {
    await delay(200);
    const all = getSeededQuizzes();
    const quiz = all.find((q: any) => q.id === id);
    if (!quiz) return { success: false, error: { message: 'Quiz not found', status_code: 404 } };
    return { success: true, data: quiz };
  },

  async createQuiz(quiz: any): Promise<ApiResponse<any>> {
    await delay(300);
    const all = getSeededQuizzes();
    const newQuiz = {
      id: Math.max(...all.map((q: any) => q.id)) + 1,
      title: quiz.title || 'Yeni Quiz',
      description: quiz.description || '',
      questions_count: Array.isArray(quiz.questions) ? quiz.questions.length : (quiz.questions_count || 0),
      created_at: new Date().toISOString(),
      category: quiz.category || 'General',
      time_limit: quiz.time_limit || 30,
      difficulty: quiz.difficulty || 'medium',
    };
    const next = [...all, newQuiz];
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.quizzes, JSON.stringify(next));
    return { success: true, data: newQuiz };
  },

  async updateQuiz(id: number, patch: any): Promise<ApiResponse<any>> {
    await delay(300);
    const all = getSeededQuizzes();
    const idx = all.findIndex((q: any) => q.id === id);
    if (idx === -1) return { success: false, error: { message: 'Quiz not found', status_code: 404 } };
    const updated = { ...all[idx], ...patch };
    const next = [...all];
    next[idx] = updated;
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.quizzes, JSON.stringify(next));
    return { success: true, data: updated };
  },
  async getStudentResults(userId: number): Promise<ApiResponse<{ total_score: number; answers: any[] }>> {
    await delay(300);
    const seeded = getSeededResults(userId);
    const answers = [
      {
        id: 1,
        question_id: 11,
        selected_option: 'A',
        is_correct: true,
        score: 10,
        question: {
          text: 'JavaScript değişken tanımlama anahtar kelimeleri hangileridir?',
          correct_option: 'A',
          option_a: 'var, let, const',
          option_b: 'int, char, float',
          option_c: 'define, declare, const',
          option_d: 'make, set, assign',
        },
      },
      {
        id: 2,
        question_id: 12,
        selected_option: 'B',
        is_correct: false,
        score: 0,
        question: {
          text: 'React Hook hangisidir?',
          correct_option: 'C',
          option_a: 'render()',
          option_b: 'componentWillMount',
          option_c: 'useEffect',
          option_d: 'getDerivedStateFromProps',
        },
      },
    ];
    const total_score = Math.round((answers.filter(a => a.is_correct).length / answers.length) * 100);
    return { success: true, data: { total_score, answers } };
  },

  async getAIFeedback(answerId: number): Promise<ApiResponse<{ answerId: number; questionId: number; explanation: string; cached: boolean; timestamp: number }>> {
    await delay(500);
    return {
      success: true,
      data: {
        answerId,
        questionId: 0,
        explanation: 'Cevabınızın mantığı doğru. Daha yüksek puan için örnek ve karşı örnekler ekleyin.',
        cached: false,
        timestamp: Math.floor(Date.now() / 1000),
      },
    };
  },

  async deleteQuiz(_quizId: number): Promise<ApiResponse<{}>> {
    await delay(200);
    const all = getSeededQuizzes();
    const next = all.filter((q: any) => q.id !== _quizId);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.quizzes, JSON.stringify(next));
    return { success: true, data: {} };
  },
};

export default apiService;

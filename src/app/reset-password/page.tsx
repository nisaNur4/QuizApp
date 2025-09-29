'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword]= useState('');
  const [token, setToken] = useState('');
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState('');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router=useRouter();
  const toast = useToast();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Geçersiz veya eksik token.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setMessage('Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.');
      toast.showToast('Şifreniz başarıyla sıfırlandı.', 'success');
      setTimeout(()=>{
        router.push('/login');
      }, 1500);
    } catch (err) {
      setError('Bir hata oluştu');
      toast.showToast('Bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-sm w-full mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Hata</h2>
          <p className="mb-6">Geçersiz veya eksik token. Lütfen şifre sıfırlama bağlantısını tekrar isteyin.</p>
          <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium">
            Şifre Sıfırlama Bağlantısı İste
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-sm w-full mx-auto p-8">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-500 text-center mb-8">
          Yeni Şifre Belirle
        </h2>
        
        {message && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Yeni Şifre
            </label>
            <input
              id="password"
              type="password"
              placeholder="Yeni şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white px-4 py-3 text-base outline-none transition"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Şifreyi Onayla
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Yeni şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white px-4 py-3 text-base outline-none transition"
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            fullWidth
            disabled={!password || !confirmPassword || loading}
          >
            Şifreyi Sıfırla
          </Button>
          
          <div className="text-center mt-4">
            <Link href="/login" className="text-blue-600 hover:text-blue-800 text-sm">
              Giriş sayfasına dön
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

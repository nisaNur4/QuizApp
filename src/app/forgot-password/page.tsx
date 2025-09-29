'use client';

import { useState } from "react";
import { useToast } from '@/context/ToastContext';
import Card from '@/components/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await new Promise((r) => setTimeout(r, 500));
      setMessage("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Eğer e-posta adresiniz kayıtlıysa, şifre sıfırlama bağlantısı içeren bir e-posta alacaksınız.");
      toast.showToast("Şifre sıfırlama bağlantısı gönderildi.", "success");
      const demoToken = 'demo-reset-token';
      const resetUrl = `/reset-password?token=${demoToken}`;
      setMessage(prev => `${prev}\n\nDemo amaçlı bağlantı: ${resetUrl}`);
    } catch {
      setError("Sunucuya ulaşılamadı.");
      toast.showToast("Sunucuya ulaşılamadı.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-sm w-full mx-auto p-8">
        <h2 className="text-2xl font-bold text-black-900 dark:text-black-500 text-center mb-8">Şifremi Unuttum</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white px-4 py-3 text-base outline-none transition"
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            fullWidth
            disabled={loading || !email}
          >
            Sıfırlama Bağlantısı Gönder
          </Button>
          {message && <div className="text-blue-700 dark:text-blue-300 bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-700 rounded-lg p-3 text-center font-semibold mt-2">{message}</div>}
          {error && <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-700 rounded-lg p-3 text-center font-semibold mt-2">{error}</div>}
          <div className="mt-4 text-center">
            <Link href="/login" className="text-blue-700 dark:text-blue-300 underline">Girişe Dön</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
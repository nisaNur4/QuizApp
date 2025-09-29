import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">Sayfa Bulunamadı</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Aradığınız sayfa taşınmış, adı değiştirilmiş veya kullanılamıyor olabilir.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/">
            <Button>
              Ana Sayfaya Dön
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">
              Giriş Yap
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

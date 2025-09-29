"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";

export default function KullanimSozlesmesiPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-4">
              Kullanım Sözleşmesi
            </h1>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              QuizApp hizmetlerini kullanarak aşağıdaki şartları kabul etmiş olursunuz:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Hesabınızın güvenliğinden siz sorumlusunuz.</li>
              <li>Sistemi kötüye kullanmak yasaktır.</li>
              <li>Hizmet şartları gerektiğinde güncellenebilir.</li>
            </ul>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

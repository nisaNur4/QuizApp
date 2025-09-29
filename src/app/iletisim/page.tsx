"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";

export default function IletisimPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-4">
              İletişim
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Bizimle iletişime geçmek için aşağıdaki bilgilerden ulaşabilirsiniz:
            </p>
            <ul className="space-y-3">
              <li>
                <span className="font-semibold">Email:</span>{" "}
                <a href="mailto:destek@quizapp.com" className="text-blue-600">
                  destek@quizapp.com
                </a>
              </li>
              <li>
                <span className="font-semibold">Telefon:</span> +90 444 444 44 44
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

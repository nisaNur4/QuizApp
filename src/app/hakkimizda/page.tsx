"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";

export default function HakkimizdaPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-4">
              Hakkımızda
            </h1>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              QuizApp, kullanıcıların quiz oluşturup çözebileceği modern bir platformdur.
              Amacımız öğrenmeyi eğlenceli, erişilebilir ve etkileşimli hale getirmektir.
            </p>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

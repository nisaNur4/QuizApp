"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";
import Button from "@/components/ui/Button";
import apiService from "@/mock/apiClient";
import { useToast } from "@/context/ToastContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Hesap Silme
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await apiService.deleteQuiz(0);
      if (!response.success) {
        throw new Error('Failed to delete account');
      }
      toast.showToast("Hesabınız silindi.", "success");
      logout();
      router.push("/");
    } catch {
      toast.showToast("Hesap silinemedi. Lütfen tekrar deneyin.", "error");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  if (!user) {
    router.push("/");
    return null;
  }

  const isTeacher = user.role === "teacher";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black-100 dark:text-black-100 mb-2">
                  Hoş geldin, {user.name}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {isTeacher ? "Eğitmen Paneli" : "Öğrenci Paneli"}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Çıkış Yap
                </Button>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="danger"
                  size="sm"
                  loading={deleting}
                >
                  Hesabımı Sil
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {isTeacher ? (
              <>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/instructor/quizzes")}>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-500 mb-2">Quizlerim</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Oluşturduğunuz quizleri görüntüleyin ve yönetin</p>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/instructor/create-quiz")}>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-500  mb-2">Yeni Quiz</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">AI destekli otomatik quiz oluşturun</p>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/instructor/quizzes")}>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-500  mb-2">Sonuçlar</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Öğrenci sonuçlarını takip edin</p>
                </Card>
              </>
            ) : (
              <>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/student/quizzes")}>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-500 mb-2">Quizler</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Çözebileceğiniz quizleri görüntüleyin</p>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/student/result")}>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-500  mb-2">Sonuçlarım</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Quiz sonuçlarınızı ve geri bildirimleri görün</p>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 text-red-600">Hesabınızı silmek istediğinize emin misiniz?</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Bu işlem geri alınamaz. Tüm verileriniz silinecek.</p>
            <div className="flex gap-4 justify-end">
              <Button onClick={() => setShowDeleteModal(false)} variant="outline" size="md">
                Vazgeç
              </Button>
              <Button onClick={handleDeleteAccount} variant="danger" size="md" loading={deleting}>
                Evet, Sil
              </Button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

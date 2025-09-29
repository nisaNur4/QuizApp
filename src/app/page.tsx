"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Kolay Kullanım",
    description: "Sade ve anlaşılır arayüzü ile kolayca sınavlar oluşturun."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Detaylı Analiz",
    description: "Sınav sonuçlarını detaylı şekilde inceleyin."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "İşbirliği",
    description: "Öğrencilerinizle kolayca etkileşim kurun."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Güvenli",
    description: "Verileriniz güvende, sadece siz erişebilirsiniz."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Zaman Tasarrufu",
    description: "Otomatik değerlendirme ile zaman kazanın."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h10a2 2 0 001.732-1.001l-3.732-6.464-3.768 6.465a2 2 0 01-3.464 0L3 12.001V15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l5-8.5L17 12l-5 8.5-5-8.5z" />
      </svg>
    ),
    title: "Modern Arayüz",
    description: "Kullanıcı dostu ve modern tasarım."
  }
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (user) {
      if (user.is_teacher) {
        router.push('/instructor/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    }
  }, [user, router]);

  if (user || !isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Eğitimde <span className="text-blue-600 dark:text-blue-400">Yeni Nesil</span> Sınav Platformu
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Öğretmenler için kolay sınav oluşturma, öğrenciler için etkileşimli öğrenme deneyimi.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                Ücretsiz Başla
              </Button>
            </Link>
            <Link href="/hakkimizda" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full">
                Daha Fazla Bilgi
              </Button>
            </Link>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-1 max-w-4xl mx-auto overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="aspect-w-16 aspect-h-9 w-full bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-center h-64">
                <span className="text-gray-400">Uygulama Önizlemesi</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Neden Bizi Tercih Etmelisiniz?</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Modern ve kullanıcı dostu arayüzümüzle eğitim süreçlerinizi kolaylaştırıyoruz.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Hemen Ücretsiz Başlayın</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            Binlerce öğretmen ve öğrenciye katılın, eğitim deneyiminizi dönüştürün.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
              Hemen Kayıt Ol
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>© {new Date().getFullYear()} QuizApp. Tüm hakları saklıdır.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/gizlilik" className="hover:text-blue-600 dark:hover:text-blue-400">Gizlilik Politikası</Link>
              <Link href="/kullanim-sozlesmesi" className="hover:text-blue-600 dark:hover:text-blue-400">Kullanım Şartları</Link>
              <Link href="/iletisim" className="hover:text-blue-600 dark:hover:text-blue-400">İletişim</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

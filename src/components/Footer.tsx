'use client';
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Menü</h3>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-white">Anasayfa</Link></li>
              <li><Link href="/hakkimizda" className="hover:text-white">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="hover:text-white">İletişim</Link></li>
              <li><Link href="/gizlilik" className="hover:text-white">Gizlilik Politikası</Link></li>
              <li><Link href="/kullanim-sozlesmesi" className="hover:text-white">Kullanım Sözleşmesi</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Bizi Takip Edin</h3>
            <ul className="space-y-2">
              <li><Link href="https://facebook.com" target="_blank" className="hover:text-white">Facebook</Link></li>
              <li><Link href="https://twitter.com" target="_blank" className="hover:text-white">Twitter</Link></li>
              <li><Link href="https://instagram.com" target="_blank" className="hover:text-white">Instagram</Link></li>
              <li><Link href="https://linkedin.com" target="_blank" className="hover:text-white">LinkedIn</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">QuizApp</h3>
            <p className="text-sm leading-6">
              QuizApp, öğrencilerin bilgilerini test etmeleri ve öğrenmelerini pekiştirmeleri için hazırlanmış bir quiz uygulamasıdır.
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          <p>© {currentYear} QuizApp. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

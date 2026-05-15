import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'СимптоМед — медицинский помощник',
  description: 'Опишите симптомы и получите рекомендацию специалиста. Быстро, точно, бесплатно.',
  openGraph: {
    title: 'СимптоМед',
    description: 'Опишите симптомы — получите рекомендацию специалиста',
    url: 'https://symed.uz',
    siteName: 'СимптоМед',
    locale: 'ru_UZ',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

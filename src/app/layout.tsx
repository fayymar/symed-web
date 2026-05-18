import type { Metadata } from 'next';
import { ConsultationProvider } from '@/context/ConsultationContext';
import { ThemeProvider } from '@/context/ThemeContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Symed — AI медицинский помощник',
  description: 'Опишите симптомы и получите рекомендацию специалиста. Быстро, точно, бесплатно.',
  openGraph: {
    title: 'Symed',
    description: 'Опишите симптомы — получите рекомендацию специалиста',
    url: 'https://symed.uz',
    siteName: 'Symed',
    locale: 'ru_UZ',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ConsultationProvider>
            {children}
          </ConsultationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

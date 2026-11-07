import type { Metadata } from 'next';
import Script from 'next/script';
import { TelegramAutoLogin } from '@/components/TelegramAutoLogin';
import ConsentGate from '@/components/ConsentGate';
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
        {/* SDK Telegram Mini App: даёт initData для автоматического входа внутри Telegram */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <ThemeProvider>
          <ConsultationProvider>
            <TelegramAutoLogin />
            {children}
            <ConsentGate />
          </ConsultationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutShell from '@/components/layout/LayoutShell';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Radio Marca Baleares - Tu emisora deportiva',
    template: '%s | Radio Marca Baleares',
  },
  description:
    'Radio Marca Baleares. Toda la informacion deportiva de las Illes Balears. Noticias, programas, parrilla y emision en directo.',
  keywords: ['radio marca', 'baleares', 'deportes', 'mallorca', 'radio deportiva', 'noticias deportivas'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Radio Marca Baleares',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}

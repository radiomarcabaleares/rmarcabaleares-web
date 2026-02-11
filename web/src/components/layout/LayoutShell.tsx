'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import RadioPlayer from './RadioPlayer';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.remove('has-player');
    } else {
      document.body.classList.add('has-player');
    }
    return () => document.body.classList.remove('has-player');
  }, [isAdmin]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 py-6">{children}</main>
      <Footer />
      <RadioPlayer />
    </>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isStaff } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-radio-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-radio-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

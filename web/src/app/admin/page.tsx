'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Newspaper, Megaphone, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  publishedNews: number;
  draftNews: number;
  activeAds: number;
  unreadContacts: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const { profile, isSuperadmin, isCopywriter, isPublicista } = useAuth();
  const [stats, setStats] = useState<Stats>({
    publishedNews: 0, draftNews: 0, activeAds: 0, unreadContacts: 0, totalUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const json = await res.json();
        if (res.ok && json.data) setStats(json.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, href }: {
    icon: any; label: string; value: number; color: string; href: string;
  }) => (
    <Link href={href} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-brand-dark">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </Link>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark">
          Bienvenido, {profile?.full_name || 'Admin'}
        </h1>
        <p className="text-gray-500 mt-1">Panel de administracion de Radio Marca Baleares</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(isSuperadmin || isCopywriter) && (
          <>
            <StatCard
              icon={Newspaper}
              label="Noticias publicadas"
              value={stats.publishedNews}
              color="bg-radio-blue"
              href="/admin/noticias"
            />
            <StatCard
              icon={Newspaper}
              label="Borradores"
              value={stats.draftNews}
              color="bg-yellow-500"
              href="/admin/noticias"
            />
          </>
        )}
        {(isSuperadmin || isPublicista) && (
          <StatCard
            icon={Megaphone}
            label="Anuncios activos"
            value={stats.activeAds}
            color="bg-marca-red"
            href="/admin/anuncios"
          />
        )}
        {isSuperadmin && (
          <>
            <StatCard
              icon={MessageSquare}
              label="Mensajes sin leer"
              value={stats.unreadContacts}
              color="bg-green-500"
              href="/admin/mensajes"
            />
            <StatCard
              icon={Users}
              label="Usuarios"
              value={stats.totalUsers}
              color="bg-purple-500"
              href="/admin/usuarios"
            />
          </>
        )}
      </div>
    </div>
  );
}

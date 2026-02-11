'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BRAND } from '@/lib/constants/brand';
import {
  LayoutDashboard,
  Newspaper,
  LayoutGrid,
  Megaphone,
  Radio,
  MessageSquare,
  Users,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { profile, isSuperadmin, isCopywriter, isPublicista, signOut } = useAuth();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['superadmin', 'copywriter', 'publicista'] },
    { href: '/admin/noticias', label: 'Noticias', icon: Newspaper, roles: ['superadmin', 'copywriter'] },
    { href: '/admin/maqueta', label: 'Maqueta', icon: LayoutGrid, roles: ['superadmin', 'copywriter'] },
    { href: '/admin/programas', label: 'Programas', icon: Radio, roles: ['superadmin', 'copywriter'] },
    { href: '/admin/anuncios', label: 'Anuncios', icon: Megaphone, roles: ['superadmin', 'publicista'] },
    { href: '/admin/mensajes', label: 'Mensajes', icon: MessageSquare, roles: ['superadmin'] },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users, roles: ['superadmin'] },
  ];

  const role = profile?.role || '';
  const filteredItems = navItems.filter(item => item.roles.includes(role));

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const roleLabels: Record<string, string> = {
    superadmin: 'Superadmin',
    copywriter: 'Copywriter',
    publicista: 'Publicista',
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-radio-blue text-white rounded-lg shadow-lg"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-radio-blue-dark text-white flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" onClick={() => setMobileOpen(false)}>
            <Image
              src={BRAND.logos.horizontal}
              alt={BRAND.name}
              width={200}
              height={50}
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>
          <p className="text-white/40 text-xs mt-2">Panel Admin</p>
        </div>

        {/* User info */}
        <Link
          href="/admin/perfil"
          onClick={() => setMobileOpen(false)}
          className="block px-6 py-4 border-b border-white/10 hover:bg-white/5 transition-colors"
        >
          <p className="text-sm font-medium truncate">{profile?.full_name || profile?.email}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
            {roleLabels[role] || role}
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(href)
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {isActive(href) && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Profile + Back to site + Logout */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/admin/perfil"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive('/admin/perfil')
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <UserCircle size={18} />
            Mi Perfil
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all"
          >
            <ChevronRight size={18} className="rotate-180" />
            Volver al sitio
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all w-full"
          >
            <LogOut size={18} />
            Cerrar sesion
          </button>
        </div>
      </aside>
    </>
  );
}

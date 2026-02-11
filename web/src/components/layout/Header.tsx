'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, Radio, Tv, Mail, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/noticias', label: 'Noticias', icon: Newspaper },
  { href: '/programas', label: 'Programas', icon: Radio },
  { href: '/tv', label: 'TV', icon: Tv },
  { href: '/contacto', label: 'Contacto', icon: Mail },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <div className="flex justify-center py-4 border-b border-gray-100">
        <Link href="/">
          <Image
            src="/images/logos/logo-horizontal-radio-marca-baleares.png"
            alt="Radio Marca Baleares"
            width={320}
            height={80}
            className="h-16 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex justify-center gap-1 py-2 px-4 bg-white">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isActive(href)
                ? 'bg-radio-blue text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100 hover:text-radio-blue'
            }`}
          >
            <Icon size={18} strokeWidth={2.2} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <div className="md:hidden flex justify-between items-center px-4 py-2">
        <span className="text-sm font-semibold text-radio-blue">Menu</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-6 py-3.5 text-sm font-semibold border-b border-gray-50 transition-colors ${
                isActive(href)
                  ? 'bg-radio-blue/5 text-radio-blue border-l-4 border-l-radio-blue'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} strokeWidth={2.2} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

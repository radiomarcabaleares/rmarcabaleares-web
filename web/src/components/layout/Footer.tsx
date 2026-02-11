import Link from 'next/link';
import Image from 'next/image';
import { BRAND } from '@/lib/constants/brand';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-radio-blue-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Image
              src={BRAND.logos.horizontal}
              alt={BRAND.name}
              width={240}
              height={60}
              className="h-12 w-auto brightness-0 invert"
            />
            <p className="text-gray-300 text-sm text-center md:text-left">
              Tu emisora deportiva en Baleares. Toda la informacion deportiva de las islas, en directo y a la carta.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg mb-4">Contacto</h3>
            <div className="flex items-start gap-2 text-sm text-gray-300">
              <Mail size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-white">{BRAND.contacts.atencionCliente.label}</p>
                <a href={`mailto:${BRAND.contacts.atencionCliente.email}`} className="hover:text-white transition-colors">
                  {BRAND.contacts.atencionCliente.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-300">
              <Phone size={16} className="mt-0.5 shrink-0" />
              <a href={`tel:${BRAND.contacts.atencionCliente.phone}`} className="hover:text-white transition-colors">
                {BRAND.contacts.atencionCliente.phone}
              </a>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-300 mt-3">
              <Mail size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-white">{BRAND.contacts.comercial.label}</p>
                <a href={`mailto:${BRAND.contacts.comercial.email}`} className="hover:text-white transition-colors">
                  {BRAND.contacts.comercial.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-300">
              <Phone size={16} className="mt-0.5 shrink-0" />
              <a href={`tel:${BRAND.contacts.comercial.phone}`} className="hover:text-white transition-colors">
                {BRAND.contacts.comercial.phone}
              </a>
            </div>
          </div>

          {/* Company Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg mb-4">Informacion Legal</h3>
            <div className="flex items-start gap-2 text-sm text-gray-300">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-white">{BRAND.company.legalName}</p>
                <p>{BRAND.company.address}</p>
                <p>{BRAND.company.postalCode} {BRAND.company.city}</p>
                <p>{BRAND.company.region}</p>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <Link href="/aviso-legal" className="text-sm text-gray-400 hover:text-white transition-colors">
                Aviso Legal
              </Link>
              <Link href="/contacto" className="text-sm text-gray-400 hover:text-white transition-colors">
                Contacto
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {BRAND.company.legalName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

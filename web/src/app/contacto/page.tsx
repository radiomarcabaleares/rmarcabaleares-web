'use client';

import { useState } from 'react';
import { BRAND } from '@/lib/constants/brand';
import LateralAds from '@/components/layout/LateralAds';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialForm: FormState = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

function ContactForm({ department, label }: { department: 'atencion_cliente' | 'comercial'; label: string }) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department,
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          subject: form.subject || null,
          message: form.message,
        }),
      });

      if (!res.ok) throw new Error('Error al enviar');
      setStatus('success');
      setForm(initialForm);
    } catch {
      setStatus('error');
      setErrorMsg('Error al enviar el formulario. Intentalo de nuevo.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-bold text-brand-dark mb-6">{label}</h2>

      {status === 'success' ? (
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle size={48} className="text-green-500 mb-4" />
          <h3 className="text-lg font-bold text-brand-dark mb-2">Mensaje enviado</h3>
          <p className="text-gray-500 mb-4">Nos pondremos en contacto contigo lo antes posible.</p>
          <button
            onClick={() => setStatus('idle')}
            className="text-sm text-radio-blue hover:underline"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`name-${department}`} className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                id={`name-${department}`}
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none transition-all"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label htmlFor={`email-${department}`} className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id={`email-${department}`}
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none transition-all"
                placeholder="tu@email.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`phone-${department}`} className="block text-sm font-medium text-gray-700 mb-1">
                Telefono
              </label>
              <input
                id={`phone-${department}`}
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none transition-all"
                placeholder="+34 600 000 000"
              />
            </div>
            <div>
              <label htmlFor={`subject-${department}`} className="block text-sm font-medium text-gray-700 mb-1">
                Asunto
              </label>
              <input
                id={`subject-${department}`}
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none transition-all"
                placeholder="Asunto del mensaje"
              />
            </div>
          </div>
          <div>
            <label htmlFor={`message-${department}`} className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje *
            </label>
            <textarea
              id={`message-${department}`}
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none transition-all resize-none"
              placeholder="Escribe tu mensaje..."
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-radio-blue text-white font-semibold rounded-lg hover:bg-radio-blue-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
            {status === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ContactoPage() {
  return (
    <LateralAds>
      <div>
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Contacto</h1>
        <p className="text-gray-500 mb-8">Ponte en contacto con Radio Marca Baleares</p>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-radio-blue">
            <h3 className="font-bold text-lg text-brand-dark mb-4">{BRAND.contacts.atencionCliente.label}</h3>
            <div className="space-y-3">
              <a
                href={`mailto:${BRAND.contacts.atencionCliente.email}`}
                className="flex items-center gap-3 text-gray-600 hover:text-radio-blue transition-colors"
              >
                <Mail size={18} className="text-radio-blue" />
                {BRAND.contacts.atencionCliente.email}
              </a>
              <a
                href={`tel:${BRAND.contacts.atencionCliente.phone}`}
                className="flex items-center gap-3 text-gray-600 hover:text-radio-blue transition-colors"
              >
                <Phone size={18} className="text-radio-blue" />
                {BRAND.contacts.atencionCliente.phone}
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-marca-red">
            <h3 className="font-bold text-lg text-brand-dark mb-4">{BRAND.contacts.comercial.label}</h3>
            <div className="space-y-3">
              <a
                href={`mailto:${BRAND.contacts.comercial.email}`}
                className="flex items-center gap-3 text-gray-600 hover:text-marca-red transition-colors"
              >
                <Mail size={18} className="text-marca-red" />
                {BRAND.contacts.comercial.email}
              </a>
              <a
                href={`tel:${BRAND.contacts.comercial.phone}`}
                className="flex items-center gap-3 text-gray-600 hover:text-marca-red transition-colors"
              >
                <Phone size={18} className="text-marca-red" />
                {BRAND.contacts.comercial.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Contact Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <ContactForm department="atencion_cliente" label="Atencion al Cliente" />
          <ContactForm department="comercial" label="Venta / Marketing" />
        </div>

        {/* Company Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Nuestra Ubicacion</h2>
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-marca-red mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-brand-dark">{BRAND.company.legalName}</p>
              <p className="text-gray-600">{BRAND.company.address}</p>
              <p className="text-gray-600">{BRAND.company.postalCode} {BRAND.company.city}</p>
              <p className="text-gray-600">{BRAND.company.region}</p>
            </div>
          </div>
        </div>
      </div>
    </LateralAds>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ContactSubmission } from '@/lib/supabase/types';
import { Mail, Phone, Calendar, Eye, EyeOff, ChevronDown, ChevronUp, Inbox } from 'lucide-react';

export default function AdminMensajesPage() {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/messages?filter=${filter}`);
      const json = await res.json();
      if (res.ok && json.data) setMessages(json.data as ContactSubmission[]);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const toggleRead = async (msg: ContactSubmission) => {
    try {
      await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id, is_read: !msg.is_read }),
      });
    } catch (err) {
      console.error('Error toggling read:', err);
    }
    setMessages(prev =>
      prev.map(m => m.id === msg.id ? { ...m, is_read: !m.is_read } : m)
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const departmentLabel = (d: string) =>
    d === 'atencion_cliente' ? 'Atencion al Cliente' : 'Comercial';

  const departmentColor = (d: string) =>
    d === 'atencion_cliente' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Mensajes de Contacto</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todos leidos'}
          </p>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'unread', 'read'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'unread' ? 'Sin leer' : 'Leidos'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16">
          <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay mensajes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(msg => {
            const isExpanded = expandedId === msg.id;
            return (
              <div
                key={msg.id}
                className={`bg-white rounded-xl border transition-all ${
                  msg.is_read ? 'border-gray-100' : 'border-radio-blue/30 shadow-sm'
                }`}
              >
                {/* Header row */}
                <button
                  onClick={() => toggleExpand(msg.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4"
                >
                  {/* Unread dot */}
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    msg.is_read ? 'bg-gray-200' : 'bg-radio-blue'
                  }`} />

                  {/* Name + Subject */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${msg.is_read ? 'text-gray-600' : 'font-semibold text-brand-dark'}`}>
                        {msg.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${departmentColor(msg.department)}`}>
                        {departmentLabel(msg.department)}
                      </span>
                    </div>
                    {msg.subject && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{msg.subject}</p>
                    )}
                  </div>

                  {/* Date */}
                  <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
                    {new Date(msg.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>

                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="flex flex-wrap gap-4 mt-4 mb-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} className="text-gray-400" />
                        <a href={`mailto:${msg.email}`} className="text-radio-blue hover:underline">{msg.email}</a>
                      </span>
                      {msg.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="text-gray-400" />
                          <a href={`tel:${msg.phone}`} className="text-radio-blue hover:underline">{msg.phone}</a>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 sm:hidden">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(msg.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </div>

                    <div className="flex justify-end mt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleRead(msg); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          msg.is_read
                            ? 'text-gray-500 hover:bg-gray-100'
                            : 'text-radio-blue hover:bg-radio-blue/10'
                        }`}
                      >
                        {msg.is_read ? <EyeOff size={14} /> : <Eye size={14} />}
                        {msg.is_read ? 'Marcar como no leido' : 'Marcar como leido'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

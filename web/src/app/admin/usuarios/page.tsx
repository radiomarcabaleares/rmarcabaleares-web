'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile, UserRole } from '@/lib/supabase/types';
import { UserPlus, Shield, Pencil, UserX, X, Save, Loader2 } from 'lucide-react';

export default function AdminUsuariosPage() {
  const { isSuperadmin } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', role: 'copywriter' as UserRole, password: '' });
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('copywriter');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (res.ok && json.data) setUsers(json.data as Profile[]);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (!isSuperadmin) {
    return (
      <div className="text-center py-20">
        <Shield size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Solo los superadmins pueden gestionar usuarios.</p>
      </div>
    );
  }

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.password) {
      setError('Email y contrasena son obligatorios');
      return;
    }
    setInviting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear usuario');
      }

      setShowInvite(false);
      setInviteForm({ email: '', full_name: '', role: 'copywriter', password: '' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const updateRole = async (userId: string) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, updates: { role: editRole } }),
      });
    } catch (err) {
      console.error('Error updating role:', err);
    }
    setEditingUser(null);
    fetchUsers();
  };

  const toggleActive = async (userId: string, current: boolean) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, updates: { is_active: !current } }),
      });
    } catch (err) {
      console.error('Error toggling user:', err);
    }
    fetchUsers();
  };

  const roleColors: Record<string, string> = {
    superadmin: 'bg-purple-100 text-purple-700',
    copywriter: 'bg-blue-100 text-blue-700',
    publicista: 'bg-green-100 text-green-700',
  };

  const roleLabels: Record<string, string> = {
    superadmin: 'Superadmin',
    copywriter: 'Copywriter',
    publicista: 'Publicista',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Usuarios</h1>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-radio-blue text-white rounded-lg hover:bg-radio-blue-light transition-colors text-sm font-medium"
        >
          <UserPlus size={18} />
          Crear Usuario
        </button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-radio-blue/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-brand-dark">Crear Nuevo Usuario</h2>
            <button onClick={() => setShowInvite(false)} className="p-1 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={e => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
                placeholder="usuario@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                value={inviteForm.full_name}
                onChange={e => setInviteForm(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
                placeholder="Nombre del usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contrasena *</label>
              <input
                type="password"
                value={inviteForm.password}
                onChange={e => setInviteForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
                placeholder="Contrasena segura"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={inviteForm.role}
                onChange={e => setInviteForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
              >
                <option value="copywriter">Copywriter</option>
                <option value="publicista">Publicista</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}

          <button
            onClick={handleInvite}
            disabled={inviting}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-radio-blue text-white rounded-lg hover:bg-radio-blue-light disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {inviting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {inviting ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rol</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm text-brand-dark">{u.full_name || 'Sin nombre'}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingUser === u.id ? (
                      <div className="flex items-center gap-1 justify-center">
                        <select
                          value={editRole}
                          onChange={e => setEditRole(e.target.value as UserRole)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="copywriter">Copywriter</option>
                          <option value="publicista">Publicista</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                        <button onClick={() => updateRole(u.id)} className="p-1 text-green-500 hover:bg-green-50 rounded">
                          <Save size={14} />
                        </button>
                        <button onClick={() => setEditingUser(null)} className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${roleColors[u.role]}`}>
                        {roleLabels[u.role]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium ${u.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditingUser(u.id); setEditRole(u.role); }}
                        className="p-2 text-gray-400 hover:text-radio-blue hover:bg-radio-blue/5 rounded-lg transition-colors"
                        title="Cambiar rol"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => toggleActive(u.id, u.is_active)}
                        className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                        title={u.is_active ? 'Desactivar' : 'Activar'}
                      >
                        <UserX size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

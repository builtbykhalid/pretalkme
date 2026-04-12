import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, Shield, Save, Plus, Trash2, AlertCircle } from 'lucide-react';

type AdminUser = {
  id: string;
  email: string | null;
  role: string;
  created_at: string;
};

const AdminSettings = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('admin');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const roles = ['admin', 'super_admin', 'moderator'];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      // Fetch all profiles with admin-level roles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .in('role', ['admin', 'super_admin', 'moderator'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      console.warn('Error fetching admins (may need RLS policy):', err);
      // Don't show error message in dev - admins list may just be empty
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    setSaving(true);
    try {
      // First, check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newAdminEmail.toLowerCase())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingUser) {
        setMessage({ type: 'error', text: 'User not found. They must have a Pretalk account first.' });
        setSaving(false);
        return;
      }

      // Update the user's role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newAdminRole })
        .eq('email', newAdminEmail.toLowerCase());

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: `User promoted to ${newAdminRole}` });
      setNewAdminEmail('');
      setNewAdminRole('admin');
      fetchAdmins();
    } catch (err: any) {
      console.error('Error adding admin:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to add administrator' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!window.confirm('Are you sure you want to demote this administrator to consultant?')) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'consultant' })
        .eq('id', userId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Administrator demoted to consultant' });
      fetchAdmins();
    } catch (err: any) {
      console.error('Error removing admin:', err);
      setMessage({ type: 'error', text: 'Failed to remove administrator' });
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setMessage({ type: 'success', text: `Role updated to ${newRole}` });
      fetchAdmins();
    } catch (err: any) {
      console.error('Error updating role:', err);
      setMessage({ type: 'error', text: 'Failed to update role' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-dark tracking-tight">Paramètres Administrateur</h1>
        <p className="text-sm text-neutral-500 mt-1">Gérez les administrateurs et la configuration système</p>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
            : 'bg-rose-50 border-rose-200 text-rose-700 font-medium'
          }`}>
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Add Admin Form */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Plus size={16} />
          </div>
          <h2 className="text-lg font-semibold text-dark">Promouvoir un Utilisateur</h2>
        </div>

        <form onSubmit={handleAddAdmin} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500">Adresse Email</label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="consultant@example.com"
                className="w-full p-3 bg-neutral-50 border border-neutral-200 text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium disabled:opacity-50"
                disabled={saving}
              />
              <p className="text-xs text-neutral-400 mt-1 font-medium">Doit avoir un compte Pretalk existant</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500">Rôle Administrateur</label>
              <select
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value)}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium disabled:opacity-50"
                disabled={saving}
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === 'super_admin' ? 'Super Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !newAdminEmail.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-dark hover:bg-black disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors text-sm shadow-sm"
          >
            <Save size={16} />
            {saving ? 'Ajout en cours...' : 'Ajouter l\'Administrateur'}
          </button>
        </form>
      </div>

      {/* Administrators List */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Shield size={16} />
          </div>
          <h2 className="text-lg font-semibold text-dark">Administrateurs Actuels</h2>
          <span className="ml-auto bg-neutral-100 text-neutral-600 font-bold px-2 py-1 rounded-md text-xs">
            {admins.length}
          </span>
        </div>

        {loading ? (
          <p className="text-neutral-500 text-sm font-medium">Chargement des administrateurs...</p>
        ) : admins.length === 0 ? (
          <p className="text-neutral-500 text-sm font-medium">Aucun administrateur trouvé</p>
        ) : (
          <div className="space-y-3">
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="p-4 text-left text-xs font-bold text-neutral-500 rounded-tl-xl">Email</th>
                    <th className="p-4 text-left text-xs font-bold text-neutral-500">Rôle</th>
                    <th className="p-4 text-left text-xs font-bold text-neutral-500">Rejoint le</th>
                    <th className="p-4 text-right text-xs font-bold text-neutral-500 rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {admins.map(admin => (
                    <tr key={admin.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-4 text-dark font-bold">{admin.email || 'Inconnu'}</td>
                      <td className="p-4">
                        <select
                          value={admin.role}
                          onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                          disabled={saving}
                          className="bg-neutral-50 border border-neutral-200 text-dark px-3 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:border-primary-500 disabled:opacity-50"
                        >
                          {roles.map(role => (
                            <option key={role} value={role}>
                              {role === 'super_admin' ? 'Super Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-neutral-500 text-xs font-medium">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 flex justify-end">
                        <button
                          onClick={() => handleRemoveAdmin(admin.id)}
                          disabled={saving}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Rétrograder en Consultant"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {admins.map(admin => (
                <div key={admin.id} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-neutral-400 mb-1">Email</p>
                    <p className="text-dark font-bold text-sm break-all">{admin.email || 'Inconnu'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-400 mb-1">Rôle</p>
                    <select
                      value={admin.role}
                      onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                      disabled={saving}
                      className="w-full bg-white border border-neutral-200 text-dark px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>
                          {role === 'super_admin' ? 'Super Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                    <p className="text-xs text-neutral-500 font-medium">
                      Rejoint le {new Date(admin.created_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleRemoveAdmin(admin.id)}
                      disabled={saving}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Security Info */}
      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex gap-4 items-start shadow-sm mb-12">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-primary-500 flex-shrink-0">
          <Lock size={20} />
        </div>
        <div>
          <h3 className="font-bold text-primary-900 mb-2">Notes de Sécurité</h3>
          <ul className="text-sm text-primary-700/80 space-y-1.5 font-medium">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div> Super Admin a un accès complet au système</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div> Admin peut gérer les utilisateurs et les agents</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div> Moderator a des permissions limitées</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div> Toutes les actions admin sont journalisées pour audit</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;






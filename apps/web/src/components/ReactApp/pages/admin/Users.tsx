import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaGift, FaHammer, FaSignInAlt } from 'react-icons/fa';
import { useFeedback } from '../../context/FeedbackContext';

type UserProfile = {
  id: string;
  email: string;
  company_name: string | null;
  account_status: 'active' | 'banned' | 'pending';
};

type GiftModalState = {
  isOpen: boolean;
  userId: string | null;
  durationDays: number;
};

const AdminUsers = () => {
  const { confirm, showFeedback } = useFeedback();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [giftModal, setGiftModal] = useState<GiftModalState>({
    isOpen: false,
    userId: null,
    durationDays: 30,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      // This query will require admin privileges and appropriate RLS policies
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, company_name, account_status');

      if (error) {
        console.error('Error fetching users:', error);
        // Handle error (e.g., show a notification)
      } else {
        setUsers(data as UserProfile[]);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = async (userId: string, currentStatus: UserProfile['account_status']) => {
    const action = currentStatus === 'active' ? 'ban' : 'unban';
    const confirmed = await confirm({
      title: `${action === 'ban' ? 'Bannir' : 'Débannir'} l'utilisateur`,
      message: `Voulez-vous vraiment ${action === 'ban' ? 'bannir' : 'débannir'} cet utilisateur ?`,
      type: action === 'ban' ? 'delete' : 'confirm',
      confirmLabel: action === 'ban' ? 'Bannir' : 'Débannir'
    });
    if (confirmed) {
      setLoading(true);
      const { data: newStatus, error } = await supabase.rpc('toggle_user_status', {
        user_id_to_toggle: userId,
      });

      if (error) {
        console.error(`Error ${action}ning user:`, error);
        showFeedback('error', { message: `Erreur lors de l'action: ${error.message}` });
      } else {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, account_status: newStatus } : u
        ));
      }
      setLoading(false);
    }
  };

  const handleGift = async (userId: string) => {
    setGiftModal({ isOpen: true, userId, durationDays: 30 });
  };

  const confirmGift = async () => {
    if (!giftModal.userId) return;

    setLoading(true);
    const { error } = await supabase.rpc('grant_gift_subscription', {
      user_id_to_gift: giftModal.userId,
      duration_days: giftModal.durationDays,
    });

    if (error) {
      console.error('Error gifting subscription:', error);
      showFeedback('error', { message: `Erreur lors de l'attribution: ${error.message}` });
    } else {
      showFeedback('success', { message: `Abonnement offert avec succès pour ${giftModal.durationDays} jours !` });
      setGiftModal({ isOpen: false, userId: null, durationDays: 30 });
    }
    setLoading(false);
  };

  const handleLoginAs = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('impersonate_user', {
      user_id_to_impersonate: userId,
    });

    if (error) {
      alert(`Error: ${error.message}`);
      setLoading(false);
    } else {
      // Store current admin session
      const currentUser = await supabase.auth.getUser();
      if (currentUser.data.user) {
        sessionStorage.setItem('admin_session', JSON.stringify({
          admin_id: currentUser.data.user.id,
          admin_email: currentUser.data.user.email,
          impersonated_user_id: userId,
          impersonated_user_email: data.user_email,
        }));
      }

      // Redirect to dashboard as the impersonated user
      showFeedback('info', {
        title: `Mode impersonation: ${data.user_email}`,
        message: 'Vous allez être redirigé vers le dashboard de cet utilisateur. Vos actions seront enregistrées comme étant les siennes. Soyez vigilant.'
      });
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-dark tracking-tight">Gestion des Utilisateurs</h1>
        <p className="text-sm text-neutral-500 mt-1">Gérez les comptes, les abonnements et les accès.</p>
      </div>

      <div className="bg-white border border-neutral-200 p-4 rounded-2xl shadow-sm">
        <input
          type="text"
          placeholder="Rechercher par email ou entreprise..."
          className="w-full p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium placeholder:text-neutral-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop view */}
      <div className="hidden md:block bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="p-4 text-left text-xs font-bold text-neutral-500">Email</th>
              <th className="p-4 text-left text-xs font-bold text-neutral-500">Entreprise</th>
              <th className="p-4 text-left text-xs font-bold text-neutral-500">Statut</th>
              <th className="p-4 text-right text-xs font-bold text-neutral-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-500 font-medium font-sm">Chargement...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-500 font-medium font-sm">Aucun utilisateur trouvé</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-4 text-dark font-medium text-sm">{user.email || 'N/A'}</td>
                  <td className="p-4 text-neutral-600 text-sm">{user.company_name || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${user.account_status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        user.account_status === 'banned' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                      {user.account_status === 'active' ? 'Actif' : user.account_status === 'banned' ? 'Banni' : user.account_status}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2 flex-wrap">
                    <button
                      onClick={() => handleLoginAs(user.id)}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2 rounded-lg transition-colors text-sm"
                      title="Se connecter en tant que"
                      disabled={loading}
                    >
                      <FaSignInAlt size={14} />
                    </button>
                    <button
                      onClick={() => handleGift(user.id)}
                      className="bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 p-2 rounded-lg transition-colors text-sm"
                      title="Offrir un abonnement"
                      disabled={loading}
                    >
                      <FaGift size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id, user.account_status)}
                      className={`p-2 rounded-lg transition-colors text-sm ${user.account_status === 'active'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                        }`}
                      title={user.account_status === 'active' ? 'Bannir' : 'Débannir'}
                      disabled={loading}
                    >
                      <FaHammer size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="p-4 text-center text-neutral-500">Chargement...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-neutral-500">Aucun utilisateur trouvé</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-4 shadow-sm">
              <div>
                <p className="text-xs font-bold text-neutral-400 mb-1">Email</p>
                <p className="text-dark font-bold text-sm break-all">{user.email || 'N/A'}
                  <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold ${user.account_status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      user.account_status === 'banned' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {user.account_status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-400 mb-1">Entreprise</p>
                <p className="text-neutral-600 text-sm">{user.company_name || 'N/A'}</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => handleLoginAs(user.id)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 rounded-xl text-xs font-bold transition-colors flex justify-center items-center gap-2"
                  disabled={loading}
                >
                  <FaSignInAlt /> Login
                </button>
                <button
                  onClick={() => handleGift(user.id)}
                  className="flex-1 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 py-2 rounded-xl text-xs font-bold transition-colors flex justify-center items-center gap-2"
                  disabled={loading}
                >
                  <FaGift /> Offrir
                </button>
                <button
                  onClick={() => handleToggleStatus(user.id, user.account_status)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex justify-center items-center gap-2 ${user.account_status === 'active'
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  disabled={loading}
                >
                  <FaHammer /> {user.account_status === 'active' ? 'Bannir' : 'Débannir'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Gift Subscription Modal */}
      {giftModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold text-dark mb-2">Offrir un abonnement</h2>
            <p className="text-sm text-neutral-500 mb-6 font-medium">
              Accordez un accès premium à cet utilisateur pour la durée spécifiée.
            </p>

            <div className="mb-6 space-y-2">
              <label className="text-sm font-bold text-dark">Durée (jours)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={giftModal.durationDays}
                onChange={(e) => setGiftModal({ ...giftModal, durationDays: parseInt(e.target.value) })}
                className="w-full p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-dark font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-neutral-400 text-xs font-medium">
                Par défaut: 30 jours (1 mois)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setGiftModal({ isOpen: false, userId: null, durationDays: 30 })}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 px-4 rounded-xl text-sm font-bold transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={confirmGift}
                className="flex-1 bg-dark hover:bg-black text-white py-2.5 px-4 rounded-xl text-sm font-bold transition-colors"
                disabled={loading}
              >
                {loading ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;






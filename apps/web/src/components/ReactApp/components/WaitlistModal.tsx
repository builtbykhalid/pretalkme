import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { directApi } from '../lib/supabase';

export default function WaitlistModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setError(t('home.waitlist.errors.invalidEmail'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await directApi.insert('waitlist', { email });
      setSuccess(t('home.waitlist.success'));
      setEmail('');
    } catch (err) {
      console.error(err);
      setError(t('home.waitlist.errors.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Unified backdrop */}
      <div
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white text-dark rounded-t-2xl md:rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center -mt-2 mb-3">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-dark transition-all">
          <X size={18} />
        </button>

        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-linear-to-br from-accent-600 to-primary-500 text-white shadow-lg shadow-accent-500/20">
            <Sparkles size={22} />
          </div>
          <h3 className="text-xl font-semibold text-dark mb-2 tracking-tight">{t('home.waitlist.title')}</h3>
          <p className="text-sm text-neutral-500 mb-5 font-medium">{t('home.waitlist.subtitle')}</p>

          {success ? (
            <div className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl p-4 font-bold">{success}</div>
          ) : (
            <>
              <input
                type="email"
                placeholder={t('home.waitlist.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 mb-3 bg-neutral-50 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-200 outline-none text-sm font-bold text-dark placeholder:text-neutral-300 transition-all"
              />
              {error && <div className="text-sm text-rose-500 mb-2 font-medium">{error}</div>}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-accent-800 to-primary-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:opacity-95 transition-all shadow-lg shadow-accent-500/15 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> {t('home.waitlist.actions.loading')}</>
                ) : (
                  t('home.waitlist.actions.join')
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Save, Bell, Mail, Settings as SettingsIcon, Clock, Zap } from 'lucide-react';

interface NotificationPreference {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  email: boolean;
  push: boolean;
  frequency: 'instant' | 'hourly' | 'daily';
}

export default function NotificationSettings() {
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'new-request',
      name: 'New Agent Requests',
      description: 'When someone submits a custom agent request',
      icon: <Zap size={20} className="text-primary-500" />,
      enabled: true,
      email: true,
      push: true,
      frequency: 'instant',
    },
    {
      id: 'user-action',
      name: 'User Actions',
      description: 'When users upgrade, downgrade, or ban account',
      icon: <SettingsIcon size={20} className="text-green-500" />,
      enabled: true,
      email: false,
      push: true,
      frequency: 'hourly',
    },
    {
      id: 'automation-error',
      name: 'Automation Errors',
      description: 'When n8n workflows or webhooks fail',
      icon: <Bell size={20} className="text-red-500" />,
      enabled: true,
      email: true,
      push: true,
      frequency: 'instant',
    },
    {
      id: 'payment-success',
      name: 'Payment Confirmations',
      description: 'When payments are received',
      icon: <Zap size={20} className="text-green-500" />,
      enabled: true,
      email: true,
      push: false,
      frequency: 'instant',
    },
    {
      id: 'agent-update',
      name: 'Agent Library Updates',
      description: 'When agents are added or modified',
      icon: <SettingsIcon size={20} className="text-accent-500" />,
      enabled: false,
      email: false,
      push: false,
      frequency: 'daily',
    },
    {
      id: 'system-alert',
      name: 'System Alerts',
      description: 'Critical system issues and maintenance',
      icon: <Bell size={20} className="text-orange-500" />,
      enabled: true,
      email: true,
      push: true,
      frequency: 'instant',
    },
  ]);

  const updatePreference = (id: string, field: keyof NotificationPreference, value: boolean | string) => {
    setPreferences(preferences.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
    setSaved(false);
  };

  const handleSave = () => {
    // Save preferences to localStorage
    localStorage.setItem('notification_preferences', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const allEnabled = preferences.every(p => p.enabled);
  const toggleAll = () => {
    const newState = !allEnabled;
    setPreferences(preferences.map(p => ({ ...p, enabled: newState })));
    setSaved(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-dark tracking-tight flex items-center gap-3">
          <Bell size={28} className="text-primary-600" />
          Paramètres de Notification
        </h1>
        <p className="text-sm text-neutral-500 mt-2">Configurez comment et quand vous recevez des alertes système et métier</p>
      </div>

      {/* Global Controls */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-dark">Contrôle Global des Notifications</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Activez ou désactivez toutes les notifications d'un seul clic
            </p>
          </div>
          <button
            onClick={toggleAll}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-inner ${allEnabled ? 'bg-primary-500' : 'bg-neutral-200'
              }`}
            aria-checked={allEnabled}
            role="switch"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${allEnabled ? 'translate-x-[26px]' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        {preferences.map((pref) => (
          <div
            key={pref.id}
            className={`bg-white border rounded-2xl p-6 transition-all shadow-sm ${pref.enabled ? 'border-primary-100 ring-1 ring-primary-50' : 'border-neutral-200 hover:border-neutral-300'}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-2.5 rounded-xl border flex-shrink-0 ${pref.enabled ? 'bg-primary-50 border-primary-100' : 'bg-neutral-50 border-neutral-100'}`}>
                  {pref.icon}
                </div>
                <div>
                  <h3 className={`font-bold ${pref.enabled ? 'text-dark' : 'text-neutral-600'}`}>{pref.name}</h3>
                  <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{pref.description}</p>
                </div>
              </div>

              {/* Toggle Enable */}
              <button
                onClick={() => updatePreference(pref.id, 'enabled', !pref.enabled)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ml-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-inner ${pref.enabled ? 'bg-primary-500' : 'bg-neutral-200'
                  }`}
                aria-checked={pref.enabled}
                role="switch"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${pref.enabled ? 'translate-x-[22px]' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {pref.enabled && (
              <div className="space-y-5 pt-5 border-t border-neutral-100 mt-5">
                {/* Channels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50/50 p-4 rounded-xl border border-neutral-100">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={pref.email}
                        onChange={(e) => updatePreference(pref.id, 'email', e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded border-2 border-neutral-300 bg-white peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all flex items-center justify-center">
                        <svg className={`w-3 h-3 text-white ${pref.email ? 'opacity-100' : 'opacity-0'} transition-opacity`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className={`transition-colors ${pref.email ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-500'}`} />
                      <span className="text-sm font-medium text-dark">Notification Email</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={pref.push}
                        onChange={(e) => updatePreference(pref.id, 'push', e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded border-2 border-neutral-300 bg-white peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all flex items-center justify-center">
                        <svg className={`w-3 h-3 text-white ${pref.push ? 'opacity-100' : 'opacity-0'} transition-opacity`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bell size={16} className={`transition-colors ${pref.push ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-500'}`} />
                      <span className="text-sm font-medium text-dark">Notification In-app</span>
                    </div>
                  </label>
                </div>

                {/* Frequency */}
                <div className="flex items-center gap-3 bg-neutral-50/50 p-4 rounded-xl border border-neutral-100">
                  <Clock size={16} className="text-neutral-400" />
                  <label className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-sm font-bold text-neutral-500 min-w-fit">Fréquence</span>
                    <select
                      value={pref.frequency}
                      onChange={(e) => updatePreference(pref.id, 'frequency', e.target.value)}
                      className="flex-1 sm:w-auto px-4 py-2 bg-white border border-neutral-200 rounded-lg text-dark text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm cursor-pointer"
                    >
                      <option value="instant">Instantanée</option>
                      <option value="hourly">Résumé Horaire</option>
                      <option value="daily">Résumé Quotidien</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Email Digest Settings */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-dark mb-5 flex items-center gap-2">
            <Mail size={18} className="text-neutral-400" /> Paramètres d'Emailing
          </h2>

          <div className="space-y-5">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" defaultChecked className="peer sr-only" />
                  <div className="w-5 h-5 rounded border-2 border-neutral-300 bg-white peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all flex items-center justify-center">
                    <svg className="w-3 h-3 text-white opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
                <span className="text-sm font-medium text-dark group-hover:text-primary-600 transition-colors">Combiner les emails quand c'est possible</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" defaultChecked className="peer sr-only" />
                  <div className="w-5 h-5 rounded border-2 border-neutral-300 bg-white peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all flex items-center justify-center">
                    <svg className="w-3 h-3 text-white opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
                <span className="text-sm font-medium text-dark group-hover:text-primary-600 transition-colors">Envoyer les résumés à 09:00 (UTC)</span>
              </label>
            </div>

            <div className="pt-5 border-t border-neutral-100">
              <label className="block text-xs font-bold text-neutral-500 mb-2">Adresse de Réception</label>
              <input
                type="email"
                defaultValue="admin@pretalk.me"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-dark text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm"
                placeholder="admin@example.com"
              />
            </div>
          </div>
        </div>

        {/* Do Not Disturb */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-dark mb-5 flex items-center gap-2">
            <Clock size={18} className="text-neutral-400" /> Ne Pas Déranger
          </h2>

          <div className="space-y-5">
            <label className="flex items-center justify-between cursor-pointer p-4 bg-neutral-50 border border-neutral-100 rounded-xl">
              <span className="text-sm font-bold text-dark">Activer le mode "Ne pas déranger"</span>
              <button
                className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ml-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-inner bg-neutral-200"
                role="switch"
                aria-checked="false"
              >
                <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform translate-x-1" />
              </button>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-2">Heure de début</label>
                <input
                  type="time"
                  defaultValue="22:00"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-dark text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-2">Heure de fin</label>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-dark text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
              <p className="text-xs font-medium text-amber-800 leading-relaxed">
                Pendant cette période, seules les alertes critiques de sécurité et de système seront affichées instantanément.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-4 flex justify-end gap-3 pt-6 border-t border-neutral-200 mt-8 mb-4">
        {saved && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-sm font-bold animate-fade-in shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            Préférences sauvegardées !
          </div>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-dark hover:bg-black text-white rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-md"
        >
          <Save size={18} />
          Enregistrer
        </button>
      </div>
    </div>
  );
}






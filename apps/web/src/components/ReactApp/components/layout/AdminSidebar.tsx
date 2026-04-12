import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Bot, Package,
  Activity, FileText, Wrench, Settings as SettingsIcon,
  Bell, Calendar, LineChart, CreditCard, Megaphone
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const adminSections = [
    {
      title: "Vue d'ensemble",
      items: [
        { label: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
      ]
    },
    {
      title: "Gestion Plateforme",
      items: [
        { label: 'Utilisateurs', path: '/admin/users', icon: Users },
        { label: 'Marketing Hub', path: '/admin/marketing', icon: Megaphone },
        { label: 'Blog', path: '/admin/blog', icon: FileText },
        { label: 'Composants', path: '/admin/components', icon: Wrench },
        { label: 'Modèles', path: '/admin/templates', icon: Package },
      ]
    },
    {
      title: "Intelligence Artificielle",
      items: [
        { label: 'Agents IA', path: '/admin/agents', icon: Bot },
        { label: 'Factory', path: '/admin/factory', icon: Package },
      ]
    },
    {
      title: "Données Globales",
      items: [
        { label: 'Rendez-vous', path: '/admin/bookings', icon: Calendar },
        { label: 'Leads', path: '/admin/leads', icon: LineChart },
        { label: 'Facturation', path: '/admin/billing', icon: CreditCard },
      ]
    },
    {
      title: "Système & Surveillance",
      items: [
        { label: 'Paramètres', path: '/admin/settings', icon: SettingsIcon },
        { label: 'Notifications', path: '/admin/notification-settings', icon: Bell },
        { label: 'Logs', path: '/admin/logs', icon: FileText },
        { label: 'Monitoring', path: '/admin/monitoring', icon: Activity },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-neutral-200 flex flex-col z-30 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'
          }`}
      >
        {/* Logo */}
        <div className="p-4 sm:p-6 flex items-center gap-3 min-h-[76px] border-b border-neutral-100">
          <div className="w-10 h-10 bg-dark rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-semibold text-xl">P</span>
          </div>
          {isOpen && (
            <span className="text-lg font-semibold text-dark truncate">
              Admin
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          {adminSections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              {/* Section Title */}
              {isOpen ? (
                <div className="px-3 text-xs text-neutral-400 mb-2">
                  {section.title}
                </div>
              ) : (
                <div className="w-full h-px bg-neutral-100 my-4" />
              )}

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'} // Exact match for root admin
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                        ? 'bg-dark text-white shadow-md'
                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-dark'
                      } ${!isOpen ? 'justify-center' : ''}`
                    }
                    title={isOpen ? '' : item.label}
                  >
                    <item.icon size={18} className={`flex-shrink-0 transition-colors`} />
                    {isOpen && <span className="text-sm font-bold">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
          <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-neutral-500">
              <SettingsIcon size={14} />
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-dark">Pretalk.me</span>
                <span className="text-xs font-medium text-neutral-500">v1.0.0</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content spacer */}
      <div
        className={`transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'
          } hidden md:block flex-shrink-0`}
      />
    </>
  );
}






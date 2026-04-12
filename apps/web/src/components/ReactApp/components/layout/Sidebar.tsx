import { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  LayoutDashboard,
  MessageSquare, 
  Users, 
  Megaphone, 
  FileText,
  GitBranch, 
  ShoppingBag, 
  Bot, 
  BarChart2, 
  Settings,
  Code
} from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';
import Logo from '../ui/Logo';

export default function Sidebar({ mobile = false, isOpen = true, onToggle }: { mobile?: boolean; isOpen?: boolean; onToggle?: () => void }) {
  const { t } = useTranslation();
  const { user } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard, path: '/' },
    { id: 'inbox',       label: 'Conversations', icon: MessageSquare,   path: '/inbox', badge: 'unread' },
    { id: 'crm',         label: 'CRM & Leads', icon: Users,           path: '/crm' },
    { id: 'campaigns',   label: 'Campagnes',   icon: Megaphone,       path: '/campaigns' },
    { id: 'templates',   label: 'Templates',   icon: FileText,        path: '/templates' },
    { id: 'flows',       label: 'Automations', icon: GitBranch,       path: '/flows' },
    { id: 'ecommerce',   label: 'E-Commerce',  icon: ShoppingBag,     path: '/ecommerce/products' },
    { id: 'ai-agent',    label: 'Agent IA',    icon: Bot,             path: '/ai-agent' },
    { id: 'analytics',   label: 'Analytics',   icon: BarChart2,       path: '/analytics' },
    { id: 'settings',    label: 'Paramètres',  icon: Settings,        path: '/settings' },
    { id: 'developer',   label: 'Outils Dév',  icon: Code,            path: '/developer' },
  ];

  return (
    <div 
      className={mobile
        ? 'relative h-full w-64 bg-white border-r border-[#D1D7DB] flex flex-col z-30 md:hidden'
        : `fixed left-0 top-0 h-full bg-white border-r border-[#D1D7DB] flex flex-col z-40 hidden md:flex transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`
      }
    >
      {/* Branding */}
      <div className={`p-6 flex items-center justify-between ${!isOpen ? 'px-0 justify-center' : ''}`}>
        <Logo size="lg" showText={isOpen} textColor="text-[#111B21]" logoColor="primary" />
        {isOpen && (
          <button onClick={onToggle} className="p-1.5 hover:bg-[#F0F2F5] rounded-lg text-[#8696A0] hover:text-[#111B21] transition-all">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                ? 'bg-[#F0F2F5] text-[#111B21] font-bold'
                : 'text-[#54656F] hover:bg-[#F0F2F5]/50'
              } ${!isOpen ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={`shrink-0 ${isActive ? 'text-[#00A884]' : 'text-[#8696A0] group-hover:text-[#54656F]'}`}
                />
                {isOpen && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="text-[14px] truncate">{item.label}</span>
                    {item.badge && (
                      <span className="bg-[#00A884] text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                        12
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile & Logout Area */}
      <div className="p-3 border-t border-[#E9EDEF]">
        <div 
          onClick={() => navigate('/settings')}
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-[#F0F2F5] cursor-pointer transition-all ${!isOpen ? 'justify-center' : ''}`}
        >
          <UserAvatar size={isOpen ? 40 : 32} />
          {isOpen && (
            <div className="overflow-hidden">
               <p className="text-[14px] font-bold text-[#111B21] truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#00A884] shadow-sm shadow-[#00A884]/20" />
                  <span className="text-[11px] font-bold text-[#8696A0] uppercase tracking-wide">Business Pro</span>
               </div>
            </div>
          )}
        </div>
        {isOpen && (
           <div className="mt-4 px-3 opacity-20 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111B21]">pretalkme v2.4</span>
           </div>
        )}
      </div>
    </div>
  );
}

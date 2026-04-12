import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Plus, Settings } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';

export default function MobileNav() {
    const navItems = [
        {
            id: 'dashboard',
            icon: LayoutDashboard,
            path: '/',
        },
        {
            id: 'leads',
            icon: Users,
            path: '/leads',
        },
        {
            id: 'create',
            icon: Plus,
            path: '/forms/new',
            isAction: true,
        },
        {
            id: 'settings',
            icon: Settings,
            path: '/settings',
        },
        {
            id: 'profile',
            path: '/my-profile',
            isProfile: true
        },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EEEEEE] px-2 pb-safe-area pt-2 z-50">
            <div className="flex items-center justify-around max-w-md mx-auto h-12 relative">
                {navItems.map((item) => (
                    item.isAction ? (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className="flex flex-col items-center justify-center -mt-9"
                        >
                            <div className="w-12 h-12 bg-[#0D0D0D] rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white transition-transform active:scale-90">
                                {item.icon && <item.icon size={22} strokeWidth={2.5} />}
                            </div>
                        </NavLink>
                    ) : (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `flex items-center justify-center py-2 px-3 rounded-lg transition-all ${isActive ? 'text-[#0D0D0D] bg-[#F0F0F0]' : 'text-[#9A9A9A] hover:text-[#6B6B6B]'
                                }`
                            }
                        >
                            {item.isProfile ? (
                                <div className="p-0.5 rounded-full border border-transparent transition-all">
                                    <UserAvatar size={20} rounded="rounded-full" />
                                </div>
                            ) : (
                                item.icon && <item.icon size={20} strokeWidth={1.5} className="transition-transform duration-200" />
                            )}
                        </NavLink>
                    )
                ))}
            </div>
        </div>
    );
}

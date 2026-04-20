import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import AnnouncementRenderer from '../components/marketing/AnnouncementRenderer';

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const isImmersivePage = pathname.includes('/my-profile') || pathname.includes('/forms/') || pathname.includes('/inbox') || /\/leads\/[^/]+/.test(pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isImmersivePage);

  useEffect(() => {
    if (isImmersivePage) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [pathname, isImmersivePage]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex relative">
      {/* Sidebar - Desktop */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Sidebar - Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative w-[240px] bg-white h-full shadow-lg animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="absolute top-4 -right-12">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 bg-white hover:bg-[#F4F4F4] rounded-lg text-[#0D0D0D] transition-all active:scale-95 border border-[#E8E8E8] shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      {/* ml = AppSwitcher(40px) + Sidebar(256px open / 80px collapsed) */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-74' : 'md:ml-30'} flex flex-col min-w-0`}>
        <AnnouncementRenderer />
        {!isImmersivePage && (
          <Header
            onMobileMenuClick={() => setMobileMenuOpen(true)}
          />
        )}
        <main className={`flex-1 overflow-y-auto relative pb-24 md:pb-8 ${isImmersivePage ? 'p-0' : 'p-4 sm:p-8'}`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}






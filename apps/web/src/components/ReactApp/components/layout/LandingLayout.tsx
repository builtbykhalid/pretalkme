import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import MainHeader from '../layout/MainHeader';
import MainFooter from '../layout/MainFooter';
import UnifiedCTA from '../layout/UnifiedCTA';

import { NotificationProvider } from '../../context/NotificationContext';

interface LayoutProps {
  children: React.ReactNode;
  forceScrolled?: boolean;
}

export const LandingLayout: React.FC<LayoutProps> = ({ children, forceScrolled = true }) => {
  return (
    <AuthProvider>
      <AppProvider>
        <NotificationProvider>
          <div className="bg-white min-h-screen font-sans">
            <MainHeader forceScrolled={forceScrolled} />
            <main>
              {children}
            </main>
            <UnifiedCTA />
            <MainFooter />
          </div>
        </NotificationProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default LandingLayout;

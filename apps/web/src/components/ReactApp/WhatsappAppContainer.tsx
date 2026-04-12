import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/whatsapp/Dashboard';
import Templates from './pages/whatsapp/Templates';
import Inbox from './pages/whatsapp/Inbox';
import CRM from './pages/whatsapp/CRM';
import ContactDetail from './pages/whatsapp/ContactDetail';
import Campaigns from './pages/whatsapp/Campaigns';
import CampaignDetail from './pages/whatsapp/CampaignDetail';
import FlowBuilder from './pages/whatsapp/FlowBuilder';
import Products from './pages/whatsapp/Products';
import Orders from './pages/whatsapp/Orders';
import AIAgent from './pages/whatsapp/AIAgent';
import AILogs from './pages/whatsapp/AILogs';
import Analytics from './pages/whatsapp/Analytics';
import Settings from './pages/whatsapp/Settings';
import Developer from './pages/whatsapp/Developer';
import Billing from './pages/whatsapp/Billing';
import Onboarding from './pages/whatsapp/Onboarding';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { ImpersonationProvider } from './context/ImpersonationContext';
import { FeedbackProvider } from './context/FeedbackContext';
import DashboardLayout from './layouts/DashboardLayout';
import { Toaster } from 'react-hot-toast';

export default function WhatsappAppContainer() {
  return (
    <AuthProvider>
      <AppProvider>
        <FeedbackProvider>
          <NotificationProvider>
            <ImpersonationProvider>
              <BrowserRouter basename="/whatsapp">
                <Routes>
                  <Route element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/inbox" element={<Inbox />} />
                    <Route path="/inbox/:conversationId" element={<Inbox />} />
                    <Route path="/crm" element={<CRM />} />
                    <Route path="/crm/:contactId" element={<ContactDetail />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/campaigns/:id" element={<CampaignDetail />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/flows" element={<FlowBuilder />} />
                    <Route path="/ecommerce/products" element={<Products />} />
                    <Route path="/ecommerce/orders" element={<Orders />} />
                    <Route path="/ai-agent" element={<AIAgent />} />
                    <Route path="/ai-agent/logs" element={<AILogs />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/settings/billing" element={<Billing />} />
                    <Route path="/developer" element={<Developer />} />
                  </Route>
                </Routes>
                <Toaster position="top-right" />
              </BrowserRouter>
            </ImpersonationProvider>
          </NotificationProvider>
        </FeedbackProvider>
      </AppProvider>
    </AuthProvider>
  );
}

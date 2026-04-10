import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { TenantDashboardLayout } from './layouts/TenantDashboardLayout';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { Dashboard } from './pages/dashboard/Dashboard';
import { TenantOverview } from './pages/tenant/TenantOverview';
import { AdsManagement } from './pages/tenant/ads/AdsManagement';
import { AdCreateWizard } from './pages/tenant/ads/AdCreateWizard';
import { AdEditDetails } from './pages/tenant/ads/AdEditDetails';
import { DesignerDashboard } from './pages/tenant/designer/DesignerDashboard';
import { PublishingSchedule } from './pages/tenant/publications/PublishingSchedule';
import { PublishingTypes } from './pages/tenant/publications/PublishingTypes';
import { CustomersList } from './pages/tenant/crm/CustomersList';
import { CustomerProfile } from './pages/tenant/crm/CustomerProfile';
import { AnnouncementTemplates } from './pages/tenant/crm/AnnouncementTemplates';
import { PricingRules } from './pages/tenant/pricing/PricingRules';
import { DataTools } from './pages/tenant/settings/DataTools';
import { PublishingCalendar } from './pages/tenant/calendar/PublishingCalendar';
import { PublishingSettings } from './pages/tenant/settings/PublishingSettings';
import { BillingList } from './pages/tenant/billing/BillingList';
import { Companies } from './pages/companies/Companies';
import { CompanyOverview } from './pages/companies/CompanyOverview';
import { CompanySettings } from './pages/companies/CompanySettings';
import { CompanyUsers } from './pages/companies/CompanyUsers';
import { CompanyDetailLayout } from './layouts/CompanyDetailLayout';
import { Users } from './pages/users/Users';
import { Landing } from './pages/public/Landing';
import { useAuthStore } from './store/authStore';

// Placeholders for now
const Settings = () => <div>Settings Placeholder</div>;
const PlaceholderPage = ({ title }) => <div className="p-8"><h1>{title}</h1><p>This is a placeholder for the future.</p></div>;

function App() {
  const { user, isAuthenticated } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Unauthenticated Landing */}
      {!isAuthenticated && (
        <Route path="/" element={<Landing />} />
      )}

      {/* Protected Target Routes */}
      {isAuthenticated && isSuperAdmin && (
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />

          {/* Global Lists */}
          <Route path="companies" element={<Companies />} />
          <Route path="users" element={<Users />} />

          {/* Single Company Views */}
          <Route path="companies/:id" element={<CompanyDetailLayout />}>
            <Route index element={<CompanyOverview />} />
            <Route path="users" element={<CompanyUsers />} />
            <Route path="settings" element={<CompanySettings />} />
          </Route>

          {/* Placeholders */}
          <Route path="settings" element={<Settings />} />
        </Route>
      )}

      {isAuthenticated && !isSuperAdmin && (
        <Route path="/" element={<TenantDashboardLayout />}>
          <Route index element={<TenantOverview />} />

          {/* Tenant Routes */}
          <Route path="ads">
            <Route index element={<AdsManagement />} />
            <Route path="new" element={<AdCreateWizard />} />
            <Route path=":id/edit" element={<AdEditDetails />} />
          </Route>
          <Route path="calendar" element={<PublishingCalendar />} />
          <Route path="designer">
            <Route path="dashboard" element={<DesignerDashboard />} />
          </Route>
          <Route path="publications">
            <Route path="schedule" element={<PublishingSchedule />} />
            <Route path="types" element={<PublishingTypes />} />
          </Route>
          <Route path="customers">
            <Route index element={<CustomersList />} />
            <Route path=":id" element={<CustomerProfile />} />
          </Route>
          <Route path="users" element={<Users />} />
          <Route path="templates" element={<AnnouncementTemplates />} />
          <Route path="pricing" element={<PricingRules />} />
          <Route path="data-tools" element={<DataTools />} />
          <Route path="settings" element={<PublishingSettings />} />
          <Route path="billing" element={<BillingList />} />
        </Route>
      )}

      {/* Fallback routing */}
      {/* If matched nothing, and user is logged out, redirect to / (Landing). If logged in, redirect to / (Dashboard) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

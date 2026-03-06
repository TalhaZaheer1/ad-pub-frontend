import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { TenantDashboardLayout } from './layouts/TenantDashboardLayout';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { Dashboard } from './pages/dashboard/Dashboard';
import { TenantOverview } from './pages/tenant/TenantOverview';
import { Companies } from './pages/companies/Companies';
import { CompanyOverview } from './pages/companies/CompanyOverview';
import { CompanySettings } from './pages/companies/CompanySettings';
import { CompanyUsers } from './pages/companies/CompanyUsers';
import { CompanyDetailLayout } from './layouts/CompanyDetailLayout';
import { Users } from './pages/users/Users';
import { useAuthStore } from './store/authStore';

// Placeholders for now
const Settings = () => <div>Settings Placeholder</div>;
const PlaceholderPage = ({ title }) => <div className="p-8"><h1>{title}</h1><p>This is a placeholder for the future.</p></div>;

function App() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Protected Routes */}
      {isSuperAdmin ? (
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
      ) : (
        <Route path="/" element={<TenantDashboardLayout />}>
          <Route index element={<TenantOverview />} />

          {/* Tenant Placeholders */}
          <Route path="campaigns" element={<PlaceholderPage title="Campaign Management" />} />
          <Route path="media" element={<PlaceholderPage title="Media Library" />} />
          <Route path="billing" element={<PlaceholderPage title="Billing & Invoices" />} />
        </Route>
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

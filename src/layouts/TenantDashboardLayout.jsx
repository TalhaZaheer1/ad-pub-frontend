import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Megaphone,
  BookOpen,
  Calendar,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Heart,
  Database,
  Sliders,
  UserCog,
  Calculator,
  Layers
} from 'lucide-react';
import { cn } from '../utils/cn';

const getNavigation = (role) => {
  if (role === 'DESIGNER') {
    return [
      { name: 'Design Workspace', href: '/designer/dashboard', icon: LayoutDashboard }
    ];
  }

  return [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Ads', href: '/ads', icon: Megaphone },
    ...(role === 'COMPANY_ADMIN' ? [{ name: 'Designer Ops', href: '/designer/dashboard', icon: Layers }] : []),
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Pricing', href: '/pricing', icon: Calculator },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Templates', href: '/templates', icon: Heart },
    { name: 'Ad/Publication Types', href: '/publications/types', icon: Sliders },
    { name: 'Data Tools', href: '/data-tools', icon: Database },
    ...(role === 'COMPANY_ADMIN' ? [{ name: 'Users', href: '/users', icon: UserCog }] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Billing', href: '/billing', icon: CreditCard },
  ];
};

export const TenantDashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = getNavigation(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-10 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-inner">
              <span className="text-white font-bold text-sm tracking-tighter">AP</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
              {user?.company?.name || 'Workspace'}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex flex-1 min-w-0 justify-center px-6">
            <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors relative py-5 whitespace-nowrap",
                      isActive
                        ? "text-accent"
                        : "text-gray-500 hover:text-gray-900"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-gray-400")} />
                      {item.name}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4 shrink-0">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white"></span>
            </button>

            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900 leading-none">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-gray-500 mt-1 capitalize">
                  {user?.role?.toLowerCase() || 'User'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo flex items-center justify-center font-bold text-sm border border-indigo-200">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="xl:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="xl:hidden fixed inset-0 top-16 z-40 bg-gray-900/10 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="xl:hidden fixed top-[4.5rem] right-4 left-4 sm:left-auto sm:w-80 sm:right-6 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="p-3 space-y-1 max-h-[80vh] overflow-y-auto no-scrollbar">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
              <div className="my-2 border-t border-gray-100" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Log out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-up">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">© 2026 AdPub System. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Support</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

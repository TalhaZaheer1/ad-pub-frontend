import React, { useState } from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export const DashboardLayout = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:bottom-0 lg:top-0 lg:flex lg:flex-col lg:w-64",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AP</span>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">Admin</span>
                    </div>
                    <button
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex flex-1 flex-col px-4 pt-6">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-2">
                                {navigation.map((item) => (
                                    <li key={item.name}>
                                        <NavLink
                                            to={item.href}
                                            className={({ isActive }) =>
                                                cn(
                                                    'group flex gap-x-3 rounded-xl p-3 text-sm font-medium leading-6 transition-colors',
                                                    isActive
                                                        ? 'bg-accent/10 text-accent'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                )
                                            }
                                        >
                                            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                            {item.name}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col lg:pl-64 min-h-screen">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-100 bg-surface/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>

                    {/* Separator */}
                    <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

                    <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex items-center gap-x-4 lg:gap-x-6">

                            {/* Profile dropdown Placeholder */}
                            <div className="flex items-center gap-x-4">
                                <div className="hidden lg:flex lg:flex-col lg:items-end">
                                    <span className="text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {user?.role}
                                    </span>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-accent flex justify-center items-center text-white font-medium shadow-sm">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </div>
                                <button
                                    onClick={() => logout()}
                                    className="p-2 text-gray-400 hover:text-danger rounded-full transition-colors ml-2"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1">
                    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

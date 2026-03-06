import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const AuthLayout = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-stretch justify-stretch m-0 p-0 text-gray-900 bg-white">
            <Outlet />
        </div>
    );
};

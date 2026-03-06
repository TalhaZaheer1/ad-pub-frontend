import React from 'react';

export const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-700">
                    Welcome to the Super Admin Dashboard.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Placeholder Stats Cards */}
                <div className="overflow-hidden rounded-xl bg-surface px-4 py-5 shadow-sm border border-gray-100 sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Total Companies</dt>
                    <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">12</dd>
                </div>
                <div className="overflow-hidden rounded-xl bg-surface px-4 py-5 shadow-sm border border-gray-100 sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Total Users</dt>
                    <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">48</dd>
                </div>
                <div className="overflow-hidden rounded-xl bg-surface px-4 py-5 shadow-sm border border-gray-100 sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Active Sessions</dt>
                    <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">24</dd>
                </div>
            </div>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { StatCard } from '../../components/ui/StatCard';
import { Users, Shield, PenTool, LayoutTemplate } from 'lucide-react';

export const CompanyOverview = () => {
    const { id } = useParams();
    const { company, isLoading: companyLoading } = useOutletContext();
    const { users, fetchUsers, isLoading: usersLoading } = useUserStore();

    // Derived stats from users
    const [stats, setStats] = useState({
        total: 0,
        admins: 0,
        designers: 0,
        production: 0
    });

    useEffect(() => {
        // Fetch all users for this specific company
        if (id) {
            fetchUsers({ companyId: id });
        }
    }, [id, fetchUsers]);

    useEffect(() => {
        if (users && users.length >= 0) {
            setStats({
                total: users.length,
                admins: users.filter(u => u.role === 'ADMIN').length,
                designers: users.filter(u => u.role === 'DESIGNER').length,
                production: users.filter(u => u.role === 'PRODUCTION').length
            });
        }
    }, [users]);

    const isLoading = companyLoading || usersLoading;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Overview</h3>
                <p className="mt-1 text-sm text-gray-500">
                    High-level metrics and recent activity for {company?.name || 'this company'}.
                </p>
            </div>

            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats.total}
                    icon={Users}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Admins"
                    value={stats.admins}
                    icon={Shield}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Designers"
                    value={stats.designers}
                    icon={PenTool}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Production Techs"
                    value={stats.production}
                    icon={LayoutTemplate}
                    isLoading={isLoading}
                />
            </dl>

            {/* Placeholder for Recent Activity Panel */}
            <div className="mt-8">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Recent Activity</h3>
                <div className="bg-surface shadow-sm border border-gray-100 rounded-2xl p-8 text-center">
                    <p className="text-sm text-gray-500">Activity logging is not yet available.</p>
                </div>
            </div>
        </div>
    );
};

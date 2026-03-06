import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import {
    Megaphone,
    TrendingUp,
    Users,
    ArrowUpRight,
    PlayCircle,
    Plus,
    LayoutDashboard,
    Image as ImageIcon
} from 'lucide-react';

export const TenantOverview = () => {
    const { user } = useAuthStore();

    return (
        <div className="space-y-8 pb-12">
            {/* Action Banner Gradient */}
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-200 isolate">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-white to-accent/5 -z-10" />
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl -z-10" />
                <div className="absolute bottom-0 left-10 -mb-20 w-48 h-48 rounded-full bg-indigo/10 blur-2xl -z-10" />

                <div className="p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            System Online
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                            Welcome back, {user?.firstName}.
                        </h1>
                        <p className="text-gray-500 max-w-xl text-lg">
                            Here's what's happening with your ad campaigns and creative production today.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Button variant="outline" className="gap-2 bg-white hidden sm:flex">
                            <PlayCircle className="w-4 h-4" />
                            Watch Tutorial
                        </Button>
                        <Button className="gap-2 shadow-md shadow-accent/20">
                            <Plus className="w-4 h-4" />
                            New Campaign
                        </Button>
                    </div>
                </div>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Campaigns', value: '12', trend: '+14%', icon: Megaphone, color: 'text-accent', bg: 'bg-accent/10' },
                    { label: 'Total Reach', value: '84.2K', trend: '+5%', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
                    { label: 'Team Members', value: '8', trend: 'Active', icon: Users, color: 'text-indigo', bg: 'bg-indigo/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow group">
                        <div className="space-y-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-sm font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            {stat.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* Secondary Content Area - Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Visual Chart Placeholder Area */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Campaign Performance</h2>
                        <Button variant="ghost" className="text-sm font-medium text-accent">View All Details</Button>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 h-96 flex flex-col justify-end relative shadow-sm overflow-hidden group">

                        {/* Mock Graph Bars */}
                        <div className="absolute inset-x-8 bottom-8 top-16 border-b border-l border-gray-100 flex items-end justify-between px-4 pb-0 z-0 opacity-80">
                            {/* Horizontal Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between z-10">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-full border-b border-gray-50" />
                                ))}
                            </div>

                            {/* Bars */}
                            {[40, 70, 45, 90, 65, 80, 55, 100].map((h, i) => (
                                <div key={i} className="relative z-20 w-[8%] h-0 group-hover:bg-indigo bg-accent rounded-t-lg transition-all duration-700 ease-out"
                                    style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}>
                                </div>
                            ))}
                        </div>
                        <div className="absolute bottom-2 inset-x-8 flex justify-between px-4 text-xs font-semibold text-gray-400">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Today</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Sidebar */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[17px] before:w-px before:bg-gray-100">
                            {[
                                { title: 'Q3 Ads Approved', time: '2 hours ago', icon: LayoutDashboard, color: 'text-success', bg: 'bg-success/20' },
                                { title: 'New assets uploaded', time: '5 hours ago', icon: ImageIcon, color: 'text-indigo', bg: 'bg-indigo/20' },
                                { title: 'Team permissions updated', time: '1 day ago', icon: Users, color: 'text-gray-500', bg: 'bg-gray-100' },
                                { title: 'Campaign paused', time: '2 days ago', icon: Megaphone, color: 'text-warning', bg: 'bg-warning/20' },
                            ].map((event, i) => (
                                <div key={i} className="relative flex gap-5 items-start">
                                    <div className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-full ${event.bg} border-4 border-white z-10 relative shadow-sm`}>
                                        <event.icon className={`w-4 h-4 ${event.color}`} />
                                    </div>
                                    <div className="pt-1.5 flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{event.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-8 border-gray-200">View Full Log</Button>
                    </div>
                </div>

            </div>
        </div>
    );
};

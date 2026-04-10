import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import {
  Megaphone,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Plus,
  Users,
  CreditCard,
  UserCog,
  FileText
} from 'lucide-react';

export const TenantOverview = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 pb-12">
      {/* Action Banner Gradient */}
      <div className="relative rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-200 isolate">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-accent/5 -z-10" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-10 -mb-20 w-48 h-48 rounded-full bg-indigo/10 blur-2xl -z-10" />

        <div className="p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Publication Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Welcome back, {user?.firstName || 'Publisher'}.
            </h1>
            <p className="text-gray-500 max-w-xl text-lg">
              Here is the latest overview of your ads, publications, and revenue.
            </p>
          </div>
        </div>
      </div>

      {/* Top Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Ads This Week', value: '45', trend: '+12%', icon: Megaphone, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Ads Today', value: '12', trend: '+4%', icon: Calendar, color: 'text-indigo', bg: 'bg-indigo/10' },
          { label: 'Total Revenue', value: '$12,450', trend: '+18%', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
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

      {/* Main Content Area - Split View */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Visual Chart Area (Revenue Summary) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Revenue Summary</h2>
            <Button variant="ghost" className="text-sm font-medium text-accent">Detailed Report</Button>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl p-6 h-[400px] flex flex-col justify-end relative shadow-sm overflow-hidden group">

            {/* Mock Graph Bars for Revenue */}
            <div className="absolute inset-x-8 bottom-8 top-16 border-b border-l border-gray-100 flex items-end justify-between px-4 pb-0 z-0 opacity-80">
              {/* Horizontal Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between z-10">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-full border-b border-gray-50" />
                ))}
              </div>

              {/* Bars */}
              {[30, 50, 45, 70, 60, 85, 55, 95].map((h, i) => (
                <div key={i} className="relative z-20 w-[8%] h-0 group-hover:bg-success bg-success/80 rounded-t-lg transition-all duration-700 ease-out"
                  style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}>
                </div>
              ))}
            </div>
            <div className="absolute bottom-2 inset-x-8 flex justify-between px-4 text-xs font-semibold text-gray-400">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Today</span>
            </div>
          </div>
        </div>

        {/* Sidebar Details */}
        <div className="space-y-8">
          {/* Quick Actions Panel */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-accent hover:bg-accent/5 transition-colors gap-2 group">
                <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-gray-700">New Ad</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-indigo hover:bg-indigo/5 transition-colors gap-2 group">
                <div className="p-2 rounded-lg bg-indigo/10 text-indigo group-hover:bg-indigo group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Add Pub</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-success hover:bg-success/5 transition-colors gap-2 group">
                <div className="p-2 rounded-lg bg-success/10 text-success group-hover:bg-success group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Customer</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-warning hover:bg-warning/5 transition-colors gap-2 group">
                <div className="p-2 rounded-lg bg-warning/10 text-warning group-hover:bg-warning group-hover:text-white transition-colors">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Invoice</span>
              </button>
              {user?.role === 'COMPANY_ADMIN' && (
                <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-colors gap-2 group">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <UserCog className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Users</span>
                </button>
              )}
            </div>
          </div>

          {/* Upcoming Publications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Pubs</h2>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="space-y-5 relative before:absolute before:inset-y-0 before:left-[17px] before:w-px before:bg-gray-100">
                {[
                  { title: 'Spring Wedding Issue', date: 'Tomorrow, 8:00 AM', status: 'Ready', color: 'text-success', bg: 'bg-success/20' },
                  { title: 'Tech Monthly May', date: 'Friday, 10:00 AM', status: 'Reviewing', color: 'text-warning', bg: 'bg-warning/20' },
                  { title: 'Local Business Guide', date: 'Next Monday', status: 'Drafting', color: 'text-gray-500', bg: 'bg-gray-100' },
                ].map((pub, i) => (
                  <div key={i} className="relative flex gap-5 items-start">
                    <div className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-full ${pub.bg} border-4 border-white z-10 relative shadow-sm`}>
                      <div className={`w-2 h-2 rounded-full bg-current ${pub.color}`} />
                    </div>
                    <div className="pt-1.5 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{pub.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{pub.date}</p>
                    </div>
                    <div className="pt-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                        {pub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6 border-gray-200">View Schedule</Button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

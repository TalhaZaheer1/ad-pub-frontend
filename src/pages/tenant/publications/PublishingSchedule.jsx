import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Clock,
    LayoutTemplate,
    MoreHorizontal,
    Edit3
} from 'lucide-react';
import { cn } from '../../../utils/cn';

// Mock Data
const MOCK_SCHEDULE = {
    '2026-03-24': [
        { id: '1', title: 'Spring Collection Launch', customer: 'Acme Fashion', area: 'Cover / Front', format: 'Full Page', status: 'Ready to Print', time: '10:00 AM' },
        { id: '2', title: 'Local Restaurant Opening', customer: 'Bistro 99', area: 'Dining Section', format: 'Quarter Page', status: 'In Review', time: '11:30 AM' },
    ],
    '2026-03-25': [
        { id: '3', title: 'Real Estate Listings Q2', customer: 'Prime Properties', area: 'Classifieds / Real Estate', format: 'Full Page', status: 'Needs Artwork', time: '09:00 AM' },
    ],
    '2026-03-26': [
        { id: '4', title: 'Tech Conference Promo', customer: 'Quantum Tech', area: 'Tech Insert', format: 'Half Page Horizontal', status: 'Approved', time: '02:00 PM' },
        { id: '5', title: 'Summer Camp Reg', customer: 'YMCA Local', area: 'Community Bulletin', format: '1/8 Page', status: 'Draft', time: '04:00 PM' },
    ]
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Ready to Print': return 'bg-success/10 text-success border-success/20';
        case 'Approved': return 'bg-indigo/10 text-indigo border-indigo/20';
        case 'In Review': return 'bg-warning/10 text-warning border-warning/20';
        case 'Needs Artwork': return 'bg-danger/10 text-danger border-danger/20';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
};

export const PublishingSchedule = () => {
    const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'daily'
    const [selectedDate, setSelectedDate] = useState('2026-03-24'); // Mock active date for daily
    const [quickEditId, setQuickEditId] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Get dates for the current mock week
    const weekDates = ['2026-03-23', '2026-03-24', '2026-03-25', '2026-03-26', '2026-03-27', '2026-03-28', '2026-03-29'];

    // Grouping helper for Weekly View
    const getGroupedAds = (ads) => {
        return ads.reduce((acc, ad) => {
            if (!acc[ad.area]) acc[ad.area] = [];
            acc[ad.area].push(ad);
            return acc;
        }, {});
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Publishing Schedule</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage weekly runs and daily ad placements across publications.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button 
                            onClick={() => setViewMode('weekly')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                                viewMode === 'weekly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Weekly
                        </button>
                        <button 
                            onClick={() => setViewMode('daily')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                                viewMode === 'daily' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Daily
                        </button>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between isolate">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
                        <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="px-3 py-1 text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            {viewMode === 'weekly' ? 'Mar 23 - Mar 29, 2026' : new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <Button variant="outline" className="hidden border-gray-200 bg-white sm:flex items-center gap-2">
                        Today
                    </Button>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex relative z-10">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search schedule..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                    </div>
                    <div className="relative">
                        <Button 
                            variant="outline" 
                            className="bg-white border-gray-200 p-2 sm:px-3"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <Filter className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:block">Filters</span>
                        </Button>
                        
                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 shadow-lg rounded-2xl z-20 p-4 animate-in fade-in zoom-in-95 duration-100">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">Filter Placements</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                                            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent/20">
                                                <option>All Statuses</option>
                                                <option>Ready to Print</option>
                                                <option>Approved</option>
                                                <option>In Review</option>
                                                <option>Needs Artwork</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Ad Format</label>
                                            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent/20">
                                                <option>All Formats</option>
                                                <option>Full Page</option>
                                                <option>Half Page Horizontal</option>
                                                <option>Quarter Page</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-5 flex justify-end">
                                        <Button variant="outline" className="text-xs py-1.5 px-3" onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Schedule View Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[500px]">
                
                {/* --- WEEKLY VIEW --- */}
                {viewMode === 'weekly' && (
                    <div className="grid grid-cols-1 divide-y divide-gray-100">
                        {weekDates.map(date => {
                            const dayAds = MOCK_SCHEDULE[date] || [];
                            const grouped = getGroupedAds(dayAds);
                            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                            
                            return (
                                <div key={date} className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                    {/* Day Header Row */}
                                    <div className="w-full md:w-32 lg:w-48 p-4 md:p-6 bg-gray-50/50 shrink-0">
                                        <p className="font-semibold text-gray-900">{dayName}</p>
                                        <p className="text-sm text-gray-500 mt-1">{dayAds.length} Placements</p>
                                    </div>
                                    
                                    {/* Ads Groups for the Day */}
                                    <div className="flex-1 p-4 md:p-6">
                                        {dayAds.length === 0 ? (
                                            <p className="text-sm text-gray-400 italic py-4">No placements scheduled.</p>
                                        ) : (
                                            <div className="space-y-6">
                                                {Object.entries(grouped).map(([area, ads]) => (
                                                    <div key={area} className="space-y-3">
                                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{area}</h4>
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                                            {ads.map(ad => (
                                                                <div key={ad.id} className="group border border-gray-200 rounded-xl p-4 hover:border-accent hover:shadow-sm transition-all bg-white relative">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border", getStatusColor(ad.status))}>
                                                                            {ad.status}
                                                                        </span>
                                                                        <div className="flex items-center text-xs text-gray-500 font-medium">
                                                                            <Clock className="w-3 h-3 mr-1" />
                                                                            {ad.time}
                                                                        </div>
                                                                    </div>
                                                                    <p className="font-semibold text-gray-900 text-sm">{ad.title}</p>
                                                                    <p className="text-xs text-gray-500 mt-0.5">{ad.customer}</p>
                                                                    
                                                                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                                                                        <LayoutTemplate className="w-3.5 h-3.5 text-gray-400" />
                                                                        <span>{ad.format}</span>
                                                                    </div>
                                                                    
                                                                    <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 bg-white border border-gray-200 text-gray-400 hover:text-accent hover:border-accent rounded-lg transition-all shadow-sm">
                                                                        <Edit3 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- DAILY VIEW --- */}
                {viewMode === 'daily' && (
                    <div className="flex flex-col h-full bg-gray-50/30">
                        {/* Daily Date Ribbon */}
                        <div className="border-b border-gray-200 bg-white px-2 py-3 overflow-x-auto flex gap-2">
                            {weekDates.map(date => {
                                const isSelected = date === selectedDate;
                                const dayShort = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                                const dayNum = new Date(date).toLocaleDateString('en-US', { day: 'numeric' });
                                return (
                                    <button 
                                        key={date}
                                        onClick={() => setSelectedDate(date)}
                                        className={cn(
                                            "flex flex-col items-center justify-center min-w-[4rem] py-2 rounded-xl transition-all border",
                                            isSelected ? "bg-accent/10 border-accent font-semibold" : "bg-white border-transparent hover:border-gray-200 text-gray-500"
                                        )}
                                    >
                                        <span className={cn("text-xs uppercase tracking-wider mb-1", isSelected ? "text-accent" : "text-gray-400")}>{dayShort}</span>
                                        <span className={cn("text-lg leading-none", isSelected ? "text-accent" : "text-gray-900")}>{dayNum}</span>
                                    </button>
                                )
                            })}
                        </div>
                        
                        {/* Daily Timeline */}
                        <div className="flex-1 p-6 lg:p-10">
                            {!(MOCK_SCHEDULE[selectedDate] && MOCK_SCHEDULE[selectedDate].length > 0) ? (
                                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                                    <CalendarIcon className="w-12 h-12 mb-3 text-gray-300" />
                                    <p>No ads scheduled for this day.</p>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto space-y-4">
                                    {MOCK_SCHEDULE[selectedDate].map(ad => (
                                        <div key={ad.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow group relative">
                                            {/* Time Gutter */}
                                            <div className="w-24 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 pb-3 sm:pb-0 sm:pr-6 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                                                <span className="text-sm font-bold text-gray-900">{ad.time}</span>
                                                <span className={cn("text-[10px] font-bold uppercase tracking-wider mt-2 px-2 py-1 rounded-md border", getStatusColor(ad.status))}>
                                                    {ad.status}
                                                </span>
                                            </div>
                                            
                                            {/* Content Area */}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-accent transition-colors">{ad.title}</h3>
                                                        <p className="text-sm font-medium text-gray-500 mt-1">{ad.customer}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setQuickEditId(ad.id)}
                                                        className="text-sm font-medium text-accent bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Quick Edit</span>
                                                    </button>
                                                </div>
                                                
                                                <div className="mt-5 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Placement Area</p>
                                                        <p className="text-sm text-gray-900 font-medium mt-1">{ad.area}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Format Size</p>
                                                        <p className="text-sm text-gray-900 font-medium mt-1 flex items-center gap-1.5">
                                                            <LayoutTemplate className="w-4 h-4 text-gray-400" />
                                                            {ad.format}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Edit Modal Mock */}
            {quickEditId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setQuickEditId(null)}></div>
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Quick Edit Schedule</h3>
                            <button onClick={() => setQuickEditId(null)} className="text-gray-400 hover:text-gray-900"><MoreHorizontal className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <Input label="Placement Time" type="time" defaultValue="10:00" />
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Status</label>
                                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20">
                                    <option>Ready to Print</option>
                                    <option>In Review</option>
                                    <option>Needs Artwork</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setQuickEditId(null)}>Cancel</Button>
                            <Button onClick={() => setQuickEditId(null)}>Save Changes</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

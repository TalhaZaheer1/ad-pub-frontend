import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import {
    Settings,
    Clock,
    Calendar,
    CheckCircle2,
    Shield,
    Bell,
    Save,
    Map
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export const PublishingSettings = () => {
    // Mock States for form
    const [publishDays, setPublishDays] = useState(['Thursday']);
    const [adDeadlineHours, setAdDeadlineHours] = useState('48');
    const [artworkDeadlineHours, setArtworkDeadlineHours] = useState('24');
    
    // Toggle States
    const [autoApprove, setAutoApprove] = useState(true);
    const [requireArtwork, setRequireArtwork] = useState(false);
    const [notifyOnSubmit, setNotifyOnSubmit] = useState(true);

    const togglePublishDay = (day) => {
        if (publishDays.includes(day)) {
            setPublishDays(publishDays.filter(d => d !== day));
        } else {
            setPublishDays([...publishDays, day]);
        }
    };

    const handleSave = () => {
        // Mock save action
        console.log("Saving settings...");
    };

    return (
        <div className="space-y-8 max-w-4xl pb-24">
            
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Settings className="w-7 h-7 text-accent" />
                        Publishing Settings
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Configure global print schedules, deadlines, and automation rules.</p>
                </div>
            </div>

            {/* SECTION 1: Master Schedule */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            Master Print Schedule
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Select the default days your publication goes to print.</p>
                    </div>
                </div>
                
                <div className="p-6 lg:p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">Weekly Publishing Days</label>
                        <div className="flex flex-wrap gap-3">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => togglePublishDay(day)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border-2",
                                        publishDays.includes(day) 
                                            ? "border-accent bg-accent/10 text-accent shadow-sm"
                                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                        {publishDays.length === 0 && (
                            <p className="text-xs text-danger mt-2 flex items-center gap-1 font-medium">
                                <Shield className="w-3.5 h-3.5" /> You must select at least one publishing day.
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-3">These days will act as the anchor for all automated deadlines below.</p>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Deadlines */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" />
                            Submission Deadlines
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Set global cut-off times relative to your publishing days.</p>
                    </div>
                </div>
                
                <div className="p-6 lg:p-8 space-y-8">
                    {/* Ad Space Booking */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-100 pb-6">
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-gray-900 mb-1">Ad Space Booking Cutoff</h3>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">How many hours before publication day must a customer secure their ad slot?</p>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                            <input 
                                type="number" 
                                value={adDeadlineHours}
                                onChange={(e) => setAdDeadlineHours(e.target.value)}
                                className="w-20 text-center font-bold text-gray-900 bg-white border border-gray-300 rounded-lg py-1.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                            />
                            <span className="text-sm font-semibold text-gray-500 pr-3">Hours</span>
                        </div>
                    </div>

                    {/* Final Artwork */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-gray-900 mb-1">Final Artwork Cutoff</h3>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">How many hours before publication must final ad graphics be uploaded and approved?</p>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                            <input 
                                type="number" 
                                value={artworkDeadlineHours}
                                onChange={(e) => setArtworkDeadlineHours(e.target.value)}
                                className="w-20 text-center font-bold text-gray-900 bg-white border border-gray-300 rounded-lg py-1.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                            />
                            <span className="text-sm font-semibold text-gray-500 pr-3">Hours</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 3: Global Policies */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-400" />
                            Default Printing Policies
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Configure global automation rules for the intake pipeline.</p>
                    </div>
                </div>
                
                <div className="p-6 lg:p-8 space-y-4">
                    
                    {/* Toggle: Auto-approve */}
                    <label className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group">
                        <div className="flex h-6 items-center">
                            <input 
                                type="checkbox" 
                                checked={autoApprove}
                                onChange={() => setAutoApprove(!autoApprove)}
                                className="h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent accent-accent" 
                            />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-900">Auto-Approve Returning Customers</span>
                            <span className="block text-xs text-gray-500 mt-1">Bypass manual review for customers who have successfully paid for 3 or more previous advertisements.</span>
                        </div>
                    </label>

                    {/* Toggle: Require Artwork */}
                    <label className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-warning/30 hover:bg-warning/5 transition-all cursor-pointer group">
                        <div className="flex h-6 items-center">
                            <input 
                                type="checkbox" 
                                checked={requireArtwork}
                                onChange={() => setRequireArtwork(!requireArtwork)}
                                className="h-5 w-5 rounded border-gray-300 text-warning focus:ring-warning accent-warning" 
                            />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-900">Require Artwork Before Payment</span>
                            <span className="block text-xs text-gray-500 mt-1">Restrict users from submitting their final booking and payment until valid artwork files are uploaded to the system.</span>
                        </div>
                    </label>

                    {/* Toggle: Notifications */}
                    <label className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group">
                        <div className="flex h-6 items-center">
                            <input 
                                type="checkbox" 
                                checked={notifyOnSubmit}
                                onChange={() => setNotifyOnSubmit(!notifyOnSubmit)}
                                className="h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent accent-accent" 
                            />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                Send Staff Notifications <Bell className="w-3.5 h-3.5 text-gray-400 group-hover:text-accent transition-colors" />
                            </span>
                            <span className="block text-xs text-gray-500 mt-1">Push an alert to standard Tenant Users whenever a new Ad Booking enters the Pending queue.</span>
                        </div>
                    </label>

                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 md:left-64 z-20 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transform transition-transform duration-300">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <span className="text-sm font-semibold text-gray-600">You have unsaved changes.</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="bg-white text-gray-600 font-semibold border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm">
                            Discard
                        </Button>
                        <Button onClick={handleSave} className="bg-gray-900 hover:bg-black text-white shadow-md flex items-center gap-2">
                            <Save className="w-4 h-4" /> Save Settings
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    );
};

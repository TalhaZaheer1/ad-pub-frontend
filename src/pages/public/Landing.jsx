import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { 
    LayoutDashboard, 
    Megaphone, 
    Calendar, 
    Users, 
    ArrowRight,
    Sparkles,
    Zap,
    Shield
} from 'lucide-react';

export const Landing = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-accent/20">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                            <span className="text-white font-bold text-sm tracking-tighter">AP</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            AdPub System
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <NavLink to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Sign in
                        </NavLink>
                        <NavLink to="/signup">
                            <Button variant="primary" className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                                Get Started
                            </Button>
                        </NavLink>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] mix-blend-multiply opacity-70 -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] mix-blend-multiply opacity-60 translate-y-1/3 -translate-x-1/3" />
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-8 ring-1 ring-accent/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles className="w-4 h-4" />
                        Next-Gen Publication Management
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100 text-balance">
                        Manage your ads <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            effortlessly.
                        </span>
                    </h1>
                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 text-balance leading-relaxed">
                        The all-in-one platform for publishers. Track sales, design formats, and automate your entire publication calendar from a single dashboard.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
                        <NavLink to="/signup" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group">
                                Start Your Journey
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </NavLink>
                        <NavLink to="/login" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-2xl bg-white/50 backdrop-blur border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                Sign In
                            </Button>
                        </NavLink>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="py-24 bg-gray-50/50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4 text-gray-900">Everything you need to publish</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Powerful tools designed specifically for modern print and digital publication teams.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Big Feature */}
                        <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow group p-8 flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                                    <LayoutDashboard className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Unified Dashboard</h3>
                                <p className="text-gray-500 max-w-sm">Bring your sales, design, and production teams together with real-time syncing and comprehensive metrics.</p>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white border border-gray-800 shadow-xl p-8 flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                                <p className="text-gray-400">Optimized workflows and rapid data entry designed for high-volume sales teams.</p>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow group p-8 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                                    <Megaphone className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Ad Management</h3>
                                <p className="text-gray-500">Track placements, artwork formats, and pricing dynamically based on publication types.</p>
                            </div>
                        </div>

                        <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow group p-8 flex flex-col justify-between">
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-success/10 to-transparent rounded-tl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-6">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Security</h3>
                                <p className="text-gray-500 max-w-sm">Role-based access control out of the box. Ensure designers only design, and sales only sell.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Placeholder CTA */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to transform your publication?</h2>
                    <p className="text-xl text-gray-500 mb-10">Join forward-thinking companies running entirely on AdPub System.</p>
                    <NavLink to="/signup">
                        <Button size="lg" className="h-14 px-10 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-shadow">
                            Create your workspace
                        </Button>
                    </NavLink>
                </div>
            </section>
        </div>
    );
};

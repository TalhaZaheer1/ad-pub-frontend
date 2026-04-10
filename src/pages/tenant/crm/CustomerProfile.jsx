import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import {
    ChevronLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CreditCard,
    FileText,
    Megaphone,
    ArrowUpRight,
    MessageSquare
} from 'lucide-react';
import { cn } from '../../../utils/cn';

// Mock Customer
const MOCK_CUSTOMER = {
    id: 'cust-1',
    name: 'Acme Fashion',
    type: 'Business',
    contact: 'Sarah Jenkins',
    email: 'sarah@acmefashion.com',
    phone: '(555) 123-4567',
    address: '123 Style Avenue, NY 10001',
    joinedDate: '2024-11-12',
    lifetimeSpend: '$12,450',
    notes: 'Key account for the Spring and Fall fashion issues. Prefers Full Page spreads on right-hand reading pages.'
};

// Mock Orders
const MOCK_ORDERS = [
    { id: 'ORD-2026-041', title: 'Spring Collection Launch', pubDate: '2026-03-24', status: 'Active', total: '$1,200' },
    { id: 'ORD-2025-892', title: 'Cyber Monday Promo', pubDate: '2025-11-28', status: 'Completed', total: '$850' },
    { id: 'ORD-2025-441', title: 'Summer Clearance', pubDate: '2025-07-15', status: 'Completed', total: '$1,200' },
];

// Mock Payments
const MOCK_PAYMENTS = [
    { id: 'PAY-8812', date: '2026-03-10', method: 'Credit Card ending 4242', amount: '$1,200', status: 'Paid' },
    { id: 'PAY-7734', date: '2025-11-30', method: 'ACH Transfer', amount: '$850', status: 'Paid' },
    { id: 'PAY-5521', date: '2025-07-20', method: 'Credit Card ending 1122', amount: '$1,200', status: 'Paid' },
];

export const CustomerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'payments'

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Navigation Header */}
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                <button 
                    onClick={() => navigate('/customers')}
                    className="flex items-center hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Customers
                </button>
            </div>

            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        {MOCK_CUSTOMER.name}
                        <span className="text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent px-2.5 py-1 rounded-lg border border-accent/20 align-middle">
                            {MOCK_CUSTOMER.type}
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Customer since {new Date(MOCK_CUSTOMER.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="bg-white border-gray-200">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                    </Button>
                    <Button onClick={() => navigate('/ads/new')} className="shadow-md">
                        <Megaphone className="w-4 h-4 mr-2" />
                        Create Ad Order
                    </Button>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                
                {/* Left Column: Info & Notes (1/3 width) */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Contact Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 relative">
                        <button className="absolute top-6 right-6 text-gray-400 hover:text-accent font-medium text-sm transition-colors">
                            Edit
                        </button>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            Contact Details
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Primary Contact</p>
                                <p className="font-medium text-gray-900">{MOCK_CUSTOMER.contact}</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                </div>
                                <span className="text-gray-900">{MOCK_CUSTOMER.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                </div>
                                <span className="text-gray-900">{MOCK_CUSTOMER.phone}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                </div>
                                <span className="text-gray-900 leading-relaxed max-w-[200px]">{MOCK_CUSTOMER.address}</span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary Snippet */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-sm border border-gray-800 p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
                            <CreditCard className="w-4 h-4" />
                            Lifetime Value
                        </h2>
                        <div className="relative z-10">
                            <span className="text-4xl font-bold tracking-tight">{MOCK_CUSTOMER.lifetimeSpend}</span>
                        </div>
                    </div>

                    {/* Internal Notes Card */}
                    <div className="bg-[#FFFBEA] rounded-3xl shadow-sm border border-[#FDE68A] p-6 relative">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#D97706]" />
                            Internal Notes
                        </h2>
                        <p className="text-sm text-gray-800 leading-relaxed">
                            {MOCK_CUSTOMER.notes}
                        </p>
                        <button className="text-xs font-bold text-[#D97706] mt-4 hover:underline">
                            + Add Note
                        </button>
                    </div>

                </div>

                {/* Right Column: Dynamic Tabs (2/3 width) */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full min-h-[500px]">
                        
                        {/* Tab Headers */}
                        <div className="flex border-b border-gray-100 px-2 pt-2">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={cn(
                                    "px-6 py-4 text-sm font-bold border-b-2 transition-colors",
                                    activeTab === 'orders' ? "border-accent text-accent" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-xl"
                                )}
                            >
                                Order History
                            </button>
                            <button
                                onClick={() => setActiveTab('payments')}
                                className={cn(
                                    "px-6 py-4 text-sm font-bold border-b-2 transition-colors",
                                    activeTab === 'payments' ? "border-accent text-accent" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-xl"
                                )}
                            >
                                Payment History
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 p-0">
                            
                            {/* Orders Table Pane */}
                            {activeTab === 'orders' && (
                                <div className="animate-in fade-in duration-300 overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-gray-50/50 text-gray-500 font-medium">
                                            <tr>
                                                <th className="px-6 py-4">Order ID</th>
                                                <th className="px-6 py-4">Ad Title</th>
                                                <th className="px-6 py-4">Pub Date</th>
                                                <th className="px-6 py-4 text-right">Total</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {MOCK_ORDERS.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{order.id}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-accent transition-colors cursor-pointer">{order.title}</td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        {new Date(order.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-gray-900">{order.total}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        {order.status === 'Active' ? (
                                                            <span className="inline-flex items-center text-success bg-success/10 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-success/20">Active</span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-gray-500 bg-gray-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-gray-200">Completed</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-gray-400 hover:text-accent p-1.5 rounded-lg hover:bg-accent/10 transition-colors">
                                                            <ArrowUpRight className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Payments Table Pane */}
                            {activeTab === 'payments' && (
                                <div className="animate-in fade-in duration-300 overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-gray-50/50 text-gray-500 font-medium">
                                            <tr>
                                                <th className="px-6 py-4">Transaction ID</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Method</th>
                                                <th className="px-6 py-4 text-right">Amount</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {MOCK_PAYMENTS.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{payment.id}</td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-900 font-medium">{payment.method}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-gray-900">{payment.amount}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center text-success bg-success/10 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-success/20">Paid</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

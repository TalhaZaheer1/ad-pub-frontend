import React, { useEffect, useState } from 'react';
import { Outlet, useParams, NavLink, useNavigate } from 'react-router-dom';
import { CompanyHeader } from '../components/ui/CompanyHeader';
import { useCompanyStore } from '../store/companyStore';
import { cn } from '../utils/cn';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const CompanyDetailLayout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fetchCompanyById = useCompanyStore(state => state.fetchCompanyById);

    // Local state to hold the specific company for this layout
    const [company, setCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCompany = async () => {
            setIsLoading(true);
            const result = await fetchCompanyById(id);
            if (result.success) {
                setCompany(result.data);
                setError(null);
            } else {
                setError(result.error);
            }
            setIsLoading(false);
        };

        if (id) {
            loadCompany();
        }
    }, [id, fetchCompanyById]);

    const navLinks = [
        { name: 'Overview', to: `/companies/${id}`, end: true },
        { name: 'Users', to: `/companies/${id}/users` },
        { name: 'Settings', to: `/companies/${id}/settings` }
    ];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <AlertCircle className="h-12 w-12 text-danger mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Failed to load company</h2>
                <p className="mt-2 text-gray-500">{error}</p>
                <Button onClick={() => navigate('/companies')} className="mt-6" variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Companies
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
            {/* Context Navigation */}
            <div className="bg-surface border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8 flex items-center">
                <button
                    onClick={() => navigate('/companies')}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Back to all companies
                </button>
            </div>

            {/* Header Data */}
            <CompanyHeader company={company} isLoading={isLoading} />

            {/* Sub-Navigation Tabs */}
            <div className="bg-surface border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.to}
                                end={link.end}
                                className={({ isActive }) => cn(
                                    isActive
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors'
                                )}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
                <Outlet context={{ company, isLoading }} />
            </div>
        </div>
    );
};

import React from 'react';
import { Badge } from './Badge';

export const CompanyHeader = ({ company }) => {
    if (!company) {
        return (
            <div className="bg-surface border-b border-gray-100 px-4 py-8 sm:px-6 lg:px-8">
                <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded"></div>
                <div className="mt-4 flex gap-4">
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface border-b border-gray-200">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                {company.name}
                            </h2>
                            <Badge variant={company.isActive ? 'success' : 'default'} className="mt-1">
                                {company.isActive ? 'Active Tenant' : 'Inactive'}
                            </Badge>
                        </div>
                        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm text-gray-500 font-mono">
                                <span className="mr-1 text-gray-400">Slug:</span> {company.slug}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <span className="mr-1 text-gray-400">ID:</span> {company.id}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <span className="mr-1 text-gray-400">Created:</span> {new Date(company.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

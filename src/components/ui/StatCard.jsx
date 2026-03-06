import React from 'react';
import { cn } from '../../utils/cn';

export const StatCard = ({
    title,
    value,
    icon: Icon,
    className,
    isLoading = false
}) => {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl bg-surface px-6 py-6 shadow-sm border border-gray-100 transition-all hover:shadow-md",
            className
        )}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        {isLoading ? (
                            <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
                        ) : (
                            <span className="text-3xl font-semibold tracking-tight text-gray-900">
                                {value}
                            </span>
                        )}
                    </div>
                </div>
                {Icon && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                )}
            </div>
        </div>
    );
};

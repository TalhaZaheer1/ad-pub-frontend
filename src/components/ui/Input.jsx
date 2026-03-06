import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({
    className,
    type = 'text',
    label,
    error,
    helperText,
    ...props
}, ref) => {
    return (
        <div className="w-full flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={cn(
                    'flex h-10 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900',
                    'placeholder:text-gray-400',
                    'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent hover:border-gray-400',
                    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                    error && 'border-danger focus:border-danger focus:ring-danger/50 text-danger hover:border-danger',
                    className
                )}
                ref={ref}
                {...props}
            />
            {error ? (
                <span className="text-sm text-danger">{error}</span>
            ) : helperText ? (
                <span className="text-sm text-gray-500">{helperText}</span>
            ) : null}
        </div>
    );
});

Input.displayName = 'Input';

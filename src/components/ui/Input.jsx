import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({
    className,
    type = 'text',
    label,
    error,
    helperText,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    // If it's a password type, allow toggling to text type
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className="w-full flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={inputType}
                    className={cn(
                        'flex h-10 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900',
                        'placeholder:text-gray-400',
                        'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent hover:border-gray-400',
                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                        error && 'border-danger focus:border-danger focus:ring-danger/50 text-danger hover:border-danger',
                        type === 'password' && 'pr-10', // Add right padding to prevent text flowing under the icon
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>
            {error ? (
                <span className="text-sm text-danger">{error}</span>
            ) : helperText ? (
                <span className="text-sm text-gray-500">{helperText}</span>
            ) : null}
        </div>
    );
});

Input.displayName = 'Input';

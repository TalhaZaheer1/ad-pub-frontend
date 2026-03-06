import React from 'react';
import { cn } from '../../utils/cn';

export const ToggleSwitch = ({
    checked,
    onChange,
    disabled = false,
    label,
    description
}) => {
    return (
        <div className="flex items-center justify-between py-2">
            {(label || description) && (
                <div>
                    {label && <span className={cn("text-sm font-medium text-gray-700", disabled && "opacity-50")}>{label}</span>}
                    {description && <p className={cn("text-xs text-gray-500", disabled && "opacity-50")}>{description}</p>}
                </div>
            )}
            <button
                type="button"
                role="switch"
                disabled={disabled}
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                    checked ? "bg-success" : "bg-gray-200",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
};

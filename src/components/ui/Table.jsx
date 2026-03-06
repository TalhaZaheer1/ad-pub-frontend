import React from 'react';
import { cn } from '../../utils/cn';

export const Table = ({ children, className }) => (
    <div className="w-full overflow-hidden rounded-2xl bg-surface shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
            <table className={cn("w-full text-sm text-left text-gray-500", className)}>
                {children}
            </table>
        </div>
    </div>
);

export const TableHeader = ({ children, className }) => (
    <thead className={cn("text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100", className)}>
        {children}
    </thead>
);

export const TableBody = ({ children, className }) => (
    <tbody className={cn("[&_tr:last-child]:border-0", className)}>
        {children}
    </tbody>
);

export const TableRow = ({ children, className, ...props }) => (
    <tr
        className={cn(
            "border-b border-gray-100 transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50",
            className
        )}
        {...props}
    >
        {children}
    </tr>
);

export const TableHead = ({ children, className }) => (
    <th scope="col" className={cn("px-6 py-4 font-medium", className)}>
        {children}
    </th>
);

export const TableCell = ({ children, className }) => (
    <td className={cn("px-6 py-4", className)}>
        {children}
    </td>
);

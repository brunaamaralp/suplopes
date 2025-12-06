import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    type?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, type = 'neutral', className = '' }) => {
    const colors = {
        success: "bg-green-100 text-green-700 border-green-300",
        danger: "bg-red-100 text-red-700 border-red-300",
        warning: "bg-yellow-100 text-yellow-700 border-yellow-300",
        info: "bg-blue-100 text-blue-700 border-blue-300",
        neutral: "bg-slate-100 text-slate-700 border-slate-300",
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${colors[type]} ${className}`}>
            {children}
        </span>
    );
};

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = false }) => (
    <div className={`
    bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-6 
    ${hoverEffect ? 'hover:border-primary/40 hover:shadow-md transition-all duration-300 hover:-translate-y-1' : ''}
    ${className}
  `}>
        {children}
    </div>
);

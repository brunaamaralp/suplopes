import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyle = "font-medium transition-all duration-300 flex items-center justify-center gap-2 rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg border border-transparent",
        secondary: "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 hover:border-slate-400",
        danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300",
        success: "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300",
        ghost: "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100",
        outline: "bg-transparent border border-slate-300 text-slate-700 hover:text-primary hover:border-primary hover:bg-primary/5"
    };

    const sizes = {
        sm: "px-3 py-2 text-xs min-h-[36px]",
        md: "px-5 py-2.5 text-sm min-h-[44px]",
        lg: "px-6 py-3 text-base min-h-[48px]"
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {!isLoading && leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
};

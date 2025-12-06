import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm text-slate-700 font-medium ml-1">{label}</label>}
        <div className="relative group">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                    {icon}
                </div>
            )}
            <input
                className={`
          w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 
          placeholder:text-slate-400
          focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 
          transition-all duration-300
          ${icon ? 'pl-10' : ''}
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
                {...props}
            />
        </div>
        {error && <span className="text-xs text-red-600 ml-1">{error}</span>}
    </div>
);

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
    error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', ...props }) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm text-slate-700 font-medium ml-1">{label}</label>}
        <div className="relative">
            <select
                className={`
          w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 appearance-none
          focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 
          transition-all duration-300
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
        </div>
        {error && <span className="text-xs text-red-600 ml-1">{error}</span>}
    </div>
);

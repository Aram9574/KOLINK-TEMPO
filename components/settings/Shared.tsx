import React from 'react';

const formInputClasses = "block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm p-2";

export const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
    return <input {...props} className={`${formInputClasses} ${props.className}`} />
}

export const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => {
    return <select {...props} className={`${formInputClasses} ${props.className}`} />
}

export const SettingsCard: React.FC<{ title: React.ReactNode; description?: string; children: React.ReactNode; footer?: React.ReactNode }> = ({ title, description, children, footer }) => (
    <div>
        <div>
            <h2 className="text-xl font-bold text-kolink-text dark:text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-kolink-text-secondary dark:text-gray-400">{description}</p>}
        </div>
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {children}
        </div>
        {footer && (
            <div className="flex justify-end pt-5 mt-5 border-t border-gray-200 dark:border-gray-700">
                {footer}
            </div>
        )}
    </div>
);

export const FormRow: React.FC<{ label: string; children: React.ReactNode; htmlFor?: string, description?: string }> = ({ label, children, htmlFor, description }) => (
    <div className="grid grid-cols-1 gap-2 py-5 md:grid-cols-3 md:gap-4 items-start">
        <div className="md:col-span-2">
            <label htmlFor={htmlFor} className="text-sm font-medium text-kolink-text dark:text-gray-300">{label}</label>
            {description && <p className="mt-1 text-xs text-kolink-text-secondary dark:text-gray-500">{description}</p>}
        </div>
        <div className="flex md:col-span-1 md:justify-end">
            {children}
        </div>
    </div>
);

export const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; id: string }> = ({ checked, onChange, id }) => (
    <label htmlFor={id} className="inline-flex relative items-center cursor-pointer">
        <input type="checkbox" id={id} className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-kolink-blue"></div>
    </label>
);
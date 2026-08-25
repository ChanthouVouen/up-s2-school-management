import type { ChangeEvent, ReactNode } from 'react';

export function FormHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
    return (
        <div className="mb-6 space-y-2 sm:mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">{title}</h2>
            {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
        </div>
    );
}

export function FormField({
    id,
    label,
    type = 'text',
    placeholder,
    autoComplete,
    rightContent,
    className = '',
    value,
    onChange,
}: {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    autoComplete?: string;
    rightContent?: ReactNode;
    className?: string;
    value?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    name={id}
                    required
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`block w-full border border-blue-400 bg-white px-4 py-3 text-base text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:outline-none ${rightContent ? 'pr-11' : ''} ${className}`}
                />
                {rightContent}
            </div>
        </div>
    );
}

export function PasswordField({
    id,
    label,
    placeholder,
    autoComplete,
    showPassword,
    onToggle,
    value,
    onChange,
}: {
    id: string;
    label: string;
    placeholder?: string;
    autoComplete?: string;
    showPassword: boolean;
    onToggle: () => void;
    value?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={showPassword ? 'text' : 'password'}
                    name={id}
                    required
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="block w-full border border-blue-400 bg-white px-4 py-3 pr-11 text-base text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:outline-none"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                >
                    {showPassword ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><path d="M3 3l18 18" strokeLinecap="round" /><path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" strokeLinecap="round" /><path d="M9.88 5.08A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.43 17.43 0 0 1-4.12 5.08" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.61 6.61A17.68 17.68 0 0 0 2 12s3.5 7 10 7a10.94 10.94 0 0 0 5.39-1.61" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" /></svg>}
                </button>
            </div>
        </div>
    );
}

export function SocialDivider() {
    return (
        <div className="my-8 flex w-full items-center">
            <div className="h-px flex-1 bg-gray-300"></div>
            <p className="px-3 text-center text-sm text-gray-500">Or continue with</p>
            <div className="h-px flex-1 bg-gray-300"></div>
        </div>
    );
}

export function SocialButton({
    children,
    className = '',
    type = 'button',
}: {
    children: ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}) {
    return (
        <button
            type={type}
            className={`flex w-full items-center justify-center gap-3 border border-blue-400 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none sm:max-w-xs ${className}`}
        >
            {children}
        </button>
    );
}

export function PrimaryButton({
    children,
    className = '',
    disabled = false,
}: {
    children: ReactNode;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <button
            type="submit"
            disabled={disabled}
            className={`flex w-full justify-center bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {children}
        </button>
    );
}

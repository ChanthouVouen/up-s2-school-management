import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { FormField, FormHeader, PasswordField, PrimaryButton, SocialButton, SocialDivider } from '../common/form';
import { GoogleIcon } from './icons';
import { registerUser } from '../../services/authService';

const PASSWORD_MISMATCH_MESSAGE = 'Passwords do not match.';
const REGISTRATION_FAILED_MESSAGE = 'Registration failed. Please try again.';

export default function RegisterContainer() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError(null);

        if (password !== confirmPassword) {
            setError(PASSWORD_MISMATCH_MESSAGE);
            return;
        }

        setIsSubmitting(true);

        try {
            const name = `${firstName} ${lastName}`.trim();
            const result = await registerUser(name, email, password);

            if (result.success) {
                navigate('/login');
            } else {
                setError(result.message ?? REGISTRATION_FAILED_MESSAGE);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-xl px-1 sm:w-[90%] lg:w-[80%]">
            <FormHeader
                title="Create your account"
                subtitle={
                    <>
                        <p>Create your account to explore more about our school!</p>
                        <p className="mt-1">
                            Already have an account?{' '}
                            <a href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                                Sign in
                            </a>
                        </p>
                    </>
                }
            />


            <div className="w-full">
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    <div className="flex w-full flex-col gap-5 sm:flex-row">
                        <div className="w-full">
                            <FormField
                                id="firstName"
                                label="First Name"
                                placeholder="First name"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                            />
                        </div>
                        <div className="w-full">
                            <FormField
                                id="lastName"
                                label="Last Name"
                                placeholder="Last name"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                            />
                        </div>
                    </div>

                    <FormField
                        id="email"
                        label="Email address"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    <PasswordField
                        id="password"
                        label="Password"
                        placeholder="Enter your password"
                        autoComplete="new-password"
                        showPassword={showPassword}
                        onToggle={() => setShowPassword((value) => !value)}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />

                    <PasswordField
                        id="confirmPassword"
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        showPassword={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword((value) => !value)}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                    />

                    {error && (
                        <p role="alert" className="text-sm font-medium text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="pt-2">
                        <PrimaryButton disabled={isSubmitting}>
                            {isSubmitting ? 'Signing up…' : 'Sign Up'}
                        </PrimaryButton>
                    </div>
                </form>

                <SocialDivider />

                <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
                    <SocialButton className="sm:max-w-xs">
                        <GoogleIcon />
                        <span>Continue with Google</span>
                    </SocialButton>
                    <a href="https://t.me" target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-3 border border-blue-400 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none sm:max-w-xs">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnYrpwLTmU4XedNUe02vv2k5g0wXHmUPtUGZ6VnBvIng&s=10" alt="Telegram" className="h-5 w-5 object-contain" />
                        <span>Connect on Telegram</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useToast } from '../hooks/useToast';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const { t } = useI18n();
  const { showToast } = useToast();

  const validateEmail = (emailToValidate: string) => {
    if (!emailToValidate) {
        return t('loginPage.alert.emailRequired');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToValidate)) {
        return t('loginPage.alert.invalidEmail');
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      showToast(validationError, 'error');
      return;
    }

    if (!password) {
      showToast(t('loginPage.alert.passwordRequired'), 'error');
      return;
    }
    // Here you would typically validate credentials with your backend (Supabase)
    // For this demo, we'll just call the onLogin prop.
    onLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-xl font-bold text-white bg-kolink-blue rounded-full">
            K
          </div>
          <h2 className="text-3xl font-bold text-kolink-text dark:text-white">{t('loginPage.welcome')}</h2>
          <p className="mt-2 text-kolink-text-secondary dark:text-gray-400">{t('loginPage.subtitle')}</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email-address" className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('loginPage.emailLabel')}</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) setEmailError('');
                }}
                className={`relative block w-full px-3 py-3 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border rounded-md appearance-none focus:outline-none focus:z-10 sm:text-sm ${emailError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-kolink-blue focus:border-kolink-blue'}`}
                placeholder={t('loginPage.emailPlaceholder')}
              />
              {emailError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{emailError}</p>}
            </div>
            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('loginPage.passwordLabel')}</label>
                    <a href="#" className="text-sm font-medium text-kolink-blue hover:text-blue-700">{t('loginPage.forgotPassword')}</a>
                </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-3 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-md appearance-none focus:outline-none focus:ring-kolink-blue focus:border-kolink-blue focus:z-10 sm:text-sm"
                placeholder={t('loginPage.passwordPlaceholder')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white transition-all duration-300 ease-in-out border border-transparent rounded-md shadow-lg bg-kolink-blue group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kolink-blue"
            >
              {t('loginPage.loginButton')}
            </button>
          </div>
        </form>
        <div className="text-sm text-center text-kolink-text-secondary dark:text-gray-400">
          <p>{t('loginPage.needHelp')} <a href="mailto:info@kolink.es" className="font-medium text-kolink-blue hover:text-blue-700">info@kolink.es</a></p>
          <p className="mt-2">{t('loginPage.noAccount')} <a href="#" className="font-medium text-kolink-blue hover:text-blue-700">{t('loginPage.register')}</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
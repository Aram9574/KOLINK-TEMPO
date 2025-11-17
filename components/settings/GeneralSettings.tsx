import React, { useState, useMemo } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../hooks/useTheme';
import { SettingsCard, FormRow, FormSelect } from './Shared';

declare global {
    namespace Intl {
        function supportedValuesOf(key: 'timeZone'): string[];
    }
}

const GeneralSettings: React.FC = () => {
    const { t, language, setLanguage } = useI18n();
    const { theme, toggleTheme } = useTheme();

    // Get a list of all IANA time zones supported by the browser
    const timezones = useMemo(() => {
        try {
            // Modern way to get time zones
            return Intl.supportedValuesOf('timeZone');
        } catch (e) {
            // Fallback for older environments
            console.warn("Intl.supportedValuesOf('timeZone') is not supported. Timezone list may be incomplete.");
            return [
                'Europe/Madrid', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney', 'UTC'
            ];
        }
    }, []);

    // Get user's current time zone as the default
    const [selectedTimezone, setSelectedTimezone] = useState(() => {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (e) {
            return 'UTC'; // Fallback to UTC
        }
    });

    return (
        <SettingsCard
            title={t('settings.general.title')}
            description={t('settings.general.description')}
        >
            <FormRow label={t('settings.general.language')}>
                <FormSelect
                    className="max-w-sm"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                </FormSelect>
            </FormRow>
            <FormRow label={t('settings.general.theme.label')}>
                <button
                    onClick={toggleTheme}
                    className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kolink-blue dark:focus:ring-offset-gray-800 ${
                        theme === 'light' ? 'bg-kolink-blue' : 'bg-gray-700'
                    }`}
                    aria-label="Toggle theme"
                    role="switch"
                    aria-checked={theme === 'dark'}
                >
                    <span className="sr-only">Toggle Theme</span>
                    <span className={`absolute left-1 top-1 transition-transform duration-300 ease-in-out ${theme === 'light' ? 'translate-x-0' : 'translate-x-8'}`}>
                         <span className="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow">
                            {theme === 'light' ? 
                                <SunIcon className="w-4 h-4 text-yellow-500" /> : 
                                <MoonIcon className="w-4 h-4 text-kolink-blue" />
                            }
                        </span>
                    </span>
                </button>
            </FormRow>
             <FormRow label={t('settings.general.timezone')}>
                <FormSelect 
                    className="max-w-sm"
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                >
                    {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                    ))}
                </FormSelect>
            </FormRow>
        </SettingsCard>
    );
};

// Icons for the theme toggle
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);
const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25c0 5.385 4.365 9.75 9.75 9.75 2.572 0 4.92-.99 6.697-2.648Z" />
    </svg>
);


export default GeneralSettings;
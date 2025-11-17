import React from 'react';
import { useI18n } from '../hooks/useI18n';

interface PlaceholderProps {
  title: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title }) => {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 bg-kolink-blue-light dark:bg-blue-900/50 rounded-full text-kolink-blue dark:text-blue-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655M12 2.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Zm0 0c-.353 0-.706.023-1.05.067m1.05-.067c.344.044.687.103 1.028.182m-1.028-.182A3.753 3.753 0 0 0 9 4.192m3 1.608a3.753 3.753 0 0 1-3-1.608m3 1.608c.353 0 .706.023 1.05.067m-1.05-.067c-.344.044-.687.103-1.028.182m1.028-.182A3.753 3.753 0 0 0 15 4.192m-3 1.608a3.753 3.753 0 0 1 3-1.608" />
        </svg>
      </div>
      <h2 className="mt-6 text-2xl font-bold text-kolink-text dark:text-white">{title}</h2>
      <p className="mt-2 text-kolink-text-secondary dark:text-gray-400">{t('placeholder.wip')}</p>
      <p className="text-kolink-text-secondary dark:text-gray-400">{t('placeholder.comeBack')}</p>
    </div>
  );
};

export default Placeholder;
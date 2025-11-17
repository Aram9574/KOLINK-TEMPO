import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, onClick }) => {
  const isClickable = !!onClick;
  
  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center w-full transition-all duration-200 ${isClickable ? 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md cursor-pointer' : 'cursor-default'}`}
    >
      <p className="text-xs font-semibold text-kolink-text-secondary dark:text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-kolink-text dark:text-white mt-1">{value}</p>
      <p className="text-xs text-kolink-text-secondary dark:text-gray-400 mt-1">{subtitle}</p>
    </button>
  );
};

export default StatCard;
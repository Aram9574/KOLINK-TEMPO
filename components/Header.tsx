

import React, { useState, useEffect, useRef } from 'react';
import type { User, Notification, SettingsTab } from '../types';
import { useI18n } from '../hooks/useI18n';
import { useGamification } from '../hooks/useGamification';
import { useCredits } from '../hooks/useCredits';
import { usePlan } from '../context/PlanContext';

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
  goToBilling: () => void;
  goToSettings: (tab: SettingsTab) => void;
}

const LevelIndicator: React.FC = () => {
  const { t } = useI18n();
  const { level, xp, xpForNextLevel, tier } = useGamification();
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const progress = xpForNextLevel > 0 ? Math.round((xp / xpForNextLevel) * 100) : 0;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
      data-tour-id="gamification"
    >
      <div className="flex items-center justify-center w-10 h-10 font-bold bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-kolink-blue dark:text-blue-400 text-lg hover:border-kolink-blue dark:hover:border-blue-500 transition-colors cursor-pointer">
        {level}
      </div>

      {isTooltipVisible && (
        <div className="absolute top-full mt-3 w-64 p-4 bg-white dark:bg-gray-800 text-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10 left-1/2 before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-solid before:border-transparent before:border-b-white dark:before:border-b-gray-800 animate-fade-in-down">
          <div className="flex items-center gap-2 mb-2">
            <TrophyIcon className="w-5 h-5 text-yellow-500" />
            <p className="font-bold text-md text-kolink-text dark:text-white">{t(`gamification.tiers.${tier.replace(/ /g, '_')}`)}</p>
          </div>
          <p className="text-xs text-kolink-text-secondary dark:text-gray-400 mb-2">{t('gamification.level')} {level}</p>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-kolink-blue h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs mt-1 text-kolink-text-secondary dark:text-gray-400">
            <span>{xp.toLocaleString()} XP</span>
            <span>{xpForNextLevel.toLocaleString()} XP</span>
          </div>
          
          <p className="text-xs text-kolink-text-secondary dark:text-gray-500 mt-3">{t('gamification.keepCreating')}</p>
        </div>
      )}
    </div>
  );
};


const Header: React.FC<HeaderProps> = ({ user, onMenuClick, goToBilling, goToSettings }) => {
  const { t } = useI18n();
  const { plan } = usePlan();
  const { credits } = useCredits();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
      { id: 1, type: 'comment', read: false, text: 'Aram Miquel ha comentado tu post.', time: 'hace 5 min' },
      { id: 2, type: 'like', read: false, text: 'A 15 personas más les ha gustado tu post sobre IA.', time: 'hace 2 horas' },
      { id: 3, type: 'system', read: true, text: '¡Bienvenido a Kolink! Completa tu perfil para empezar.', time: 'hace 1 día' },
      { id: 4, type: 'like', read: true, text: 'Tu post ha superado las 100 recomendaciones.', time: 'hace 2 días' },
  ]);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  const getInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    return nameParts.map(part => part[0]).slice(0, 2).join('').toUpperCase();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  }

  const clearRead = () => {
    setNotifications(notifications.filter(n => !n.read));
  }

  return (
    <header className="flex items-center justify-between px-6 py-2 bg-white dark:bg-gray-800 border-b-2 border-kolink-gray dark:border-gray-700">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="text-gray-500 focus:outline-none md:hidden">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={goToBilling}
          className="hidden sm:flex items-center gap-2 p-2 text-sm font-medium transition-colors duration-200 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Gestionar Plan y Créditos"
        >
          <CreditCardIcon />
          <span className="font-semibold">{credits}</span>
          <span className="text-kolink-text-secondary dark:text-gray-400">{t('header.credits')}</span>
          <span className="px-2 py-0.5 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full dark:bg-blue-900 dark:text-blue-300">{plan}</span>
        </button>
        <LevelIndicator />
        <div className="relative" ref={notificationsRef}>
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white ring-2 ring-white dark:ring-gray-800">
                        {unreadCount}
                    </span>
                )}
            </button>
             {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
                <div className="p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-kolink-text dark:text-white">{t('header.notifications.title')}</h3>
                  {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs font-medium text-kolink-blue hover:underline">{t('header.notifications.markAllRead')}</button>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map(notification => (
                    <div key={notification.id} onClick={() => markAsRead(notification.id)} className={`flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${notification.read ? '' : 'bg-kolink-blue-light dark:bg-blue-900/20'}`}>
                        <div className="flex-shrink-0 mr-3 mt-0.5">
                            <NotificationIcon type={notification.type} />
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm text-kolink-text dark:text-gray-300">{notification.text}</p>
                            <p className="text-xs text-kolink-text-secondary dark:text-gray-500 mt-0.5">{notification.time}</p>
                        </div>
                        {!notification.read && <div className="w-2 h-2 mt-1.5 ml-2 bg-kolink-blue rounded-full flex-shrink-0"></div>}
                    </div>
                  )) : (
                    <div className="text-center py-8 px-4">
                        <BellIcon className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
                        <p className="mt-2 text-sm font-semibold text-kolink-text dark:text-white">{t('header.notifications.empty.title')}</p>
                        <p className="text-xs text-kolink-text-secondary dark:text-gray-400">{t('header.notifications.empty.subtitle')}</p>
                    </div>
                  )}
                </div>
                {notifications.some(n => n.read) && (
                    <div className="p-2 text-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <button onClick={clearRead} className="text-sm font-medium text-kolink-blue hover:underline w-full">{t('header.notifications.clearRead')}</button>
                    </div>
                )}
              </div>
            )}
        </div>
        <div className="relative">
          <button onClick={() => goToSettings('general')} className="flex items-center space-x-2" title={t('sidebar.nav.ajustes')}>
            <div className="items-center justify-center hidden w-10 h-10 font-bold text-blue-800 bg-blue-200 rounded-full sm:flex">
              {getInitials(user.name)}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
);

const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 dark:text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>
);

const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'comment':
            return <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-kolink-text-secondary dark:text-gray-400" />;
        case 'like':
            return <HandThumbUpIcon className="w-5 h-5 text-kolink-text-secondary dark:text-gray-400" />;
        case 'system':
            return <Cog6ToothIcon className="w-5 h-5 text-kolink-text-secondary dark:text-gray-400" />;
        default:
            return <InformationCircleIcon className="w-5 h-5 text-kolink-text-secondary dark:text-gray-400" />;
    }
};

const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 1-4.874-1.971 2.25 2.25 0 0 1-1.296-3.034 9.75 9.75 0 0 1 1.97-4.874 2.25 2.25 0 0 1 3.034-1.296A9.75 9.75 0 0 1 12 6.75a9.75 9.75 0 0 1 4.874 1.971 2.25 2.25 0 0 1 1.296 3.034 9.75 9.75 0 0 1-1.97 4.874 2.25 2.25 0 0 1-3.034 1.296A9.75 9.75 0 0 1 12 18.75Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 9V4.5m0 15V18" /></svg>);
const ChatBubbleLeftEllipsisIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);
const HandThumbUpIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75A2.25 2.25 0 0 1 16.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M6.633 10.5l-1.89-1.89a.75.75 0 0 0-1.06 0l-1.06 1.06a.75.75 0 0 0 0 1.06l4.5 4.5a.75.75 0 0 0 1.06 0l3.353-3.353a.75.75 0 0 0 0-1.06l-1.89-1.89a.75.75 0 0 0-1.061 0Z" /></svg>);
const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
const InformationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>);

export default Header;
import React from 'react';
import type { User, NavItem } from '../types';
import StatCard from './StatCard';
import { useI18n } from '../hooks/useI18n';
import { usePosts } from '../context/PostsContext';
import { useGamification } from '../hooks/useGamification';
import { useCredits } from '../hooks/useCredits';

interface PanelProps {
  user: User;
  setActiveNavItem: (item: NavItem) => void;
}

const GamificationCard: React.FC = () => {
    const { t } = useI18n();
    const { level, xp, xpForNextLevel, tier } = useGamification();
    const progress = xpForNextLevel > 0 ? (xp / xpForNextLevel) * 100 : 100;

    return (
        <div className="flex flex-col justify-between p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
            <div>
                 <div className="flex items-center mb-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-yellow-500 dark:text-yellow-300">
                        <TrophyIcon className="w-6 h-6" />
                    </div>
                    <h3 className="ml-4 text-lg font-bold text-kolink-text dark:text-white">{t('gamification.yourRank')}</h3>
                </div>
                <p className="text-kolink-blue dark:text-blue-400 font-semibold">{t(`gamification.tiers.${tier.replace(/ /g, '_')}`)}</p>
                <div className="mt-4">
                    <div className="flex justify-between mb-1 text-sm font-medium text-kolink-text-secondary dark:text-gray-400">
                        <span>{t('gamification.level')} {level}</span>
                        <span>{xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-kolink-blue h-2.5 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                    </div>
                </div>
            </div>
             <p className="mt-4 text-xs text-kolink-text-secondary dark:text-gray-500">{t('gamification.keepCreating')}</p>
        </div>
    )
}

const XPExplanationCard: React.FC = () => {
    const { t } = useI18n();
    const xpActions = [
        { text: t('panel.xp_explanation.actions.generate'), icon: <SparklesIcon className="w-5 h-5 text-kolink-blue" /> },
        { text: t('panel.xp_explanation.actions.schedule'), icon: <CalendarDaysIcon className="w-5 h-5 text-kolink-blue" /> },
        { text: t('panel.xp_explanation.actions.publish'), icon: <PaperAirplaneIcon className="w-5 h-5 text-kolink-blue" /> },
        { text: t('panel.xp_explanation.actions.autopilot'), icon: <CpuChipIcon className="w-5 h-5 text-kolink-blue" /> },
    ];

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
                <div className="p-3 bg-kolink-blue-light dark:bg-blue-900/50 rounded-lg text-kolink-blue dark:text-blue-300">
                    <StarIcon className="w-6 h-6" />
                </div>
                <h3 className="ml-4 text-lg font-bold text-kolink-text dark:text-white">{t('panel.xp_explanation.title')}</h3>
            </div>
            <p className="mt-1 text-sm text-kolink-text-secondary dark:text-gray-400">{t('panel.xp_explanation.description')}</p>
            <ul className="mt-4 space-y-2">
                {xpActions.map((action, index) => (
                    <li key={index} className="flex items-center text-sm text-kolink-text-secondary dark:text-gray-300">
                        {action.icon}
                        <span className="ml-3">{action.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const Panel: React.FC<PanelProps> = ({ user, setActiveNavItem }) => {
  const { t } = useI18n();
  const { posts } = usePosts();
  const { credits } = useCredits();
  const now = new Date();

  // Calculate global stats
  const publishedPosts = posts.filter(p => p.status === 'scheduled' && p.scheduledAt && p.scheduledAt <= now);
  const totalPublishedPosts = publishedPosts.length;
  const totalImpressions = publishedPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  
  const postsWithStats = publishedPosts.filter(p => p.views && p.views > 0);
  const totalEngagementValue = postsWithStats.reduce((sum, p) => sum + ((p.likes || 0) + (p.comments || 0)), 0);
  const totalImpressionsForEngagement = postsWithStats.reduce((sum, p) => sum + (p.views || 0), 0);
  const averageEngagementRate = totalImpressionsForEngagement > 0 ? (totalEngagementValue / totalImpressionsForEngagement) * 100 : 0;

  // Dynamic greeting
  const getGreeting = () => {
      const hour = now.getHours();
      if (hour < 12) return t('panel.greeting_morning', { name: user.name });
      if (hour < 18) return t('panel.greeting_afternoon', { name: user.name });
      return t('panel.greeting_night', { name: user.name });
  }

  const navigateToStats = () => setActiveNavItem('Estadísticas');

  return (
    <div>
        <h1 className="text-3xl font-bold text-kolink-text dark:text-white">{getGreeting()}</h1>
        <p className="mt-2 text-kolink-text-secondary dark:text-gray-400">{t('panel.description')}</p>

        <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
                title={t('panel.stats.totalPosts')} 
                value={totalPublishedPosts} 
                subtitle={t('panel.stats.totalPostsSubtitle')}
                onClick={navigateToStats}
            />
            <StatCard 
                title={t('panel.stats.totalImpressions')} 
                value={totalImpressions.toLocaleString('es-ES')} 
                subtitle={t('panel.stats.totalImpressionsSubtitle')}
                onClick={navigateToStats}
            />
            <StatCard 
                title={t('panel.stats.avgEngagement')} 
                value={`${averageEngagementRate.toFixed(1)}%`} 
                subtitle={t('panel.stats.avgEngagementSubtitle')}
                onClick={navigateToStats}
            />
            <StatCard 
                title={t('panel.stats.credits')} 
                value={credits}
                subtitle={t('panel.stats.creditsSubtitle')}
            />
        </div>

      <div className="grid grid-cols-1 gap-8 mt-8 md:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          title={t('panel.actions.generatePost.title')}
          description={t('panel.actions.generatePost.description')}
          onClick={() => setActiveNavItem('Generador de Posts')}
          icon={<SparklesIcon />}
          buttonText={t('common.open')}
          isPrimary
        />
        <GamificationCard />
        <XPExplanationCard />
      </div>
    </div>
  );
};

interface ActionCardProps {
    title: string;
    description: string;
    onClick: () => void;
    icon: React.ReactElement;
    buttonText: string;
    isPrimary?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, onClick, icon, buttonText, isPrimary=false }) => {
    return (
        <div className="flex flex-col justify-between p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
            <div>
                <div className="flex items-center mb-4">
                    <div className="p-3 bg-kolink-blue-light dark:bg-blue-900/50 rounded-lg text-kolink-blue dark:text-blue-300">
                        {/* FIX: Explicitly specify the props type for React.cloneElement to resolve typing error. */}
                        {React.cloneElement<React.SVGProps<SVGSVGElement>>(icon, {className: "w-6 h-6"})}
                    </div>
                    <h3 className="ml-4 text-lg font-bold text-kolink-text dark:text-white">{title}</h3>
                </div>
                <p className="mt-1 text-sm text-kolink-text-secondary dark:text-gray-400">{description}</p>
            </div>
            <button 
              onClick={onClick}
              className={`w-full py-2.5 mt-6 font-semibold rounded-lg transition-colors duration-200 ${isPrimary ? 'bg-kolink-blue text-white hover:bg-blue-700' : 'bg-gray-200 text-kolink-text hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}
            >
              {buttonText}
            </button>
        </div>
    )
}

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" ><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>);
const CpuChipIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M8.25 21v-1.5M21 15.75h-1.5M15.75 3h-1.5M21 8.25v7.5a2.25 2.25 0 0 1-2.25-2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-7.5a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 21 8.25Zm-9.75 5.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75ZM3 15.75v-7.5a2.25 2.25 0 0 1 2.25-2.25h1.5" /></svg>);
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" ><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>);
const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 1-4.874-1.971 2.25 2.25 0 0 1-1.296-3.034 9.75 9.75 0 0 1 1.97-4.874 2.25 2.25 0 0 1 3.034-1.296A9.75 9.75 0 0 1 12 6.75a9.75 9.75 0 0 1 4.874 1.971 2.25 2.25 0 0 1 1.296 3.034 9.75 9.75 0 0 1-1.97 4.874 2.25 2.25 0 0 1-3.034 1.296A9.75 9.75 0 0 1 12 18.75Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 9V4.5m0 15V18" /></svg>);
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518 .442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>);
const CalendarDaysIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-4.5 12h18" /></svg>);
const PaperAirplaneIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>);

export default Panel;
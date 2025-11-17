
import React, { useState } from 'react';
import type { NavItem } from '../types';
import { useI18n } from '../hooks/useI18n';
import { useToast } from '../hooks/useToast';

interface SidebarProps {
  activeNavItem: NavItem;
  setActiveNavItem: (item: NavItem) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeNavItem, setActiveNavItem, isOpen, setIsOpen }) => {
  const { t } = useI18n();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const navItems: { name: NavItem, icon: React.ReactElement, section?: string, tourId?: string }[] = [
    { name: 'Panel', icon: <HomeIcon /> },
    { name: 'Generador de Posts', icon: <SparklesIcon />, tourId: 'post-generator' },
    { name: 'Autopilot', icon: <CpuChipIcon />, tourId: 'autopilot' },
    { name: 'Base de Conocimiento', icon: <CircleStackIcon /> },
    { name: 'Mis posts', icon: <FolderIcon />, tourId: 'my-posts' },
    { name: 'Estadísticas', icon: <ChartBarIcon /> },
    { name: 'Ajustes', icon: <Cog6ToothIcon /> },
    { name: 'Centro de ayuda', icon: <QuestionMarkCircleIcon /> },
  ];

  const renderNavItem = (item: { name: NavItem, icon: React.ReactElement, tourId?: string }) => {
      const isActive = activeNavItem === item.name;
      const baseClasses = "flex items-center w-full px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-lg";
      const activeClasses = "bg-kolink-blue text-white shadow-md";
      const inactiveClasses = "text-kolink-text-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700";

      return (
        <button
            key={item.name}
            data-tour-id={item.tourId}
            onClick={() => {
                setActiveNavItem(item.name)
                if (window.innerWidth < 768) setIsOpen(false);
            }}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {/* FIX: Explicitly specify the props type for React.cloneElement to resolve typing error. */}
            {React.cloneElement<React.SVGProps<SVGSVGElement>>(item.icon, { className: "w-5 h-5 mr-3"})}
            {t(`sidebar.nav.${item.name.toLowerCase().replace(/ /g, '_')}`)}
        </button>
      )
  }

  return (
    <>
    <div className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
    <aside className={`flex-shrink-0 w-64 bg-white dark:bg-gray-800 flex flex-col p-4 transition-transform transform md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} fixed h-full z-30`}>
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
                <div className="inline-flex items-center justify-center w-8 h-8 text-lg font-bold text-white bg-kolink-blue rounded-md">K</div>
                <span className="ml-3 text-xl font-bold text-kolink-text dark:text-white">KOLINK</span>
            </div>
             <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

      <button onClick={() => setActiveNavItem('Generador de Posts')} className="w-full px-4 py-3 mb-6 font-semibold text-white transition-colors duration-200 rounded-lg shadow-lg bg-kolink-blue hover:bg-blue-700">
        {t('sidebar.writePost')}
      </button>

      <nav className="flex-1 space-y-2">
        {renderNavItem(navItems.find(i => i.name === 'Panel')!)}
        
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
             <h3 className="px-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">{t('sidebar.sections.contentCreation')}</h3>
             <div className="mt-2 space-y-2">
                {renderNavItem(navItems.find(i => i.name === 'Generador de Posts')!)}
                {renderNavItem(navItems.find(i => i.name === 'Autopilot')!)}
                {renderNavItem(navItems.find(i => i.name === 'Base de Conocimiento')!)}
             </div>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
             <h3 className="px-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">{t('sidebar.sections.drafts')}</h3>
             <div className="mt-2 space-y-1">
                {renderNavItem(navItems.find(i => i.name === 'Mis posts')!)}
             </div>
        </div>
        
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {renderNavItem(navItems.find(i => i.name === 'Estadísticas')!)}
            {renderNavItem(navItems.find(i => i.name === 'Ajustes')!)}
            {renderNavItem(navItems.find(i => i.name === 'Centro de ayuda')!)}
        </div>
      </nav>

      <div className="mt-auto">
        <div className="p-4 rounded-lg bg-kolink-blue-light dark:bg-gray-700">
          <h4 className="font-bold text-kolink-text dark:text-white">{t('sidebar.report.title')}</h4>
          <p className="text-sm text-kolink-text-secondary dark:text-gray-400">{t('sidebar.report.description')}</p>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="w-full px-4 py-2 mt-3 text-sm font-medium text-white transition-colors duration-200 bg-gray-800 rounded-md hover:bg-black dark:bg-gray-600 dark:hover:bg-gray-500">
            {t('sidebar.report.button')}
          </button>
        </div>
      </div>
    </aside>

    {isReportModalOpen && <ReportModal onClose={() => setIsReportModalOpen(false)} />}
    </>
  );
};

// Report Modal Component
const ReportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useI18n();
    const { showToast } = useToast();
    const [type, setType] = useState('bug');
    const [summary, setSummary] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!summary.trim()) {
            showToast(t('sidebar.report.modal.summaryRequired'), 'error');
            return;
        }
        console.log({ type, summary }); // Simulate submission
        showToast(t('sidebar.report.modal.submitSuccess'), 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-kolink-text dark:text-white">{t('sidebar.report.modal.title')}</h3>
                        <p className="mt-1 text-sm text-kolink-text-secondary dark:text-gray-400">{t('sidebar.report.modal.description')}</p>
                    </div>
                     <button onClick={onClose} className="p-1 -mt-2 -mr-2 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="feedback-type" className="block text-sm font-medium text-kolink-text-secondary dark:text-gray-300">{t('sidebar.report.modal.typeLabel')}</label>
                        <select
                            id="feedback-type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm"
                        >
                            <option value="bug">{t('sidebar.report.modal.types.bug')}</option>
                            <option value="suggestion">{t('sidebar.report.modal.types.suggestion')}</option>
                            <option value="content">{t('sidebar.report.modal.types.content')}</option>
                            <option value="other">{t('sidebar.report.modal.types.other')}</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="feedback-summary" className="block text-sm font-medium text-kolink-text-secondary dark:text-gray-300">{t('sidebar.report.modal.summaryLabel')}</label>
                        <textarea
                            id="feedback-summary"
                            rows={5}
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            required
                            placeholder={t('sidebar.report.modal.summaryPlaceholder')}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm p-3"
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-kolink-text dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">{t('sidebar.report.modal.cancel')}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg bg-kolink-blue hover:bg-blue-700">{t('sidebar.report.modal.submit')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Icon Components
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
);
const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
);
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
);
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
);
const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>
);
const CpuChipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M8.25 21v-1.5M21 15.75h-1.5M15.75 3h-1.5M21 8.25v7.5a2.25 2.25 0 0 1-2.25-2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-7.5a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 21 8.25Zm-9.75 5.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75ZM3 15.75v-7.5a2.25 2.25 0 0 1 2.25-2.25h1.5" /></svg>
);
const QuestionMarkCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>
);
const CircleStackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>
);

export default Sidebar;
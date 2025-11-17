

import React, { useState, useEffect } from 'react';
import type { User, NavItem, SettingsTab } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';
import Panel from './Panel';
import Generator from './Generator';
import MyPosts from './MyPosts';
import Settings from './Settings';
import Statistics from './Statistics';
import Autopilot from './Autopilot';
import KnowledgeBase from './KnowledgeBase';
import HelpCenter from './HelpCenter';
import Placeholder from './Placeholder';
import OnboardingTour from './OnboardingTour';
import { useI18n } from '../hooks/useI18n';
import PlanSelectionModal from './settings/PlanSelectionModal';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeNavItem, setActiveNavItem] = useState<NavItem>('Panel');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useI18n();
  const [initialSettingsTab, setInitialSettingsTab] = useState<SettingsTab | undefined>();

  // Onboarding Tour State
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // FIX: Explicitly typed the tourSteps array to match the TourStep interface in OnboardingTour.tsx.
  // This prevents the 'position' property's type from being widened to a generic 'string'.
  const tourSteps: {
    targetId: string;
    titleKey: string;
    contentKey: string;
    position?: 'right' | 'bottom' | 'left' | 'top';
  }[] = [
    { targetId: 'welcome', titleKey: 'onboarding.welcome.title', contentKey: 'onboarding.welcome.content' },
    { targetId: 'post-generator', titleKey: 'onboarding.generator.title', contentKey: 'onboarding.generator.content', position: 'right' },
    { targetId: 'autopilot', titleKey: 'onboarding.autopilot.title', contentKey: 'onboarding.autopilot.content', position: 'right' },
    { targetId: 'my-posts', titleKey: 'onboarding.my_posts.title', contentKey: 'onboarding.my_posts.content', position: 'right' },
    { targetId: 'gamification', titleKey: 'onboarding.gamification.title', contentKey: 'onboarding.gamification.content', position: 'bottom' },
    { targetId: 'finish', titleKey: 'onboarding.finish.title', contentKey: 'onboarding.finish.content' },
  ];

  useEffect(() => {
    // We use a timeout to ensure the rest of the app has rendered
    const timer = setTimeout(() => {
      const hasCompleted = localStorage.getItem('kolink-onboarding-complete');
      if (!hasCompleted) {
        setIsTourActive(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleEndTour = () => {
    setIsTourActive(false);
    localStorage.setItem('kolink-onboarding-complete', 'true');
  };

  const handleNextStep = () => {
    const nextStepIndex = tourStep + 1;
    if (nextStepIndex >= tourSteps.length) {
      handleEndTour();
      return;
    }

    const nextStep = tourSteps[nextStepIndex];
    const sidebarSteps = ['post-generator', 'autopilot', 'my-posts'];
    
    if (sidebarSteps.includes(nextStep.targetId) && !isSidebarOpen && window.innerWidth < 768) {
        setIsSidebarOpen(true);
        // Give sidebar time to open before moving to the next step
        setTimeout(() => setTourStep(nextStepIndex), 300); 
    } else {
        setTourStep(nextStepIndex);
    }
  };

  const handlePrevStep = () => {
    setTourStep(prev => Math.max(0, prev - 1));
  };

  const goToBilling = () => {
    setInitialSettingsTab('billing');
    setActiveNavItem('Ajustes');
  };

  const goToSettings = (tab: SettingsTab) => {
    setInitialSettingsTab(tab);
    setActiveNavItem('Ajustes');
  };

  const handleSidebarNav = (item: NavItem) => {
    if (item === 'Ajustes') {
      setInitialSettingsTab(undefined);
    }
    setActiveNavItem(item);
  };


  const renderContent = () => {
    switch (activeNavItem) {
      case 'Panel':
        return <Panel user={user} setActiveNavItem={setActiveNavItem} />;
      case 'Generador de Posts':
        return <Generator openPlanModal={() => setIsPlanModalOpen(true)} />;
      case 'Mis posts':
        return <MyPosts />;
      case 'Autopilot':
        return <Autopilot user={user} openPlanModal={() => setIsPlanModalOpen(true)} />;
      case 'Base de Conocimiento':
        return <KnowledgeBase />;
      case 'Ajustes':
        return <Settings user={user} openPlanModal={() => setIsPlanModalOpen(true)} initialTab={initialSettingsTab} />;
      case 'Estadísticas':
        return <Statistics />;
      case 'Centro de ayuda':
        return <HelpCenter />;
      default:
        return <Panel user={user} setActiveNavItem={setActiveNavItem} />;
    }
  };

  return (
    <div className="flex h-screen bg-kolink-gray dark:bg-gray-900">
      <Sidebar activeNavItem={activeNavItem} setActiveNavItem={handleSidebarNav} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} goToBilling={goToBilling} goToSettings={goToSettings} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-kolink-gray dark:bg-gray-900">
          <div className="container px-6 py-8 mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
      {isPlanModalOpen && <PlanSelectionModal onClose={() => setIsPlanModalOpen(false)} />}
       {isTourActive && (
        <OnboardingTour
          steps={tourSteps}
          currentStepIndex={tourStep}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
          onSkip={handleEndTour}
          t={t}
        />
      )}
    </div>
  );
};

export default Dashboard;

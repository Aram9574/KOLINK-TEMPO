
import React, { useState, useEffect, useRef } from 'react';

interface TourStep {
    targetId: string;
    titleKey: string;
    contentKey: string;
    position?: 'right' | 'bottom' | 'left' | 'top';
}

interface OnboardingTourProps {
    steps: TourStep[];
    currentStepIndex: number;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    t: (key: string) => string;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, currentStepIndex, onNext, onPrev, onSkip, t }) => {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

    const currentStep = steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;
    const isModalStep = currentStep.targetId === 'welcome' || currentStep.targetId === 'finish';

    useEffect(() => {
        const highlightClass = 'onboarding-highlight';

        // Clean up previous highlight
        document.querySelectorAll(`.${highlightClass}`).forEach(el => el.classList.remove(highlightClass));

        if (isModalStep) {
            setTargetRect(null);
            return;
        }

        const updatePosition = () => {
            const targetElement = document.querySelector(`[data-tour-id="${currentStep.targetId}"]`);
            if (targetElement) {
                targetElement.classList.add(highlightClass);
                const rect = targetElement.getBoundingClientRect();
                setTargetRect(rect);
            }
        };

        // Needs a slight delay for elements to be available, esp. when sidebar opens
        const timeoutId = setTimeout(updatePosition, 100);

        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            clearTimeout(timeoutId);
            document.querySelectorAll(`.${highlightClass}`).forEach(el => el.classList.remove(highlightClass));
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [currentStep.targetId, isModalStep]);

    useEffect(() => {
        if (!targetRect || !popoverRef.current) return;

        const popoverRect = popoverRef.current.getBoundingClientRect();
        const spacing = 16;
        let top = 0, left = 0;

        const position = currentStep.position || 'bottom';

        switch (position) {
            case 'right':
                top = targetRect.top + (targetRect.height / 2) - (popoverRect.height / 2);
                left = targetRect.right + spacing;
                break;
            case 'left':
                top = targetRect.top + (targetRect.height / 2) - (popoverRect.height / 2);
                left = targetRect.left - popoverRect.width - spacing;
                break;
            case 'top':
                top = targetRect.top - popoverRect.height - spacing;
                left = targetRect.left + (targetRect.width / 2) - (popoverRect.width / 2);
                break;
            case 'bottom':
            default:
                top = targetRect.bottom + spacing;
                left = targetRect.left + (targetRect.width / 2) - (popoverRect.width / 2);
                break;
        }

        // Adjust if popover goes off-screen
        top = Math.max(spacing, Math.min(top, window.innerHeight - popoverRect.height - spacing));
        left = Math.max(spacing, Math.min(left, window.innerWidth - popoverRect.width - spacing));

        setPopoverPosition({ top, left });

    }, [targetRect, currentStep.position]);


    const popoverContent = (
        <div className="flex flex-col h-full">
            <div>
                <h3 className="text-lg font-bold text-kolink-text dark:text-white">{t(currentStep.titleKey)}</h3>
                <p className="mt-2 text-sm text-kolink-text-secondary dark:text-gray-400">{t(currentStep.contentKey)}</p>
            </div>
            <div className="flex items-center justify-between mt-6">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{currentStepIndex + 1} / {steps.length}</span>
                <div className="flex items-center gap-2">
                    {!isFirstStep && <button onClick={onPrev} className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">{t('onboarding.buttons.prev')}</button>}
                    <button onClick={onNext} className="px-3 py-2 text-sm font-medium text-white rounded-md bg-kolink-blue hover:bg-blue-700">{isLastStep ? t('onboarding.buttons.finish') : t('onboarding.buttons.next')}</button>
                </div>
            </div>
        </div>
    );
    
    return (
        <>
            <style>{`
              .onboarding-highlight {
                position: relative;
                z-index: 9999;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.9), 0 0 0 9999px rgba(0, 0, 0, 0.6);
                border-radius: 8px;
                transition: box-shadow 0.3s ease-in-out;
              }
              .onboarding-popover-arrow::before {
                content: '';
                position: absolute;
                width: 1rem;
                height: 1rem;
                background: inherit;
                transform: rotate(45deg);
              }
              .onboarding-popover-arrow-top::before { top: -0.5rem; left: calc(50% - 0.5rem); }
              .onboarding-popover-arrow-bottom::before { bottom: -0.5rem; left: calc(50% - 0.5rem); }
              .onboarding-popover-arrow-left::before { left: -0.5rem; top: calc(50% - 0.5rem); }
              .onboarding-popover-arrow-right::before { right: -0.5rem; top: calc(50% - 0.5rem); }
            `}</style>
            
            {isModalStep ? (
                 <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 m-4 text-center">
                       <h2 className="text-2xl font-bold text-kolink-text dark:text-white">{t(currentStep.titleKey)}</h2>
                        <p className="mt-2 text-kolink-text-secondary dark:text-gray-400">{t(currentStep.contentKey)}</p>
                         <div className="flex items-center justify-center gap-4 mt-6">
                             <button onClick={onSkip} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:underline">{t('onboarding.buttons.skip')}</button>
                             <button onClick={onNext} className="px-5 py-2.5 font-semibold text-white rounded-lg bg-kolink-blue hover:bg-blue-700">{isFirstStep ? t('onboarding.buttons.start') : t('onboarding.buttons.finish')}</button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {!targetRect && <div className="fixed inset-0 z-[9998] bg-black bg-opacity-60 backdrop-blur-sm"></div>}
                    {targetRect && (
                        <div
                            ref={popoverRef}
                            style={{ top: `${popoverPosition.top}px`, left: `${popoverPosition.left}px` }}
                            className="fixed z-[10000] w-72 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700"
                        >
                            {popoverContent}
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default OnboardingTour;

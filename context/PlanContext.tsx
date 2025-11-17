import React, { createContext, useState, ReactNode, useContext } from 'react';
import type { PlanName } from '../types';

interface PlanContextType {
  plan: PlanName;
  setPlan: (plan: PlanName) => void;
}

export const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plan, setPlan] = useState<PlanName>('Free');

  return (
    <PlanContext.Provider value={{ plan, setPlan }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
    const context = useContext(PlanContext);
    if (context === undefined) {
        throw new Error('usePlan must be used within a PlanProvider');
    }
    return context;
};

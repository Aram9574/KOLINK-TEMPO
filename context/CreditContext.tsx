import React, { createContext, useState, ReactNode } from 'react';

interface CreditsContextType {
  credits: number;
  addCredits: (amount: number) => void;
  setCredits: (amount: number) => void;
  useCredit: (amount: number) => boolean;
}

export const CreditContext = createContext<CreditsContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [credits, setCreditsState] = useState<number>(10);

  const addCredits = (amount: number) => {
    setCreditsState(prevCredits => prevCredits + amount);
  };

  const setCredits = (amount: number) => {
    setCreditsState(amount);
  };

  const useCredit = (amount: number) => {
    if (credits >= amount) {
      setCreditsState(prevCredits => prevCredits - amount);
      return true;
    }
    return false;
  };

  return (
    <CreditContext.Provider value={{ credits, addCredits, setCredits, useCredit }}>
      {children}
    </CreditContext.Provider>
  );
};
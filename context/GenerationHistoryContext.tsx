import React, { createContext, useState, ReactNode, useContext } from 'react';
import type { GeneratedPostHistoryItem } from '../types';

interface GenerationHistoryContextType {
  history: GeneratedPostHistoryItem[];
  addPostToHistory: (content: string) => void;
}

export const GenerationHistoryContext = createContext<GenerationHistoryContextType | undefined>(undefined);

const initialHistory: GeneratedPostHistoryItem[] = [
    { id: 'hist-1', content: 'Este es un ejemplo de un post generado anteriormente sobre IA en marketing.', date: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 'hist-2', content: 'Otro post del historial, esta vez sobre liderazgo en equipos remotos.', date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
];

export const GenerationHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<GeneratedPostHistoryItem[]>(initialHistory);

  const addPostToHistory = (content: string) => {
    const newItem: GeneratedPostHistoryItem = {
      id: `hist-${Date.now()}`,
      content,
      date: new Date(),
    };
    setHistory(prev => [newItem, ...prev]);
  };

  return (
    <GenerationHistoryContext.Provider value={{ history, addPostToHistory }}>
      {children}
    </GenerationHistoryContext.Provider>
  );
};

export const useGenerationHistory = () => {
  const context = useContext(GenerationHistoryContext);
  if (context === undefined) {
    throw new Error('useGenerationHistory must be used within a GenerationHistoryProvider');
  }
  return context;
};
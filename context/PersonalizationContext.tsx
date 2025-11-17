import React, { createContext, useState, ReactNode, useMemo } from 'react';
import { useI18n } from '../hooks/useI18n';
import type { UserIdentity } from '../types';

export interface BestPractice {
  id: string;
  text: string; // Instruction for AI, and display text for custom practices
  title?: string; // For base practices
  description?: string; // For base practices
  type: 'base' | 'custom';
  active?: boolean;
}

interface PersonalizationContextType {
  identity: UserIdentity;
  setIdentity: (identity: UserIdentity) => void;
  basePractices: BestPractice[];
  customPractices: BestPractice[];
  toggleBasePractice: (id: string) => void;
  addCustomPractice: (text: string) => void;
  removeCustomPractice: (id: string) => void;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

interface BasePracticeState {
    [id: string]: boolean;
}

const basePracticeDefinitions = [
    { id: 'bp-hook', key: 'hook' },
    { id: 'bp-story', key: 'storytelling' },
    { id: 'bp-pain', key: 'pain_points' },
    { id: 'bp-paragraphs', key: 'short_paragraphs' },
    { id: 'bp-question', key: 'end_with_question' },
];

export const PersonalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useI18n();

  const [identity, setIdentity] = useState<UserIdentity>({
    name: 'Aram',
    occupation: 'AI Content Specialist @ Kolink',
    bio: 'Especialista en contenido IA con más de 5 años de experiencia ayudando a startups B2B a crecer su presencia online. Apasionado por la tecnología y la comunicación.',
    customInstructions: 'Usa un tono optimista y motivador. Incluye anécdotas personales cuando sea relevante.',
  });
  
  const [basePracticesState, setBasePracticesState] = useState<BasePracticeState>({
    'bp-hook': true,
    'bp-story': true,
    'bp-pain': false,
    'bp-paragraphs': true,
    'bp-question': true,
  });

  const basePractices: BestPractice[] = useMemo(() => basePracticeDefinitions.map(def => ({
      id: def.id,
      title: t(`settings.personalization.bestPractices.practices.${def.key}.title`),
      description: t(`settings.personalization.bestPractices.practices.${def.key}.description`),
      text: t(`settings.personalization.bestPractices.practices.${def.key}.instruction`),
      type: 'base',
      active: !!basePracticesState[def.id],
  })), [t, basePracticesState]);
  
  const [customPractices, setCustomPractices] = useState<BestPractice[]>([]);

  const toggleBasePractice = (id: string) => {
    setBasePracticesState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addCustomPractice = (text: string) => {
    const newPractice: BestPractice = {
      id: `cp-${Date.now()}`,
      text,
      type: 'custom',
    };
    setCustomPractices(prev => [...prev, newPractice]);
  };

  const removeCustomPractice = (id: string) => {
    setCustomPractices(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PersonalizationContext.Provider
      value={{
        identity,
        setIdentity,
        basePractices,
        customPractices,
        toggleBasePractice,
        addCustomPractice,
        removeCustomPractice,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
};

export default PersonalizationContext;
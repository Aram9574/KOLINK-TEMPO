import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { KnowledgeItem } from '../types';

interface KnowledgeBaseContextType {
  knowledgeItems: KnowledgeItem[];
  addKnowledgeItem: (item: Omit<KnowledgeItem, 'id'>) => void;
  updateKnowledgeItem: (id: string, updates: Partial<KnowledgeItem>) => void;
  deleteKnowledgeItem: (id: string) => void;
}

const KnowledgeBaseContext = createContext<KnowledgeBaseContextType | undefined>(undefined);

export const KnowledgeBaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([
    {
        id: 'kb-1',
        title: 'Sobre Kolink (Mi Producto)',
        content: 'Kolink es un micro-SaaS que ayuda a profesionales y empresas a crear contenido viral para LinkedIn usando IA. Las características clave son: Generador de Posts con plantillas, Autopilot para sugerencias automáticas, y una Base de Conocimiento para personalizar la IA.'
    },
    {
        id: 'kb-2',
        title: 'Tono de Voz de la Marca',
        content: 'El tono de Kolink debe ser: profesional pero cercano, experto pero no arrogante, innovador y enfocado en los beneficios para el usuario. Usar emojis con moderación. Siempre terminar con una pregunta para fomentar la conversación.'
    }
  ]);

  const addKnowledgeItem = (itemData: Omit<KnowledgeItem, 'id'>) => {
    const newItem: KnowledgeItem = {
      ...itemData,
      id: new Date().toISOString() + Math.random(),
    };
    setKnowledgeItems(prevItems => [newItem, ...prevItems]);
  };

  const updateKnowledgeItem = (id: string, updates: Partial<KnowledgeItem>) => {
    setKnowledgeItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteKnowledgeItem = (id: string) => {
    setKnowledgeItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  return (
    <KnowledgeBaseContext.Provider value={{ knowledgeItems, addKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem }}>
      {children}
    </KnowledgeBaseContext.Provider>
  );
};

export const useKnowledgeBase = () => {
  const context = useContext(KnowledgeBaseContext);
  if (!context) {
    throw new Error('useKnowledgeBase must be used within a KnowledgeBaseProvider');
  }
  return context;
};
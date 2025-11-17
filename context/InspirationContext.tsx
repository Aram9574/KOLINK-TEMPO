import React, { createContext, useState, ReactNode } from 'react';
import type { InspirationPost } from '../types';

interface InspirationContextType {
  inspirationPosts: InspirationPost[];
  addInspirationPost: (post: Omit<InspirationPost, 'id'>) => void;
  updateInspirationPost: (id: string, updates: Partial<InspirationPost>) => void;
  deleteInspirationPost: (id: string) => void;
}

export const InspirationContext = createContext<InspirationContextType | undefined>(undefined);

const initialInspirationPosts: InspirationPost[] = [
    {
        id: 'insp-1',
        content: `Acabo de pasar de 0 a 10,000€/mes en 90 días.\n\nSin página web.\nSin seguidores.\nSin un producto complejo.\n\n¿El secreto? Una oferta irresistible y un sistema de ventas simple.\n\nNo necesitas más.\n\nDeja de complicarte y enfócate en lo esencial.`
    },
    {
        id: 'insp-2',
        content: `La mayoría de la gente fracasa en LinkedIn por una razón:\n\nIntentan ser perfectos.\n\nPero la gente no conecta con la perfección.\nConecta con la autenticidad.\n\nMuestra tus dudas.\nComparte tus errores.\nHabla de tus miedos.\n\nLa vulnerabilidad es tu mayor superpoder aquí.`
    }
];


export const InspirationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inspirationPosts, setInspirationPosts] = useState<InspirationPost[]>(initialInspirationPosts);

  const addInspirationPost = (postData: Omit<InspirationPost, 'id'>) => {
    const newPost: InspirationPost = {
      ...postData,
      id: `insp-${new Date().toISOString()}`,
    };
    setInspirationPosts(prev => [newPost, ...prev]);
  };

  const updateInspirationPost = (id: string, updates: Partial<InspirationPost>) => {
    setInspirationPosts(prev =>
      prev.map(post => (post.id === id ? { ...post, ...updates } : post))
    );
  };

  const deleteInspirationPost = (id: string) => {
    setInspirationPosts(prev => prev.filter(post => post.id !== id));
  };

  return (
    <InspirationContext.Provider value={{ inspirationPosts, addInspirationPost, updateInspirationPost, deleteInspirationPost }}>
      {children}
    </InspirationContext.Provider>
  );
};
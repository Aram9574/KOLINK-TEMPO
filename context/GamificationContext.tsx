import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import type { TierName } from '../types';
import { useToast } from '../hooks/useToast';
import { useI18n } from '../hooks/useI18n';

interface GamificationState {
  level: number;
  xp: number;
  xpForNextLevel: number;
  tier: TierName;
}

interface GamificationContextType extends GamificationState {
  addXp: (amount: number, message: string) => void;
}

export const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const calculateXpForLevel = (level: number) => Math.floor(100 * Math.pow(level, 1.5));

const getTierForLevel = (level: number): TierName => {
    if (level >= 20) return 'Visionario de LinkedIn';
    if (level >= 10) return 'Influencer Digital';
    if (level >= 5) return 'Estratega de Contenido';
    return 'Novato Creador';
};

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const { t } = useI18n();
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);

    const xpForNextLevel = useMemo(() => calculateXpForLevel(level), [level]);
    const tier = useMemo(() => getTierForLevel(level), [level]);

    const addXp = (amount: number, message: string) => {
        setXp(currentXp => {
            let newXp = currentXp + amount;
            let newLevel = level;
            let xpNeeded = calculateXpForLevel(newLevel);

            while (newXp >= xpNeeded) {
                newXp -= xpNeeded;
                newLevel++;
                showToast(t('gamification.levelUp', { level: newLevel }), 'success');
                xpNeeded = calculateXpForLevel(newLevel);
            }
            
            setLevel(newLevel);
            showToast(message, 'info');
            return newXp;
        });
    };

    const value = { level, xp, xpForNextLevel, tier, addXp };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
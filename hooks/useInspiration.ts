import { useContext } from 'react';
import { InspirationContext } from '../context/InspirationContext';

export const useInspiration = () => {
    const context = useContext(InspirationContext);
    if (context === undefined) {
        throw new Error('useInspiration must be used within a InspirationProvider');
    }
    return context;
};

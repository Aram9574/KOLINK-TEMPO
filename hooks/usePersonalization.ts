import { useContext } from 'react';
import PersonalizationContext from '../context/PersonalizationContext';

export const usePersonalization = () => {
    const context = useContext(PersonalizationContext);
    if (context === undefined) {
        throw new Error('usePersonalization must be used within a PersonalizationProvider');
    }
    return context;
};
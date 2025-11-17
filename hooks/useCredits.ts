import { useContext } from 'react';
import { CreditContext } from '../context/CreditContext';

export const useCredits = () => {
    const context = useContext(CreditContext);
    if (context === undefined) {
        throw new Error('useCredits must be used within a CreditProvider');
    }
    return context;
};

import { useContext } from 'react';
import { GenerationHistoryContext } from '../context/GenerationHistoryContext';

export const useGenerationHistory = () => {
    const context = useContext(GenerationHistoryContext);
    if (context === undefined) {
        throw new Error('useGenerationHistory must be used within a GenerationHistoryProvider');
    }
    return context;
};

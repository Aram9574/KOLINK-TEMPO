import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './context/i18nContext';
import { ThemeProvider } from './context/ThemeContext';
import { PostsProvider } from './context/PostsContext';
import { GamificationProvider } from './context/GamificationContext';
import { PlanProvider } from './context/PlanContext';
import { ToastProvider } from './context/ToastContext';
import { KnowledgeBaseProvider } from './context/KnowledgeBaseContext';
import { PersonalizationProvider } from './context/PersonalizationContext';
import { InspirationProvider } from './context/InspirationContext';
import { CreditProvider } from './context/CreditContext';
import { GenerationHistoryProvider } from './context/GenerationHistoryContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <PlanProvider>
          <ToastProvider>
            <CreditProvider>
              <PostsProvider>
                <GamificationProvider>
                  <KnowledgeBaseProvider>
                    <PersonalizationProvider>
                      <InspirationProvider>
                        <GenerationHistoryProvider>
                          <App />
                        </GenerationHistoryProvider>
                      </InspirationProvider>
                    </PersonalizationProvider>
                  </KnowledgeBaseProvider>
                </GamificationProvider>
              </PostsProvider>
            </CreditProvider>
          </ToastProvider>
        </PlanProvider>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>
);
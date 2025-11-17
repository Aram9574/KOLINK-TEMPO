import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import { ToastContainer } from './components/Toast';

const App: React.FC = () => {
  const [user, setUser] = useState({ name: 'Aram', avatar: 'AZ', email: 'aram@kolink.es', headline: 'AI Content Specialist @ Kolink' });

  return (
    <div className="min-h-screen bg-kolink-gray font-sans">
      <Dashboard user={user} />
      <ToastContainer />
    </div>
  );
};

export default App;
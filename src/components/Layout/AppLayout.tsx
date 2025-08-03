import React, { memo } from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = memo(({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
});

AppLayout.displayName = 'AppLayout';

export default AppLayout; 
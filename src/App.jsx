import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/pages/DashboardPage';
import CommoditiesPage from './components/pages/CommoditiesPage';
import GoldPage from './components/pages/GoldPage';
import ExchangeRatesPage from './components/pages/ExchangeRatesPage';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage />;
      case 'commodities': return <CommoditiesPage />;
      case 'gold': return <GoldPage />;
      case 'exchange': return <ExchangeRatesPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar Component */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header (Mobile view) */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-500 hover:text-gray-800 mr-4"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-bold text-gray-800 capitalize">
            {activeTab === 'dashboard' ? 'Overview' : activeTab}
          </h2>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
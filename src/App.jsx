import React, { useState } from 'react';
import { Menu, Calendar } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MarketTicker from './components/MarketTicker';
import DashboardPage from './components/pages/DashboardPage';
import CommoditiesPage from './components/pages/CommoditiesPage';
import GoldPage from './components/pages/GoldPage';
import ExchangeRatesPage from './components/pages/ExchangeRatesPage';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState('bn');

  const formattedDate = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const pageTitles = {
    dashboard: { bn: 'বাজার ওভারভিউ', en: 'Market Overview' },
    commodities: { bn: 'দৈনন্দিন কাঁচাবাজার', en: 'Daily Commodities' },
    gold: { bn: 'স্বর্ণের বাজারদর', en: 'Gold Rates (BAJUS)' },
    exchange: { bn: 'মুদ্রা বিনিময় হার', en: 'Currency Exchange' },
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage lang={lang} setActiveTab={setActiveTab} />;
      case 'commodities':
        return <CommoditiesPage lang={lang} />;
      case 'gold':
        return <GoldPage lang={lang} />;
      case 'exchange':
        return <ExchangeRatesPage lang={lang} />;
      default:
        return <DashboardPage lang={lang} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Glassmorphic Status Bar */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden sm:inline text-slate-400 font-medium">
                {lang === 'bn' ? 'আজকের বাজারদর' : 'Bazar Dor'}
              </span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="font-bold text-slate-900">
                {pageTitles[activeTab]?.[lang] || pageTitles.dashboard[lang]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/60">
              <Calendar size={13} className="text-slate-400" />
              <span>{formattedDate}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{lang === 'bn' ? 'লাইভ মনিটর' : 'Live Sync'}</span>
            </div>
          </div>
        </header>

        {/* Live Scrolling Market Price Ticker */}
        <MarketTicker lang={lang} setActiveTab={setActiveTab} />

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-7xl mx-auto animate-fadeIn">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Coins, DollarSign, X } from 'lucide-react';
import logo from '../assets/আজকের বাজারদর.png';

const Sidebar = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, lang, setLang }) => {
  const [internalLang, setInternalLang] = useState('bn');
  const currentLang = lang !== undefined ? lang : internalLang;

  const handleLangChange = (selectedLang) => {
    if (setLang) {
      setLang(selectedLang);
    } else {
      setInternalLang(selectedLang);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: currentLang === 'bn' ? 'ওভারভিউ' : 'Overview',
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: 'commodities',
      label: currentLang === 'bn' ? 'কাঁচাবাজার' : 'Commodities',
      icon: <ShoppingCart size={20} />,
    },
    {
      id: 'gold',
      label: currentLang === 'bn' ? 'স্বর্ণের দাম' : 'Gold Price',
      icon: <Coins size={20} />,
    },
    {
      id: 'exchange',
      label: currentLang === 'bn' ? 'মুদ্রা বিনিময়' : 'Currency Exchange',
      icon: <DollarSign size={20} />,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Clean White + Slate & Blue Theme) */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-white text-slate-800 border-r border-slate-200
          transition-transform duration-300 ease-in-out
          flex flex-col justify-between
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top Section: Logo + Name & Navigation */}
        <div>
          <div className="px-5 py-4 flex justify-between items-center border-b border-slate-200 gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 text-left focus:outline-none min-w-0"
            >
              <img
                src={logo}
                alt="Logo"
                className="h-8 w-8 object-contain shrink-0"
              />
              <span className="text-lg font-bold text-slate-900 tracking-tight truncate">
                {currentLang === 'bn' ? 'আজকের বাজারদর' : 'Bazar Dor'}
              </span>
            </button>

            <button
              className="md:hidden text-slate-500 hover:text-slate-900 shrink-0"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={22} />
            </button>
          </div>

          <nav className="mt-4 px-3">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom Section: বাংলা / English Toggle */}
        <div className="p-4 border-t border-slate-200">
          <div className="grid grid-cols-2 bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleLangChange('bn')}
              className={`py-2 rounded-md transition-colors ${
                currentLang === 'bn'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => handleLangChange('en')}
              className={`py-2 rounded-md transition-colors ${
                currentLang === 'en'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
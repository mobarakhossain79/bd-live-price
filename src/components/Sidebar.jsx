import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Coins,
  DollarSign,
  X,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import logo from '../assets/আজকের বাজারদর.png';

const Sidebar = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  lang = 'bn',
  setLang,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      labelBn: 'ওভারভিউ',
      labelEn: 'Overview',
      descBn: 'এক নজরে বাজার',
      descEn: 'Market summary',
      icon: LayoutDashboard,
    },
    {
      id: 'commodities',
      labelBn: 'কাঁচাবাজার',
      labelEn: 'Commodities',
      descBn: 'নিত্যপণ্যের খুচরা দর',
      descEn: 'Daily essentials',
      icon: ShoppingCart,
    },
    {
      id: 'gold',
      labelBn: 'স্বর্ণের দাম',
      labelEn: 'Gold Price',
      descBn: 'বাজুস নির্ধারিত দর',
      descEn: 'BAJUS official rates',
      icon: Coins,
    },
    {
      id: 'exchange',
      labelBn: 'মুদ্রা বিনিময়',
      labelEn: 'Currency Exchange',
      descBn: 'ওপেন মার্কেট রেট',
      descEn: 'Foreign exchange',
      icon: DollarSign,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-68 bg-white text-slate-800 border-r border-slate-200/90
          transition-transform duration-300 ease-out
          flex flex-col justify-between shrink-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex justify-between items-center border-b border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-left focus:outline-none group min-w-0"
            >
              <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1.5 shrink-0 group-hover:border-blue-300 transition-colors">
                <img src={logo} alt="Logo" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <span className="block text-base font-extrabold text-slate-900 tracking-tight truncate">
                  {lang === 'bn' ? 'আজকের বাজারদর' : 'Bazar Dor'}
                </span>
                <span className="block text-[11px] font-medium text-slate-400 truncate">
                  {lang === 'bn' ? 'বাংলাদেশ মার্কেট মনিটর' : 'BD Market Monitor'}
                </span>
              </div>
            </button>

            <button
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Section */}
          <div className="px-3.5 pt-5">
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'bn' ? 'মেনু নেভিগেশন' : 'Market Sectors'}
            </p>
            <nav>
              <ul className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isActive
                              ? 'bg-white/15 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Icon size={17} />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm font-bold leading-tight truncate">
                            {lang === 'bn' ? item.labelBn : item.labelEn}
                          </span>
                          <span
                            className={`block text-[11px] mt-0.5 truncate ${
                              isActive ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {lang === 'bn' ? item.descBn : item.descEn}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Info & Language Switcher */}
        <div className="p-4 border-t border-slate-200/80 space-y-3 bg-slate-50/50">
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200/80">
            <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {lang === 'bn'
                ? 'তথ্যসূত্র: টিসিবি, বাজুস ও খোলা বাজারের সর্বশেষ আপডেট।'
                : 'Sources: TCB, BAJUS & Open Market verified rates.'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
              <Globe size={12} />
              <span>{lang === 'bn' ? 'ভাষা নির্বাচন করুন' : 'Display Language'}</span>
            </div>
            <div className="grid grid-cols-2 bg-slate-200/70 rounded-xl p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLang && setLang('bn')}
                className={`py-2 rounded-lg transition-all ${
                  lang === 'bn'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLang && setLang('en')}
                className={`py-2 rounded-lg transition-all ${
                  lang === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Search,
  Calculator,
  Minus,
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const LIVE_EXCHANGE_API_URL = `${API_BASE_URL}/api/exchange-rates`;

const INITIAL_RATES = [
  { code: 'USD', nameBn: 'মার্কিন ডলার', nameEn: 'US Dollar', flag: '🇺🇸', buy: 121.8, sell: 122.5, priceChange: 0 },
  { code: 'EUR', nameBn: 'ইউরো', nameEn: 'Euro', flag: '🇪🇺', buy: 131.9, sell: 132.8, priceChange: 0 },
  { code: 'GBP', nameBn: 'ব্রিটিশ পাউন্ড', nameEn: 'British Pound', flag: '🇬🇧', buy: 154.2, sell: 155.4, priceChange: 0 },
  { code: 'SAR', nameBn: 'সৌদি রিয়াল', nameEn: 'Saudi Riyal', flag: '🇸🇦', buy: 32.35, sell: 32.65, priceChange: 0 },
  { code: 'AED', nameBn: 'আমিরাত দিরহাম', nameEn: 'UAE Dirham', flag: '🇦🇪', buy: 33.05, sell: 33.35, priceChange: 0 },
  { code: 'QAR', nameBn: 'কাতারি রিয়াল', nameEn: 'Qatari Riyal', flag: '🇶🇦', buy: 33.3, sell: 33.6, priceChange: 0 },
  { code: 'KWD', nameBn: 'কুয়েতি দিনার', nameEn: 'Kuwaiti Dinar', flag: '🇰🇼', buy: 396.5, sell: 398.5, priceChange: 0 },
  { code: 'MYR', nameBn: 'মালয়েশিয়ান রিঙ্গিত', nameEn: 'Malaysian Ringgit', flag: '🇲🇾', buy: 27.5, sell: 27.8, priceChange: 0 },
  { code: 'SGD', nameBn: 'সিঙ্গাপুর ডলার', nameEn: 'Singapore Dollar', flag: '🇸🇬', buy: 90.5, sell: 91.2, priceChange: 0 },
  { code: 'INR', nameBn: 'ভারতীয় রুপি', nameEn: 'Indian Rupee', flag: '🇮🇳', buy: 1.42, sell: 1.45, priceChange: 0 },
];

const ExchangeRatesPage = ({ lang = 'bn' }) => {
  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('bd_live_exchange_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((item) => ({
        ...item,
        buy: Number(item.buy),
        sell: Number(item.sell),
        priceChange: Number(item.priceChange || 0),
      }));
    }
    return INITIAL_RATES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('100');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isBdtToForeign, setIsBdtToForeign] = useState(false);

  const syncExchangeRates = useCallback(async () => {
    try {
      const res = await fetch(LIVE_EXCHANGE_API_URL, { cache: 'no-store' });
      if (!res.ok) return;

      const data = await res.json();
      const latestRates = data.rates || {};

      setRates((prevRates) => {
        let hasUpdated = false;

        const nextRates = prevRates.map((item) => {
          const newSell = Number(latestRates[item.code]);

          if (newSell && newSell !== item.sell) {
            hasUpdated = true;
            const diff = Number((newSell - item.sell).toFixed(2));
            return {
              ...item,
              buy: Number((item.buy + diff).toFixed(2)),
              sell: Number(newSell.toFixed(2)),
              priceChange: diff,
            };
          }
          return item;
        });

        if (hasUpdated) {
          localStorage.setItem('bd_live_exchange_v2', JSON.stringify(nextRates));
          return nextRates;
        }
        return prevRates;
      });
    } catch (error) {
      console.error('Exchange rate sync error:', error);
    }
  }, []);

  useEffect(() => {
    syncExchangeRates();
    const interval = setInterval(syncExchangeRates, 15000);
    const handleFocus = () => syncExchangeRates();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncExchangeRates]);

  const convertedResult = useMemo(() => {
    const activeRate = rates.find((r) => r.code === selectedCurrency) || rates[0];
    const numericAmount = parseFloat(amount) || 0;

    if (isBdtToForeign) {
      return (numericAmount / activeRate.sell).toFixed(2);
    }
    return (numericAmount * activeRate.buy).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [rates, selectedCurrency, amount, isBdtToForeign]);

  const filteredRates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return rates;
    return rates.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.nameBn.toLowerCase().includes(q) ||
        r.nameEn.toLowerCase().includes(q)
    );
  }, [rates, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Unified Clean Fintech Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            {lang === 'bn' ? 'বাংলাদেশ মুদ্রা বিনিময় হার' : 'Bangladesh Currency Exchange'}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {lang === 'bn' ? 'মুদ্রা বিনিময় দর (ওপেন মার্কেট)' : 'Exchange Rates (Open Market)'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'bn'
              ? 'খোলা বাজারের ক্রয় ও বিক্রয় হার • রেট বাড়লে বা কমলে স্বয়ংক্রিয়ভাবে আপডেট হবে'
              : 'Open market buy & sell rates • Auto-updates on rate fluctuation'}
          </p>
        </div>

        {rates[0] && (
          <div className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80 self-start">
            <span className="text-2xl">🇺🇸</span>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">
                {lang === 'bn' ? '১ মার্কিন ডলার (USD)' : '1 US Dollar (USD)'}
              </p>
              <p className="text-xl font-extrabold text-slate-900 tabular-nums">
                ৳ {Number(rates[0].sell).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fintech Currency Converter */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 mb-4">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Calculator size={16} />
          </div>
          <span>{lang === 'bn' ? 'তাৎক্ষণিক মুদ্রা রূপান্তর ক্যালকুলেটর' : 'Instant Currency Converter'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              {isBdtToForeign
                ? lang === 'bn'
                  ? 'টাকার পরিমাণ (BDT)'
                  : 'Amount in BDT (৳)'
                : lang === 'bn'
                ? 'বিদেশি মুদ্রার পরিমাণ'
                : 'Foreign Amount'}
            </label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 tabular-nums"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              {lang === 'bn' ? 'মুদ্রা নির্বাচন করুন' : 'Select Currency'}
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
            >
              {rates.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.flag} {r.code} - {lang === 'bn' ? r.nameBn : r.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 flex justify-center md:pt-6">
            <button
              type="button"
              onClick={() => setIsBdtToForeign((prev) => !prev)}
              title={lang === 'bn' ? 'দিক পরিবর্তন করুন' : 'Swap Direction'}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white border border-slate-200/80 transition-colors"
            >
              <ArrowRightLeft size={17} />
            </button>
          </div>

          <div className="md:col-span-4 bg-blue-600 text-white rounded-xl px-4 py-3 shadow-sm shadow-blue-600/20">
            <p className="text-[11px] font-medium text-blue-100">
              {isBdtToForeign
                ? lang === 'bn'
                  ? `প্রাপ্ত ${selectedCurrency} (বিক্রয় হার অনুযায়ী)`
                  : `Converted ${selectedCurrency} (Sell Rate)`
                : lang === 'bn'
                ? 'বাংলাদেশি টাকায় (ক্রয় হার অনুযায়ী)'
                : 'In Bangladeshi Taka (Buy Rate)'}
            </p>
            <p className="text-xl font-extrabold text-white mt-0.5 tabular-nums">
              {isBdtToForeign ? `${convertedResult} ${selectedCurrency}` : `৳ ${convertedResult}`}
            </p>
          </div>
        </div>
      </div>

      {/* Exchange Rates Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-slate-900 text-base">
            {lang === 'bn' ? 'আজকের মুদ্রা তালিকা' : "Today's Currency List"}
          </h3>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'মুদ্রা খুঁজুন (USD, রিয়াল)...' : 'Search (USD, Riyal)...'}
              className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="p-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {lang === 'bn' ? 'মুদ্রা' : 'Currency'}
                </th>
                <th className="p-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {lang === 'bn' ? 'অবস্থা' : 'Status'}
                </th>
                <th className="p-4 text-xs font-extrabold uppercase tracking-wider text-slate-500 text-right">
                  {lang === 'bn' ? 'ক্রয় মূল্য (BDT)' : 'We Buy (BDT)'}
                </th>
                <th className="p-4 text-xs font-extrabold uppercase tracking-wider text-slate-500 text-right">
                  {lang === 'bn' ? 'বিক্রয় মূল্য (BDT)' : 'We Sell (BDT)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRates.map((rate) => (
                <tr key={rate.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <span className="text-2xl">{rate.flag}</span>
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{rate.code}</p>
                      <p className="text-xs text-slate-500">
                        {lang === 'bn' ? rate.nameBn : rate.nameEn}
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    {rate.priceChange > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/70 tabular-nums">
                        <TrendingUp size={12} />
                        +৳{Number(rate.priceChange).toFixed(2)}
                      </span>
                    ) : rate.priceChange < 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 tabular-nums">
                        <TrendingDown size={12} />
                        -৳{Math.abs(Number(rate.priceChange)).toFixed(2)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        <Minus size={11} />
                        {lang === 'bn' ? 'স্থিতিশীল' : 'Stable'}
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right font-bold text-slate-700 tabular-nums">
                    ৳ {Number(rate.buy).toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-extrabold text-slate-900 text-base tabular-nums">
                    <span className="text-blue-600 mr-0.5">৳</span>
                    {Number(rate.sell).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRatesPage;
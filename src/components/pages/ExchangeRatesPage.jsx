import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  Sparkles,
  Calculator,
} from 'lucide-react';

const INITIAL_RATES = [
  { code: 'USD', nameBn: 'মার্কিন ডলার', nameEn: 'US Dollar', flag: '🇺🇸', buy: 121.80, sell: 122.50, priceChange: 0 },
  { code: 'EUR', nameBn: 'ইউরো', nameEn: 'Euro', flag: '🇪🇺', buy: 131.90, sell: 132.80, priceChange: 0 },
  { code: 'GBP', nameBn: 'ব্রিটিশ পাউন্ড', nameEn: 'British Pound', flag: '🇬🇧', buy: 154.20, sell: 155.40, priceChange: 0 },
  { code: 'SAR', nameBn: 'সৌদি রিয়াল', nameEn: 'Saudi Riyal', flag: '🇸🇦', buy: 32.35, sell: 32.65, priceChange: 0 },
  { code: 'AED', nameBn: 'আমিরাত দিরহাম', nameEn: 'UAE Dirham', flag: '🇦🇪', buy: 33.05, sell: 33.35, priceChange: 0 },
  { code: 'QAR', nameBn: 'কাতারি রিয়াল', nameEn: 'Qatari Riyal', flag: '🇶🇦', buy: 33.30, sell: 33.60, priceChange: 0 },
  { code: 'KWD', nameBn: 'কুয়েতি দিনার', nameEn: 'Kuwaiti Dinar', flag: '🇰🇼', buy: 396.50, sell: 398.50, priceChange: 0 },
  { code: 'MYR', nameBn: 'মালয়েশিয়ান রিঙ্গিত', nameEn: 'Malaysian Ringgit', flag: '🇲🇾', buy: 27.50, sell: 27.80, priceChange: 0 },
  { code: 'SGD', nameBn: 'সিঙ্গাপুর ডলার', nameEn: 'Singapore Dollar', flag: '🇸🇬', buy: 90.50, sell: 91.20, priceChange: 0 },
  { code: 'INR', nameBn: 'ভারতীয় রুপি', nameEn: 'Indian Rupee', flag: '🇮🇳', buy: 1.42, sell: 1.45, priceChange: 0 },
];

const LIVE_EXCHANGE_API_URL = 'http://localhost:8000/api/exchange-rates';

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
    if (!LIVE_EXCHANGE_API_URL) return;

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
    <div className="animate-fadeIn space-y-6">
      {/* হিরো ব্যানার */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-6 md:p-7 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-200 border border-white/10 mb-3">
              <Sparkles size={13} />
              <span>{lang === 'bn' ? 'বাংলাদেশ মুদ্রা বিনিময় হার' : 'Bangladesh Currency Exchange'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {lang === 'bn' ? 'মুদ্রা বিনিময় দর (ওপেন মার্কেট)' : 'Exchange Rates (Open Market)'}
            </h2>
            <p className="text-sm text-slate-300 mt-1.5 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>
                {lang === 'bn'
                  ? 'স্থিতিশীল বিনিময় হার • রেট বাড়লে বা কমলে স্বয়ংক্রিয়ভাবে আপডেট হবে'
                  : 'Stable Exchange Rate • Auto-updates when rate increases or decreases'}
              </span>
            </p>
          </div>

          {rates[0] && (
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 px-5 py-3.5 shrink-0">
              <p className="text-xs text-blue-200 flex items-center gap-1.5">
                <span>🇺🇸</span>
                <span>{lang === 'bn' ? '১ মার্কিন ডলার (USD)' : '1 US Dollar (USD)'}</span>
              </p>
              <p className="text-2xl font-extrabold text-white mt-0.5">
                ৳ {Number(rates[0].sell).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* কুইক কারেন্সি কনভার্টার ক্যালকুলেটর */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-4">
          <Calculator size={17} className="text-blue-600" />
          <span>{lang === 'bn' ? 'মুদ্রা রূপান্তর ক্যালকুলেটর' : 'Quick Currency Converter'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">
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
              className="w-full px-3.5 py-2.5 text-sm font-bold text-gray-900 bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {lang === 'bn' ? 'মুদ্রা নির্বাচন করুন' : 'Select Currency'}
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-semibold text-gray-800 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              {rates.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.flag} {r.code} - {lang === 'bn' ? r.nameBn : r.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 flex justify-center md:pt-5">
            <button
              type="button"
              onClick={() => setIsBdtToForeign((prev) => !prev)}
              title={lang === 'bn' ? 'দিক পরিবর্তন করুন' : 'Swap Direction'}
              className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <ArrowRightLeft size={18} />
            </button>
          </div>

          <div className="md:col-span-4 bg-slate-900 text-white rounded-xl px-4 py-3">
            <p className="text-[11px] text-slate-400">
              {isBdtToForeign
                ? lang === 'bn'
                  ? `প্রাপ্ত ${selectedCurrency}`
                  : `Converted ${selectedCurrency}`
                : lang === 'bn'
                ? 'বাংলাদেশি টাকায় (ক্রয় হার অনুযায়ী)'
                : 'In Bangladeshi Taka (Buy Rate)'}
            </p>
            <p className="text-xl font-extrabold text-emerald-400 mt-0.5">
              {isBdtToForeign ? `${convertedResult} ${selectedCurrency}` : `৳ ${convertedResult}`}
            </p>
          </div>
        </div>
      </div>

      {/* সার্চ ও মুদ্রা তালিকা টেবিল */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-gray-800 text-base">
            {lang === 'bn' ? 'আজকের মুদ্রা তালিকা' : "Today's Currency List"}
          </h3>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'মুদ্রা খুঁজুন (USD, রিয়াল)...' : 'Search (USD, Riyal)...'}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  {lang === 'bn' ? 'মুদ্রা' : 'Currency'}
                </th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  {lang === 'bn' ? 'অবস্থা' : 'Status'}
                </th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">
                  {lang === 'bn' ? 'ক্রয় মূল্য (BDT)' : 'We Buy (BDT)'}
                </th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">
                  {lang === 'bn' ? 'বিক্রয় মূল্য (BDT)' : 'We Sell (BDT)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRates.map((rate) => (
                <tr key={rate.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <span className="text-2xl">{rate.flag}</span>
                    <div>
                      <p className="font-bold text-gray-800">{rate.code}</p>
                      <p className="text-xs text-gray-500">
                        {lang === 'bn' ? rate.nameBn : rate.nameEn}
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    {rate.priceChange > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">
                        <TrendingUp size={13} />
                        +৳{Number(rate.priceChange).toFixed(2)}
                      </span>
                    ) : rate.priceChange < 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        <TrendingDown size={13} />
                        -৳{Math.abs(Number(rate.priceChange)).toFixed(2)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        <CheckCircle2 size={12} />
                        {lang === 'bn' ? 'স্থিতিশীল' : 'Stable'}
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right font-semibold text-gray-800">
                    ৳ {Number(rate.buy).toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-extrabold text-gray-900">
                    ৳ {Number(rate.sell).toFixed(2)}
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
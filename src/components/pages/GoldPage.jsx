import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  Calculator,
  Scale,
  Receipt,
  BadgeCheck,
  Minus,
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const LIVE_GOLD_API_URL = `${API_BASE_URL}/api/gold-prices`;

const OFFICIAL_BAJUS_PRICES = [
  {
    id: '22k',
    karatCode: '22K',
    purityBn: '৯১.৬% বিশুদ্ধ',
    purityEn: '91.6% Pure',
    typeEn: '22 Karat (Hallmark)',
    typeBn: '২২ ক্যারেট (হলমার্ক)',
    descBn: 'সর্বোচ্চ বিশুদ্ধ ও আধুনিক গহনার জন্য সর্বাধিক প্রচলিত',
    descEn: 'Highest purity standard for fine jewelry',
    price: 194964,
    priceChange: 0,
    badgeBg: 'bg-amber-500 text-white',
    purityBadge: 'bg-amber-50 text-amber-700 border-amber-200/70',
    accentText: 'text-amber-600',
    activeRing: 'border-amber-500 ring-2 ring-amber-500/15',
  },
  {
    id: '21k',
    karatCode: '21K',
    purityBn: '৮৭.৫% বিশুদ্ধ',
    purityEn: '87.5% Pure',
    typeEn: '21 Karat (Hallmark)',
    typeBn: '২১ ক্যারেট (হলমার্ক)',
    descBn: 'টেকসই ও ঐতিহ্যবাহী নকশার গহনার জন্য উপযুক্ত',
    descEn: 'Suited for durable & traditional jewelry',
    price: 186100,
    priceChange: 0,
    badgeBg: 'bg-orange-500 text-white',
    purityBadge: 'bg-orange-50 text-orange-700 border-orange-200/70',
    accentText: 'text-orange-600',
    activeRing: 'border-orange-500 ring-2 ring-orange-500/15',
  },
  {
    id: '18k',
    karatCode: '18K',
    purityBn: '৭৫.০% বিশুদ্ধ',
    purityEn: '75.0% Pure',
    typeEn: '18 Karat (Hallmark)',
    typeBn: '১৮ ক্যারেট (হলমার্ক)',
    descBn: 'পাথর বসানো ও হালকা নকশার গহনার জন্য ব্যবহৃত',
    descEn: 'Used for stone-studded & lightweight designs',
    price: 159517,
    priceChange: 0,
    badgeBg: 'bg-blue-600 text-white',
    purityBadge: 'bg-blue-50 text-blue-700 border-blue-200/70',
    accentText: 'text-blue-600',
    activeRing: 'border-blue-600 ring-2 ring-blue-600/15',
  },
  {
    id: 'traditional',
    karatCode: 'OLD',
    purityBn: 'প্রচলিত মান',
    purityEn: 'Traditional',
    typeEn: 'Traditional Gold (সনাতন)',
    typeBn: 'সনাতন পদ্ধতির স্বর্ণ',
    descBn: 'পুরাতন স্বর্ণ গলিয়ে প্রস্তুতকৃত প্রচলিত মান',
    descEn: 'Traditional standard refined from old gold',
    price: 132678,
    priceChange: 0,
    badgeBg: 'bg-slate-700 text-white',
    purityBadge: 'bg-slate-100 text-slate-700 border-slate-200',
    accentText: 'text-slate-700',
    activeRing: 'border-slate-700 ring-2 ring-slate-700/15',
  },
];

const BHORI_IN_GRAMS = 11.664;
const BHORI_IN_ANA = 16;

const GoldPage = ({ lang = 'bn' }) => {
  const [prices, setPrices] = useState(() => {
    const saved = localStorage.getItem('bd_live_gold_prices_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((item) => {
        const base = OFFICIAL_BAJUS_PRICES.find((b) => b.id === item.id) || {};
        return {
          ...base,
          ...item,
          price: Number(item.price),
          priceChange: Number(item.priceChange || 0),
        };
      });
    }
    return OFFICIAL_BAJUS_PRICES;
  });

  const [unit, setUnit] = useState('bhori');
  const [selectedKarat, setSelectedKarat] = useState('22k');
  const [quantity, setQuantity] = useState('1');
  const [includeVat, setIncludeVat] = useState(true);
  const [includeMaking, setIncludeMaking] = useState(true);

  const checkPriceUpdate = useCallback(async () => {
    try {
      const res = await fetch(LIVE_GOLD_API_URL, { cache: 'no-store' });
      if (!res.ok) return;

      const latestData = await res.json();

      setPrices((prevPrices) => {
        let hasChanged = false;

        const updated = prevPrices.map((item) => {
          const newPrice = Number(latestData[item.id]);

          if (newPrice && newPrice !== item.price) {
            hasChanged = true;
            return {
              ...item,
              priceChange: newPrice - item.price,
              price: newPrice,
            };
          }
          return item;
        });

        if (hasChanged) {
          localStorage.setItem('bd_live_gold_prices_v2', JSON.stringify(updated));
          return updated;
        }
        return prevPrices;
      });
    } catch (error) {
      console.error('Gold price sync error:', error);
    }
  }, []);

  useEffect(() => {
    checkPriceUpdate();
    const interval = setInterval(checkPriceUpdate, 15000);
    const handleFocus = () => checkPriceUpdate();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkPriceUpdate]);

  const convertByUnit = useCallback(
    (bhoriAmount) => {
      if (unit === 'ana') return Math.round(bhoriAmount / BHORI_IN_ANA);
      if (unit === 'gram') return Math.round(bhoriAmount / BHORI_IN_GRAMS);
      return bhoriAmount;
    },
    [unit]
  );

  const breakdown = useMemo(() => {
    const activeGold = prices.find((p) => p.id === selectedKarat) || prices[0];
    const qty = Math.max(0, parseFloat(quantity) || 0);

    const exactUnitRate =
      unit === 'ana'
        ? activeGold.price / BHORI_IN_ANA
        : unit === 'gram'
        ? activeGold.price / BHORI_IN_GRAMS
        : activeGold.price;

    const basePrice = Math.round(exactUnitRate * qty);
    const vatAmount = includeVat ? Math.round(basePrice * 0.05) : 0;
    const makingCharge = includeMaking ? Math.round(basePrice * 0.06) : 0;
    const total = basePrice + vatAmount + makingCharge;

    return { basePrice, vatAmount, makingCharge, total };
  }, [prices, selectedKarat, quantity, unit, includeVat, includeMaking]);

  const quickPresets = [
    { labelBn: '১ আনা', labelEn: '1 Ana', targetUnit: 'ana', qty: '1' },
    { labelBn: '৪ আনা (সিকি)', labelEn: '4 Ana', targetUnit: 'ana', qty: '4' },
    { labelBn: '৮ আনা (আধা ভরি)', labelEn: '8 Ana', targetUnit: 'ana', qty: '8' },
    { labelBn: '১ ভরি', labelEn: '1 Bhori', targetUnit: 'bhori', qty: '1' },
    { labelBn: '১০ গ্রাম', labelEn: '10 Gram', targetUnit: 'gram', qty: '10' },
  ];

  const getUnitSubtitle = () => {
    if (unit === 'ana') {
      return lang === 'bn' ? 'প্রতি ১ আনা (১৬ আনায় ১ ভরি)' : 'Per 1 Ana (16 Ana = 1 Bhori)';
    }
    if (unit === 'gram') {
      return lang === 'bn' ? 'প্রতি ১ গ্রাম' : 'Per 1 Gram';
    }
    return lang === 'bn' ? 'প্রতি ১ ভরি (১১.৬৬৪ গ্রাম)' : 'Per 1 Bhori (11.664g)';
  };

  return (
    <div className="space-y-6">
      {/* Header & Unit Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            {lang === 'bn'
              ? 'বাংলাদেশ জুয়েলার্স অ্যাসোসিয়েশন (BAJUS)'
              : 'Bangladesh Jewellers Association (BAJUS)'}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {lang === 'bn' ? 'আজকের স্বর্ণের বাজারদর' : "Today's Gold Market Price"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'bn'
              ? 'ভরি, আনা বা গ্রাম নির্বাচন করে প্রতি এককের নির্ধারিত দাম দেখুন'
              : 'Select Bhori, Ana, or Gram to view exact unit rates'}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5">
          <span className="text-[11px] font-bold text-slate-400">
            {lang === 'bn' ? 'পরিমাপের একক:' : 'Weight Unit:'}
          </span>
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 self-start">
            {[
              { id: 'bhori', bn: 'প্রতি ভরি', en: 'Per Bhori' },
              { id: 'ana', bn: 'প্রতি আনা', en: 'Per Ana' },
              { id: 'gram', bn: 'প্রতি গ্রাম', en: 'Per Gram' },
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setUnit(u.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  unit === u.id
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'bn' ? u.bn : u.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Karat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prices.map((gold) => {
          const displayPrice = convertByUnit(gold.price);
          const displayChange = convertByUnit(gold.priceChange);
          const perAnaRef = Math.round(gold.price / BHORI_IN_ANA);
          const perGramRef = Math.round(gold.price / BHORI_IN_GRAMS);
          const isSelected = selectedKarat === gold.id;

          return (
            <div
              key={gold.id}
              onClick={() => setSelectedKarat(gold.id)}
              className={`cursor-pointer bg-white p-6 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md ${
                isSelected ? gold.activeRing : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-11 w-11 rounded-xl ${gold.badgeBg} flex items-center justify-center font-extrabold text-xs tracking-wider shrink-0 shadow-xs`}
                  >
                    {gold.karatCode}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-900">
                        {lang === 'bn' ? gold.typeBn : gold.typeEn}
                      </h2>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${gold.purityBadge}`}
                      >
                        {lang === 'bn' ? gold.purityBn : gold.purityEn}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'bn' ? gold.descBn : gold.descEn}
                    </p>
                  </div>
                </div>

                {displayChange > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/70 tabular-nums shrink-0">
                    <TrendingUp size={12} />
                    +৳{displayChange.toLocaleString('en-IN')}
                  </span>
                ) : displayChange < 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 tabular-nums shrink-0">
                    <TrendingDown size={12} />
                    -৳{Math.abs(displayChange).toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                    <Minus size={11} />
                    {lang === 'bn' ? 'স্থিতিশীল' : 'Stable'}
                  </span>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-1">
                    {getUnitSubtitle()}
                  </span>
                  <div className="flex items-baseline gap-1 tabular-nums">
                    <span className={`text-lg font-extrabold ${gold.accentText}`}>৳</span>
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {displayPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500 space-y-0.5 tabular-nums bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  {unit !== 'ana' && (
                    <p>
                      {lang === 'bn' ? '১ আনা:' : '1 Ana:'}{' '}
                      <strong className="text-slate-900">
                        ৳{perAnaRef.toLocaleString('en-IN')}
                      </strong>
                    </p>
                  )}
                  {unit !== 'gram' && (
                    <p>
                      {lang === 'bn' ? '১ গ্রাম:' : '1 Gram:'}{' '}
                      <strong className="text-slate-900">
                        ৳{perGramRef.toLocaleString('en-IN')}
                      </strong>
                    </p>
                  )}
                  {unit !== 'bhori' && (
                    <p>
                      {lang === 'bn' ? '১ ভরি:' : '1 Bhori:'}{' '}
                      <strong className="text-slate-900">
                        ৳{gold.price.toLocaleString('en-IN')}
                      </strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Jewelry Cost Calculator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Calculator size={16} />
              </div>
              <span>
                {lang === 'bn'
                  ? 'গহনা কেনার আনুমানিক খরচ ক্যালকুলেটর'
                  : 'Jewelry Cost Estimator'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'bn'
                ? 'ওজন লিখুন অথবা প্রিসেট বাটনে ক্লিক করে ভ্যাট ও মজুরিসহ মোট খরচ দেখুন'
                : 'Enter weight or pick a preset to calculate total cost with VAT & making charge'}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {quickPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUnit(preset.targetUnit);
                  setQuantity(preset.qty);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white transition-colors"
              >
                {lang === 'bn' ? preset.labelBn : preset.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              {lang === 'bn' ? '১. স্বর্ণের মান (ক্যারেট)' : '1. Gold Purity (Karat)'}
            </label>
            <select
              value={selectedKarat}
              onChange={(e) => setSelectedKarat(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
            >
              {prices.map((g) => (
                <option key={g.id} value={g.id}>
                  {lang === 'bn' ? g.typeBn : g.typeEn}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              {lang === 'bn' ? '২. ওজনের পরিমাণ লিখুন' : '2. Enter Weight Quantity'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.25"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full pl-3.5 pr-16 py-2.5 text-sm font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 tabular-nums"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                {unit === 'bhori'
                  ? lang === 'bn'
                    ? 'ভরি'
                    : 'Bhori'
                  : unit === 'ana'
                  ? lang === 'bn'
                    ? 'আনা'
                    : 'Ana'
                  : lang === 'bn'
                  ? 'গ্রাম'
                  : 'Gram'}
              </span>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeVat}
                onChange={(e) => setIncludeVat(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span>
                {lang === 'bn' ? '৫% সরকারি ভ্যাট যোগ করুন' : 'Add 5% Govt. VAT'}
              </span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeMaking}
                onChange={(e) => setIncludeMaking(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span>
                {lang === 'bn'
                  ? '৬% ন্যূনতম মজুরি যোগ করুন'
                  : 'Add 6% Min. Making Charge'}
              </span>
            </label>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 tabular-nums">
            <span className="text-[11px] font-semibold text-slate-500 block">
              {lang === 'bn' ? 'স্বর্ণের মূল দাম' : 'Base Gold Price'}
            </span>
            <span className="text-base font-extrabold text-slate-900 mt-1 block">
              ৳ {breakdown.basePrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 tabular-nums">
            <span className="text-[11px] font-semibold text-slate-500 block">
              {lang === 'bn' ? 'সরকারি ভ্যাট (৫%)' : 'Govt. VAT (5%)'}
            </span>
            <span className="text-base font-extrabold text-slate-900 mt-1 block">
              ৳ {breakdown.vatAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 tabular-nums">
            <span className="text-[11px] font-semibold text-slate-500 block">
              {lang === 'bn' ? 'ন্যূনতম মজুরি (৬%)' : 'Min. Making (6%)'}
            </span>
            <span className="text-base font-extrabold text-slate-900 mt-1 block">
              ৳ {breakdown.makingCharge.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-blue-600 text-white tabular-nums flex flex-col justify-center shadow-sm shadow-blue-600/20">
            <span className="text-[11px] font-medium text-blue-100 flex items-center gap-1">
              <Coins size={13} />
              {lang === 'bn' ? 'সর্বমোট আনুমানিক মূল্য' : 'Total Estimated Cost'}
            </span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">
              ৳ {breakdown.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Info Guides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Scale size={18} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">
              {lang === 'bn' ? 'স্বর্ণের ওজনের সহজ হিসাব' : 'Gold Weight Conversion'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {lang === 'bn'
                ? '১ ভরি = ১৬ আনা = ৯৬ রতি = ১১.৬৬৪ গ্রাম। অর্থাৎ ১ আনা সমান ০.৭২৯ গ্রাম।'
                : '1 Bhori = 16 Ana = 96 Rati = 11.664 Grams (1 Ana = 0.729g).'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Receipt size={18} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">
              {lang === 'bn' ? 'ভ্যাট ও মজুরি নিয়মাবলি' : 'VAT & Making Rules'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {lang === 'bn'
                ? 'বাজুস নির্দেশনা অনুযায়ী গহনা কেনার সময় মূল দামের সাথে ৫% ভ্যাট ও ন্যূনতম ৬% মজুরি প্রযোজ্য।'
                : 'Per BAJUS guidelines, 5% Govt. VAT and minimum 6% making charge apply on jewelry purchases.'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <BadgeCheck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">
              {lang === 'bn' ? 'হলমার্ক ও রশিদ যাচাই' : 'Hallmark & Invoice'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {lang === 'bn'
                ? 'ক্রয়ের সময় গহনায় ক্যারেট হলমার্ক সিল দেখে নিন এবং পাকা ক্যাশ মেমো বুঝে নিন।'
                : 'Always verify the karat hallmark stamp on jewelry and collect an official receipt.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldPage;
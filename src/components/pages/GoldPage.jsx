import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  Calculator,
  Scale,
  Receipt,
  BadgeCheck,
} from 'lucide-react';

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
    // ১. সোনালি হলুদ (খুবই হালকা অপাসিটি + সফট শ্যাডো)
    cardBg: 'bg-amber-50/20',
    cardBorder: 'border-amber-200/50 hover:border-amber-300',
    cardShadow: 'shadow-md shadow-amber-500/5 hover:shadow-lg hover:shadow-amber-500/10',
    activeRing: 'border-amber-400/70 ring-2 ring-amber-400/15',
    karatBg: 'bg-amber-600/85 text-white',
    purityBadge: 'bg-amber-100/50 text-amber-800',
    currencyText: 'text-amber-600',
    dividerBorder: 'border-amber-200/40',
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
    // ২. হালকা কমলা (Low Opacity + Soft Orange Shadow)
    cardBg: 'bg-orange-50/35',
    cardBorder: 'border-orange-200/70 hover:border-orange-400',
    cardShadow: 'shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/15',
    activeRing: 'border-orange-500/80 ring-2 ring-orange-500/15',
    karatBg: 'bg-orange-600/90 text-white',
    purityBadge: 'bg-orange-100/60 text-orange-800',
    currencyText: 'text-orange-600',
    dividerBorder: 'border-orange-200/50',
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
    // ৩. আকাশি নীল (Low Opacity + Soft Sky Shadow)
    cardBg: 'bg-sky-50/35',
    cardBorder: 'border-sky-200/70 hover:border-sky-400',
    cardShadow: 'shadow-md shadow-sky-500/10 hover:shadow-lg hover:shadow-sky-500/15',
    activeRing: 'border-sky-500/80 ring-2 ring-sky-500/15',
    karatBg: 'bg-sky-600/90 text-white',
    purityBadge: 'bg-sky-100/60 text-sky-800',
    currencyText: 'text-sky-600',
    dividerBorder: 'border-sky-200/50',
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
    // ৪. ক্লাসিক স্টোন (Low Opacity + Soft Stone Shadow)
    cardBg: 'bg-stone-100/40',
    cardBorder: 'border-stone-200/80 hover:border-stone-400',
    cardShadow: 'shadow-md shadow-stone-500/10 hover:shadow-lg hover:shadow-stone-500/15',
    activeRing: 'border-stone-500/80 ring-2 ring-stone-500/15',
    karatBg: 'bg-stone-700/90 text-white',
    purityBadge: 'bg-stone-200/60 text-stone-800',
    currencyText: 'text-stone-700',
    dividerBorder: 'border-stone-200/60',
  },
];

const BHORI_IN_GRAMS = 11.664;
const BHORI_IN_ANA = 16;
const LIVE_GOLD_API_URL = 'http://localhost:8000/api/gold-prices';

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

  const [unit, setUnit] = useState('bhori'); // 'bhori' | 'ana' | 'gram'
  const [selectedKarat, setSelectedKarat] = useState('22k');
  const [quantity, setQuantity] = useState('1');
  const [includeVat, setIncludeVat] = useState(true);
  const [includeMaking, setIncludeMaking] = useState(true);

  const checkPriceUpdate = useCallback(async () => {
    if (!LIVE_GOLD_API_URL) return;

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
      return lang === 'bn' ? 'প্রতি ১ আনা (১৬ আনায় ১ ভরি)' : 'Per 1 Ana (16 Ana = 1 Bhori)';
    }
    if (unit === 'gram') {
      return lang === 'bn' ? 'প্রতি ১ গ্রাম' : 'Per 1 Gram';
    }
    return lang === 'bn' ? 'প্রতি ১ ভরি (১১.৬৬৪ গ্রাম)' : 'Per 1 Bhori (11.664g)';
  };

  return (
    <div className="space-y-6">
      {/* ১. হেডার ও সহজ ইউনিট সুইচার (ভরি / আনা / গ্রাম) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            {lang === 'bn'
              ? 'বাংলাদেশ জুয়েলার্স অ্যাসোসিয়েশন (BAJUS)'
              : 'Bangladesh Jewellers Association (BAJUS)'}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {lang === 'bn' ? 'আজকের স্বর্ণের বাজারদর' : "Today's Gold Market Price"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'bn'
              ? 'নিচের বাটন থেকে ভরি, আনা বা গ্রাম নির্বাচন করে সহজেই প্রতি এককের দাম দেখুন'
              : 'Switch between Bhori, Ana, or Gram below to view exact unit rates'}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5">
          <span className="text-[11px] font-medium text-slate-400">
            {lang === 'bn' ? 'পরিমাপের একক নির্বাচন করুন:' : 'Select Weight Unit:'}
          </span>
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start">
            <button
              type="button"
              onClick={() => setUnit('bhori')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                unit === 'bhori'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? 'প্রতি ভরি' : 'Per Bhori'}
            </button>
            <button
              type="button"
              onClick={() => setUnit('ana')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                unit === 'ana'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? 'প্রতি আনা' : 'Per Ana'}
            </button>
            <button
              type="button"
              onClick={() => setUnit('gram')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                unit === 'gram'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? 'প্রতি গ্রাম' : 'Per Gram'}
            </button>
          </div>
        </div>
      </div>

      {/* ২. ৪টি লো-অপাসিটি রঙ ও সফট শ্যাডোযুক্ত গোল্ড কার্ড */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              className={`cursor-pointer backdrop-blur-xs ${gold.cardBg} ${gold.cardShadow} p-6 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                isSelected ? gold.activeRing : gold.cardBorder
              }`}
            >
              {/* কার্ডের উপরের অংশ */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-11 w-11 rounded-lg ${gold.karatBg} flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-sm`}
                  >
                    {gold.karatCode}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">
                        {lang === 'bn' ? gold.typeBn : gold.typeEn}
                      </h2>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${gold.purityBadge}`}
                      >
                        {lang === 'bn' ? gold.purityBn : gold.purityEn}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {lang === 'bn' ? gold.descBn : gold.descEn}
                    </p>
                  </div>
                </div>

                {/* দাম বাড়া/কমার ব্যাজ */}
                {displayChange > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-600 text-white tabular-nums shrink-0 shadow-xs">
                    <TrendingUp size={12} />
                    +৳{displayChange.toLocaleString('en-IN')}
                  </span>
                ) : displayChange < 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-rose-600 text-white tabular-nums shrink-0 shadow-xs">
                    <TrendingDown size={12} />
                    -৳{Math.abs(displayChange).toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded bg-white/75 text-slate-600 border border-slate-200/60 shrink-0">
                    {lang === 'bn' ? 'স্থিতিশীল' : 'Stable'}
                  </span>
                )}
              </div>

              {/* কার্ডের মূল দাম */}
              <div
                className={`mt-5 pt-4 border-t ${gold.dividerBorder} flex flex-wrap items-end justify-between gap-3`}
              >
                <div>
                  <span className="text-xs text-slate-500 block mb-1">
                    {getUnitSubtitle()}
                  </span>
                  <div className="flex items-baseline gap-1 tabular-nums">
                    <span className={`text-lg font-bold ${gold.currencyText}`}>৳</span>
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">
                      {displayPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* এক নজরে আনা ও গ্রামের রেফারেন্স */}
                <div className="text-right text-xs text-slate-600 space-y-0.5 tabular-nums">
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

      {/* ৩. সহজ ও স্বচ্ছ গহনার খরচ ক্যালকুলেটর */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator size={17} className="text-blue-600" />
              <span>
                {lang === 'bn'
                  ? 'গহনা কেনার আনুমানিক খরচ হিসাব করুন'
                  : 'Jewelry Cost Estimator'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'bn'
                ? 'ওজন লিখুন অথবা নিচের বাটনে ক্লিক করে ভ্যাট ও মজুরিসহ মোট খরচ দেখুন'
                : 'Enter weight or tap a preset below to calculate total cost with VAT & making charge'}
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
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white transition-colors"
              >
                {lang === 'bn' ? preset.labelBn : preset.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {lang === 'bn' ? '১. স্বর্ণের মান (ক্যারেট)' : '1. Gold Purity (Karat)'}
            </label>
            <select
              value={selectedKarat}
              onChange={(e) => setSelectedKarat(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
            >
              {prices.map((g) => (
                <option key={g.id} value={g.id}>
                  {lang === 'bn' ? g.typeBn : g.typeEn}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {lang === 'bn' ? '২. ওজনের পরিমাণ লিখুন' : '2. Enter Weight Quantity'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.25"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full pl-3.5 pr-16 py-2.5 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600 tabular-nums"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
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

          <div className="md:col-span-4 flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
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
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
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

        {/* স্বচ্ছ খরচের ব্রেকডাউন বক্স */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 tabular-nums">
            <span className="text-[11px] font-medium text-slate-500 block">
              {lang === 'bn' ? 'স্বর্ণের মূল দাম' : 'Base Gold Price'}
            </span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">
              ৳ {breakdown.basePrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 tabular-nums">
            <span className="text-[11px] font-medium text-slate-500 block">
              {lang === 'bn' ? 'সরকারি ভ্যাট (৫%)' : 'Govt. VAT (5%)'}
            </span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">
              ৳ {breakdown.vatAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 tabular-nums">
            <span className="text-[11px] font-medium text-slate-500 block">
              {lang === 'bn' ? 'ন্যূনতম মজুরি (৬%)' : 'Min. Making (6%)'}
            </span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">
              ৳ {breakdown.makingCharge.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 text-white tabular-nums flex flex-col justify-center">
            <span className="text-[11px] text-slate-300 flex items-center gap-1">
              <Coins size={13} className="text-blue-400" />
              {lang === 'bn' ? 'সর্বমোট আনুমানিক মূল্য' : 'Total Estimated Cost'}
            </span>
            <span className="text-xl font-bold text-white mt-0.5 block">
              ৳ {breakdown.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* ৪. ভিজিটরদের জন্য সহজ ওজন ও ক্রয় নির্দেশিকা */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <Scale size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {lang === 'bn' ? 'স্বর্ণের ওজনের সহজ হিসাব' : 'Gold Weight Conversion'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {lang === 'bn'
                ? '১ ভরি = ১৬ আনা = ৯৬ রতি = ১১.৬৬৪ গ্রাম। অর্থাৎ ১ আনা সমান ০.৭২৯ গ্রাম।'
                : '1 Bhori = 16 Ana = 96 Rati = 11.664 Grams (1 Ana = 0.729g).'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <Receipt size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {lang === 'bn' ? 'ভ্যাট ও মজুরি নিয়মাবলি' : 'VAT & Making Rules'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {lang === 'bn'
                ? 'বাজুস নির্দেশনা অনুযায়ী গহনা কেনার সময় মূল দামের সাথে ৫% ভ্যাট ও ন্যূনতম ৬% মজুরি প্রযোজ্য।'
                : 'Per BAJUS guidelines, 5% Govt. VAT and minimum 6% making charge apply on jewelry purchases.'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <BadgeCheck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {lang === 'bn' ? 'হলমার্ক ও রশিদ যাচাই' : 'Hallmark & Invoice'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {lang === 'bn'
                ? 'ক্রয়ের সময় গহনায় ক্যারেট হলমার্ক সিল দেখে নিন এবং পাকা ক্যাশ মেমো বুঝে নিন।'
                : 'Always verify the karat hallmark stamp on jewelry and collect an official receipt.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldPage;
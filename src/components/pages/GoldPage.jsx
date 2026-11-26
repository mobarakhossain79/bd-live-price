import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Check,
  RotateCcw,
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const LIVE_GOLD_API_URL = `${API_BASE_URL}/api/gold-prices`;

const OFFICIAL_BAJUS_PRICES = [
  {
    id: '22k',
    karat: '22K',
    purity: '91.6%',
    typeBn: '২২ ক্যারেট হলমার্ক',
    typeEn: '22 Karat Hallmark',
    noteBn: 'আধুনিক ও সূক্ষ্ম নকশার গহনা',
    noteEn: 'Fine & intricate jewelry',
    price: 194964,
    priceChange: 0,
  },
  {
    id: '21k',
    karat: '21K',
    purity: '87.5%',
    typeBn: '২১ ক্যারেট হলমার্ক',
    typeEn: '21 Karat Hallmark',
    noteBn: 'ঐতিহ্যবাহী ও টেকসই গহনা',
    noteEn: 'Traditional & durable wear',
    price: 186100,
    priceChange: 0,
  },
  {
    id: '18k',
    karat: '18K',
    purity: '75.0%',
    typeBn: '১৮ ক্যারেট হলমার্ক',
    typeEn: '18 Karat Hallmark',
    noteBn: 'পাথর ও ডায়মন্ড সেটিং গহনা',
    noteEn: 'Stone & diamond settings',
    price: 159517,
    priceChange: 0,
  },
  {
    id: 'traditional',
    karat: 'SNT',
    purity: 'TRAD',
    typeBn: 'সনাতন পদ্ধতির স্বর্ণ',
    typeEn: 'Traditional Gold',
    noteBn: 'পুরাতন স্বর্ণ থেকে পরিশোধিত',
    noteEn: 'Refined traditional standard',
    price: 132678,
    priceChange: 0,
  },
];

const INITIAL_INTL_GOLD = {
  pricePerOz: 1586.46,
  priceChange: 0,
};

const BHORI_IN_GRAMS = 11.664;
const BHORI_IN_ANA = 16;
const TROY_OUNCE_IN_GRAMS = 31.1034768;

const GoldPage = ({ lang = 'bn' }) => {
  const [prices, setPrices] = useState(() => {
    const saved = localStorage.getItem('bd_live_gold_prices_v2');
    if (saved) {
      try {
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
      } catch {
        return OFFICIAL_BAJUS_PRICES;
      }
    }
    return OFFICIAL_BAJUS_PRICES;
  });

  const [intlGold, setIntlGold] = useState(() => {
    const savedIntl = localStorage.getItem('bd_live_intl_gold_v1');
    if (savedIntl) {
      try {
        const parsed = JSON.parse(savedIntl);
        return {
          pricePerOz: Number(parsed.pricePerOz) || INITIAL_INTL_GOLD.pricePerOz,
          priceChange: Number(parsed.priceChange || 0),
        };
      } catch {
        return INITIAL_INTL_GOLD;
      }
    }
    return INITIAL_INTL_GOLD;
  });

  const [unit, setUnit] = useState('bhori'); // 'bhori' | 'ana' | 'gram'
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

      const incomingIntl = Number(
        latestData.international ?? latestData.usd_oz ?? latestData.spot_usd
      );
      if (incomingIntl && incomingIntl > 0) {
        setIntlGold((prev) => {
          if (incomingIntl !== prev.pricePerOz) {
            const updatedIntl = {
              pricePerOz: incomingIntl,
              priceChange: Number((incomingIntl - prev.pricePerOz).toFixed(2)),
            };
            localStorage.setItem('bd_live_intl_gold_v1', JSON.stringify(updatedIntl));
            return updatedIntl;
          }
          return prev;
        });
      }
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

  const intlMetrics = useMemo(() => {
    const perGramUsd = intlGold.pricePerOz / TROY_OUNCE_IN_GRAMS;
    const perBhoriUsd = perGramUsd * BHORI_IN_GRAMS;
    return {
      oz: intlGold.pricePerOz.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      gram: perGramUsd.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      bhori: perBhoriUsd.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  }, [intlGold.pricePerOz]);

  const activeGoldObj = useMemo(
    () => prices.find((p) => p.id === selectedKarat) || prices[0],
    [prices, selectedKarat]
  );

  const breakdown = useMemo(() => {
    const qty = Math.max(0, parseFloat(quantity) || 0);
    const exactUnitRate =
      unit === 'ana'
        ? activeGoldObj.price / BHORI_IN_ANA
        : unit === 'gram'
        ? activeGoldObj.price / BHORI_IN_GRAMS
        : activeGoldObj.price;

    const basePrice = Math.round(exactUnitRate * qty);
    const vatAmount = includeVat ? Math.round(basePrice * 0.05) : 0;
    const makingCharge = includeMaking ? Math.round(basePrice * 0.06) : 0;
    const total = basePrice + vatAmount + makingCharge;

    return { basePrice, vatAmount, makingCharge, total };
  }, [activeGoldObj, quantity, unit, includeVat, includeMaking]);

  const presets = [
    { bn: '১ আনা', en: '1 Ana', u: 'ana', q: '1' },
    { bn: '৪ আনা', en: '4 Ana', u: 'ana', q: '4' },
    { bn: '৮ আনা', en: '8 Ana', u: 'ana', q: '8' },
    { bn: '১ ভরি', en: '1 Bhori', u: 'bhori', q: '1' },
    { bn: '১০ গ্রাম', en: '10g', u: 'gram', q: '10' },
  ];

  const unitName =
    unit === 'ana'
      ? lang === 'bn'
        ? 'আনা'
        : 'Ana'
      : unit === 'gram'
      ? lang === 'bn'
        ? 'গ্রাম'
        : 'Gram'
      : lang === 'bn'
      ? 'ভরি'
      : 'Bhori';

  return (
    <div className="space-y-8 pb-8">
      {/* ১. মিনিমাল এডিটোরিয়াল হেডার + ইউনিট টগল */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            <span>
              {lang === 'bn'
                ? 'বাজুস নির্ধারিত খুচরা বাজারদর'
                : 'BAJUS Official Retail Bullion'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {lang === 'bn' ? 'স্বর্ণের আজকের বাজারদর' : "Today's Gold Rates"}
          </h1>
        </div>

        {/* Clean Segmented Unit Control */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 self-start">
          {[
            { id: 'bhori', bn: 'ভরি (১১.৬৬৪g)', en: 'Bhori' },
            { id: 'ana', bn: 'আনা', en: 'Ana' },
            { id: 'gram', bn: 'গ্রাম', en: 'Gram' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setUnit(tab.id)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                unit === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? tab.bn : tab.en}
            </button>
          ))}
        </div>
      </div>

      {/* ২. আন্তর্জাতিক স্পট বুলিয়ন স্ট্রিপ (Clean Horizontal Ticker Strip) */}
      <div className="bg-stone-900 text-stone-100 rounded-xl px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wider">
            XAU/USD
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {lang === 'bn'
                ? 'আন্তর্জাতিক স্পট মার্কেট (২৪ ক্যারেট বুলিয়ন)'
                : 'International Spot Bullion (24K)'}
            </p>
            <p className="text-xs text-stone-400">
              {lang === 'bn'
                ? 'প্রতি ট্রয় আউন্স (৩১.১০৩৫ গ্রাম) বিশ্ববাজার দর'
                : 'Global spot benchmark per troy ounce (31.1035g)'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:gap-8 tabular-nums pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-800">
          <div>
            <span className="block text-[11px] text-stone-400">
              {lang === 'bn' ? 'প্রতি আউন্স' : 'Per Ounce'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold text-amber-300">
                ${intlMetrics.oz}
              </span>
              {intlGold.priceChange !== 0 && (
                <span
                  className={`inline-flex items-center text-xs font-semibold ${
                    intlGold.priceChange > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {intlGold.priceChange > 0 ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  ${Math.abs(intlGold.priceChange).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-stone-800 hidden sm:block" />

          <div>
            <span className="block text-[11px] text-stone-400">
              {lang === 'bn' ? 'প্রতি ১ ভরি (USD)' : 'Per Bhori (USD)'}
            </span>
            <span className="text-base font-semibold text-white mt-0.5 block">
              ${intlMetrics.bhori}
            </span>
          </div>

          <div className="h-8 w-px bg-stone-800 hidden sm:block" />

          <div>
            <span className="block text-[11px] text-stone-400">
              {lang === 'bn' ? 'প্রতি ১ গ্রাম (USD)' : 'Per Gram (USD)'}
            </span>
            <span className="text-base font-semibold text-white mt-0.5 block">
              ${intlMetrics.gram}
            </span>
          </div>
        </div>
      </div>

      {/* ৩. ক্যারেট কার্ড গ্রিড (ক্রিয়েটিভ ও হ্যান্ড-ক্রাফটেড মিনিমাল লেআউট) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prices.map((gold) => {
          const displayPrice = convertByUnit(gold.price);
          const displayChange = convertByUnit(gold.priceChange);
          const isSelected = selectedKarat === gold.id;

          const perAna = Math.round(gold.price / BHORI_IN_ANA);
          const perGram = Math.round(gold.price / BHORI_IN_GRAMS);

          return (
            <div
              key={gold.id}
              onClick={() => setSelectedKarat(gold.id)}
              className={`relative cursor-pointer rounded-xl bg-white p-5 sm:p-6 border transition-all duration-150 ${
                isSelected
                  ? 'border-stone-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Left Accent Bar for Active Card */}
              {isSelected && (
                <div className="absolute left-0 top-4 bottom-4 w-1 bg-amber-600 rounded-r" />
              )}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                      {gold.karat}
                    </span>
                    <span className="text-xs font-medium text-stone-400">
                      {gold.purity}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                        <Check size={12} strokeWidth={2.5} />
                        {lang === 'bn' ? 'নির্বাচিত' : 'Selected'}
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 mt-2">
                    {lang === 'bn' ? gold.typeBn : gold.typeEn}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'bn' ? gold.noteBn : gold.noteEn}
                  </p>
                </div>

                {/* Minimal Delta Indicator */}
                <div className="text-right shrink-0">
                  {displayChange > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded tabular-nums">
                      <ArrowUpRight size={13} />
                      +৳{displayChange.toLocaleString('en-IN')}
                    </span>
                  ) : displayChange < 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded tabular-nums">
                      <ArrowDownRight size={13} />
                      -৳{Math.abs(displayChange).toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Minus size={12} />
                      {lang === 'bn' ? 'অপরিবর্তিত' : 'Unchanged'}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Secondary Equivalents */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-baseline justify-between gap-4 tabular-nums">
                <div>
                  <span className="text-xs text-slate-400 block">
                    {lang === 'bn' ? `প্রতি ১ ${unitName}` : `Per 1 ${unitName}`}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-semibold text-slate-400">৳</span>
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">
                      {displayPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {unit !== 'ana' && (
                    <span>
                      {lang === 'bn' ? 'আনা' : 'Ana'}{' '}
                      <strong className="text-slate-800 font-semibold">
                        ৳{perAna.toLocaleString('en-IN')}
                      </strong>
                    </span>
                  )}
                  {unit !== 'gram' && (
                    <span>
                      {lang === 'bn' ? 'গ্রাম' : 'Gram'}{' '}
                      <strong className="text-slate-800 font-semibold">
                        ৳{perGram.toLocaleString('en-IN')}
                      </strong>
                    </span>
                  )}
                  {unit !== 'bhori' && (
                    <span>
                      {lang === 'bn' ? 'ভরি' : 'Bhori'}{' '}
                      <strong className="text-slate-800 font-semibold">
                        ৳{gold.price.toLocaleString('en-IN')}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ৪. ক্রিয়েটিভ স্প্লিট ইনভয়েস ক্যালকুলেটর */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* বাম পাশ: ইনপুট কন্ট্রোল */}
          <div className="lg:col-span-7 p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'bn' ? 'গহনার মূল্য ক্যালকুলেটর' : 'Jewelry Price Calculator'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'bn'
                    ? 'ক্যারেট ও ওজন দিয়ে ভ্যাট এবং মজুরিসহ হিসাব করুন'
                    : 'Calculate exact estimate including VAT & making charge'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setQuantity('1');
                  setUnit('bhori');
                  setIncludeVat(true);
                  setIncludeMaking(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-800 transition-colors"
                title="Reset"
              >
                <RotateCcw size={13} />
                <span>{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
              </button>
            </div>

            {/* Quick Weight Chips */}
            <div>
              <span className="block text-xs font-semibold text-slate-500 mb-2">
                {lang === 'bn' ? 'দ্রুত ওজন নির্বাচন:' : 'Quick Presets:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUnit(p.u);
                      setQuantity(p.q);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      unit === p.u && quantity === p.q
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lang === 'bn' ? p.bn : p.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Karat & Quantity Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {lang === 'bn' ? 'স্বর্ণের ক্যারেট' : 'Gold Karat'}
                </label>
                <select
                  value={selectedKarat}
                  onChange={(e) => setSelectedKarat(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-stone-900"
                >
                  {prices.map((g) => (
                    <option key={g.id} value={g.id}>
                      {lang === 'bn' ? g.typeBn : g.typeEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {lang === 'bn' ? `ওজন (${unitName})` : `Weight (${unitName})`}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full pl-3.5 pr-16 py-2.5 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-stone-900 tabular-nums"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    {unitName}
                  </span>
                </div>
              </div>
            </div>

            {/* Clean Checkboxes */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeVat}
                  onChange={(e) => setIncludeVat(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-stone-900"
                />
                <span>{lang === 'bn' ? 'সরকারি ভ্যাট (৫%)' : 'Govt. VAT (5%)'}</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeMaking}
                  onChange={(e) => setIncludeMaking(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-stone-900"
                />
                <span>
                  {lang === 'bn' ? 'ন্যূনতম মজুরি (৬%)' : 'Min. Making Charge (6%)'}
                </span>
              </label>
            </div>
          </div>

          {/* ডান পাশ: রশিদ / ইনভয়েস সামারি */}
          <div className="lg:col-span-5 bg-stone-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {lang === 'bn' ? 'খরচের বিবরণী' : 'Estimate Summary'}
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {activeGoldObj.karat} • {quantity || 0} {unitName}
                </span>
              </div>

              <div className="py-4 space-y-3 text-sm tabular-nums">
                <div className="flex justify-between text-slate-600">
                  <span>{lang === 'bn' ? 'স্বর্ণের মূল দাম' : 'Base Gold Value'}</span>
                  <span className="font-semibold text-slate-900">
                    ৳ {breakdown.basePrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>{lang === 'bn' ? 'ভ্যাট (৫%)' : 'VAT (5%)'}</span>
                  <span className="font-semibold text-slate-900">
                    ৳ {breakdown.vatAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>{lang === 'bn' ? 'মজুরি (৬%)' : 'Making Charge (6%)'}</span>
                  <span className="font-semibold text-slate-900">
                    ৳ {breakdown.makingCharge.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-slate-300 tabular-nums">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {lang === 'bn' ? 'সর্বমোট আনুমানিক মূল্য' : 'Estimated Payable'}
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  ৳ {breakdown.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ৫. নিচের পরিমাপ ও নিয়মাবলি (মিনিমাল ফুটার নোট) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs text-slate-500">
        <div className="border-l-2 border-slate-200 pl-3.5">
          <p className="font-bold text-slate-800 mb-1">
            {lang === 'bn' ? 'ওজন রূপান্তর' : 'Weight Standard'}
          </p>
          <p className="leading-relaxed">
            {lang === 'bn'
              ? '১ ভরি = ১৬ আনা = ৯৬ রতি = ১১.৬৬৪ গ্রাম (১ আনা = ০.৭২৯ গ্রাম)।'
              : '1 Bhori = 16 Ana = 96 Rati = 11.664 Grams (1 Ana = 0.729g).'}
          </p>
        </div>

        <div className="border-l-2 border-slate-200 pl-3.5">
          <p className="font-bold text-slate-800 mb-1">
            {lang === 'bn' ? 'ভ্যাট ও মজুরি' : 'Tax & Making'}
          </p>
          <p className="leading-relaxed">
            {lang === 'bn'
              ? 'বাজুস নিয়ম অনুযায়ী গহনার মূল দামের সাথে ৫% ভ্যাট ও ন্যূনতম ৬% মজুরি যুক্ত হয়।'
              : 'Per BAJUS rules, 5% Govt. VAT and minimum 6% making charge apply.'}
          </p>
        </div>

        <div className="border-l-2 border-slate-200 pl-3.5">
          <p className="font-bold text-slate-800 mb-1">
            {lang === 'bn' ? 'হলমার্ক ও রশিদ' : 'Hallmark Verification'}
          </p>
          <p className="leading-relaxed">
            {lang === 'bn'
              ? 'ক্রয়ের সময় গহনায় ক্যারেট হলমার্ক সিল দেখে নিন এবং পাকা ক্যাশ মেমো বুঝে নিন।'
              : 'Verify the karat hallmark stamp and always collect an official invoice.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoldPage;
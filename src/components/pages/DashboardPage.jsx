import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  Layers,
  Minus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const LIVE_OVERVIEW_API_URL = `${API_BASE_URL}/api/overview`;

const INITIAL_OVERVIEW = {
  usd: { price: 122.5, priceChange: 0 },
  sar: { price: 32.65, priceChange: 0 },
  eur: { price: 132.8, priceChange: 0 },
  gold22k: { price: 194964, priceChange: 0 },
  gold21k: { price: 186100, priceChange: 0 },
  rice: { price: 72, priceChange: 0 },
  onion: { price: 110, priceChange: 0 },
  beef: { price: 780, priceChange: 0 },
  oil: { price: 167, priceChange: 0 },
};

const TREND_DATASETS = {
  usd: {
    labelBn: 'মার্কিন ডলার (USD / BDT)',
    labelEn: 'US Dollar (USD / BDT)',
    data: [
      { dayBn: 'শনি', dayEn: 'Sat', price: 121.8 },
      { dayBn: 'রবি', dayEn: 'Sun', price: 122.0 },
      { dayBn: 'সোম', dayEn: 'Mon', price: 122.0 },
      { dayBn: 'মঙ্গল', dayEn: 'Tue', price: 122.2 },
      { dayBn: 'বুধ', dayEn: 'Wed', price: 122.5 },
      { dayBn: 'বৃহঃ', dayEn: 'Thu', price: 122.5 },
    ],
  },
  gold: {
    labelBn: '২২ ক্যারেট স্বর্ণ (প্রতি ভরি)',
    labelEn: '22K Gold (Per Bhori)',
    data: [
      { dayBn: 'শনি', dayEn: 'Sat', price: 198500 },
      { dayBn: 'রবি', dayEn: 'Sun', price: 198500 },
      { dayBn: 'সোম', dayEn: 'Mon', price: 196800 },
      { dayBn: 'মঙ্গল', dayEn: 'Tue', price: 196800 },
      { dayBn: 'বুধ', dayEn: 'Wed', price: 194964 },
      { dayBn: 'বৃহঃ', dayEn: 'Thu', price: 194964 },
    ],
  },
  rice: {
    labelBn: 'মিনিকেট চাল (প্রতি কেজি)',
    labelEn: 'Miniket Rice (Per Kg)',
    data: [
      { dayBn: 'শনি', dayEn: 'Sat', price: 70 },
      { dayBn: 'রবি', dayEn: 'Sun', price: 70 },
      { dayBn: 'সোম', dayEn: 'Mon', price: 71 },
      { dayBn: 'মঙ্গল', dayEn: 'Tue', price: 72 },
      { dayBn: 'বুধ', dayEn: 'Wed', price: 72 },
      { dayBn: 'বৃহঃ', dayEn: 'Thu', price: 72 },
    ],
  },
};

const DashboardPage = ({ lang = 'bn', setActiveTab }) => {
  const [market, setMarket] = useState(() => {
    const saved = localStorage.getItem('bd_live_overview_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      const merged = { ...INITIAL_OVERVIEW };
      Object.keys(INITIAL_OVERVIEW).forEach((key) => {
        if (parsed[key]) {
          merged[key] = {
            price: Number(parsed[key].price),
            priceChange: Number(parsed[key].priceChange || 0),
          };
        }
      });
      return merged;
    }
    return INITIAL_OVERVIEW;
  });

  const [activeChart, setActiveChart] = useState('usd');

  const syncOverviewData = useCallback(async () => {
    try {
      const res = await fetch(LIVE_OVERVIEW_API_URL, { cache: 'no-store' });
      if (!res.ok) return;

      const data = await res.json();

      setMarket((prev) => {
        let changed = false;
        const next = { ...prev };

        const checkAndUpdate = (key, incomingValue) => {
          const val = Number(incomingValue);
          if (val && val !== prev[key].price) {
            changed = true;
            next[key] = {
              price: val,
              priceChange: Number((val - prev[key].price).toFixed(2)),
            };
          }
        };

        if (data.exchange_rates) {
          checkAndUpdate('usd', data.exchange_rates.USD);
          checkAndUpdate('sar', data.exchange_rates.SAR);
          checkAndUpdate('eur', data.exchange_rates.EUR);
        }
        if (data.gold) {
          checkAndUpdate('gold22k', data.gold['22k']);
          checkAndUpdate('gold21k', data.gold['21k']);
        }
        if (data.commodities) {
          checkAndUpdate('rice', data.commodities['1']);
          checkAndUpdate('onion', data.commodities['6']);
          checkAndUpdate('beef', data.commodities['13']);
          checkAndUpdate('oil', data.commodities['20']);
        }

        if (changed) {
          localStorage.setItem('bd_live_overview_v2', JSON.stringify(next));
          return next;
        }
        return prev;
      });
    } catch (err) {
      console.error('Overview sync error:', err);
    }
  }, []);

  useEffect(() => {
    syncOverviewData();
    const interval = setInterval(syncOverviewData, 15000);
    const handleFocus = () => syncOverviewData();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncOverviewData]);

  const currentChartConfig = TREND_DATASETS[activeChart];
  const chartSeries = currentChartConfig.data.map((point, index, arr) => {
    const label = lang === 'bn' ? point.dayBn : point.dayEn;
    if (index === arr.length - 1) {
      const liveVal =
        activeChart === 'usd'
          ? market.usd.price
          : activeChart === 'gold'
          ? market.gold22k.price
          : market.rice.price;
      return { name: label, price: liveVal };
    }
    return { name: label, price: point.price };
  });

  const kpiCards = [
    {
      id: 'usd',
      tab: 'exchange',
      titleBn: 'মার্কিন ডলার (USD)',
      titleEn: 'US Dollar (USD)',
      unitBn: 'ওপেন মার্কেট বিক্রয়',
      unitEn: 'Open Market Sell',
      price: `৳ ${market.usd.price.toFixed(2)}`,
      priceChange: market.usd.priceChange,
      icon: DollarSign,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'gold22k',
      tab: 'gold',
      titleBn: '২২ ক্যারেট স্বর্ণ',
      titleEn: '22K Gold (BAJUS)',
      unitBn: 'প্রতি ভরি (১১.৬৬৪ গ্রাম)',
      unitEn: 'Per Bhori (11.664g)',
      price: `৳ ${market.gold22k.price.toLocaleString('en-IN')}`,
      priceChange: market.gold22k.priceChange,
      icon: Coins,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'rice',
      tab: 'commodities',
      titleBn: 'মিনিকেট চাল',
      titleEn: 'Miniket Rice',
      unitBn: 'প্রতি কেজি খুচরা',
      unitEn: 'Retail Per Kg',
      price: `৳ ${market.rice.price.toLocaleString('en-IN')}`,
      priceChange: market.rice.priceChange,
      icon: ShoppingCart,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'onion',
      tab: 'commodities',
      titleBn: 'দেশি পেঁয়াজ',
      titleEn: 'Local Onion',
      unitBn: 'প্রতি কেজি খুচরা',
      unitEn: 'Retail Per Kg',
      price: `৳ ${market.onion.price.toLocaleString('en-IN')}`,
      priceChange: market.onion.priceChange,
      icon: Layers,
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
  ];

  const quickWatchlist = [
    {
      code: '21K',
      nameBn: '২১ ক্যারেট স্বর্ণ',
      nameEn: '21K Gold',
      unitBn: 'প্রতি ভরি',
      unitEn: 'Per Bhori',
      price: `৳ ${market.gold21k.price.toLocaleString('en-IN')}`,
      priceChange: market.gold21k.priceChange,
      tab: 'gold',
    },
    {
      code: 'SAR',
      nameBn: 'সৌদি রিয়াল',
      nameEn: 'Saudi Riyal',
      unitBn: 'বিক্রয় হার',
      unitEn: 'Sell Rate',
      price: `৳ ${market.sar.price.toFixed(2)}`,
      priceChange: market.sar.priceChange,
      tab: 'exchange',
    },
    {
      code: 'EUR',
      nameBn: 'ইউরো',
      nameEn: 'Euro',
      unitBn: 'বিক্রয় হার',
      unitEn: 'Sell Rate',
      price: `৳ ${market.eur.price.toFixed(2)}`,
      priceChange: market.eur.priceChange,
      tab: 'exchange',
    },
    {
      code: 'KG',
      nameBn: 'গরুর মাংস',
      nameEn: 'Beef',
      unitBn: 'প্রতি কেজি',
      unitEn: 'Per Kg',
      price: `৳ ${market.beef.price.toLocaleString('en-IN')}`,
      priceChange: market.beef.priceChange,
      tab: 'commodities',
    },
    {
      code: 'LTR',
      nameBn: 'সয়াবিন তেল',
      nameEn: 'Soybean Oil',
      unitBn: 'প্রতি লিটার',
      unitEn: 'Per Liter',
      price: `৳ ${market.oil.price.toLocaleString('en-IN')}`,
      priceChange: market.oil.priceChange,
      tab: 'commodities',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <span>{lang === 'bn' ? 'বাংলাদেশ বাজার মনিটর' : 'Bangladesh Market Monitor'}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {lang === 'bn' ? 'আজকের বাজার দর ও সারসংক্ষেপ' : "Today's Market Overview"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'bn'
              ? 'স্বর্ণ, নিত্যপণ্য ও বৈদেশিক মুদ্রার রিয়েল-টাইম বাজারদর'
              : 'Real-time market benchmarks for gold, essentials, and foreign exchange'}
          </p>
        </div>

        {setActiveTab && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('commodities')}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/90 transition-colors"
            >
              {lang === 'bn' ? 'কাঁচাবাজার' : 'Commodities'}
            </button>
            <button
              onClick={() => setActiveTab('gold')}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/90 transition-colors"
            >
              {lang === 'bn' ? 'স্বর্ণের দাম' : 'Gold Price'}
            </button>
            <button
              onClick={() => setActiveTab('exchange')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              {lang === 'bn' ? 'মুদ্রা বিনিময়' : 'Exchange'}
            </button>
          </div>
        )}
      </div>

      {/* Fintech KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => setActiveTab && setActiveTab(card.tab)}
              className={`group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 ${
                setActiveTab ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${card.iconBg}`}>
                    <IconComponent size={17} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {lang === 'bn' ? card.titleBn : card.titleEn}
                  </span>
                </div>
                {setActiveTab && (
                  <ArrowUpRight
                    size={16}
                    className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                )}
              </div>

              <div className="mt-4 flex items-baseline justify-between gap-2">
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                  {card.price}
                </span>

                {card.priceChange > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/70 tabular-nums">
                    <TrendingUp size={12} />
                    +৳{card.priceChange.toLocaleString('en-IN')}
                  </span>
                ) : card.priceChange < 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 tabular-nums">
                    <TrendingDown size={12} />
                    -৳{Math.abs(card.priceChange).toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    <Minus size={11} />
                    {lang === 'bn' ? 'স্থিতিশীল' : 'Stable'}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-2.5 font-medium">
                {lang === 'bn' ? card.unitBn : card.unitEn}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Analytics Grid: Trend Chart + Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {lang === 'bn' ? 'সাপ্তাহিক বাজার প্রবণতা' : 'Weekly Rate Analytics'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn' ? currentChartConfig.labelBn : currentChartConfig.labelEn}
              </p>
            </div>

            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl self-start">
              {[
                { key: 'usd', bn: 'ডলার (USD)', en: 'USD' },
                { key: 'gold', bn: 'স্বর্ণ (২২কে)', en: 'Gold 22K' },
                { key: 'rice', bn: 'মিনিকেট চাল', en: 'Rice' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveChart(tab.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeChart === tab.key
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'bn' ? tab.bn : tab.en}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fintechBlueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                  width={72}
                  tickFormatter={(val) => `৳${val.toLocaleString('en-IN')}`}
                />
                <Tooltip
                  formatter={(value) => [
                    `৳ ${Number(value).toLocaleString('en-IN')}`,
                    lang === 'bn' ? 'বাজারদর' : 'Rate',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #1E293B',
                    fontSize: '12px',
                    fontWeight: 600,
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: '#FFFFFF' }}
                  labelStyle={{ color: '#94A3B8', marginBottom: '2px' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#fintechBlueGradient)"
                  dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#0F172A', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Market Watchlist */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">
                {lang === 'bn' ? 'গুরুত্বপূর্ণ বাজারদর' : 'Key Watchlist'}
              </h2>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {lang === 'bn' ? 'সর্বশেষ' : 'Latest'}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {quickWatchlist.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveTab && setActiveTab(item.tab)}
                  className={`py-3 flex items-center justify-between gap-3 ${
                    setActiveTab
                      ? 'cursor-pointer hover:bg-slate-50/90 -mx-2.5 px-2.5 rounded-xl transition-colors'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-8 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-700 text-[11px] font-extrabold flex items-center justify-center shrink-0">
                      {item.code}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {lang === 'bn' ? item.nameBn : item.nameEn}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {lang === 'bn' ? item.unitBn : item.unitEn}
                      </p>
                    </div>
                  </div>

                  <div className="text-right tabular-nums">
                    <p className="text-sm font-extrabold text-slate-900">{item.price}</p>
                    {item.priceChange > 0 ? (
                      <span className="text-[11px] font-bold text-rose-600">
                        +৳{item.priceChange.toLocaleString('en-IN')}
                      </span>
                    ) : item.priceChange < 0 ? (
                      <span className="text-[11px] font-bold text-emerald-600">
                        -৳{Math.abs(item.priceChange).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">
                        {lang === 'bn' ? 'স্থিতিশীল' : 'Stable'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {setActiveTab && (
            <button
              onClick={() => setActiveTab('commodities')}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-colors"
            >
              {lang === 'bn' ? 'সম্পূর্ণ বাজার তালিকা দেখুন →' : 'Explore All Commodities →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const LIVE_OVERVIEW_API_URL = `${API_BASE_URL}/api/overview`;

const DEFAULT_TICKER_STATE = {
  usd: { price: 122.5, priceChange: 0 },
  eur: { price: 132.8, priceChange: 0 },
  sar: { price: 32.65, priceChange: 0 },
  gold22k: { price: 194964, priceChange: 0 },
  gold21k: { price: 186100, priceChange: 0 },
  rice: { price: 72, priceChange: 0 },
  onion: { price: 110, priceChange: 0 },
  beef: { price: 780, priceChange: 0 },
  oil: { price: 167, priceChange: 0 },
};

const MarketTicker = ({ lang = 'bn', setActiveTab }) => {
  const [tickerData, setTickerData] = useState(() => {
    const saved = localStorage.getItem('bd_live_overview_v2');
    if (saved) {
      try {
        return { ...DEFAULT_TICKER_STATE, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_TICKER_STATE;
      }
    }
    return DEFAULT_TICKER_STATE;
  });

  const syncTicker = useCallback(async () => {
    try {
      const res = await fetch(LIVE_OVERVIEW_API_URL, { cache: 'no-store' });
      if (!res.ok) return;

      const data = await res.json();

      setTickerData((prev) => {
        let changed = false;
        const next = { ...prev };

        const updateField = (key, incoming) => {
          const val = Number(incoming);
          if (val && val !== prev[key]?.price) {
            changed = true;
            next[key] = {
              price: val,
              priceChange: Number((val - prev[key].price).toFixed(2)),
            };
          }
        };

        if (data.exchange_rates) {
          updateField('usd', data.exchange_rates.USD);
          updateField('eur', data.exchange_rates.EUR);
          updateField('sar', data.exchange_rates.SAR);
        }
        if (data.gold) {
          updateField('gold22k', data.gold['22k']);
          updateField('gold21k', data.gold['21k']);
        }
        if (data.commodities) {
          updateField('rice', data.commodities['1']);
          updateField('onion', data.commodities['6']);
          updateField('beef', data.commodities['13']);
          updateField('oil', data.commodities['20']);
        }

        return changed ? next : prev;
      });
    } catch {
      // Silent fail to keep UI smooth when offline
    }
  }, []);

  useEffect(() => {
    syncTicker();
    const interval = setInterval(syncTicker, 15000);
    return () => clearInterval(interval);
  }, [syncTicker]);

  const items = [
    {
      id: 'usd',
      tab: 'exchange',
      labelBn: 'USD ডলার',
      labelEn: 'USD',
      value: `৳${Number(tickerData.usd.price).toFixed(2)}`,
      change: tickerData.usd.priceChange,
    },
    {
      id: 'gold22k',
      tab: 'gold',
      labelBn: '২২কে স্বর্ণ (ভরি)',
      labelEn: '22K Gold',
      value: `৳${Number(tickerData.gold22k.price).toLocaleString('en-IN')}`,
      change: tickerData.gold22k.priceChange,
    },
    {
      id: 'rice',
      tab: 'commodities',
      labelBn: 'মিনিকেট চাল',
      labelEn: 'Miniket Rice',
      value: `৳${Number(tickerData.rice.price).toLocaleString('en-IN')}/কেজি`,
      valueEn: `৳${Number(tickerData.rice.price).toLocaleString('en-IN')}/kg`,
      change: tickerData.rice.priceChange,
    },
    {
      id: 'sar',
      tab: 'exchange',
      labelBn: 'SAR রিয়াল',
      labelEn: 'SAR',
      value: `৳${Number(tickerData.sar.price).toFixed(2)}`,
      change: tickerData.sar.priceChange,
    },
    {
      id: 'onion',
      tab: 'commodities',
      labelBn: 'দেশি পেঁয়াজ',
      labelEn: 'Local Onion',
      value: `৳${Number(tickerData.onion.price).toLocaleString('en-IN')}/কেজি`,
      valueEn: `৳${Number(tickerData.onion.price).toLocaleString('en-IN')}/kg`,
      change: tickerData.onion.priceChange,
    },
    {
      id: 'gold21k',
      tab: 'gold',
      labelBn: '২১কে স্বর্ণ (ভরি)',
      labelEn: '21K Gold',
      value: `৳${Number(tickerData.gold21k.price).toLocaleString('en-IN')}`,
      change: tickerData.gold21k.priceChange,
    },
    {
      id: 'beef',
      tab: 'commodities',
      labelBn: 'গরুর মাংস',
      labelEn: 'Beef',
      value: `৳${Number(tickerData.beef.price).toLocaleString('en-IN')}/কেজি`,
      valueEn: `৳${Number(tickerData.beef.price).toLocaleString('en-IN')}/kg`,
      change: tickerData.beef.priceChange,
    },
    {
      id: 'eur',
      tab: 'exchange',
      labelBn: 'EUR ইউরো',
      labelEn: 'EUR',
      value: `৳${Number(tickerData.eur.price).toFixed(2)}`,
      change: tickerData.eur.priceChange,
    },
    {
      id: 'oil',
      tab: 'commodities',
      labelBn: 'সয়াবিন তেল',
      labelEn: 'Soybean Oil',
      value: `৳${Number(tickerData.oil.price).toLocaleString('en-IN')}/লিটার`,
      valueEn: `৳${Number(tickerData.oil.price).toLocaleString('en-IN')}/L`,
      change: tickerData.oil.priceChange,
    },
  ];

  // Duplicate list for seamless infinite loop
  const loopedItems = [...items, ...items];

  return (
    <div className="bg-white border-b border-slate-200/80 h-10 flex items-center overflow-hidden select-none shrink-0">
      {/* Left Fixed Badge */}
      <div className="h-full px-3.5 md:px-5 bg-slate-900 text-white flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider shrink-0 z-10 shadow-xs">
        <Activity size={13} className="text-blue-400" />
        <span>{lang === 'bn' ? 'বাজার আপডেট' : 'MARKET PULSE'}</span>
      </div>

      {/* Scrolling Ticker Track */}
      <div className="relative flex-1 overflow-hidden h-full flex items-center">
        {/* Subtle left/right fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="animate-marquee items-center">
          {loopedItems.map((item, idx) => (
            <button
              key={`${item.id}-${idx}`}
              type="button"
              onClick={() => setActiveTab && setActiveTab(item.tab)}
              className="inline-flex items-center gap-2 px-4 py-1 border-r border-slate-200/70 hover:bg-slate-50 transition-colors text-xs whitespace-nowrap cursor-pointer"
            >
              <span className="font-semibold text-slate-500">
                {lang === 'bn' ? item.labelBn : item.labelEn}
              </span>

              <span className="font-extrabold text-slate-900 tabular-nums">
                {lang === 'en' && item.valueEn ? item.valueEn : item.value}
              </span>

              {item.change > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-600 tabular-nums">
                  <TrendingUp size={11} />
                  +৳{item.change}
                </span>
              ) : item.change < 0 ? (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 tabular-nums">
                  <TrendingDown size={11} />
                  -৳{Math.abs(item.change)}
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] font-semibold text-slate-400">
                  <Minus size={10} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
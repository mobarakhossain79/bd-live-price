import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  Star,
  X,
} from 'lucide-react';

// বাংলাদেশের বাজারদর অনুযায়ী স্থিতিশীল কাঁচাবাজারের ২৪টি পণ্যের তালিকা
const INITIAL_COMMODITIES = [
  // চাল ও ডাল (Grain & Lentils)
  { id: 1, nameBn: 'মিনিকেট চাল', nameEn: 'Miniket Rice', categoryBn: 'চাল ও ডাল', categoryEn: 'Grain & Lentils', price: 72, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 2, nameBn: 'নাজিরশাইল চাল', nameEn: 'Nazirshail Rice', categoryBn: 'চাল ও ডাল', categoryEn: 'Grain & Lentils', price: 80, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 3, nameBn: 'আটা (প্যাকেট)', nameEn: 'Packet Flour (Atta)', categoryBn: 'চাল ও ডাল', categoryEn: 'Grain & Lentils', price: 55, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 4, nameBn: 'মসুর ডাল (দেশি)', nameEn: 'Red Lentil (Deshi)', categoryBn: 'চাল ও ডাল', categoryEn: 'Grain & Lentils', price: 135, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 5, nameBn: 'ছোলা বুট', nameEn: 'Chickpeas', categoryBn: 'চাল ও ডাল', categoryEn: 'Grain & Lentils', price: 115, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },

  // সবজি ও মশলা (Vegetables & Spices)
  { id: 6, nameBn: 'দেশি পেঁয়াজ', nameEn: 'Local Onion', categoryBn: 'সবজি', categoryEn: 'Vegetable', price: 110, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 7, nameBn: 'আলু (ডায়মন্ড)', nameEn: 'Potato (Diamond)', categoryBn: 'সবজি', categoryEn: 'Vegetable', price: 55, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 8, nameBn: 'দেশি রসুন', nameEn: 'Local Garlic', categoryBn: 'সবজি', categoryEn: 'Vegetable', price: 220, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 9, nameBn: 'আদা (আমদানিকৃত)', nameEn: 'Ginger (Imported)', categoryBn: 'সবজি', categoryEn: 'Vegetable', price: 240, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 10, nameBn: 'কাঁচা মরিচ', nameEn: 'Green Chili', categoryBn: 'সবজি', categoryEn: 'Vegetable', price: 160, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 11, nameBn: 'টমেটো', nameEn: 'Tomato', categoryBn: 'সবজি', categoryEn: 'Vegetable', price: 90, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 12, nameBn: 'বেগুন (লম্বা)', nameEn: 'Brinjal / Eggplant', categoryBn: 'সবজি', categoryEn: 'Vegetable', price: 80, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },

  // মাছ, মাংস ও ডিম (Fish, Meat & Egg)
  { id: 13, nameBn: 'গরুর মাংস', nameEn: 'Beef', categoryBn: 'মাছ ও মাংস', categoryEn: 'Fish & Meat', price: 780, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 14, nameBn: 'খাসির মাংস', nameEn: 'Mutton', categoryBn: 'মাছ ও মাংস', categoryEn: 'Fish & Meat', price: 1150, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 15, nameBn: 'ব্রয়লার মুরগি', nameEn: 'Broiler Chicken', categoryBn: 'মাছ ও মাংস', categoryEn: 'Fish & Meat', price: 195, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 16, nameBn: 'সোনালি মুরগি', nameEn: 'Sonali Chicken', categoryBn: 'মাছ ও মাংস', categoryEn: 'Fish & Meat', price: 320, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 17, nameBn: 'রুই মাছ (মাঝারি)', nameEn: 'Rui Fish (Medium)', categoryBn: 'মাছ ও মাংস', categoryEn: 'Fish & Meat', price: 380, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 18, nameBn: 'ইলিশ মাছ (১ কেজি)', nameEn: 'Hilsa Fish (1 Kg)', categoryBn: 'মাছ ও মাংস', categoryEn: 'Fish & Meat', price: 1850, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 19, nameBn: 'ফার্মের ডিম (লাল)', nameEn: 'Farm Egg (Brown)', categoryBn: 'মাছ ও মাংস', categoryEn: 'Fish & Meat', price: 150, priceChange: 0, unitBn: 'ডজন', unitEn: 'Dozen' },

  // মুদি ও তেল (Grocery & Oil)
  { id: 20, nameBn: 'সয়াবিন তেল (বোতলজাত)', nameEn: 'Soybean Oil (Bottled)', categoryBn: 'মুদি ও তেল', categoryEn: 'Grocery & Oil', price: 167, priceChange: 0, unitBn: 'লিটার', unitEn: 'Liter' },
  { id: 21, nameBn: 'সরিষার তেল', nameEn: 'Mustard Oil', categoryBn: 'মুদি ও তেল', categoryEn: 'Grocery & Oil', price: 250, priceChange: 0, unitBn: 'লিটার', unitEn: 'Liter' },
  { id: 22, nameBn: 'চিনি (সাদা)', nameEn: 'Sugar (White)', categoryBn: 'মুদি ও তেল', categoryEn: 'Grocery & Oil', price: 130, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 23, nameBn: 'আয়োডিনযুক্ত লবণ', nameEn: 'Iodized Salt', categoryBn: 'মুদি ও তেল', categoryEn: 'Grocery & Oil', price: 42, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
  { id: 24, nameBn: 'গুঁড়া দুধ (ফুল ক্রিম)', nameEn: 'Full Cream Milk Powder', categoryBn: 'মুদি ও তেল', categoryEn: 'Grocery & Oil', price: 820, priceChange: 0, unitBn: 'কেজি', unitEn: 'Kg' },
];

const LIVE_COMMODITIES_API_URL = 'http://localhost:8000/api/commodities';

const CommoditiesPage = ({ lang = 'bn' }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('bd_live_commodities_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((p) => {
        const match = INITIAL_COMMODITIES.find((init) => init.id === p.id) || {};
        return {
          ...match,
          ...p,
          price: Number(p.price),
          priceChange: Number(p.priceChange || 0),
        };
      });
    }
    return INITIAL_COMMODITIES;
  });

  const [pinnedIds, setPinnedIds] = useState(() => {
    const savedPins = localStorage.getItem('bd_pinned_commodities');
    return savedPins ? JSON.parse(savedPins) : [1, 6, 13, 19];
  });

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');

  const togglePin = (id) => {
    setPinnedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('bd_pinned_commodities', JSON.stringify(updated));
      return updated;
    });
  };

  const syncCommodityPrices = useCallback(async () => {
    if (!LIVE_COMMODITIES_API_URL) return;

    try {
      const res = await fetch(LIVE_COMMODITIES_API_URL, { cache: 'no-store' });
      if (!res.ok) return;

      const latestMap = await res.json();

      setItems((prevItems) => {
        let hasUpdated = false;

        const nextItems = prevItems.map((item) => {
          const newPrice = Number(latestMap[item.id]);

          if (newPrice && newPrice !== item.price) {
            hasUpdated = true;
            return {
              ...item,
              priceChange: newPrice - item.price,
              price: newPrice,
            };
          }
          return item;
        });

        if (hasUpdated) {
          localStorage.setItem('bd_live_commodities_v2', JSON.stringify(nextItems));
          return nextItems;
        }
        return prevItems;
      });
    } catch (error) {
      console.error('Commodity price sync error:', error);
    }
  }, []);

  useEffect(() => {
    syncCommodityPrices();
    const interval = setInterval(syncCommodityPrices, 15000);

    const handleFocus = () => syncCommodityPrices();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncCommodityPrices]);

  const stats = useMemo(() => {
    const increasedCount = items.filter((i) => i.priceChange > 0).length;
    const decreasedCount = items.filter((i) => i.priceChange < 0).length;
    return {
      total: items.length,
      increased: increasedCount,
      decreased: decreasedCount,
    };
  }, [items]);

  const categories = useMemo(
    () => [
      { key: 'ALL', labelBn: 'সব পণ্য', labelEn: 'All Items', count: items.length },
      { key: 'PINNED', labelBn: 'পিন করা', labelEn: 'Watchlist', count: pinnedIds.length },
      {
        key: 'চাল ও ডাল',
        labelBn: 'চাল ও ডাল',
        labelEn: 'Grain & Lentils',
        count: items.filter((i) => i.categoryBn === 'চাল ও ডাল').length,
      },
      {
        key: 'সবজি',
        labelBn: 'সবজি',
        labelEn: 'Vegetables',
        count: items.filter((i) => i.categoryBn === 'সবজি').length,
      },
      {
        key: 'মাছ ও মাংস',
        labelBn: 'মাছ ও মাংস',
        labelEn: 'Fish & Meat',
        count: items.filter((i) => i.categoryBn === 'মাছ ও মাংস').length,
      },
      {
        key: 'মুদি ও তেল',
        labelBn: 'মুদি ও তেল',
        labelEn: 'Grocery & Oil',
        count: items.filter((i) => i.categoryBn === 'মুদি ও তেল').length,
      },
    ],
    [items, pinnedIds]
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'ALL'
          ? true
          : selectedCategory === 'PINNED'
          ? pinnedIds.includes(item.id)
          : item.categoryBn === selectedCategory;

      const matchesSearch =
        !query ||
        item.nameBn.toLowerCase().includes(query) ||
        item.nameEn.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'increased') {
      return [...filtered].sort((a, b) => b.priceChange - a.priceChange);
    }
    if (sortBy === 'decreased') {
      return [...filtered].sort((a, b) => a.priceChange - b.priceChange);
    }
    return filtered;
  }, [items, selectedCategory, searchQuery, sortBy, pinnedIds]);

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            {lang === 'bn' ? 'বাংলাদেশ খুচরা বাজার মনিটর' : 'Bangladesh Retail Market Monitor'}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {lang === 'bn' ? 'দৈনন্দিন কাঁচাবাজার দর' : 'Daily Commodities Market Price'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'bn'
              ? 'খুচরা বাজারদর • দাম বাড়লে বা কমলে স্বয়ংক্রিয়ভাবে আপডেট হবে'
              : 'Retail market rate • Auto-updates when price increases or decreases'}
          </p>
        </div>

        <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 tabular-nums self-start">
          <span>
            {lang === 'bn' ? 'মোট:' : 'Total:'}{' '}
            <strong className="text-slate-900">{stats.total}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            {lang === 'bn' ? 'বেড়েছে:' : 'Up:'}{' '}
            <strong className="text-blue-600">{stats.increased}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            {lang === 'bn' ? 'কমেছে:' : 'Down:'}{' '}
            <strong className="text-slate-900">{stats.decreased}</strong>
          </span>
        </div>
      </div>

      {/* সার্চ ও সর্টিং বার */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'পণ্যের নাম লিখে খুঁজুন (যেমন: মিনিকেট, পেঁয়াজ, ইলিশ)...'
                : 'Search commodities (e.g. Rice, Onion, Hilsa)...'
            }
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2.5">
          <div className="relative flex items-center">
            <ArrowUpDown size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-8 pr-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="default">{lang === 'bn' ? 'সাজানো: ডিফল্ট' : 'Sort: Default'}</option>
              <option value="price-asc">{lang === 'bn' ? 'দাম: কম থেকে বেশি' : 'Price: Low to High'}</option>
              <option value="price-desc">{lang === 'bn' ? 'দাম: বেশি থেকে কম' : 'Price: High to Low'}</option>
              <option value="increased">{lang === 'bn' ? 'দাম বেড়েছে আগে' : 'Price Increased First'}</option>
              <option value="decreased">{lang === 'bn' ? 'দাম কমেছে আগে' : 'Price Decreased First'}</option>
            </select>
          </div>

          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              title={lang === 'bn' ? 'কার্ড ভিউ' : 'Grid View'}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title={lang === 'bn' ? 'তালিকা ভিউ' : 'Table View'}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ক্যাটাগরি ফিল্টার */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{lang === 'bn' ? cat.labelBn : cat.labelEn}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[11px] tabular-nums ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* পণ্যের তালিকা */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <h3 className="text-base font-bold text-slate-900">
            {lang === 'bn' ? 'কোনো পণ্য খুঁজে পাওয়া যায়নি' : 'No matching products found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn'
              ? 'অন্য কোনো নাম দিয়ে খুঁজুন অথবা সব পণ্য নির্বাচন করুন'
              : 'Try searching with another keyword or select All Items'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isPinned = pinnedIds.includes(item.id);
            const displayName = lang === 'bn' ? item.nameBn : item.nameEn;

            return (
              <div
                key={item.id}
                className="group bg-blue-50/35 backdrop-blur-xs p-5 rounded-xl border border-blue-200/70 hover:border-blue-500 shadow-sm shadow-blue-900/5 hover:shadow-md hover:shadow-blue-900/10 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* উপরের অংশ: ক্যাটাগরি ব্যাজ ও পিন বাটন */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-white/85 text-slate-600 border border-blue-100">
                      {lang === 'bn' ? item.categoryBn : item.categoryEn}
                    </span>

                    <button
                      onClick={() => togglePin(item.id)}
                      title={lang === 'bn' ? 'তালিকায় পিন করুন' : 'Pin to Watchlist'}
                      className={`p-1 rounded-md transition-colors ${
                        isPinned
                          ? 'text-blue-600 bg-white shadow-2xs'
                          : 'text-slate-400 hover:text-blue-600 hover:bg-white/70'
                      }`}
                    >
                      <Star size={15} fill={isPinned ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* মাঝের অংশ: পণ্যের নাম */}
                  <div className="mt-3.5">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {displayName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'bn' ? item.nameEn : item.nameBn}
                    </p>
                  </div>
                </div>

                {/* নিচের অংশ: একক, মূল্য ও দাম বাড়া-কমার স্ট্যাটাস */}
                <div className="mt-4 pt-3.5 border-t border-blue-200/50 flex items-end justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-0.5">
                      {lang === 'bn' ? `প্রতি ${item.unitBn}` : `Per ${item.unitEn}`}
                    </span>
                    <div className="flex items-baseline gap-1 tabular-nums">
                      <span className="text-sm font-bold text-blue-600">৳</span>
                      <span className="text-2xl font-bold text-slate-900 tracking-tight">
                        {item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {item.priceChange > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-blue-600 text-white tabular-nums">
                      <TrendingUp size={12} />
                      +৳{item.priceChange}
                    </span>
                  ) : item.priceChange < 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-white tabular-nums">
                      <TrendingDown size={12} />
                      -৳{Math.abs(item.priceChange)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/80 text-slate-600 border border-blue-100/80">
                      {lang === 'bn' ? 'স্থিতিশীল' : 'Stable'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {lang === 'bn' ? 'পণ্যের নাম' : 'Product Name'}
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {lang === 'bn' ? 'ধরন' : 'Category'}
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {lang === 'bn' ? 'একক' : 'Unit'}
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {lang === 'bn' ? 'অবস্থা' : 'Status'}
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    {lang === 'bn' ? 'খুচরা মূল্য' : 'Retail Price'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isPinned = pinnedIds.includes(item.id);
                  const displayName = lang === 'bn' ? item.nameBn : item.nameEn;

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => togglePin(item.id)}
                            className={
                              isPinned
                                ? 'text-blue-600'
                                : 'text-slate-300 hover:text-blue-600'
                            }
                          >
                            <Star size={15} fill={isPinned ? 'currentColor' : 'none'} />
                          </button>

                          <div>
                            <p className="font-bold text-slate-900 text-sm">{displayName}</p>
                            <p className="text-xs text-slate-400">
                              {lang === 'bn' ? item.nameEn : item.nameBn}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {lang === 'bn' ? item.categoryBn : item.categoryEn}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {lang === 'bn' ? item.unitBn : item.unitEn}
                      </td>
                      <td className="p-4">
                        {item.priceChange > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-blue-600 text-white tabular-nums">
                            <TrendingUp size={12} />
                            +৳{item.priceChange}
                          </span>
                        ) : item.priceChange < 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-white tabular-nums">
                            <TrendingDown size={12} />
                            -৳{Math.abs(item.priceChange)}
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {lang === 'bn' ? 'স্থিতিশীল' : 'Stable'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right font-bold text-base text-slate-900 tabular-nums">
                        <span className="text-blue-600 mr-0.5">৳</span>
                        {item.price.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommoditiesPage;
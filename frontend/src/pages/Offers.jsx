import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  Tag, 
  AlertTriangle, 
  Calendar, 
  Clock,
  Timer,
  ArrowRight, 
  Check,
  FileImage,
  TrendingDown,
  X,
  RefreshCw
} from 'lucide-react';
import { t } from '../utils/translations';

// Helper to format countdown
function getCountdown(expiresAt, currentNow) {
  if (!expiresAt) return { text: 'No Expiry', status: 'active', remainingSeconds: Infinity };
  const target = new Date(expiresAt).getTime();
  const diff = target - currentNow.getTime();

  if (diff <= 0) {
    return { text: 'Expired', status: 'expired', remainingSeconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  let text = '';
  if (days > 0) {
    text = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  } else {
    text = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }

  const isUrgent = diff < 3 * 60 * 60 * 1000; // less than 3 hours
  return {
    text,
    status: isUrgent ? 'urgent' : 'active',
    remainingSeconds: Math.floor(diff / 1000)
  };
}

// Helper to format exact date and time
function formatExactDateTime(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export default function Offers({ lang, navigateTo, params }) {
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState('active'); // 'active' | 'expired' | 'all'
  
  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [offerType, setOfferType] = useState('Percentage Discount');
  const [discountValue, setDiscountValue] = useState(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59');
  const [clearanceOverride, setClearanceOverride] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Extend Modal State
  const [extendModal, setExtendModal] = useState({ open: false, offer: null, newDate: '', newTime: '23:59' });

  // Real-time ticking clock (updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchOffers();
    
    // Set End date default to 7 days from now at 11:59 PM
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setEndDate(nextWeek.toISOString().split('T')[0]);
    setEndTime('23:59');
  }, []);

  // Listen for autoCreate parameter from dashboard slow-moving action trigger
  useEffect(() => {
    if (products.length > 0 && params && params.autoCreateOfferProdId) {
      setSelectedProductId(params.autoCreateOfferProdId);
      setOfferType('Percentage Discount');
      setDiscountValue(10);
    }
  }, [products, params]);

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products for offers:', err));
  };

  const fetchOffers = () => {
    setLoading(true);
    fetch('/api/offers')
      .then(res => res.json())
      .then(data => {
        setOffers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching offers:', err);
        setLoading(false);
      });
  };

  // Quick Expiration Presets
  const applyPreset = (type) => {
    const today = new Date();
    if (type === '1hr') {
      const target = new Date(today.getTime() + 60 * 60 * 1000);
      setEndDate(target.toISOString().split('T')[0]);
      setEndTime(target.toTimeString().slice(0, 5));
    } else if (type === 'today_end') {
      setEndDate(today.toISOString().split('T')[0]);
      setEndTime('23:59');
    } else if (type === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setEndDate(tomorrow.toISOString().split('T')[0]);
      setEndTime('23:59');
    } else if (type === '3days') {
      const threeDays = new Date(today);
      threeDays.setDate(threeDays.getDate() + 3);
      setEndDate(threeDays.toISOString().split('T')[0]);
      setEndTime('23:59');
    } else if (type === '1week') {
      const week = new Date(today);
      week.setDate(week.getDate() + 7);
      setEndDate(week.toISOString().split('T')[0]);
      setEndTime('23:59');
    }
  };

  // Find currently selected product info
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Profit calculations
  let originalSellingPrice = 0;
  let purchasePrice = 0;
  let offerPrice = 0;
  let normalProfit = 0;
  let discountProfit = 0;
  let discountAmount = 0;

  if (selectedProduct) {
    originalSellingPrice = selectedProduct.selling_price;
    purchasePrice = selectedProduct.purchase_price;
    normalProfit = originalSellingPrice - purchasePrice;

    if (offerType === 'Percentage Discount') {
      discountAmount = originalSellingPrice * (Number(discountValue) / 100);
      offerPrice = originalSellingPrice - discountAmount;
    } else if (offerType === 'Flat Discount') {
      discountAmount = Number(discountValue);
      offerPrice = originalSellingPrice - discountAmount;
    } else if (offerType === 'Buy 1 Get 1') {
      // Effective 50% discount per unit
      discountAmount = originalSellingPrice / 2;
      offerPrice = originalSellingPrice - discountAmount;
    } else {
      discountAmount = originalSellingPrice * (Number(discountValue) / 100);
      offerPrice = originalSellingPrice - discountAmount;
    }

    discountProfit = offerPrice - purchasePrice;
  }

  const isProfitNegative = discountProfit < 0;

  // Calculate target expiration ISO
  const combinedExpiryString = `${endDate}T${endTime || '23:59'}:00`;
  const calculatedExpiryDate = new Date(combinedExpiryString);
  const isInputExpired = !isNaN(calculatedExpiryDate.getTime()) && calculatedExpiryDate.getTime() <= now.getTime();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedProductId) return setErrorMsg('Please select a product');
    if (discountValue <= 0) return setErrorMsg('Discount must be greater than zero');
    if (!endDate) return setErrorMsg('Please choose an expiry date');
    if (!endTime) return setErrorMsg('Please choose an exact expiry time');
    if (isInputExpired) {
      return setErrorMsg('The selected expiry date and time is in the past! Please choose a future date & time.');
    }
    if (isProfitNegative && !clearanceOverride) {
      return setErrorMsg('Offer rejected: Profit margin is negative! Check Clearance Override if you wish to clear stock at a loss.');
    }

    const exactExpiresAt = new Date(`${endDate}T${endTime}:00`).toISOString();

    const offerData = {
      product_id: selectedProductId,
      offer_type: offerType,
      original_price: originalSellingPrice,
      discount: Number(discountValue),
      offer_price: Number(offerPrice.toFixed(2)),
      start_date: startDate,
      end_date: endDate,
      end_time: endTime,
      expires_at: exactExpiresAt
    };

    fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create offer');
        return res.json();
      })
      .then(() => {
        setSelectedProductId('');
        setClearanceOverride(false);
        fetchOffers();
      })
      .catch(err => setErrorMsg(err.message));
  };

  const handleCancelOffer = (id) => {
    if (!confirm('Are you sure you want to cancel this offer?')) return;
    
    fetch(`/api/offers/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete offer');
        fetchOffers();
      })
      .catch(err => alert(err.message));
  };

  const handleOpenExtend = (off) => {
    const today = new Date();
    const plus3 = new Date(today.setDate(today.getDate() + 3));
    setExtendModal({
      open: true,
      offer: off,
      newDate: plus3.toISOString().split('T')[0],
      newTime: off.end_time || '23:59'
    });
  };

  const handleSaveExtend = () => {
    if (!extendModal.offer || !extendModal.newDate || !extendModal.newTime) return;
    
    const newExpiresAt = new Date(`${extendModal.newDate}T${extendModal.newTime}:00`).toISOString();
    if (new Date(newExpiresAt).getTime() <= now.getTime()) {
      alert('New expiry date & time must be in the future!');
      return;
    }

    fetch(`/api/offers/${extendModal.offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        end_date: extendModal.newDate,
        end_time: extendModal.newTime,
        expires_at: newExpiresAt,
        status: 'active'
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to extend offer');
        return res.json();
      })
      .then(() => {
        setExtendModal({ open: false, offer: null, newDate: '', newTime: '23:59' });
        fetchOffers();
      })
      .catch(err => alert(err.message));
  };

  // Filter offers based on real-time countdown status
  const processedOffers = offers.map(off => {
    const cd = getCountdown(off.expires_at, now);
    const isActuallyExpired = off.status === 'expired' || cd.status === 'expired';
    return {
      ...off,
      countdown: cd,
      isExpired: isActuallyExpired
    };
  });

  const activeOffersList = processedOffers.filter(o => !o.isExpired);
  const expiredOffersList = processedOffers.filter(o => o.isExpired);

  const displayedOffers = activeFilter === 'active' 
    ? activeOffersList 
    : activeFilter === 'expired' 
      ? expiredOffersList 
      : processedOffers;

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>{t(lang, 'offers')}</span>
            <span className="text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Exact Date & Time Expiry
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create profit-aware promotional deals that automatically expire on your exact target date and time.
          </p>
        </div>

        {/* Live Clock Badge */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2.5 self-start sm:self-auto font-mono text-xs">
          <Clock size={16} className="text-primary-500" />
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-sans font-bold">Current System Time</p>
            <p className="font-extrabold text-gray-900 dark:text-white">
              {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Offer Builder */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <h3 className="font-extrabold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700 flex items-center gap-1.5">
            <Percent size={18} className="text-primary-500" /> Profit-Aware Offer Calculator
          </h3>

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Product drop down */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Select Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setErrorMsg('');
                }}
                className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full font-medium"
                required
              >
                <option value="">-- Choose a product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Sell: ₹{p.selling_price} | Stock: {p.quantity})
                  </option>
                ))}
              </select>
            </div>

            {/* Offer type details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Offer Type</label>
                <select
                  value={offerType}
                  onChange={(e) => setOfferType(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                >
                  <option value="Percentage Discount">Percentage (%)</option>
                  <option value="Flat Discount">Flat (₹)</option>
                  <option value="Buy 1 Get 1">Buy 1 Get 1 (BOGO)</option>
                  <option value="Clearance Sale">Clearance Sale</option>
                </select>
              </div>

              {/* Discount inputs */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  {offerType === 'Percentage Discount' ? 'Discount (%)' : (offerType === 'Flat Discount' ? 'Discount (₹)' : 'Value')}
                </label>
                <input 
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  disabled={offerType === 'Buy 1 Get 1'} // BOGO is fixed at 50% discount
                  placeholder="e.g. 10"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full disabled:opacity-50 font-bold"
                  required
                />
              </div>
            </div>

            {/* Exact Expiration Date & Time Configuration */}
            <div className="bg-gray-50 dark:bg-gray-750/70 p-3.5 rounded-xl border border-gray-200 dark:border-gray-650 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase flex items-center gap-1.5">
                  <Clock size={14} className="text-primary-500" /> Expiry Date & Exact Time
                </label>
                <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">
                  Auto-Expires at this minute
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '+1 Hour Flash', type: '1hr' },
                  { label: 'Today (11:59 PM)', type: 'today_end' },
                  { label: 'Tomorrow', type: 'tomorrow' },
                  { label: '3 Days', type: '3days' },
                  { label: '1 Week', type: '1week' }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p.type)}
                    className="text-[10px] font-bold bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-gray-700 dark:text-gray-200 hover:text-primary-600 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-600 transition shadow-2xs cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Expiry Date</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full font-mono font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Exact Expiry Time</label>
                  <input 
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Real-time Preview Banner */}
              <div className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center justify-between gap-2 ${
                isInputExpired 
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-600' 
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-700 dark:text-emerald-400'
              }`}>
                <span className="flex items-center gap-1 font-bold">
                  {isInputExpired ? <AlertTriangle size={13} /> : <Timer size={13} />}
                  <span>Expires Exactly At:</span>
                </span>
                <span className="font-black">
                  {formatExactDateTime(combinedExpiryString)}
                </span>
              </div>
            </div>

            {/* LIVE MARGIN MATRIX PANEL */}
            {selectedProduct && (
              <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-xl border border-gray-150 dark:border-gray-700 flex flex-col gap-3 text-xs">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400">Live Margin Matrix:</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">Normal pricing:</p>
                    <p className="font-bold text-gray-700 dark:text-gray-200 mt-1">Sell Price: ₹{originalSellingPrice}</p>
                    <p className="text-[10px] text-green-600 font-semibold mt-0.5">Profit margin: ₹{normalProfit} ({(normalProfit/originalSellingPrice * 100).toFixed(0)}%)</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Proposed Offer pricing:</p>
                    <p className="font-extrabold text-gray-900 dark:text-white mt-1">Offer Price: ₹{offerPrice.toFixed(0)}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${isProfitNegative ? 'text-red-500' : 'text-green-600'}`}>
                      Profit margin: ₹{discountProfit.toFixed(0)} ({(discountProfit/offerPrice * 100).toFixed(0)}%)
                    </p>
                  </div>
                </div>

                {/* Warning and Override */}
                {isProfitNegative && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-lg flex flex-col gap-2 mt-1">
                    <span className="font-bold flex items-center gap-1"><AlertTriangle size={14} className="shrink-0" /> Safety Warning!</span>
                    <p className="text-[10px] leading-relaxed">
                      The discount proposed exceeds purchase value of ₹{purchasePrice}. This offer results in a net loss of <strong>₹{Math.abs(discountProfit).toFixed(0)}</strong> per unit sold.
                    </p>
                    <div className="flex items-center gap-2 mt-1 select-none">
                      <input 
                        type="checkbox"
                        id="override"
                        checked={clearanceOverride}
                        onChange={(e) => setClearanceOverride(e.target.checked)}
                        className="accent-red-600 rounded cursor-pointer"
                      />
                      <label htmlFor="override" className="font-extrabold text-[10px] cursor-pointer">Clearance override: I approve this margin loss.</label>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={(isProfitNegative && !clearanceOverride) || isInputExpired}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check size={18} /> Approve & Save Offer
            </button>
          </form>
        </div>

        {/* Right Hand: Active Offers list with Live Ticking Timers */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 dark:border-gray-700">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Tag size={18} className="text-primary-500" /> Offers Engine
            </h3>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-750 p-1 rounded-xl">
              <button
                onClick={() => setActiveFilter('active')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeFilter === 'active' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                🟢 Active ({activeOffersList.length})
              </button>
              <button
                onClick={() => setActiveFilter('expired')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeFilter === 'expired' 
                    ? 'bg-red-600 text-white shadow-xs' 
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                🔴 Expired ({expiredOffersList.length})
              </button>
              <button
                onClick={() => setActiveFilter('all')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeFilter === 'all' 
                    ? 'bg-gray-800 dark:bg-gray-650 text-white shadow-xs' 
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                All ({processedOffers.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-750/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-150 dark:border-gray-700">
                  <th className="p-3">Product</th>
                  <th className="p-3 text-right">Offer Price</th>
                  <th className="p-3 text-center">Exact Expiration & Countdown</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-450">Loading offers...</td>
                  </tr>
                ) : displayedOffers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400 italic">
                      {activeFilter === 'active' ? 'No active offers running right now.' : 'No offers found in this view.'}
                    </td>
                  </tr>
                ) : (
                  displayedOffers.map((off) => {
                    const cd = off.countdown;
                    return (
                      <tr key={off.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-750/35 transition ${off.isExpired ? 'opacity-65' : ''}`}>
                        <td className="p-3">
                          <div>
                            <p className="font-extrabold text-gray-800 dark:text-white">{off.product_name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {off.offer_type} • Original: ₹{off.original_price}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <p className="font-black text-sm text-primary-600 dark:text-primary-400">₹{off.offer_price}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">Save ₹{(off.original_price - off.offer_price).toFixed(0)}</p>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">
                              {formatExactDateTime(off.expires_at)}
                            </span>

                            {/* Live Ticking Countdown Badge */}
                            {off.isExpired ? (
                              <span className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900 flex items-center gap-1">
                                <X size={10} /> Expired
                              </span>
                            ) : cd.status === 'urgent' ? (
                              <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 animate-pulse flex items-center gap-1">
                                <Timer size={10} /> {cd.text} left
                              </span>
                            ) : (
                              <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-850 flex items-center gap-1 shadow-2xs">
                                <Clock size={10} /> {cd.text} left
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            off.isExpired
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                              : 'bg-emerald-600 text-white shadow-xs'
                          }`}>
                            {off.isExpired ? 'Ended' : 'Active'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {!off.isExpired && (
                              <button
                                onClick={() => navigateTo('pamphlet', { autoLoadOfferId: off.id })}
                                className="bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-850 px-2 py-1 rounded-lg font-bold hover:bg-primary-100 flex items-center gap-0.5 transition cursor-pointer"
                                title="Design Publicity Pamphlet"
                              >
                                <FileImage size={12} /> Design
                              </button>
                            )}

                            {/* Extend Time Button */}
                            <button
                              onClick={() => handleOpenExtend(off)}
                              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-lg font-bold border border-gray-300 dark:border-gray-600 flex items-center gap-1 transition text-[11px] cursor-pointer"
                              title="Extend Date & Time"
                            >
                              <Clock size={11} /> Extend
                            </button>

                            <button
                              onClick={() => handleCancelOffer(off.id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer"
                              title="Delete Offer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Extend Expiration Modal */}
      {extendModal.open && extendModal.offer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
              <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-primary-500" />
                <span>Extend Offer Expiration Time</span>
              </h3>
              <button 
                onClick={() => setExtendModal({ open: false, offer: null, newDate: '', newTime: '23:59' })}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {extendModal.offer.product_name}
              </p>
              <p className="text-xs text-gray-400">
                Current Expiration: {formatExactDateTime(extendModal.offer.expires_at)}
              </p>
            </div>

            {/* Quick Extension Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: '+1 Day', days: 1 },
                { label: '+3 Days', days: 3 },
                { label: '+1 Week', days: 7 }
              ].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + opt.days);
                    setExtendModal(prev => ({ ...prev, newDate: d.toISOString().split('T')[0] }));
                  }}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-primary-50 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-650 cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">New Expiry Date</label>
                <input
                  type="date"
                  value={extendModal.newDate}
                  onChange={(e) => setExtendModal({ ...extendModal, newDate: e.target.value })}
                  className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">New Expiry Time</label>
                <input
                  type="time"
                  value={extendModal.newTime}
                  onChange={(e) => setExtendModal({ ...extendModal, newTime: e.target.value })}
                  className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none font-bold font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={() => setExtendModal({ open: false, offer: null, newDate: '', newTime: '23:59' })}
                className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveExtend}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} /> Update Expiry Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

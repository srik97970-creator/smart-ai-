import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  Tag, 
  AlertTriangle, 
  Calendar, 
  ArrowRight, 
  Check,
  FileImage,
  TrendingDown,
  X
} from 'lucide-react';
import { t } from '../utils/translations';

export default function Offers({ lang, navigateTo, params }) {
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [offerType, setOfferType] = useState('Percentage Discount');
  const [discountValue, setDiscountValue] = useState(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [clearanceOverride, setClearanceOverride] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchOffers();
    
    // Set End date default to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setEndDate(nextWeek.toISOString().split('T')[0]);
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
      // Clearance / combo offers default to flat discount or customized values
      discountAmount = originalSellingPrice * (Number(discountValue) / 100);
      offerPrice = originalSellingPrice - discountAmount;
    }

    discountProfit = offerPrice - purchasePrice;
  }

  const isProfitNegative = discountProfit < 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedProductId) return setErrorMsg('Please select a product');
    if (discountValue <= 0) return setErrorMsg('Discount must be greater than zero');
    if (isProfitNegative && !clearanceOverride) {
      return setErrorMsg('Offer rejected: Profit margin is negative! Check Clearance Override if you wish to clear stock at a loss.');
    }

    const offerData = {
      product_id: selectedProductId,
      offer_type: offerType,
      original_price: originalSellingPrice,
      discount: Number(discountValue),
      offer_price: Number(offerPrice.toFixed(2)),
      start_date: startDate,
      end_date: endDate
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

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">{t(lang, 'offers')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Create profit-aware discounts. The engine calculates profit margins in real-time to prevent cash losses.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Offer Builder */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <h3 className="font-extrabold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700 flex items-center gap-1.5">
            <Percent size={18} className="text-primary-500" /> Profit-Aware Offer Calculator
          </h3>

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} />
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
                className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
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
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                  required
                />
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
              disabled={isProfitNegative && !clearanceOverride}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Check size={18} /> Approve & Save Offer
            </button>
          </form>
        </div>

        {/* Right Hand: Active Offers list */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Tag size={18} className="text-primary-500" /> Active Offers List
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-750/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-150 dark:border-gray-700">
                  <th className="p-3">Product details</th>
                  <th className="p-3">Offer type</th>
                  <th className="p-3 text-right">Offer Price</th>
                  <th className="p-3 text-center">Validity</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-450">Loading offers...</td>
                  </tr>
                ) : offers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-450">No promotional offers active.</td>
                  </tr>
                ) : (
                  offers.map((off) => (
                    <tr key={off.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/35 transition">
                      <td className="p-3">
                        <div>
                          <p className="font-extrabold text-gray-800 dark:text-white">{off.product_name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Original: ₹{off.original_price}</p>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-gray-500">{off.offer_type}</td>
                      <td className="p-3 text-right font-black text-primary-600 dark:text-primary-400">₹{off.offer_price}</td>
                      <td className="p-3 text-center text-[10px] text-gray-400 font-mono">
                        {off.start_date} to {off.end_date}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigateTo('pamphlet', { autoLoadOfferId: off.id })}
                            className="bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-850 px-2 py-1 rounded font-bold hover:bg-primary-100 flex items-center gap-0.5 transition"
                            title="Generate Publicity Pamphlet"
                          >
                            <FileImage size={12} /> Design
                          </button>
                          <button
                            onClick={() => handleCancelOffer(off.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950 transition"
                            title="Cancel Offer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

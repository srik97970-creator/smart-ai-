import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Percent, 
  Send,
  Zap,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  Bot
} from 'lucide-react';
import { t } from '../utils/translations';

export default function Dashboard({ lang, navigateTo }) {
  const [stats, setStats] = useState({
    revenue: 0,
    grossProfit: 0,
    netProfit: 0,
    productsSold: 0,
    transactions: 0
  });
  const [weeklyStats, setWeeklyStats] = useState({
    revenue: 0,
    grossProfit: 0,
    netProfit: 0,
    productsSold: 0,
    transactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [offers, setOffers] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Today's Reports
      const reportRes = await fetch('/api/reports?range=today');
      if (reportRes.ok) {
        const reportData = await reportRes.json();
        if (reportData && reportData.summary) {
          setStats(reportData.summary);
        }
      }

      // 1b. Fetch Weekly Reports
      const weeklyRes = await fetch('/api/reports?range=7days');
      if (weeklyRes.ok) {
        const weeklyData = await weeklyRes.json();
        if (weeklyData && weeklyData.summary) {
          setWeeklyStats(weeklyData.summary);
        }
      }

      // 2. Fetch Products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) {
          setProducts(prodData);
        }
      }

      // 3. Fetch Insights
      const insRes = await fetch('/api/insights');
      if (insRes.ok) {
        const insData = await insRes.json();
        if (Array.isArray(insData)) {
          setInsights(insData);
        }
      }

      // 4. Fetch Offers List
      const offerRes = await fetch('/api/offers');
      if (offerRes.ok) {
        const offerData = await offerRes.json();
        if (Array.isArray(offerData)) {
          setOffers(offerData);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (promptText) => {
    navigateTo('aiAgent', { autoSendPrompt: promptText });
  };

  const submitMiniAi = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    navigateTo('aiAgent', { autoSendPrompt: aiPrompt });
  };

  // Stock calculations
  const totalStockQty = Array.isArray(products) ? products.reduce((sum, p) => sum + (p.quantity || 0), 0) : 0;
  const lowStockProducts = Array.isArray(products) ? products.filter(p => p.quantity <= p.minimum_stock) : [];
  const slowMovingProducts = Array.isArray(insights) ? insights.filter(ins => ins.type === 'slow_moving') : [];

  // Expiry calculations (expiring in next 90 days or already expired)
  const expiringProducts = Array.isArray(products) ? products.filter(p => {
    if (!p.expiry_date) return false;
    const expDate = new Date(p.expiry_date);
    const diffTime = expDate - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90;
  }) : [];

  // Find active clearance offer for a product
  const getActiveOfferForProduct = (prodId) => {
    const nowStr = new Date().toISOString().split('T')[0];
    return Array.isArray(offers) ? offers.find(o => 
      o.product_id === prodId && 
      o.status === 'active' && 
      o.start_date <= nowStr && 
      o.end_date >= nowStr
    ) : null;
  };

  const suggestionChips = [
    { text: "What is my profit today?", key: "profitToday" },
    { text: "Which products need restocking?", key: "needRestocking" },
    { text: "What is my best-selling product?", key: "bestSeller" },
    { text: "Which products should I promote?", key: "whichPromote" }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time business performance and AI intelligence.
          </p>
        </div>
        <div className="text-xs bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 px-3 py-1.5 rounded-lg font-bold border border-primary-200 dark:border-primary-850 flex items-center gap-1.5 self-start">
          <Zap size={14} className="pulse-active text-primary-500" />
          AI System Online
        </div>
      </div>

      {/* today stats card grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Card */}
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sales Revenue</span>
            <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><TrendingUp size={16} /></span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 divide-x divide-gray-150 dark:divide-gray-700">
            <div>
              <p className="text-[9px] text-gray-450 font-bold uppercase tracking-wider">Today</p>
              <h3 className="text-base lg:text-lg font-black text-gray-900 dark:text-white mt-0.5">₹{(stats.revenue || 0).toLocaleString('en-IN')}</h3>
              <p className="text-[8px] text-gray-400">{stats.transactions || 0} bills</p>
            </div>
            <div className="pl-2">
              <p className="text-[9px] text-gray-450 font-bold uppercase tracking-wider">Weekly</p>
              <h3 className="text-base lg:text-lg font-black text-gray-900 dark:text-white mt-0.5">₹{(weeklyStats.revenue || 0).toLocaleString('en-IN')}</h3>
              <p className="text-[8px] text-gray-400">{weeklyStats.transactions || 0} bills</p>
            </div>
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net Profit</span>
            <span className={`p-2 rounded-xl ${(stats.netProfit || 0) >= 0 ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
              {(stats.netProfit || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 divide-x divide-gray-150 dark:divide-gray-700">
            <div>
              <p className="text-[9px] text-gray-450 font-bold uppercase tracking-wider">Today</p>
              <h3 className={`text-base lg:text-lg font-black mt-0.5 ${(stats.netProfit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                ₹{(stats.netProfit || 0).toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="pl-2">
              <p className="text-[9px] text-gray-450 font-bold uppercase tracking-wider">Weekly</p>
              <h3 className={`text-base lg:text-lg font-black mt-0.5 ${(weeklyStats.netProfit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                ₹{(weeklyStats.netProfit || 0).toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </div>

        {/* Low Stock count Card */}
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Low Stock</span>
            <span className={`p-2 rounded-xl ${lowStockProducts.length > 0 ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">{lowStockProducts.length} Items</h3>
            <p className="text-[10px] text-gray-400 mt-1">Total items in store: {products.length}</p>
          </div>
        </div>

        {/* Active Offers Card */}
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Offers</span>
            <span className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl"><Percent size={16} /></span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">
              {offers.filter(o => o.status === 'active').length} Offers
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">Slow items: {slowMovingProducts.length}</p>
          </div>
        </div>
      </div>

      {/* Proactive AI Insights Panel */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-primary-500/10 to-green-500/10 border border-primary-200 dark:border-primary-900/40 p-4 lg:p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-primary-500 text-white rounded-lg"><Zap size={16} /></span>
            <h3 className="font-extrabold text-sm lg:text-base text-primary-800 dark:text-primary-300">🏪 AI Business Assistant Insights</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {insights.map((ins) => {
              const isLowStock = ins.type === 'low_stock';
              return (
                <div key={ins.id} className="bg-white dark:bg-gray-850 p-4 rounded-xl border border-gray-100 dark:border-gray-750 flex flex-col justify-between gap-3 shadow-sm">
                  <div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${isLowStock ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30' : 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30'}`}>
                      {isLowStock ? 'Low Stock' : 'Slow Moving'}
                    </span>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mt-2">{ins.message}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{ins.recommendation}</p>
                  </div>
                  <div className="flex gap-2">
                    {isLowStock ? (
                      <button 
                        onClick={() => navigateTo('inventory', { autoRestockProdId: ins.ref_id })}
                        className="text-xs px-3.5 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold flex items-center gap-1 shadow hover:shadow-primary-500/10 transition"
                      >
                        Restock Now <ArrowRight size={12} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigateTo('offers', { autoCreateOfferProdId: ins.ref_id })}
                        className="text-xs px-3.5 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold flex items-center gap-1 shadow hover:shadow-primary-500/10 transition"
                      >
                        Create Offer <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expiry & Clearance Alert Panel */}
      {expiringProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-red-500 text-white rounded-lg">📅</span>
            <h3 className="font-extrabold text-sm lg:text-base text-gray-900 dark:text-white">Expiry & Clearance Alerts</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2 leading-relaxed">
            These products are expiring soon (under 90 days). Promote them early to clear stock before they go waste!
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {expiringProducts.map((p) => {
              const activeOffer = getActiveOfferForProduct(p.id);
              const expDate = new Date(p.expiry_date);
              const diffTime = expDate - new Date();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isExpired = diffDays <= 0;

              return (
                <div key={p.id} className="p-4 rounded-xl border border-gray-150 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 flex flex-col justify-between gap-3 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isExpired ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : diffDays <= 30 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'}`}>
                        {isExpired ? 'Expired' : `${diffDays} Days Left`}
                      </span>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{p.name}</h4>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-2 font-medium">📅 Expiry Date: {new Date(p.expiry_date).toLocaleDateString('en-IN')}</p>
                    
                    {activeOffer ? (
                      <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold flex flex-col gap-1 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex justify-between">
                          <span>🏷️ Active Offer: {activeOffer.offer_type}</span>
                          <span className="text-gray-400 font-medium">Ends: {new Date(activeOffer.end_date).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                          Price: ₹{activeOffer.offer_price} (Original: ₹{activeOffer.original_price}) | Starts: {new Date(activeOffer.start_date).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-red-500 font-bold flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-100 dark:border-red-900/30">
                        <span>⚠️ No active clearance offer! Clear this stock quickly.</span>
                      </div>
                    )}
                  </div>
                  
                  {!activeOffer && (
                    <button
                      onClick={() => navigateTo('offers', { autoCreateOfferProdId: p.id })}
                      className="text-xs px-3.5 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold shadow hover:shadow-primary-500/10 transition self-start flex items-center gap-1"
                    >
                      Promote Stock <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ask AI Mini Widget & Quick Stats Tables */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Hand: Ask SmartShop AI Mini Box */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Bot size={18} /></span>
            <h3 className="font-extrabold text-gray-900 dark:text-white">Ask SmartShop AI</h3>
          </div>
          
          <form onSubmit={submitMiniAi} className="flex gap-2">
            <input 
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="How much profit did I earn this month?"
              className="flex-1 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button 
              type="submit"
              className="bg-primary-600 hover:bg-primary-500 text-white p-3 rounded-xl shadow-lg shadow-primary-500/10 transition"
            >
              <Send size={18} />
            </button>
          </form>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Suggested Questions:</span>
            <div className="flex flex-wrap gap-2">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(chip.text)}
                  className="text-xs px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-950/30 border border-gray-200 dark:border-gray-650 hover:border-primary-200 text-gray-600 dark:text-gray-300 rounded-lg text-left transition"
                >
                  {chip.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Hand: Stores Quick Overview List */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag size={18} className="text-gray-500" /> Stock Overview
          </h3>
          <div className="flex-1 flex flex-col justify-around gap-4">
            
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Store Inventory</span>
              <span className="font-black text-gray-800 dark:text-gray-200">{totalStockQty} items</span>
            </div>

            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Low Stock items</span>
              <span className={`text-sm font-black ${lowStockProducts.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {lowStockProducts.length} items
              </span>
            </div>

            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Slow-Moving stock items</span>
              <span className="text-sm font-black text-amber-500">{slowMovingProducts.length} items</span>
            </div>
            
            <button 
              onClick={() => navigateTo('inventory')}
              className="text-xs py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-750 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition text-center"
            >
              Go to Inventory Manager
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

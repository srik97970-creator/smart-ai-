import React, { useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  Sparkles, 
  Palette, 
  ChevronRight, 
  Calculator, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { t } from '../utils/translations';

export default function LandingPage({ onEnterDemo, lang, setLang, shopInfo }) {
  const [designerCost, setDesignerCost] = useState(500);
  const [pamphletsCount, setPamphletsCount] = useState(10);

  const estimatedSavings = designerCost * pamphletsCount;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-slate-800">
        <span className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-primary-400">
          🏪 SmartShop AI
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            {['en', 'te', 'hi'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs px-2.5 py-1 rounded font-bold uppercase transition ${lang === l ? 'bg-primary-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <button 
            onClick={onEnterDemo}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-primary-500/20 transition duration-150"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto w-full px-6 py-16 lg:py-24 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
          <span className="inline-flex items-center self-center lg:self-start gap-1.5 px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} /> The Smartest Way to Run Your Shop
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Run Your Shop Smarter With <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-green-300">AI Assistance</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Manage stock, track sales and profit, discover better offers, and create professional publicity materials — all from one simple application designed for small and medium-sized store owners.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-2">
            <button 
              onClick={onEnterDemo}
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-base font-bold shadow-xl hover:shadow-primary-500/30 flex items-center justify-center gap-2 group transition duration-150"
            >
              Get Started Now <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#saver" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-base font-bold transition flex items-center justify-center gap-2"
            >
              <Calculator size={18} /> Calculate Savings
            </a>
          </div>
        </div>

        {/* Hero Interactive App Mockup preview */}
        <div className="lg:col-span-5 bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center gap-1.5 border-b border-slate-700 pb-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-slate-500 ml-2 font-mono">smartshop-ai.app</span>
          </div>

          <div className="flex flex-col gap-4 text-xs font-medium">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/40 flex justify-between">
              <div>
                <p className="text-slate-500 uppercase tracking-wider text-[10px]">Today's Sales</p>
                <p className="text-lg font-extrabold text-slate-100 mt-0.5">₹8,450</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 uppercase tracking-wider text-[10px]">Net Profit</p>
                <p className="text-lg font-extrabold text-primary-400 mt-0.5">₹1,630</p>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/40">
              <p className="text-primary-400 font-bold flex items-center gap-1 mb-1">
                <Sparkles size={12} /> Proactive AI Recommendations:
              </p>
              <p className="text-slate-300">
                "Surf Excel detergent has high stock (38 units) but sales have slowed. Create a 10% offer to clear stock."
              </p>
              <button 
                onClick={onEnterDemo}
                className="mt-2.5 px-3 py-1.5 bg-primary-600 text-white rounded font-bold hover:bg-primary-500 transition duration-100 flex items-center gap-1"
              >
                Create Offer & Generate Pamphlet
              </button>
            </div>

            {/* Simulated Pamphlet Graphic Preview */}
            <div className="bg-gradient-to-br from-yellow-500 to-amber-600 text-slate-950 p-4 rounded-xl shadow-lg border border-amber-400 text-center font-bold relative">
              <span className="absolute top-2 right-2 bg-red-600 text-white text-[8px] px-1 py-0.5 rounded">FESTIVAL OFFER</span>
              <p className="text-[10px] tracking-widest text-amber-950">SRI LAKSHMI STORES</p>
              <p className="text-base font-extrabold leading-tight mt-1">SURF EXCEL 1 KG</p>
              <div className="flex justify-center items-center gap-2 mt-1">
                <span className="line-through text-slate-800 text-[10px]">₹140</span>
                <span className="text-lg font-black text-red-700">₹126</span>
              </div>
              <p className="text-[9px] text-amber-950 mt-1">Save ₹14 • Call: 98765 43210</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Problems Section */}
      <section className="bg-slate-950 py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            Challenges Faced by Small Shopkeepers
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Inventory Forgetting", desc: "Forgetting to restock important items, losing customer trust." },
              { title: "Excess/Slow Stock", desc: "Capital stuck in items sitting on shelves for months." },
              { title: "Manual Profit Tracking", desc: "Hard to calculate daily revenue, costs, and helper wages." },
              { title: "Expensive Designer Fees", desc: "Paying ₹500 for every single offer pamphlet or WhatsApp flyer." }
            ].map((p, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl flex gap-3.5">
                <AlertCircle className="text-red-400 shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-slate-200">{p.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features & Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col gap-16">
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold">All-In-One Shop Solution</h2>
          <p className="text-slate-400 max-w-xl mx-auto">SmartShop AI seamlessly maps inventory to sales, and generates marketing publicity content automatically.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Package, title: "Manage Stock", desc: "Know exactly what you have. Receive automatic low-stock triggers before products run out completely.", color: "text-blue-400" },
            { icon: TrendingUp, title: "Track Profit", desc: "Detailed, automated sales ledgers calculating margins and net profit minus shop expenses like rent/power.", color: "text-green-400" },
            { icon: Sparkles, title: "AI Assistant", desc: "Ask questions in Telugu, Hindi, or English. Receive proactive business insights based on real store transactions.", color: "text-purple-400" },
            { icon: Palette, title: "Pamphlet Generator", desc: "Design flyers instantly inside the app. Download, share on WhatsApp, and generate localized captions in seconds.", color: "text-amber-400" }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl flex flex-col gap-4">
                <div className={`p-3 bg-slate-900 rounded-xl inline-flex self-start ${feat.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-100">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Publicity Cost Calculator */}
      <section id="saver" className="bg-slate-950 py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 rounded-3xl shadow-xl flex flex-col gap-8">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center justify-center gap-2">
              <Calculator className="text-primary-500" /> Publicity Cost Saver Calculator
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              SmartShop AI lets you generate design pamphlets yourself. See how much money you can save compared to hiring external designers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center mt-4">
            <div className="flex flex-col gap-6">
              {/* Slider 1: Designer Fee */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-bold text-sm">
                  <span className="text-slate-300">Designer Fee per Flyer:</span>
                  <span className="text-primary-400">₹{designerCost}</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="2000" 
                  step="50"
                  value={designerCost} 
                  onChange={(e) => setDesignerCost(Number(e.target.value))}
                  className="w-full accent-primary-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Configure what an external designer usually charges you.</span>
              </div>

              {/* Slider 2: Flyer Count */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-bold text-sm">
                  <span className="text-slate-300">Pamphlets needed per month:</span>
                  <span className="text-primary-400">{pamphletsCount} flyers</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={pamphletsCount} 
                  onChange={(e) => setPamphletsCount(Number(e.target.value))}
                  className="w-full accent-primary-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Savings Display */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700/80 flex flex-col items-center justify-center text-center">
              <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Estimated Monthly Savings</p>
              <p className="text-4xl sm:text-5xl font-black text-primary-400 mt-2">₹{estimatedSavings.toLocaleString('en-IN')}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-4 leading-normal">
                <CheckCircle size={12} className="text-primary-500 shrink-0" />
                <span>Estimated saving compared with creating this promotional design externally.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-900/40 py-8 text-center text-xs text-slate-500 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-extrabold tracking-wider text-primary-400">🏪 SmartShop AI</p>
          <p>© 2026 SmartShop AI. Your Agentic Retail Assistant.</p>
          <div className="flex gap-4">
            <button onClick={onEnterDemo} className="hover:text-slate-300 transition font-medium">Terms of Use</button>
            <button onClick={onEnterDemo} className="hover:text-slate-300 transition font-medium">Privacy Policy</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

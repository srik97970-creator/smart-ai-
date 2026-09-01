import React, { useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  Sparkles, 
  Palette, 
  ChevronRight, 
  Calculator, 
  CheckCircle,
  AlertCircle,
  Phone,
  MessageCircle,
  Tag
} from 'lucide-react';
import { t } from '../utils/translations';

export default function LandingPage({ onEnterDemo, lang, setLang, shopInfo }) {
  const [designerCost, setDesignerCost] = useState(500);
  const [pamphletsCount, setPamphletsCount] = useState(10);

  const estimatedSavings = designerCost * pamphletsCount;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Live Store Offer Announcement Ribbon */}
      <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white text-xs font-black py-2.5 px-4 text-center flex flex-wrap items-center justify-center gap-2 shadow-inner border-b border-amber-400/40">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-200"></span>
        </span>
        <span>🔥 LIVE FESTIVAL OFFER at Sri Lakshmi Stores: Surf Excel 1 KG at only <span className="underline decoration-yellow-300 font-bold">₹126</span> (Save ₹14!)</span>
        <a 
          href="tel:9440925829" 
          className="ml-2 bg-black/20 hover:bg-black/30 px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-white/30 inline-flex items-center gap-1 transition"
        >
          <Phone size={10} /> Call: 94409 25829
        </a>
        <a
          href="https://api.whatsapp.com/send?text=%F0%9F%94%A5%20*FESTIVAL%20OFFER%20at%20Sri%20Lakshmi%20Stores*%21%0A%0ASurf%20Excel%201%20KG%20at%20only%20*₹126*%20%28Save%20*₹14*%21%29%0A%0A📍%20Main%20Road%2C%20Gunadala%2C%20Vijayawada%0A📞%20Call%3A%209440925829%20%7C%20UPI%3A%209440925829%40ybl"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-500 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 transition shadow"
        >
          <MessageCircle size={10} /> Send through WhatsApp
        </a>
      </div>
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
            <div className="bg-gradient-to-br from-yellow-500 via-amber-500 to-amber-600 text-slate-950 p-4 rounded-2xl shadow-xl border-2 border-amber-300 text-center font-bold relative">
              <span className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full shadow animate-pulse">
                FESTIVAL OFFER
              </span>
              <p className="text-[10px] tracking-widest text-amber-950 uppercase font-black">SRI LAKSHMI STORES</p>
              <p className="text-base font-extrabold leading-tight mt-1">SURF EXCEL 1 KG</p>
              <div className="flex justify-center items-center gap-2 mt-1">
                <span className="line-through text-slate-800 text-xs font-mono">₹140</span>
                <span className="text-xl font-black text-red-700 font-mono">₹126</span>
              </div>
              <p className="text-[10px] text-amber-950 font-black mt-1">
                Save ₹14 • Call: <a href="tel:9440925829" className="underline hover:text-red-900 font-mono font-bold">94409 25829</a>
              </p>
              <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-amber-600/30">
                <a
                  href="tel:9440925829"
                  className="bg-slate-900 hover:bg-black text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow transition"
                >
                  <Phone size={10} /> Call Now
                </a>
                <a
                  href="https://api.whatsapp.com/send?text=%F0%9F%94%A5%20*FESTIVAL%20OFFER%20at%20Sri%20Lakshmi%20Stores*%21%0A%0ASurf%20Excel%201%20KG%20at%20only%20*₹126*%20%28Save%20*₹14*%21%29%0A%0A📍%20Main%20Road%2C%20Gunadala%2C%20Vijayawada%0A📞%20Call%3A%209440925829%20%7C%20UPI%3A%209440925829%40ybl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow transition"
                >
                  <MessageCircle size={10} /> Send through WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Store Offers Spotlight on Front Page */}
      <section className="max-w-7xl mx-auto w-full px-6 py-6">
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-2xl border-4 border-yellow-300 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                <span className="bg-red-600 text-white text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider shadow animate-pulse">
                  🔥 LIVE FESTIVAL OFFER
                </span>
                <span className="bg-white/40 text-slate-950 text-xs font-black uppercase px-3 py-1 rounded-full">
                  SRI LAKSHMI STORES
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mt-1 tracking-tight">
                SURF EXCEL 1 KG
              </h2>
              <div className="flex items-center gap-3 justify-center md:justify-start mt-1">
                <span className="text-xl line-through text-slate-800 font-bold font-mono">₹140</span>
                <span className="text-4xl font-black text-red-700 font-mono">₹126</span>
                <span className="bg-green-700 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                  SAVE ₹14
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-amber-950 mt-1">
                📍 Store Address: Main Road, Gunadala, Vijayawada, Andhra Pradesh • UPI: 9440925829@ybl
              </p>
            </div>

            {/* Actions: Call & WhatsApp */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <a
                href="tel:9440925829"
                className="bg-slate-950 hover:bg-black text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition"
              >
                <Phone size={18} className="text-yellow-400" />
                <span>Call: 94409 25829</span>
              </a>
              <a
                href="https://api.whatsapp.com/send?text=%F0%9F%94%A5%20*FESTIVAL%20OFFER%20at%20Sri%20Lakshmi%20Stores*%21%0A%0A%F0%9F%9B%8D%EF%B8%8F%20*SURF%20EXCEL%201%20KG*%0A%F0%9F%92%B0%20Offer%20Price%3A%20*₹126*%20%28Original%3A%20~~₹140~~%20-%20Save%20*₹14*%21%29%0A%0A%F0%9F%93%8D%20Store%3A%20Main%20Road%2C%20Gunadala%2C%20Vijayawada%0A%F0%9F%93%9E%20Call%3A%209440925829%20%7C%20UPI%3A%209440925829%40ybl"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition"
              >
                <MessageCircle size={18} className="text-white" />
                <span>Send through WhatsApp</span>
              </a>
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

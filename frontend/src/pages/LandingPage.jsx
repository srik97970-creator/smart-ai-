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
  Tag,
  Copy,
  Check,
  History,
  RotateCcw,
  Percent,
  User,
  ShoppingBag,
  CreditCard,
  Banknote,
  Scale,
  Bell,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BookOpen
} from 'lucide-react';
import { t } from '../utils/translations';

export default function LandingPage({ onEnterDemo, lang, setLang, shopInfo }) {
  // Real Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcEquation, setCalcEquation] = useState('');
  const [calcPrevValue, setCalcPrevValue] = useState(null);
  const [calcOperator, setCalcOperator] = useState(null);
  const [calcWaitingForOperand, setCalcWaitingForOperand] = useState(false);
  const [calcHistory, setCalcHistory] = useState([
    { eq: '120 × 3 + 50', res: '410', time: 'Just now' },
    { eq: '2,450 - 550', res: '1,900', time: '1 min ago' }
  ]);
  const [calcCopied, setCalcCopied] = useState(false);

  const handleCalcNumber = (digit) => {
    if (calcWaitingForOperand) {
      setCalcDisplay(String(digit));
      setCalcWaitingForOperand(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? String(digit) : calcDisplay + digit);
    }
  };

  const handleCalcDecimal = () => {
    if (calcWaitingForOperand) {
      setCalcDisplay('0.');
      setCalcWaitingForOperand(false);
      return;
    }
    if (!calcDisplay.includes('.')) {
      setCalcDisplay(calcDisplay + '.');
    }
  };

  const handleCalcOperator = (nextOperator) => {
    const inputValue = parseFloat(calcDisplay);

    if (calcPrevValue == null) {
      setCalcPrevValue(inputValue);
      setCalcEquation(`${calcDisplay} ${nextOperator}`);
    } else if (calcOperator) {
      const currentValue = calcPrevValue || 0;
      const result = calculate(currentValue, inputValue, calcOperator);
      setCalcDisplay(String(result));
      setCalcPrevValue(result);
      setCalcEquation(`${result} ${nextOperator}`);
    }

    setCalcWaitingForOperand(true);
    setCalcOperator(nextOperator);
  };

  const calculate = (prev, current, op) => {
    switch (op) {
      case '+': return prev + current;
      case '-': return prev - current;
      case '×': return prev * current;
      case '÷': return current !== 0 ? Math.round((prev / current) * 100) / 100 : 'Error';
      default: return current;
    }
  };

  const handleCalcEquals = () => {
    const inputValue = parseFloat(calcDisplay);

    if (calcPrevValue != null && calcOperator) {
      const result = calculate(calcPrevValue, inputValue, calcOperator);
      const eqStr = `${calcPrevValue} ${calcOperator} ${inputValue}`;
      setCalcDisplay(String(result));
      setCalcEquation(`${eqStr} =`);
      setCalcHistory(prev => [
        { eq: eqStr, res: String(result), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev.slice(0, 7)
      ]);
      setCalcPrevValue(null);
      setCalcOperator(null);
      setCalcWaitingForOperand(true);
    }
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
  };

  const handleCalcAllClear = () => {
    setCalcDisplay('0');
    setCalcEquation('');
    setCalcPrevValue(null);
    setCalcOperator(null);
    setCalcWaitingForOperand(false);
  };

  const handleCalcBackspace = () => {
    if (calcWaitingForOperand) return;
    if (calcDisplay.length > 1) {
      setCalcDisplay(calcDisplay.slice(0, -1));
    } else {
      setCalcDisplay('0');
    }
  };

  const handleCalcToggleSign = () => {
    const val = parseFloat(calcDisplay);
    if (val !== 0) {
      setCalcDisplay(String(-val));
    }
  };

  const handleCalcPercent = () => {
    const val = parseFloat(calcDisplay);
    setCalcDisplay(String(val / 100));
  };

  const handleCalcAddGst = (rate) => {
    const val = parseFloat(calcDisplay) || 0;
    const gstAmt = (val * rate) / 100;
    const total = Math.round((val + gstAmt) * 100) / 100;
    const eqStr = `${val} + ${rate}% GST`;
    setCalcDisplay(String(total));
    setCalcEquation(`${eqStr} =`);
    setCalcHistory(prev => [
      { eq: eqStr, res: String(total), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...prev.slice(0, 7)
    ]);
    setCalcWaitingForOperand(true);
  };

  const handleCalcDiscount = (rate) => {
    const val = parseFloat(calcDisplay) || 0;
    const discAmt = (val * rate) / 100;
    const total = Math.round((val - discAmt) * 100) / 100;
    const eqStr = `${val} - ${rate}% OFF`;
    setCalcDisplay(String(total));
    setCalcEquation(`${eqStr} =`);
    setCalcHistory(prev => [
      { eq: eqStr, res: String(total), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...prev.slice(0, 7)
    ]);
    setCalcWaitingForOperand(true);
  };

  const handleCalcCopy = () => {
    navigator.clipboard.writeText(calcDisplay);
    setCalcCopied(true);
    setTimeout(() => setCalcCopied(false), 2000);
  };

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
              href="#calculator" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-base font-bold transition flex items-center justify-center gap-2"
            >
              <Calculator size={18} /> Digital Calculator
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

      {/* Real Interactive Digital Retail Calculator */}
      <section id="calculator" className="bg-slate-950 py-20 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6 flex flex-col gap-10">
          <div className="text-center flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full self-center border border-emerald-500/20">
              ⚡ Live Shopkeeper Tool
            </span>
            <h2 className="text-3xl sm:text-4xl font-black flex items-center justify-center gap-2.5 text-white">
              <Calculator className="text-emerald-400" size={32} /> Digital Retail Calculator
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Fast counter calculations, instant GST additions (+5%, +12%, +18%), quick discount rates, and interactive history tape.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* The Real Calculator Physical Device */}
            <div className="lg:col-span-7 bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/60 flex flex-col gap-5">
              
              {/* Screen / Display */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-inner relative overflow-hidden">
                <div className="flex justify-between items-center text-xs text-slate-400 min-h-[20px] font-mono">
                  <span>{calcEquation}</span>
                  <button
                    onClick={handleCalcCopy}
                    className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded-md transition"
                    title="Copy result"
                  >
                    {calcCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{calcCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-right text-3xl sm:text-4xl font-black font-mono text-white tracking-tight mt-2 overflow-x-auto select-all">
                  {calcDisplay}
                </div>
              </div>

              {/* Quick Business GST & Discount Keys */}
              <div className="grid grid-cols-6 gap-2">
                {[
                  { label: '+5% GST', fn: () => handleCalcAddGst(5), color: 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-800/50' },
                  { label: '+12% GST', fn: () => handleCalcAddGst(12), color: 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-800/50' },
                  { label: '+18% GST', fn: () => handleCalcAddGst(18), color: 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-800/50' },
                  { label: '-10% OFF', fn: () => handleCalcDiscount(10), color: 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-800/50' },
                  { label: '-20% OFF', fn: () => handleCalcDiscount(20), color: 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-800/50' },
                  { label: '-50% OFF', fn: () => handleCalcDiscount(50), color: 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-800/50' }
                ].map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={btn.fn}
                    className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-extrabold border transition shadow-sm ${btn.color}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {/* Row 1 */}
                <button 
                  onClick={handleCalcAllClear} 
                  className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 font-black py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base transition shadow-sm active:scale-95"
                >
                  AC
                </button>
                <button 
                  onClick={handleCalcClear} 
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base transition shadow-sm active:scale-95"
                >
                  C
                </button>
                <button 
                  onClick={handleCalcBackspace} 
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base transition shadow-sm active:scale-95 flex items-center justify-center"
                  title="Backspace"
                >
                  ⌫
                </button>
                <button 
                  onClick={() => handleCalcOperator('÷')} 
                  className="bg-amber-600 hover:bg-amber-500 text-white font-black py-3.5 sm:py-4 rounded-2xl text-lg sm:text-xl transition shadow-md shadow-amber-600/20 active:scale-95"
                >
                  ÷
                </button>

                {/* Row 2 */}
                <button 
                  onClick={() => handleCalcNumber(7)} 
                  className="bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700/80 font-bold py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg transition shadow-sm active:scale-95"
                >
                  7
                </button>
                <button 
                  onClick={() => handleCalcNumber(8)} 
                  className="bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700/80 font-bold py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg transition shadow-sm active:scale-95"
                >
                  8
                </button>
                <button 
                  onClick={() => handleCalcNumber(9)} 
                  className="bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700/80 font-bold py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg transition shadow-sm active:scale-95"
                >
                  9
                </button>
                <button 
                  onClick={() => handleCalcOperator('×')} 
                  className="bg-amber-600 hover:bg-amber-500 text-white font-black py-3.5 sm:py-4 rounded-2xl text-lg sm:text-xl transition shadow-md shadow-amber-600/20 active:scale-95"
                >
                  ×
                </button>

                {/* Row 3 */}
                <button 
                  onClick={() => handleCalcNumber(4)} 
                  className="bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700/80 font-bold py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg transition shadow-sm active:scale-95"
                >
                  4
                </button>
                <button 
                  onClick={() => handleCalcNumber(5)} 
                  className="bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700/80 font-bold py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg transition shadow-sm active:scale-95"
                >
                  5
                </button>
                <button 
                  onClick={() => handleCalcNumber(6)} 
                  className="bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700/80 font-bold py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg transition shadow-sm active:scale-95"
                >
                  6
                </button>
                <button 
                  onClick={() => handleCalcOperator('-')} 
                  className="bg-amber-600 hover:bg-amber-500 text-white font-black py-3.5 sm:py-4 rounded-2xl text-lg sm:text-xl transition shadow-md shadow-amber-600/20 active:scale-95"
                >
                  -
                </button>

                {/* Row 4 */}
                <button 
                  onClick={() => handleCalcNumber(1)} 
                  className="bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700/80 font-bold py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg transition shadow-sm active:scale-95"
                >
                  1
                </button>
                <button 
                  onClick={() => handleCalcNumber(2)} 
                  className="bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700/80 font-bold py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg transition shadow-sm active:scale-95"
                >
                  2
                </button>
                <button 
                  onClick={() => handleCalcNumber(3)} 
                  className="bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700/80 font-bold py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg transition shadow-sm active:scale-95"
                >
                  3
                </button>
                <button 
                  onClick={() => handleCalcOperator('+')} 
                  className="bg-amber-600 hover:bg-amber-500 text-white font-black py-3.5 sm:py-4 rounded-2xl text-lg sm:text-xl transition shadow-md shadow-amber-600/20 active:scale-95"
                >
                  +
                </button>

                {/* Row 5 */}
                <button 
                  onClick={handleCalcToggleSign} 
                  className="bg-slate-800/90 hover:bg-slate-750 text-slate-300 border border-slate-700/80 font-bold py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base transition shadow-sm active:scale-95"
                >
                  +/-
                </button>
                <button 
                  onClick={() => handleCalcNumber(0)} 
                  className="bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700/80 font-bold py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg transition shadow-sm active:scale-95"
                >
                  0
                </button>
                <button 
                  onClick={handleCalcDecimal} 
                  className="bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700/80 font-bold py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg transition shadow-sm active:scale-95"
                >
                  .
                </button>
                <button 
                  onClick={handleCalcEquals} 
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 sm:py-4 rounded-2xl text-xl transition shadow-lg shadow-emerald-600/30 active:scale-95"
                >
                  =
                </button>
              </div>
            </div>

            {/* Right Column: History Tape & Retail Shortcuts */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* History Tape Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <History size={16} className="text-emerald-400" /> Calculation History
                  </h3>
                  {calcHistory.length > 0 && (
                    <button
                      onClick={() => setCalcHistory([])}
                      className="text-[11px] text-slate-400 hover:text-red-400 font-bold transition"
                    >
                      Clear Log
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {calcHistory.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-6 text-center">No calculations recorded yet.</p>
                  ) : (
                    calcHistory.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCalcDisplay(item.res);
                          setCalcEquation(item.eq);
                        }}
                        className="bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs cursor-pointer transition group"
                        title="Click to load into calculator"
                      >
                        <div>
                          <p className="font-mono text-slate-400 text-[11px]">{item.eq}</p>
                          <p className="text-[9px] text-slate-600 mt-0.5">{item.time}</p>
                        </div>
                        <p className="font-mono font-black text-sm text-emerald-400 group-hover:underline">
                          = {item.res}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Retail Quick Tips Card */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-3">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  🏪 Retail Billing Shortcuts
                </h4>
                <ul className="text-xs text-slate-400 flex flex-col gap-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Use <strong>+GST buttons</strong> to instantly add 5%, 12%, or 18% tax to any wholesale product price.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>Use <strong>-OFF buttons</strong> to quickly compute festival discounts on billing totals.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>Click on any line in the <strong>History Tape</strong> to reload that calculated value anytime.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notebook vs Digital Khata & 6-Step Workflow Section */}
      <section className="bg-slate-900 py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-16">
          
          {/* Section Header */}
          <div className="text-center flex flex-col items-center gap-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5 shadow-sm">
              <BookOpen size={14} /> Paper Notebook vs Digital Khata
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Stop Losing Money in <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400">Old Paper Notebooks</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              When shop owners scribble credit in physical diaries, pages get torn, handwriting is illegible, and payments slip through the cracks. Here is how SmartShop AI solves every single credit problem.
            </p>
          </div>

          {/* Problem Checklist: The 7 Things Shopkeepers Forget in Notebooks */}
          <div className="grid md:grid-cols-2 gap-8 items-start bg-slate-950/90 border border-slate-800 p-6 sm:p-10 rounded-3xl shadow-2xl">
            {/* The Notebook Problem */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <h3 className="text-lg sm:text-xl font-black text-red-400 uppercase tracking-wide">
                  ❌ What You Forget in Paper Notebooks:
                </h3>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { q: "Who took the credit?", desc: "Customer name written unclearly or without phone number." },
                  { q: "How much did they take?", desc: "Scribbled numbers smudged or difficult to read weeks later." },
                  { q: "When did they take it?", desc: "No exact date or timestamp recorded during busy hours." },
                  { q: "How much has already been paid?", desc: "Partial cash payments scratched out messily." },
                  { q: "How much is remaining?", desc: "Requires manual addition prone to costly human error." },
                  { q: "When should they pay?", desc: "No promised due date noted; shopkeeper feels awkward asking." },
                  { q: "Which customers have overdue payments?", desc: "Must manually flip through dozens of dusty pages every night." }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-red-950/20 border border-red-900/30 p-3 rounded-xl">
                    <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-200">{item.q}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The SmartShop AI Solution */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h3 className="text-lg sm:text-xl font-black text-emerald-400 uppercase tracking-wide">
                  ✅ How SmartShop AI Solves It:
                </h3>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { a: "100% Verified Customer Profiles", sol: "Name, phone number, and custom credit limits saved digitally." },
                  { a: "Exact Digital Itemized Records", sol: "Every single rupee recorded with exact products or bill reference." },
                  { a: "Automatic Timestamp & Date", sol: "Exact hour and date auto-recorded; never disputable." },
                  { a: "Instant Cash & UPI Payment Logs", sol: "Partial payments log instantly via Cash or UPI (9440925829@ybl)." },
                  { a: "Automated Real-Time Live Balance", sol: "Smart ledger subtracts payments instantly with zero math mistakes." },
                  { a: "Promised Due Dates & Reminders", sol: "Set promised payback dates with automatic countdown alerts." },
                  { a: "1-Click Overdue Customer Filter", sol: "Instant dashboard filter showing every pending balance needing attention." }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-300">{item.a}</p>
                      <p className="text-xs text-slate-400">{item.sol}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The Complete 6-Step Workflow Pipeline: Customer → Purchase → Credit → Payment → Balance → Reminder */}
          <div className="flex flex-col gap-8">
            <div className="text-center flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-primary-400">
                The Complete Digital Khata Lifecycle
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                Customer → Purchase → Credit → Payment → Balance → Reminder
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
                Follow this seamless 6-step cycle to recover udhar 3x faster without awkward conversations or lost records.
              </p>
            </div>

            {/* Pipeline Step Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                {
                  step: "1",
                  title: "Customer",
                  subtitle: "గ్రాహకుడు / ग्राहक",
                  icon: User,
                  color: "from-blue-600 to-indigo-600",
                  textColor: "text-blue-400",
                  desc: "Select or register customer in 3 seconds with mobile number and credit limit."
                },
                {
                  step: "2",
                  title: "Purchase",
                  subtitle: "కొనుగోలు / खरीद",
                  icon: ShoppingBag,
                  color: "from-indigo-600 to-purple-600",
                  textColor: "text-indigo-400",
                  desc: "Add products or enter total cart amount directly from store inventory."
                },
                {
                  step: "3",
                  title: "Credit",
                  subtitle: "ఉధార్ / उधार",
                  icon: CreditCard,
                  color: "from-red-600 to-rose-600",
                  textColor: "text-red-400",
                  desc: "Tap 'You Gave ₹' to log outstanding amount with date, time, and note."
                },
                {
                  step: "4",
                  title: "Payment",
                  subtitle: "చెల్లింపు / भुगतान",
                  icon: Banknote,
                  color: "from-emerald-600 to-teal-600",
                  textColor: "text-emerald-400",
                  desc: "Record partial or full payment via Cash or Instant Scan-to-Pay UPI QR."
                },
                {
                  step: "5",
                  title: "Balance",
                  subtitle: "బకాయి / बकाया",
                  icon: Scale,
                  color: "from-amber-600 to-orange-600",
                  textColor: "text-amber-400",
                  desc: "Remaining net balance updates in real-time. Zero calculations required."
                },
                {
                  step: "6",
                  title: "Reminder",
                  subtitle: "రిమైండర్ / अनुस्मारक",
                  icon: Bell,
                  color: "from-cyan-600 to-blue-600",
                  textColor: "text-cyan-400",
                  desc: "1-Click WhatsApp & SMS reminder with UPI link in Telugu, Hindi, or English."
                }
              ].map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div 
                    key={idx} 
                    className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between gap-4 relative hover:border-slate-700 transition group shadow-lg"
                  >
                    {/* Step Number Badge */}
                    <div className="flex justify-between items-start">
                      <span className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.color} text-white font-black text-xs flex items-center justify-center shadow`}>
                        0{s.step}
                      </span>
                      <Icon size={20} className={s.textColor} />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-white group-hover:text-primary-400 transition">
                        {s.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">{s.subtitle}</p>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <span>Step {s.step}</span>
                      {idx < 5 && <ArrowRight size={12} className="text-slate-600 ml-auto" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Launch Digital Khata CTA */}
            <div className="mt-4 p-6 sm:p-8 bg-gradient-to-r from-red-600/20 via-amber-600/20 to-emerald-600/20 border border-slate-700/80 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-xl">
              <div>
                <h4 className="text-xl font-black text-white">
                  Ready to digitize your store's Udhar Khata?
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  100% Free, Secure, and designed specifically for Indian Retailers.
                </p>
              </div>
              <button
                onClick={onEnterDemo}
                className="px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-black text-sm rounded-xl shadow-xl hover:shadow-primary-500/30 flex items-center gap-2 shrink-0 transition"
              >
                <BookOpen size={18} /> Open Digital Khata Book
              </button>
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

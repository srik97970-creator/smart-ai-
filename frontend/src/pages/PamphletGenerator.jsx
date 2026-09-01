import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Share2, 
  RefreshCw, 
  Palette, 
  AlertTriangle, 
  Sparkles,
  Calendar,
  MessageSquare,
  Copy,
  Check,
  Calculator,
  Languages
} from 'lucide-react';
import { t } from '../utils/translations';

export default function PamphletGenerator({ lang, navigateTo, params, shopInfo }) {
  const [offers, setOffers] = useState([]);
  const [pamphletsCount, setPamphletsCount] = useState(6); // Cumulative tracker mock
  const [selectedOfferId, setSelectedOfferId] = useState('');
  
  // Custom design inputs
  const [template, setTemplate] = useState('Festival Sale');
  const [pamphletLang, setPamphletLang] = useState(lang);
  const [titleText, setTitleText] = useState('Festival Bonanza!');
  const [validityText, setValidityText] = useState('Offer valid while stocks last');
  
  // Copy feedback state
  const [copiedText, setCopiedText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customPhone, setCustomPhone] = useState('');

  // Fetch customers for WhatsApp direct targeting
  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching customers in PamphletGenerator:', err));
  }, []);

  useEffect(() => {
    fetch('/api/offers')
      .then(res => res.json())
      .then(data => {
        setOffers(data);
        // If loaded with parameter from offers list action click, immediately select it
        if (data.length > 0 && params && params.autoLoadOfferId) {
          setSelectedOfferId(params.autoLoadOfferId);
        } else if (data.length > 0) {
          setSelectedOfferId(data[0].id);
        }
      })
      .catch(err => console.error('Error fetching offers for pamphlet:', err));
  }, [params]);

  // Sync pamphlet generator language when app language changes
  useEffect(() => {
    setPamphletLang(lang);
  }, [lang]);

  const selectedOffer = offers.find(o => o.id === selectedOfferId);

  // Prefill title text based on template
  useEffect(() => {
    if (template === 'Festival Sale') {
      setTitleText(pamphletLang === 'te' ? 'పండుగ ధమాకా ఆఫర్!' : (pamphletLang === 'hi' ? 'त्योहार धमाका ऑफर!' : 'FESTIVAL SPECIAL!'));
    } else if (template === 'Clearance Sale') {
      setTitleText(pamphletLang === 'te' ? 'స్టాక్ క్లియరెన్స్ సేల్!' : (pamphletLang === 'hi' ? 'स्टॉक क्लीयरेंस सेल!' : 'CLEARANCE SALE!'));
    } else if (template === 'Buy 1 Get 1') {
      setTitleText(pamphletLang === 'te' ? 'ఒకటి కొంటే ఒకటి ఉచితం!' : (pamphletLang === 'hi' ? 'एक खरीदो एक मुफ्त पाओ!' : 'BUY 1 GET 1 FREE!'));
    } else {
      setTitleText(pamphletLang === 'te' ? 'ప్రత్యేక తగ్గింపు ఆఫర్!' : (pamphletLang === 'hi' ? 'विशेष छूट ऑफर!' : 'SPECIAL DISCOUNT OFFER!'));
    }
  }, [template, pamphletLang]);

  // Design Theme configs
  const themes = {
    'Festival Sale': {
      bg: 'from-amber-500 to-red-600',
      text: 'text-amber-950',
      accentBg: 'bg-red-700 text-white',
      cardBorder: 'border-amber-400'
    },
    'Clearance Sale': {
      bg: 'from-slate-900 to-zinc-950 text-white',
      text: 'text-zinc-100',
      accentBg: 'bg-red-600 text-white',
      cardBorder: 'border-red-600'
    },
    'Buy 1 Get 1': {
      bg: 'from-orange-400 to-amber-500',
      text: 'text-orange-950',
      accentBg: 'bg-white text-orange-600 border border-orange-200',
      cardBorder: 'border-orange-300'
    },
    'Weekend Offer': {
      bg: 'from-blue-600 to-indigo-700 text-white',
      text: 'text-blue-50',
      accentBg: 'bg-indigo-900 text-yellow-300',
      cardBorder: 'border-blue-400'
    },
    'Supermarket Offer': {
      bg: 'from-emerald-500 to-green-600',
      text: 'text-emerald-950',
      accentBg: 'bg-green-900 text-white',
      cardBorder: 'border-green-300'
    }
  };

  const activeTheme = themes[template] || themes['Festival Sale'];

  // Generated Text templates (Publicity Copywriting)
  const generatePublicityContent = () => {
    if (!selectedOffer) return { whatsapp: '', instagram: '', facebook: '' };

    const prodName = selectedOffer.product_name;
    const orig = selectedOffer.original_price;
    const offPrice = selectedOffer.offer_price;
    const saveAmt = orig - offPrice;
    const shop = shopInfo.shop_name || 'Sri Lakshmi Stores';
    const phone = shopInfo.phone || '9440925829';
    const addr = shopInfo.address || 'Visakhapatnam';

    let whatsapp = '';
    let instagram = '';
    let facebook = '';

    if (pamphletLang === 'te') {
      whatsapp = `🔥 *${titleText}* 🔥\n\n🏪 *${shop}* లో బంపర్ ఆఫర్!\n\n🛍️ *${prodName}* ఇప్పుడు కేవలం *₹${offPrice}* లకే! (అసలు ధర: ~~₹${orig}~~ - మీరు పొందే ఆదా: *₹${saveAmt}*!)\n\n🗓️ ${validityText}\n\n📍 చిరునామా: ${addr}\n📞 సంప్రదించండి: ${phone}\n\nత్వరపడండి, స్టాక్ పరిమితంగా ఉంది!`;
      instagram = `💥 ${titleText} 💥\n\nమీ ఆదాను రెట్టింపు చేసుకోండి! ${shop} లో ${prodName} ఇప్పుడు ప్రత్యేక ఆఫర్ ధర ₹${offPrice} కే లభిస్తుంది. సేవ్ చేయండి ₹${saveAmt}!\n\n👉 ఈరోజే మా దుకాణాన్ని సందర్శించండి.\n\n#SmartShop #SpecialOffer #RetailSavings #Discount #RetailAI #${prodName.replace(/\s+/g, '')}`;
      facebook = `🎉 ${titleText} - కేవలం ${shop} లోనే! 🎉\n\nఈ పండుగ సీజన్ లో మీ ఇంటి బడ్జెట్ ను ఆదా చేసుకోండి. ${prodName} పై భారీ డిస్కౌంట్ ఆఫర్. \n\n• అసలు ధర: ₹${orig}\n• ఆఫర్ ధర: ₹${offPrice}\n• నికర ఆదా: ₹${saveAmt}\n\n📞 వివరాలకు కాల్ చేయండి: ${phone}\n🏢 అడ్రస్: ${addr}`;
    } else if (pamphletLang === 'hi') {
      whatsapp = `🔥 *${titleText}* 🔥\n\n🏪 *${shop}* पर शानदार बचत ऑफर!\n\n🛍️ *${prodName}* अब मात्र *₹${offPrice}* में! (सामान्य मूल्य: ~~₹${orig}~~ - आपकी कुल बचत: *₹${saveAmt}*!)\n\n🗓️ ${validityText}\n\n📍 पता: ${addr}\n📞 संपर्क करें: ${phone}\n\nजल्दी करें, स्टॉक सीमित है!`;
      instagram = `💥 ${titleText} 💥\n\nबड़ी बचत का मौका! ${shop} पर ${prodName} अब विशेष ऑफर मूल्य ₹${offPrice} में उपलब्ध है। बचाएं ₹${saveAmt}!\n\n👉 आज ही हमारी दुकान पर आएं।\n\n#SmartShop #SpecialOffer #HindiOffers #RetailSavings #Discount #${prodName.replace(/\s+/g, '')}`;
      facebook = `🎉 ${titleText} - केवल ${shop} पर! 🎉\n\nअपने घर के बजट की बचत करें। ${prodName} पर भारी छूट।\n\n• मूल मूल्य: ₹${orig}\n• ऑफर मूल्य: ₹${offPrice}\n• कुल बचत: ₹${saveAmt}\n\n📞 संपर्क करें: ${phone}\n🏢 पता: ${addr}`;
    } else {
      whatsapp = `🔥 *${titleText}* 🔥\n\n🏪 Great deals at *${shop}*!\n\n🛍️ Get *${prodName}* for just *₹${offPrice}* instead of ~~₹${orig}~~. You save *₹${saveAmt}*!\n\n🗓️ ${validityText}\n\n📍 Address: ${addr}\n📞 Contact: ${phone}\n\nHurry, stocks are limited!`;
      instagram = `💥 ${titleText} 💥\n\nBigger savings, better shopping! Get ${prodName} now at a special offer price of ₹${offPrice} only at ${shop}. Save ₹${saveAmt}!\n\n👉 Visit us today!\n\n#SmartShopAI #SpecialOffer #RetailSavings #Discount #ShopLocal #${prodName.replace(/\s+/g, '')}`;
      facebook = `🎉 ${titleText} - Only at ${shop}! 🎉\n\nSave on your household budget with our limited time discounts. Get ${prodName} at premium offer prices.\n\n• Original Price: ₹${orig}\n• Offer Price: ₹${offPrice}\n• Total Saved: ₹${saveAmt}\n\n📞 Contact us: ${phone}\n🏢 Address: ${addr}`;
    }

    return { whatsapp, instagram, facebook };
  };

  const publicityCopy = generatePublicityContent();

  const handleCopyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      
      // Print/PDF Generator Window
      const printWindow = window.open('', '_blank');
      const flyerHtml = `
        <html>
          <head>
            <title>${titleText} - ${shopInfo.shop_name || 'Flyer'}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { font-family: 'Inter', sans-serif; }
              @media print {
                body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body class="flex items-center justify-center min-h-screen bg-slate-900 p-4">
            <div class="w-[360px] h-[500px] bg-gradient-to-b ${activeTheme.bg} p-6 rounded-3xl border-4 ${activeTheme.cardBorder} text-center flex flex-col justify-between shadow-2xl text-slate-100 relative overflow-hidden">
              <div class="flex flex-col items-center">
                <span class="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activeTheme.accentBg}">
                  ${template}
                </span>
                <h2 class="text-xl font-extrabold mt-3 uppercase tracking-tight">${titleText}</h2>
              </div>
              
              <div>
                <p class="text-xs uppercase tracking-widest opacity-85 font-bold">Special Offer on</p>
                <h3 class="text-2xl font-black mt-1 leading-snug">${selectedOffer.product_name}</h3>
                
                <div class="flex justify-center items-center gap-4 mt-5">
                  <div class="flex flex-col">
                    <span class="text-[10px] uppercase opacity-75">Was</span>
                    <span class="line-through text-xs font-semibold opacity-70">₹${selectedOffer.original_price}</span>
                  </div>
                  <div class="w-[1px] h-8 bg-white/20"></div>
                  <div class="flex flex-col bg-white/10 px-5 py-1.5 rounded-2xl border border-white/20">
                    <span class="text-[9px] uppercase font-bold text-red-100">Now Pay Only</span>
                    <span class="text-3xl font-black text-white">₹${selectedOffer.offer_price}</span>
                  </div>
                </div>
                
                <div class="mt-5">
                  <span class="inline-block bg-red-600 text-white text-xs font-black px-3.5 py-1 rounded-xl border border-red-500 shadow-md">
                    SAVE ₹${selectedOffer.original_price - selectedOffer.offer_price}!
                  </span>
                </div>
              </div>
              
              <div class="border-t border-dashed border-white/35 pt-4 flex flex-col gap-0.5">
                <p class="text-xs font-bold tracking-wider">${shopInfo.shop_name || 'Sri Lakshmi Stores'}</p>
                <p class="text-[9px] opacity-75">${shopInfo.address || ''}</p>
                <p class="text-[10px] font-bold mt-1">📞 Contact: ${shopInfo.phone || ''}</p>
                <p class="text-[8px] font-mono opacity-60 mt-1 uppercase tracking-widest">${validityText}</p>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 1000);
              }
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(flyerHtml);
      printWindow.document.close();

      setPamphletsCount(prev => prev + 1);
    }, 500);
  };

  // Savings math
  const designerCostMultiplier = shopInfo.designer_cost || 500;
  const totalMoneySaved = pamphletsCount * designerCostMultiplier;

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">{t(lang, 'pamphlet')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create professional marketing pamphlets and social copy in English, Telugu, or Hindi.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Pamphlet parameters editor */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Publicity savings tracker widget */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-900/40 p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-500 text-white rounded-xl"><Calculator size={18} /></span>
              <div>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-extrabold uppercase tracking-wider">Publicity Cost Saved</p>
                <h4 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">₹{totalMoneySaved.toLocaleString('en-IN')} Saved</h4>
              </div>
            </div>
            <div className="text-right text-xs text-gray-400">
              <p className="font-bold">{pamphletsCount} flyers created</p>
              <p className="text-[9px]">Saved ₹{designerCostMultiplier} per design</p>
            </div>
          </div>

          {/* Designer Controls Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700 flex items-center gap-1.5">
              <Palette size={18} className="text-primary-500" /> Flyer Design Controls
            </h3>

            <div className="flex flex-col gap-3">
              {/* Select Active Offer */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase">Select Active Offer</label>
                  <button 
                    type="button"
                    onClick={() => navigateTo('offers')}
                    className="text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    + Create/Edit Offers
                  </button>
                </div>
                <select
                  value={selectedOfferId}
                  onChange={(e) => setSelectedOfferId(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-755 border border-gray-200 dark:border-gray-655 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                >
                  <option value="">-- Choose active discount --</option>
                  {offers.map(o => (
                    <option key={o.id} value={o.id}>{o.product_name} (₹{o.offer_price})</option>
                  ))}
                </select>
              </div>

              {/* Design Template Theme select */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Design Template Theme</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-755 border border-gray-200 dark:border-gray-655 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                >
                  <option value="Festival Sale">Festival Sale</option>
                  <option value="Clearance Sale">Clearance Sale</option>
                  <option value="Buy 1 Get 1">Buy 1 Get 1 (BOGO)</option>
                  <option value="Weekend Offer">Weekend Offer</option>
                  <option value="Supermarket Offer">Supermarket Offer</option>
                </select>
              </div>

              {/* Language pick */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Poster Language</label>
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-750 p-1 rounded-lg border border-gray-200 dark:border-gray-650">
                  {['en', 'te', 'hi'].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setPamphletLang(l)}
                      className={`flex-1 text-xs py-1.5 rounded font-bold uppercase transition ${pamphletLang === l ? 'bg-primary-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {l === 'en' ? 'English' : (l === 'te' ? 'Telugu (తెలుగు)' : 'Hindi (हिंदी)')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom banner title text */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Flyer Header Title</label>
                <input 
                  type="text"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  placeholder="e.g. Festival Bonanza!"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                />
              </div>

              {/* Validity details text */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Offer Validity Text</label>
                <input 
                  type="text"
                  value={validityText}
                  onChange={(e) => setValidityText(e.target.value)}
                  placeholder="e.g. Offer valid till Sept 10th"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Hand: Pamphlet live preview card & copywriter scripts */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {selectedOffer ? (
            <div className="grid sm:grid-cols-12 gap-6">
              
              {/* Flyer canvas mockup */}
              <div className="sm:col-span-6 flex flex-col gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Flyer Preview:</span>
                
                {/* Pamphlet card graphics */}
                <div className={`bg-gradient-to-b ${activeTheme.bg} p-6 rounded-3xl border-4 ${activeTheme.cardBorder} text-center flex flex-col justify-between aspect-[3/4] shadow-2xl relative overflow-hidden select-none`}>
                  {/* Decorative badge background rings */}
                  <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-black/10 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex flex-col gap-1.5 items-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${activeTheme.accentBg}`}>
                      {template}
                    </span>
                    <h2 className="text-xl font-extrabold mt-2 leading-tight uppercase tracking-tight drop-shadow-sm">
                      {titleText}
                    </h2>
                  </div>

                  <div className="my-auto py-4">
                    <p className="text-xs uppercase tracking-widest opacity-80 font-bold">Special Offer on</p>
                    <h3 className="text-2xl font-black leading-tight tracking-tight mt-1 drop-shadow-xs">
                      {selectedOffer.product_name}
                    </h3>

                    {/* Pricing bubbles */}
                    <div className="flex justify-center items-center gap-3.5 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase opacity-75">Was</span>
                        <span className="line-through text-sm font-semibold opacity-70">₹{selectedOffer.original_price}</span>
                      </div>
                      <div className="w-[1px] h-6 bg-current opacity-30"></div>
                      <div className="flex flex-col bg-white/10 px-4 py-1.5 rounded-2xl border border-white/20 backdrop-blur-xs shadow">
                        <span className="text-[9px] uppercase font-bold text-red-100">Now Pay Only</span>
                        <span className="text-3xl font-black text-white drop-shadow">₹{selectedOffer.offer_price}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className="inline-block bg-red-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-lg border border-red-500 animate-bounce">
                        SAVE ₹{selectedOffer.original_price - selectedOffer.offer_price}!
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-current/35 pt-4 flex flex-col gap-1">
                    <p className="text-[10px] font-bold tracking-wider">{shopInfo.shop_name || 'Sri Lakshmi Stores'}</p>
                    <p className="text-[8px] opacity-75 leading-tight">{shopInfo.address || 'Address Area'}</p>
                    <p className="text-[9px] font-bold mt-1">📞 Contact: {shopInfo.phone || '9440925829'}</p>
                    <p className="text-[8px] font-mono opacity-60 mt-1 uppercase tracking-widest">{validityText}</p>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-1">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-300 text-white text-xs font-bold py-2.5 rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    {downloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                    {downloading ? 'Downloading...' : 'Download flyer'}
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Share2 size={14} /> WhatsApp Share
                  </button>
                </div>
              </div>

              {/* Copywriter captions */}
              <div className="sm:col-span-6 flex flex-col gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Publicity Copywriting Scripts:</span>
                
                {/* Whatsapp copy box */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150 dark:border-gray-700 flex flex-col gap-2.5 shadow-sm text-xs relative group">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-green-600 dark:text-green-400 flex items-center gap-1"><MessageSquare size={14} /> WhatsApp Message</span>
                    <button
                      onClick={() => handleCopyText(publicityCopy.whatsapp, 'wa')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 transition"
                      title="Copy message"
                    >
                      {copiedText === 'wa' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <pre className="font-sans whitespace-pre-wrap text-[11px] leading-relaxed text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-750 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 max-h-[160px] overflow-y-auto">
                    {publicityCopy.whatsapp}
                  </pre>
                </div>

                {/* Instagram / FB copy box */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150 dark:border-gray-700 flex flex-col gap-2.5 shadow-sm text-xs relative group">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-indigo-500 flex items-center gap-1">📸 Social Media Caption</span>
                    <button
                      onClick={() => handleCopyText(publicityCopy.instagram, 'ig')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 transition"
                      title="Copy Caption"
                    >
                      {copiedText === 'ig' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <pre className="font-sans whitespace-pre-wrap text-[11px] leading-relaxed text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-750 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 max-h-[120px] overflow-y-auto">
                    {publicityCopy.instagram}
                  </pre>
                </div>
              </div>

            </div>
          ) : (
            <p className="text-center text-gray-400 py-12 text-sm bg-white dark:bg-gray-800 border rounded-2xl border-gray-150 dark:border-gray-700">
              No active offers found. Please navigate to the <strong>Offers Engine</strong> to generate a promotion discount first.
            </p>
          )}
        </div>

      </div>

      {/* WhatsApp Share Link Trigger Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-150 dark:border-gray-700">
            <h3 className="text-lg font-black text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700">
              Share via WhatsApp
            </h3>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-normal">
              Copy the promo text script below and paste it directly on your WhatsApp business chat or upload it as a status card.
            </p>

            <div className="bg-gray-50 dark:bg-gray-750 p-3 rounded-xl border border-gray-150 dark:border-gray-700 mt-4 max-h-[120px] overflow-y-auto font-mono text-[10px] text-gray-600 dark:text-gray-350 whitespace-pre-wrap">
              {publicityCopy.whatsapp}
            </div>

            {/* Direct WhatsApp Customer Selection */}
            <div className="flex flex-col gap-2 mt-4 text-left">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Target Customer (Optional)</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCustomerId(val);
                  const cust = customers.find(c => c.id === val);
                  setCustomPhone(cust ? cust.phone : '');
                }}
                className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full text-gray-700 dark:text-gray-300 font-medium"
              >
                <option value="">-- Choose registered customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
              
              <input 
                type="tel"
                value={customPhone}
                onChange={(e) => {
                  setCustomPhone(e.target.value);
                  setSelectedCustomerId('');
                }}
                placeholder="Or enter custom phone number"
                className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full text-gray-700 dark:text-gray-300 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4 mt-4 dark:border-gray-700">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publicityCopy.whatsapp);
                  const phoneParam = customPhone.trim() ? `phone=91${customPhone.trim()}&` : '';
                  alert('Text copied. Opening WhatsApp...');
                  window.open(`https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(publicityCopy.whatsapp)}`, '_blank');
                  setShowShareModal(false);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1"
              >
                Copy & Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

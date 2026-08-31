const db = require('../database/db');
const { GoogleGenAI } = require('@google/generative-ai');

// Optional Gemini API Setup
let aiModel = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Gemini model initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Gemini model:', err);
  }
}

// Local Business Intelligence NLP Engine (Updated to Async)
async function localChatInterpreter(prompt, language = 'en') {
  const query = prompt.toLowerCase();
  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = new Date().toISOString().substring(0, 7); // "YYYY-MM"

  // 1. Profit queries
  if (query.includes('profit') || query.includes('earning') || query.includes('earn') || query.includes('లాభం') || query.includes('मुनाफा')) {
    const isToday = query.includes('today') || query.includes('ఈరోజు') || query.includes('आज');
    const isMonth = query.includes('month') || query.includes('నెల') || query.includes('महीना') || query.includes('this month');

    const sales = await db.find('sales');
    const expenses = await db.find('expenses');

    let targetSales = [];
    let targetExpenses = [];
    let periodName = '';

    if (isToday) {
      targetSales = sales.filter(s => s.sale_date.startsWith(todayStr));
      targetExpenses = expenses.filter(e => e.expense_date === todayStr);
      periodName = language === 'te' ? 'ఈరోజు' : (language === 'hi' ? 'आज' : 'today');
    } else {
      targetSales = sales.filter(s => s.sale_date.startsWith(thisMonthStr));
      targetExpenses = expenses.filter(e => e.expense_date.startsWith(thisMonthStr));
      periodName = language === 'te' ? 'ఈ నెల' : (language === 'hi' ? 'इस महीने' : 'this month');
    }

    const totalRevenue = targetSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const grossProfit = targetSales.reduce((sum, s) => sum + Number(s.total_profit), 0);
    const totalExpenses = targetExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = grossProfit - totalExpenses;

    let responseText = '';
    if (language === 'te') {
      responseText = `📊 **${periodName} వ్యాపార లాభాల నివేదిక:**\n` +
        `• మొత్తం అమ్మకాలు (రెవెన్యూ): ₹${totalRevenue.toLocaleString('en-IN')}\n` +
        `• స్థూల లాభం (Gross Profit): ₹${grossProfit.toLocaleString('en-IN')}\n` +
        `• ఖర్చులు (Expenses): ₹${totalExpenses.toLocaleString('en-IN')}\n` +
        `• **నికర లాభం (Net Profit): ₹${netProfit.toLocaleString('en-IN')}**`;
    } else if (language === 'hi') {
      responseText = `📊 **${periodName} व्यापार लाभ रिपोर्ट:**\n` +
        `• कुल बिक्री (राजस्व): ₹${totalRevenue.toLocaleString('en-IN')}\n` +
        `• कुल लाभ (Gross Profit): ₹${grossProfit.toLocaleString('en-IN')}\n` +
        `• कुल खर्च (Expenses): ₹${totalExpenses.toLocaleString('en-IN')}\n` +
        `• **शुद्ध लाभ (Net Profit): ₹${netProfit.toLocaleString('en-IN')}**`;
    } else {
      responseText = `📊 **Business Profit Report for ${periodName}:**\n` +
        `• Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}\n` +
        `• Gross Profit: ₹${grossProfit.toLocaleString('en-IN')}\n` +
        `• Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')}\n` +
        `• **Net Profit: ₹${netProfit.toLocaleString('en-IN')}**`;
    }

    return { response: responseText };
  }

  // 2. Best-selling queries
  if (query.includes('best seller') || query.includes('selling') || query.includes('most sold') || query.includes('అమ్మకం') || query.includes('सबसे ज्यादा')) {
    const topProd = await db.getTopSellingProduct();
    if (!topProd) {
      return { response: "No sales records found yet to calculate best-selling items." };
    }

    let responseText = '';
    if (language === 'te') {
      responseText = `🏆 **ఎక్కువగా అమ్ముడైన ఉత్పత్తి:** **${topProd.name}**\n` +
        `• మొత్తం విక్రయించిన పరిమాణం: ${topProd.qtySold} యూనిట్లు\n` +
        `• దీని ద్వారా వచ్చిన రెవెన్యూ: ₹${topProd.revenue.toLocaleString('en-IN')}\n` +
        `• ప్రయోజనం: ఈ ఉత్పత్తి మీ షాప్‌కు అత్యధిక వ్యాపారాన్ని అందిస్తోంది!`;
    } else if (language === 'hi') {
      responseText = `🏆 **सबसे अधिक बिकने वाला उत्पाद:** **${topProd.name}**\n` +
        `• कुल बिकी मात्रा: ${topProd.qtySold} इकाइयाँ\n` +
        `• इस उत्पाद से राजस्व: ₹${topProd.revenue.toLocaleString('en-IN')}\n` +
        `• सुझाव: यह उत्पाद आपकी दुकान में सबसे लोकप्रिय है!`;
    } else {
      responseText = `🏆 **Your Best-Selling Product is:** **${topProd.name}**\n` +
        `• Total Quantity Sold: ${topProd.qtySold} units\n` +
        `• Total Revenue Generated: ₹${topProd.revenue.toLocaleString('en-IN')}\n` +
        `• Insight: This product is currently driving the highest sales volume in your shop. Keep it well-stocked!`;
    }

    return { response: responseText };
  }

  // 3. Low Stock queries
  if (query.includes('low stock') || query.includes('restock') || query.includes('స్టాక్') || query.includes('कम स्टॉक') || query.includes('खरीदना')) {
    const lowStockProducts = await db.find('products', p => p.quantity <= p.minimum_stock);
    if (lowStockProducts.length === 0) {
      return {
        response: language === 'te' ? "✅ అన్ని ఉత్పత్తులు తగినంత స్టాక్‌ను కలిగి ఉన్నాయి. ఏదీ తక్కువగా లేదు." 
                 : (language === 'hi' ? "✅ सभी उत्पाद पर्याप्त स्टॉक में हैं। कोई भी कम नहीं है।" 
                 : "✅ All products are sufficiently stocked. No products need restocking right now.")
      };
    }

    let responseText = '';
    if (language === 'te') {
      responseText = `⚠️ **రీస్టాక్ చేయవలసిన ఉత్పత్తులు (${lowStockProducts.length}):**\n\n` +
        lowStockProducts.map(p => `• **${p.name}** (ప్రస్తుతం: ${p.quantity} | కనీసం ఉండవలసింది: ${p.minimum_stock})`).join('\n') +
        `\n\n💡 వ్యాపార నిరంతరాయానికి పైన పేర్కొన్న ఉత్పత్తులను వెంటనే ఆర్డర్ చేయండి.`;
    } else if (language === 'hi') {
      responseText = `⚠️ **इन उत्पादों को रीस्टॉक करने की आवश्यकता है (${lowStockProducts.length}):**\n\n` +
        lowStockProducts.map(p => `• **${p.name}** (अभी: ${p.quantity} | न्यूनतम आवश्यक: ${p.minimum_stock})`).join('\n') +
        `\n\n💡 बिक्री जारी रखने के लिए कृपया इन्हें तुरंत ऑर्डर करें।`;
    } else {
      responseText = `⚠️ **Products Requiring Restock (${lowStockProducts.length}):**\n\n` +
        lowStockProducts.map(p => `• **${p.name}** (Current Stock: ${p.quantity} | Min Required: ${p.minimum_stock})`).join('\n') +
        `\n\n💡 We recommend replenishing these immediately to prevent loss of sales.`;
    }

    return { 
      response: responseText, 
      action: { type: 'navigate', target: '/inventory', label: 'View Inventory' },
      data: lowStockProducts 
    };
  }

  // 4. Slow Moving / Promote Offer queries
  if (query.includes('slow moving') || query.includes('promote') || query.includes('offer') || query.includes('ఆఫర్') || query.includes('मंद')) {
    const insights = await db.find('ai_insights', ins => ins.type === 'slow_moving');
    if (insights.length === 0) {
      return {
        response: "There are no significant slow-moving items detected right now."
      };
    }

    const firstSlow = insights[0];
    const product = await db.findById('products', firstSlow.ref_id);

    let responseText = `📦 **Slow-Moving Product Analysis:**\n\n${firstSlow.message}\n\n${firstSlow.recommendation}`;
    if (language === 'te') {
      responseText = `📦 **నెమ్మదిగా అమ్ముడవుతున్న ఉత్పత్తుల విశ్లేషణ:**\n\n${product ? `**${product.name}** స్టాక్ ఎక్కువగా ఉంది కానీ అమ్మకాలు తక్కువగా ఉన్నాయి. దీనికి 10% డిస్కౌంట్ ఆఫర్ ఇవ్వడం మంచిది.` : firstSlow.message}`;
    } else if (language === 'hi') {
      responseText = `📦 **धीमे बिकने वाले उत्पादों का विश्लेषण:**\n\n${product ? `**${product.name}** का स्टॉक अधिक है लेकिन बिक्री धीमी है। हम इसके लिए 10% की छूट का सुझाव देते हैं।` : firstSlow.message}`;
    }

    return {
      response: responseText,
      action: product ? {
        type: 'create_offer',
        product_id: product.id,
        original_price: product.selling_price,
        purchase_price: product.purchase_price,
        label: language === 'te' ? 'ఆఫర్ సృష్టించండి' : (language === 'hi' ? 'ऑफर बनाएं' : 'Create Offer')
      } : null
    };
  }

  // 5. Highest Margin queries
  if (query.includes('highest profit') || query.includes('margin') || query.includes('మార్జిన్') || query.includes('मुनाफा मार्जिन')) {
    const products = await db.find('products');
    const sorted = [...products].sort((a, b) => {
      const marginA = (Number(a.selling_price) - Number(a.purchase_price)) / Number(a.selling_price);
      const marginB = (Number(b.selling_price) - Number(b.purchase_price)) / Number(b.selling_price);
      return marginB - marginA;
    }).slice(0, 5);

    let responseText = '';
    if (language === 'te') {
      responseText = `📈 **అత్యధిక లాభాల మార్జిన్ ఉన్న టాప్ 5 ఉత్పత్తులు:**\n\n` +
        sorted.map((p, idx) => {
          const margin = ((Number(p.selling_price) - Number(p.purchase_price)) / Number(p.selling_price)) * 100;
          return `${idx + 1}. **${p.name}** - మార్జిన్: **${margin.toFixed(0)}%** (కొనుగోలు: ₹${p.purchase_price} | విక్రయం: ₹${p.selling_price})`;
        }).join('\n');
    } else if (language === 'hi') {
      responseText = `📈 **सबसे अधिक मुनाफा मार्जिन वाले टॉप 5 उत्पाद:**\n\n` +
        sorted.map((p, idx) => {
          const margin = ((Number(p.selling_price) - Number(p.purchase_price)) / Number(p.selling_price)) * 100;
          return `${idx + 1}. **${p.name}** - मार्जिन: **${margin.toFixed(0)}%** (खरीद: ₹${p.purchase_price} | बिक्री: ₹${p.selling_price})`;
        }).join('\n');
    } else {
      responseText = `📈 **Top 5 Products with Highest Profit Margins:**\n\n` +
        sorted.map((p, idx) => {
          const margin = ((Number(p.selling_price) - Number(p.purchase_price)) / Number(p.selling_price)) * 100;
          return `${idx + 1}. **${p.name}** - Margin: **${margin.toFixed(0)}%** (Buy: ₹${p.purchase_price} | Sell: ₹${p.selling_price})`;
        }).join('\n');
    }

    return { response: responseText };
  }

  // 6. Udhar / Credit queries
  const isUdharQuery = query.includes('appu') || query.includes('udhar') || query.includes('debt') || 
                       query.includes('credit') || query.includes('khata') || query.includes('బకాయి') || 
                       query.includes('उधार') || query.includes('outstanding') || query.includes('repay') ||
                       query.includes('due') || query.includes('overdue');

  if (isUdharQuery) {
    const customers = await db.find('customers');
    const creditTx = await db.find('credit_transactions');
    const now = new Date();

    // Check if looking for a specific customer name
    let matchedCustomer = null;
    for (const c of customers) {
      if (query.includes(c.name.toLowerCase())) {
        matchedCustomer = c;
        break;
      }
    }

    if (matchedCustomer) {
      const debt = Number(matchedCustomer.debt_balance || 0);
      let responseText = '';
      if (language === 'te') {
        responseText = `👤 **కస్టమర్ బకాయి నివేదిక (${matchedCustomer.name}):**\n` +
          `• మొత్తం బకాయి (Udhar): **₹${debt.toLocaleString('en-IN')}**\n` +
          `• ఫోన్ నంబర్: ${matchedCustomer.phone}\n` +
          `${debt > 0 ? '💡 సూచన: బకాయి చెల్లించమని కస్టమర్‌కు వాట్సాప్ రిమైండర్ పంపండి.' : '✅ ఈ కస్టమర్‌కు ఎటువంటి బకాయిలు లేవు.'}`;
      } else if (language === 'hi') {
        responseText = `👤 **ग्राहक उधार रिपोर्ट (${matchedCustomer.name}):**\n` +
          `• कुल लंबित राशि (Udhar): **₹${debt.toLocaleString('en-IN')}**\n` +
          `• फोन नंबर: ${matchedCustomer.phone}\n` +
          `${debt > 0 ? '💡 सुझाव: लंबित भुगतान के लिए व्हाट्सएप रिमाइंडर भेजें।' : '✅ इस ग्राहक पर कोई बकाया नहीं है।'}`;
      } else {
        responseText = `👤 **Customer Outstanding Report for ${matchedCustomer.name}:**\n` +
          `• Current Outstanding Balance: **₹${debt.toLocaleString('en-IN')}**\n` +
          `• Phone Number: ${matchedCustomer.phone}\n` +
          `${debt > 0 ? '💡 Suggestion: You can send a polite WhatsApp reminder from the Smart Udhar dashboard.' : '✅ This customer has cleared all debts.'}`;
      }
      return { 
        response: responseText,
        action: { type: 'navigate', target: '/udhar', label: 'View Udhar Ledger' }
      };
    }

    // "Who owes me money?" or general pending debt list
    if (query.includes('who') || query.includes('evaru') || query.includes('कौ') || query.includes('highest')) {
      const debtors = customers.filter(c => Number(c.debt_balance || 0) > 0);
      if (debtors.length === 0) {
        return { response: "✅ No customers currently have outstanding credit balances!" };
      }

      debtors.sort((a, b) => Number(b.debt_balance) - Number(a.debt_balance));
      let responseText = `📝 **Customers with Outstanding Udhar (${debtors.length}):**\n\n`;
      debtors.forEach(d => {
        responseText += `• **${d.name}**: ₹${Number(d.debt_balance).toLocaleString('en-IN')} (Phone: ${d.phone})\n`;
      });
      return { 
        response: responseText,
        action: { type: 'navigate', target: '/udhar', label: 'Open Udhar Book' }
      };
    }

    // Overdue queries
    if (query.includes('overdue') || query.includes('daati') || query.includes('विलंब')) {
      const overdueTxs = creditTx.filter(t => t.status === 'due' && t.due_date && new Date(t.due_date) < now);
      if (overdueTxs.length === 0) {
        return { response: "✅ Great news! You have no overdue payments outstanding." };
      }

      let responseText = `⚠️ **Overdue Payments Pending Recovery (${overdueTxs.length}):**\n\n`;
      for (const tx of overdueTxs) {
        const cust = customers.find(c => c.id === tx.customer_id);
        const name = cust ? cust.name : 'Unknown';
        const delayDays = Math.ceil((now - new Date(tx.due_date)) / (1000 * 60 * 60 * 24));
        responseText += `• **${name}**: ₹${Number(tx.outstanding_amount).toLocaleString('en-IN')} (Overdue by ${delayDays} days)\n`;
      }
      return { 
        response: responseText,
        action: { type: 'navigate', target: '/udhar', label: 'Open Udhar Dashboard' }
      };
    }

    // Total outstanding sum
    const totalSum = customers.reduce((sum, c) => sum + (Number(c.debt_balance) || 0), 0);
    return {
      response: `💳 **Smart Udhar - Ledger Overview:**\n` +
        `• Total outstanding shop credit: **₹${totalSum.toLocaleString('en-IN')}**\n` +
        `• Customers with pending Udhar: **${customers.filter(c => Number(c.debt_balance) > 0).length}**\n\n` +
        `💡 Navigate to the Smart Udhar page to manage individual customer statements, settle payments, and send WhatsApp reminder messages.`
    };
  }

  // Fallback default response
  let defaultResponse = '';
  if (language === 'te') {
    defaultResponse = `👋 హలో! నేను స్మార్ట్‌షాప్ AI బిజినెస్ అసిస్టెంట్‌ని. మీరు నన్ను వీటి గురించి అడగవచ్చు:\n` +
      `• "ఈరోజు నాకు వచ్చిన లాభం ఎంత?"\n` +
      `• "రీస్టాక్ చేయవలసిన వస్తువులు ఏవి?"\n` +
      `• "ఎక్కువగా అమ్ముడైన ఉత్పత్తి ఏది?"\n` +
      `• "నాకు ఆఫర్లను సిఫార్సు చేయి."`;
  } else if (language === 'hi') {
    defaultResponse = `👋 नमस्ते! मैं आपका स्मार्टशॉप AI बिजनेस असिस्टेंट हूँ। आप मुझसे पूछ सकते हैं:\n` +
      `• "आज मुझे कितना मुनाफा हुआ?"\n` +
      `• "किस उत्पाद को रीस्टॉक करने की आवश्यकता है?"\n` +
      `• "दुकान का सबसे ज्यादा बिकने वाला उत्पाद कौन सा है?"\n` +
      `• "मुझे किसी धीमी गति के उत्पाद पर ऑफर का सुझाव दें।"`;
  } else {
    defaultResponse = `👋 Hello! I am your SmartShop AI Business Assistant. You can ask me questions like:\n` +
      `• "How much profit did I make today?"\n` +
      `• "Which products are low in stock?"\n` +
      `• "What is my best-selling product this month?"\n` +
      `• "Which products should I promote with an offer?"`;
  }

  return { response: defaultResponse };
}

// Main AI Assistant Chat Entry point
async function askAiAgent(prompt, language = 'en') {
  if (aiModel) {
    try {
      const products = await db.find('products');
      const sales = await db.find('sales');
      const expenses = await db.find('expenses');
      
      const systemContext = `
You are the AI Business Assistant for "SmartShop AI", a retail management application for small/medium shopkeepers.
You have access to the following current shop data to answer the user's questions accurately.
Never make up financial numbers. Use only the data below.

Current Shop State:
- Total Products: ${products.length}
- Low Stock Items: ${products.filter(p => p.quantity <= p.minimum_stock).map(p => `${p.name} (stock:${p.quantity}, min:${p.minimum_stock})`).join(', ')}
- Products List (first 10): ${products.slice(0, 10).map(p => `${p.name} (Buy:₹${p.purchase_price}, Sell:₹${p.selling_price}, Qty:${p.quantity})`).join(', ')}
- Total Sales Recorded: ${sales.length}
- Total Expenses: ${expenses.reduce((sum, e) => sum + Number(e.amount), 0)}

User Language: ${language}
Please answer the user's question clearly, concisely, and in the language requested. For Telugu, you can use Telugu script. For Hindi, use Devanagari script. Keep answers very practical for a shopkeeper.
`;
      const result = await aiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: `${systemContext}\n\nUser Question: ${prompt}` }] }]
      });
      return { response: result.response.text() };
    } catch (err) {
      console.error('Gemini query failed, falling back to local NLP engine:', err);
    }
  }

  // Fallback to deterministic NLP engine
  return await localChatInterpreter(prompt, language);
}

module.exports = {
  askAiAgent
};

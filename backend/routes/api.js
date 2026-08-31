const express = require('express');
const router = express.Router();
const db = require('../database/db');
const aiService = require('../services/aiService');

// 1. SHOP PROFILE ENDPOINTS
router.get('/shop', async (req, res) => {
  try {
    const shops = await db.find('shops');
    if (shops.length === 0) {
      return res.status(404).json({ error: 'Shop profile not found' });
    }
    res.json(shops[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/shop', async (req, res) => {
  try {
    const shops = await db.find('shops');
    if (shops.length === 0) {
      return res.status(404).json({ error: 'Shop profile not found' });
    }
    const updated = await db.update('shops', shops[0].id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(550).json({ error: err.message });
  }
});

// 2. PRODUCT ENDPOINTS
router.get('/products', async (req, res) => {
  const { category, search } = req.query;
  try {
    let products = await db.find('products');

    if (category) {
      products = products.filter(p => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q))
      );
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', async (req, res) => {
  const { name, purchase_price, selling_price, quantity, minimum_stock } = req.body;
  if (!name || purchase_price === undefined || selling_price === undefined || quantity === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (Number(purchase_price) < 0 || Number(selling_price) < 0 || Number(quantity) < 0) {
    return res.status(400).json({ error: 'Prices and quantities cannot be negative' });
  }
  
  try {
    const product = await db.insert('products', {
      ...req.body,
      purchase_price: Number(purchase_price),
      selling_price: Number(selling_price),
      quantity: Number(quantity),
      minimum_stock: Number(minimum_stock || 5)
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await db.findById('products', id);
    if (!exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const { purchase_price, selling_price, quantity, minimum_stock } = req.body;
    const updates = { ...req.body };
    if (purchase_price !== undefined) updates.purchase_price = Number(purchase_price);
    if (selling_price !== undefined) updates.selling_price = Number(selling_price);
    if (quantity !== undefined) updates.quantity = Number(quantity);
    if (minimum_stock !== undefined) updates.minimum_stock = Number(minimum_stock);

    const updated = await db.update('products', id, updates);
    res.json(updated);
  } catch (err) {
    res.status(550).json({ error: err.message });
  }
});

router.post('/products/:id/adjust', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (quantity === undefined || isNaN(quantity)) {
    return res.status(400).json({ error: 'Adjustment quantity is required' });
  }

  try {
    const product = await db.findById('products', id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newQty = product.quantity + Number(quantity);
    if (newQty < 0) {
      return res.status(400).json({ error: 'Inventory quantity cannot be adjusted below zero' });
    }

    const updated = await db.update('products', id, { quantity: newQty });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const success = await db.delete('products', id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. SALES ENDPOINTS
router.get('/sales', async (req, res) => {
  try {
    const sales = await db.find('sales');
    sales.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sales', async (req, res) => {
  const { customer_id, items, payment_method, amount_paid, due_date, notes } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Sales transaction must include at least one item' });
  }

  try {
    const saleResult = await db.createSale({ customer_id, items, payment_method, amount_paid, due_date, notes });
    res.status(201).json(saleResult);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. CUSTOMER ENDPOINTS
router.get('/customers', async (req, res) => {
  try {
    const customers = await db.find('customers');
    const sales = await db.find('sales');
    const saleItems = await db.find('sale_items');
    const products = await db.find('products');

    const enriched = customers.map(c => {
      const custSales = sales.filter(s => s.customer_id === c.id);
      if (custSales.length === 0) {
        return {
          ...c,
          last_purchase_item: null,
          last_purchase_qty: 0,
          last_purchase_rate: 0
        };
      }

      custSales.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
      const latestSale = custSales[0];

      const items = saleItems.filter(item => item.sale_id === latestSale.id);
      if (items.length === 0) {
        return {
          ...c,
          last_purchase_item: null,
          last_purchase_qty: 0,
          last_purchase_rate: 0
        };
      }

      const firstItem = items[0];
      const prod = products.find(p => p.id === firstItem.product_id);

      return {
        ...c,
        last_purchase_item: prod ? prod.name : 'Unknown Product',
        last_purchase_qty: firstItem.quantity,
        last_purchase_rate: firstItem.selling_price
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/customers', async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and Phone are required' });
  }
  try {
    const customer = await db.insert('customers', {
      name,
      phone,
      total_spending: 0,
      debt_balance: 0,
      last_purchase: null
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/customers/:id/repay', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Repayment amount must be positive' });
  }
  try {
    const customer = await db.findById('customers', id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const currentDebt = Number(customer.debt_balance) || 0;
    const newDebt = Math.max(0, currentDebt - Number(amount));

    await db.update('customers', id, { debt_balance: newDebt });
    res.json({ success: true, debt_balance: newDebt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. EXPENSE ENDPOINTS
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await db.find('expenses');
    res.json(expenses);
  } catch (err) {
    res.status(550).json({ error: err.message });
  }
});

router.post('/expenses', async (req, res) => {
  const { category, amount, description, expense_date } = req.body;
  if (!category || !amount || !expense_date) {
    return res.status(400).json({ error: 'Category, amount, and date are required' });
  }
  try {
    const expense = await db.insert('expenses', {
      category,
      amount: Number(amount),
      description: description || '',
      expense_date
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. OFFERS ENDPOINTS
router.get('/offers', async (req, res) => {
  try {
    const offers = await db.find('offers');
    const enriched = [];
    for (const o of offers) {
      const p = await db.findById('products', o.product_id);
      enriched.push({
        ...o,
        product_name: p ? p.name : 'Unknown Product'
      });
    }
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/offers', async (req, res) => {
  const { product_id, offer_type, original_price, discount, offer_price, start_date, end_date } = req.body;
  if (!product_id || !offer_type || original_price === undefined || discount === undefined || offer_price === undefined || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing offer parameter fields' });
  }

  try {
    const offer = await db.insert('offers', {
      product_id,
      offer_type,
      original_price: Number(original_price),
      discount: Number(discount),
      offer_price: Number(offer_price),
      start_date,
      end_date,
      status: 'active'
    });
    res.status(201).json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/offers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const success = await db.delete('offers', id);
    if (!success) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.json({ message: 'Offer cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. PAMPHLET ENDPOINTS
router.get('/pamphlets', async (req, res) => {
  try {
    const pamphlets = await db.find('pamphlets');
    res.json(pamphlets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pamphlets', async (req, res) => {
  const { offer_id, template, language, title, description, image_url } = req.body;
  if (!template || !language || !title || !description) {
    return res.status(400).json({ error: 'Template, language, title, and description are required' });
  }
  
  try {
    const shops = await db.find('shops');
    const shop = shops.length > 0 ? shops[0] : null;

    const pamphlet = await db.insert('pamphlets', {
      offer_id: offer_id || null,
      shop_id: shop ? shop.id : null,
      template,
      language,
      title,
      description,
      image_url: image_url || '',
      generated_date: new Date().toISOString()
    });
    res.status(201).json(pamphlet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. AI INSIGHTS
router.get('/insights', async (req, res) => {
  try {
    const insights = await db.find('ai_insights');
    res.json(insights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. AI CHAT AGENT
router.post('/ai/chat', async (req, res) => {
  const { prompt, language } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt query is required' });
  }
  try {
    const result = await aiService.askAiAgent(prompt, language || 'en');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'AI Agent error processing query' });
  }
});

// 10. DAILY/WEEKLY/MONTHLY REPORTS
router.get('/reports', async (req, res) => {
  const { range, start, end } = req.query;
  try {
    const sales = await db.find('sales');
    const expenses = await db.find('expenses');
    const products = await db.find('products');

    const now = new Date();
    let startDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7days') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'custom' && start && end) {
      startDate = new Date(start);
    } else {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    const endDate = range === 'custom' && end ? new Date(end) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const filteredSales = sales.filter(s => {
      const d = new Date(s.sale_date);
      return d >= startDate && d <= endDate;
    });

    const filteredExpenses = expenses.filter(e => {
      const d = new Date(e.expense_date);
      return d >= startDate && d <= endDate;
    });

    const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const totalCost = filteredSales.reduce((sum, s) => sum + Number(s.total_cost), 0);
    const grossProfit = filteredSales.reduce((sum, s) => sum + Number(s.total_profit), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = grossProfit - totalExpenses;
    
    const numTransactions = filteredSales.length;
    
    const saleItems = await db.find('sale_items');
    const filteredSaleItems = saleItems.filter(item => {
      const d = new Date(item.created_at);
      return d >= startDate && d <= endDate;
    });
    
    const totalProductsSold = filteredSaleItems.reduce((sum, item) => sum + item.quantity, 0);

    const itemQuantities = {};
    filteredSaleItems.forEach(item => {
      if (!itemQuantities[item.product_id]) {
        itemQuantities[item.product_id] = 0;
      }
      itemQuantities[item.product_id] += item.quantity;
    });

    const bestSellers = Object.keys(itemQuantities)
      .map(pId => {
        const p = products.find(prod => prod.id === pId);
        return {
          product_name: p ? p.name : 'Unknown Product',
          quantity: itemQuantities[pId]
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      summary: {
        revenue: totalRevenue,
        cost: totalCost,
        grossProfit,
        expenses: totalExpenses,
        netProfit,
        transactions: numTransactions,
        productsSold: totalProductsSold
      },
      bestSellers,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. ANALYTICS CHARTS DATA
router.get('/analytics', async (req, res) => {
  try {
    const sales = await db.find('sales');
    const expenses = await db.find('expenses');
    const products = await db.find('products');
    const saleItems = await db.find('sale_items');

    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];

      const daySales = sales.filter(s => s.sale_date.startsWith(dayStr));
      const dayExpenses = expenses.filter(e => e.expense_date === dayStr);

      const revenue = daySales.reduce((sum, s) => sum + Number(s.total_amount), 0);
      const cost = daySales.reduce((sum, s) => sum + Number(s.total_cost), 0);
      const profit = daySales.reduce((sum, s) => sum + Number(s.total_profit), 0);
      const expenseAmt = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

      dailyData.push({
        date: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        revenue,
        profit: profit - expenseAmt,
        expenses: expenseAmt
      });
    }

    const expenseSplit = {};
    expenses.forEach(e => {
      if (!expenseSplit[e.category]) {
        expenseSplit[e.category] = 0;
      }
      expenseSplit[e.category] += Number(e.amount);
    });
    const expenseChartData = Object.keys(expenseSplit).map(cat => ({
      name: cat,
      value: expenseSplit[cat]
    }));

    const categoryStock = {};
    products.forEach(p => {
      if (!categoryStock[p.category]) {
        categoryStock[p.category] = 0;
      }
      categoryStock[p.category] += p.quantity;
    });
    const stockChartData = Object.keys(categoryStock).map(cat => ({
      name: cat,
      value: categoryStock[cat]
    }));

    const bestSellingMap = {};
    saleItems.forEach(item => {
      if (!bestSellingMap[item.product_id]) {
        bestSellingMap[item.product_id] = 0;
      }
      bestSellingMap[item.product_id] += item.quantity;
    });

    const bestSellingList = Object.keys(bestSellingMap)
      .map(pId => {
        const p = products.find(prod => prod.id === pId);
        return {
          name: p ? p.name.split(' ')[0] : 'Product',
          sales: bestSellingMap[pId]
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    res.json({
      dailyData,
      expenseChartData,
      stockChartData,
      bestSellingList
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. USER AUTHENTICATION & REGISTRATION ENDPOINTS
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const user = await db.findOne('users', u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.json({ success: true, user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await db.find('users');
    const safeUsers = users.map(u => ({ id: u.id, username: u.username, role: u.role, created_at: u.created_at }));
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const exists = await db.findOne('users', u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const newUser = await db.insert('users', {
      username,
      password,
      role: role || 'admin'
    });
    res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. SMART UDHAR & CUSTOMER CREDIT ENDPOINTS
router.get('/udhar/summary', async (req, res) => {
  try {
    const customers = await db.find('customers');
    const creditTx = await db.find('credit_transactions');
    const creditPayments = await db.find('credit_payments');

    const totalOutstanding = customers.reduce((sum, c) => sum + (Number(c.debt_balance) || 0), 0);
    const activeUdharCount = customers.filter(c => (Number(c.debt_balance) || 0) > 0).length;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Due today outstanding
    const dueToday = creditTx
      .filter(t => t.status === 'due' && t.due_date && t.due_date.startsWith(todayStr))
      .reduce((sum, t) => sum + (Number(t.outstanding_amount) || 0), 0);

    // Overdue outstanding (due date passed and outstanding_amount > 0)
    const overdue = creditTx
      .filter(t => t.status === 'due' && t.due_date && new Date(t.due_date) < now)
      .reduce((sum, t) => sum + (Number(t.outstanding_amount) || 0), 0);

    // Calculate MTD credit given and recovered
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const creditGivenThisMonth = creditTx
      .filter(t => new Date(t.credit_date) >= startOfMonth)
      .reduce((sum, t) => sum + (Number(t.credit_amount) || 0), 0);

    const creditRecoveredThisMonth = creditPayments
      .filter(p => new Date(p.payment_date) >= startOfMonth)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    res.json({
      totalOutstanding,
      dueToday,
      overdue,
      activeUdharCount,
      creditGivenThisMonth,
      creditRecoveredThisMonth
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/credit/transactions', async (req, res) => {
  const { customer_id, product_name, total_bill, amount_paid, due_date, notes } = req.body;
  if (!customer_id || !total_bill) {
    return res.status(400).json({ error: 'Customer ID and Total Bill are required' });
  }

  try {
    const customer = await db.findById('customers', customer_id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const totalBillNum = Number(total_bill);
    const paidNum = Number(amount_paid || 0);
    const creditAmt = Math.max(0, totalBillNum - paidNum);

    if (creditAmt > 0) {
      // Update customer balance
      await db.update('customers', customer_id, {
        debt_balance: (Number(customer.debt_balance) || 0) + creditAmt,
        total_spending: (Number(customer.total_spending) || 0) + totalBillNum
      });

      // Insert credit transaction
      const creditTx = await db.insert('credit_transactions', {
        customer_id,
        credit_amount: creditAmt,
        amount_paid: paidNum,
        outstanding_amount: creditAmt,
        credit_date: new Date().toISOString(),
        due_date: due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'due',
        notes: notes || `Direct Credit Entry: ${product_name || 'Groceries'}`
      });

      res.status(201).json(creditTx);
    } else {
      res.status(400).json({ error: 'Credit amount must be greater than zero. Otherwise record a direct cash sale.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/credit/payments', async (req, res) => {
  const { customer_id, amount, payment_method, notes } = req.body;
  if (!customer_id || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Customer ID and positive payment amount are required' });
  }

  try {
    const customer = await db.findById('customers', customer_id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const repayAmt = Number(amount);
    let remainingRepay = repayAmt;

    // Settle active credit transactions (FIFO order: oldest first)
    const creditTxs = await db.find('credit_transactions');
    const custTxs = creditTxs
      .filter(t => t.customer_id === customer_id && t.status === 'due')
      .sort((a, b) => new Date(a.credit_date) - new Date(b.credit_date));

    const paymentsCreated = [];

    for (const tx of custTxs) {
      if (remainingRepay <= 0) break;

      const outstanding = Number(tx.outstanding_amount) || 0;
      const settlement = Math.min(outstanding, remainingRepay);
      const newOutstanding = outstanding - settlement;

      // Update transaction status
      await db.update('credit_transactions', tx.id, {
        outstanding_amount: newOutstanding,
        status: newOutstanding === 0 ? 'paid' : 'due'
      });

      // Insert payment record
      const payment = await db.insert('credit_payments', {
        credit_id: tx.id,
        customer_id,
        amount: settlement,
        payment_method: payment_method || 'cash',
        payment_date: new Date().toISOString(),
        notes: notes || 'Udhar Repayment Settle'
      });

      paymentsCreated.push(payment);
      remainingRepay -= settlement;
    }

    // If the customer pays more than their outstanding credit transactions, log it anyway to credit_payments but outstanding_amount decreases
    if (remainingRepay > 0) {
      const excessPayment = await db.insert('credit_payments', {
        credit_id: null,
        customer_id,
        amount: remainingRepay,
        payment_method: payment_method || 'cash',
        payment_date: new Date().toISOString(),
        notes: notes || 'Excess Settle/Advance Payment'
      });
      paymentsCreated.push(excessPayment);
    }

    // Update customer outstanding running balance
    const currentDebt = Number(customer.debt_balance) || 0;
    const newDebt = Math.max(0, currentDebt - repayAmt);
    await db.update('customers', customer_id, {
      debt_balance: newDebt
    });

    res.status(201).json({ success: true, new_debt_balance: newDebt, payments: paymentsCreated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/customers/:id/ledger', async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await db.findById('customers', id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const creditTx = await db.find('credit_transactions');
    const creditPayments = await db.find('credit_payments');
    const sales = await db.find('sales');

    const custCredits = creditTx.filter(t => t.customer_id === id);
    const custPayments = creditPayments.filter(p => p.customer_id === id);
    const custSales = sales.filter(s => s.customer_id === id);

    // Create a combined ledger timeline
    const timeline = [];

    // Add credit purchases
    custCredits.forEach(c => {
      const sale = custSales.find(s => s.id === c.sale_id);
      timeline.push({
        type: 'credit',
        amount: c.credit_amount,
        outstanding: c.outstanding_amount,
        date: c.credit_date,
        due_date: c.due_date,
        status: c.status,
        description: c.notes || (sale ? 'POS Credit Purchase' : 'Credit Purchase')
      });
    });

    // Add payments
    custPayments.forEach(p => {
      timeline.push({
        type: 'payment',
        amount: p.amount,
        date: p.payment_date,
        description: p.notes || `Repayment via ${p.payment_method.toUpperCase()}`
      });
    });

    // Sort timeline by date descending
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate monthly stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const creditGivenThisMonth = custCredits
      .filter(t => new Date(t.credit_date) >= startOfMonth)
      .reduce((sum, t) => sum + (Number(t.credit_amount) || 0), 0);

    const creditRecoveredThisMonth = custPayments
      .filter(p => new Date(p.payment_date) >= startOfMonth)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    res.json({
      customer,
      timeline,
      summary: {
        creditGivenThisMonth,
        creditRecoveredThisMonth
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const fs = require('fs');
const path = require('path');
const supabase = require('./supabaseClient');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to get filepath for a collection
function getFilePath(collectionName) {
  return path.join(DATA_DIR, `${collectionName}.json`);
}

// Read collection from file
function readCollection(collectionName) {
  const filePath = getFilePath(collectionName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error(`Error reading collection ${collectionName}:`, error);
    return [];
  }
}

// Write collection to file
function writeCollection(collectionName, data) {
  const filePath = getFilePath(collectionName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing collection ${collectionName}:`, error);
  }
}

// Initialize collections
const collections = [
  'shops',
  'products',
  'sales',
  'sale_items',
  'customers',
  'expenses',
  'offers',
  'pamphlets',
  'ai_insights',
  'users',
  'credit_transactions',
  'credit_payments',
  'suppliers',
  'supplier_transactions',
  'cashbook_entries',
  'khata_books'
];

collections.forEach(name => {
  if (!fs.existsSync(getFilePath(name))) {
    writeCollection(name, []);
  }
});

// Seed default khata books if empty
try {
  const booksPath = getFilePath('khata_books');
  if (fs.existsSync(booksPath)) {
    const fileData = fs.readFileSync(booksPath, 'utf8');
    const books = JSON.parse(fileData || '[]');
    if (books.length === 0) {
      const defaultBooks = [
        { id: 'kb_main', name: '🏪 Main Store Khata', type: 'store', is_default: true, created_at: new Date().toISOString() },
        { id: 'kb_wholesale', name: '📦 Wholesale & Suppliers', type: 'wholesale', is_default: false, created_at: new Date().toISOString() },
        { id: 'kb_personal', name: '🏠 Personal & Household', type: 'personal', is_default: false, created_at: new Date().toISOString() }
      ];
      writeCollection('khata_books', defaultBooks);
    }
  }
} catch (e) {
  console.error('Error seeding default khata books:', e);
}

// Seed default admin user in local JSON database if empty
try {
  const usersPath = getFilePath('users');
  const fileData = fs.readFileSync(usersPath, 'utf8');
  const usersList = JSON.parse(fileData || '[]');
  if (usersList.length === 0) {
    usersList.push({
      id: 'user_admin_default',
      username: 'admin',
      password: 'smartshop',
      role: 'admin',
      created_at: new Date().toISOString()
    });
    fs.writeFileSync(usersPath, JSON.stringify(usersList, null, 2), 'utf8');
    console.log('Seeded default admin user in local database: admin / smartshop');
  }
} catch (e) {
  console.error('Error seeding default user:', e.message);
}

// Helper to generate custom short keys
function generateShortId(collectionName) {
  const prefix = collectionName.substring(0, 3).toLowerCase();
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}_${timestamp}_${random}`;
}

const db = {
  // Generic Find (supports filtering locally after pulling from database)
  async find(collectionName, predicate = () => true) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from(collectionName)
          .select('*');
        if (error) throw error;
        return (data || []).filter(predicate);
      } catch (err) {
        console.error(`Supabase find error for ${collectionName}:`, err.message);
      }
    }
    // Local JSON fallback
    const data = readCollection(collectionName);
    return data.filter(predicate);
  },

  async findOne(collectionName, predicate) {
    const items = await this.find(collectionName, predicate);
    return items.length > 0 ? items[0] : null;
  },

  async findById(collectionName, id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from(collectionName)
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error(`Supabase findById error for ${collectionName}:`, err.message);
      }
    }
    return this.findOne(collectionName, item => item.id === id);
  },

  // Generic Insert
  async insert(collectionName, item) {
    if (!item.id) {
      item.id = generateShortId(collectionName);
    }
    item.created_at = new Date().toISOString();

    if (supabase) {
      try {
        // Enforce basic shop bindings if missing
        if (!item.shop_id && collectionName !== 'shops') {
          const shopList = await this.find('shops');
          if (shopList.length > 0) {
            item.shop_id = shopList[0].id;
          }
        }
        
        const { data, error } = await supabase
          .from(collectionName)
          .insert(item)
          .select();
        if (error) throw error;
        
        // Post-insert Hooks
        if (collectionName === 'sales' || collectionName === 'products') {
          await this.generateAiInsights();
        }
        
        return data && data.length > 0 ? data[0] : item;
      } catch (err) {
        console.error(`Supabase insert error for ${collectionName}:`, err.message);
      }
    }

    // Local JSON database insertion
    const data = readCollection(collectionName);
    data.push(item);
    writeCollection(collectionName, data);
    
    if (collectionName === 'sales' || collectionName === 'products') {
      await this.generateAiInsights();
    }
    return item;
  },

  // Generic Update
  async update(collectionName, id, updates) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from(collectionName)
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select();
        if (error) throw error;

        // Post-update Hooks
        if (collectionName === 'products' || collectionName === 'sales') {
          await this.generateAiInsights();
        }

        return data && data.length > 0 ? data[0] : null;
      } catch (err) {
        console.error(`Supabase update error for ${collectionName}:`, err.message);
      }
    }

    // Local JSON update
    const data = readCollection(collectionName);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;

    data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
    writeCollection(collectionName, data);

    if (collectionName === 'products' || collectionName === 'sales') {
      await this.generateAiInsights();
    }
    return data[index];
  },

  // Generic Delete
  async delete(collectionName, id) {
    if (supabase) {
      try {
        const { error } = await supabase
          .from(collectionName)
          .delete()
          .eq('id', id);
        if (error) throw error;

        // Cleanup hooks
        if (collectionName === 'sales') {
          await supabase.from('sale_items').delete().eq('sale_id', id);
        }
        if (collectionName === 'offers') {
          await supabase.from('pamphlets').delete().eq('offer_id', id);
        }

        return true;
      } catch (err) {
        console.error(`Supabase delete error for ${collectionName}:`, err.message);
        return false;
      }
    }

    // Local JSON delete
    const data = readCollection(collectionName);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return false;

    data.splice(index, 1);
    writeCollection(collectionName, data);

    if (collectionName === 'sales') {
      const saleItems = readCollection('sale_items');
      writeCollection('sale_items', saleItems.filter(item => item.sale_id !== id));
    }
    if (collectionName === 'offers') {
      const pamphlets = readCollection('pamphlets');
      writeCollection('pamphlets', pamphlets.filter(p => p.offer_id !== id));
    }
    return true;
  },

  // Transaction sales
  async createSale(saleData) {
    const { customer_id, items, payment_method, amount_paid: rawAmountPaid } = saleData;
    
    let total_amount = 0;
    let total_cost = 0;
    let total_profit = 0;
    
    const sale_id = `sale_${Date.now()}`;
    const saleItemsCreated = [];

    const products = await this.find('products');

    for (const item of items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}. Required: ${item.quantity}, Available: ${product.quantity}`);
      }

      // Check for active offer discount
      const activeOffer = await this.findActiveOfferForProduct(product.id);
      const sellingPrice = activeOffer ? activeOffer.offer_price : product.selling_price;
      const purchasePrice = product.purchase_price;

      const itemCost = purchasePrice * item.quantity;
      const itemRevenue = sellingPrice * item.quantity;
      const itemProfit = itemRevenue - itemCost;

      total_amount += itemRevenue;
      total_cost += itemCost;
      total_profit += itemProfit;

      // Decrement stock
      product.quantity -= item.quantity;

      const saleItem = {
        id: `sitem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        sale_id,
        product_id: product.id,
        quantity: item.quantity,
        selling_price: sellingPrice,
        purchase_price: purchasePrice,
        profit: itemProfit,
        created_at: new Date().toISOString()
      };
      saleItemsCreated.push(saleItem);
    }

    const isDebt = payment_method === 'debt';
    const amtPaid = isDebt ? (rawAmountPaid !== undefined ? Number(rawAmountPaid) : 0) : total_amount;
    const creditAmt = isDebt ? Math.max(0, total_amount - amtPaid) : 0;
    const payStatus = isDebt ? (creditAmt === 0 ? 'paid' : 'due') : 'paid';

    if (supabase) {
      try {
        const shopList = await this.find('shops');
        const shop_id = shopList.length > 0 ? shopList[0].id : null;

        // 1. Insert Sales record
        const { error: saleErr } = await supabase
          .from('sales')
          .insert({
            id: sale_id,
            shop_id,
            customer_id: customer_id || null,
            total_amount,
            total_cost,
            total_profit,
            payment_method: payment_method || 'cash',
            amount_paid: amtPaid,
            credit_amount: creditAmt,
            payment_status: payStatus,
            sale_date: new Date().toISOString()
          });
        if (saleErr) throw saleErr;

        // 2. Insert Sale Items
        const { error: itemsErr } = await supabase
          .from('sale_items')
          .insert(saleItemsCreated);
        if (itemsErr) throw itemsErr;

        // 3. Update products stock
        for (const item of items) {
          const product = products.find(p => p.id === item.product_id);
          const { error: prodErr } = await supabase
            .from('products')
            .update({ quantity: product.quantity })
            .eq('id', product.id);
          if (prodErr) throw prodErr;
        }

        // 4. Update Customer profile spending & debt balance
        if (customer_id) {
          const cust = await this.findById('customers', customer_id);
          if (cust) {
            await supabase
              .from('customers')
              .update({
                total_spending: (Number(cust.total_spending) || 0) + total_amount,
                debt_balance: (Number(cust.debt_balance) || 0) + creditAmt,
                last_purchase: new Date().toISOString()
              })
              .eq('id', customer_id);
          }
        }

        // 5. Create credit transaction record
        if (creditAmt > 0 && customer_id) {
          const creditTx = {
            id: `credit_${Date.now()}`,
            shop_id,
            customer_id,
            sale_id,
            credit_amount: creditAmt,
            amount_paid: amtPaid,
            outstanding_amount: creditAmt,
            credit_date: new Date().toISOString(),
            due_date: saleData.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'due',
            notes: saleData.notes || 'POS Credit Purchase'
          };
          await this.insert('credit_transactions', creditTx);
        }

        await this.generateAiInsights();

        return {
          sale: { 
            id: sale_id, 
            customer_id, 
            total_amount, 
            total_cost, 
            total_profit, 
            payment_method: payment_method || 'cash',
            amount_paid: amtPaid,
            credit_amount: creditAmt,
            payment_status: payStatus,
            sale_date: new Date().toISOString() 
          },
          items: saleItemsCreated
        };

      } catch (err) {
        console.error('Supabase createSale transaction error:', err.message);
        throw err;
      }
    }

    // Local JSON transactional write
    writeCollection('products', products);

    const allSaleItems = readCollection('sale_items');
    allSaleItems.push(...saleItemsCreated);
    writeCollection('sale_items', allSaleItems);

    const saleRecord = {
      id: sale_id,
      customer_id: customer_id || null,
      total_amount,
      total_cost,
      total_profit,
      payment_method: payment_method || 'cash',
      amount_paid: amtPaid,
      credit_amount: creditAmt,
      payment_status: payStatus,
      sale_date: new Date().toISOString()
    };
    await this.insert('sales', saleRecord);

    if (customer_id) {
      const customer = await this.findById('customers', customer_id);
      if (customer) {
        await this.update('customers', customer_id, {
          total_spending: (customer.total_spending || 0) + total_amount,
          debt_balance: (customer.debt_balance || 0) + creditAmt,
          last_purchase: saleRecord.sale_date
        });
      }
    }

    // Create credit transaction record locally
    if (creditAmt > 0 && customer_id) {
      const creditTx = {
        id: `credit_${Date.now()}`,
        shop_id: null,
        customer_id,
        sale_id,
        credit_amount: creditAmt,
        amount_paid: amtPaid,
        outstanding_amount: creditAmt,
        credit_date: new Date().toISOString(),
        due_date: saleData.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'due',
        notes: saleData.notes || 'POS Credit Purchase'
      };
      await this.insert('credit_transactions', creditTx);
    }

    await this.generateAiInsights();

    return {
      sale: saleRecord,
      items: saleItemsCreated
    };
  },

  async findActiveOfferForProduct(productId) {
    const offers = await this.find('offers');
    const now = new Date().toISOString().split('T')[0];
    return offers.find(o => 
      o.product_id === productId && 
      o.status === 'active' && 
      o.start_date <= now && 
      o.end_date >= now
    );
  },

  async generateAiInsights() {
    const products = await this.find('products');
    const sales = await this.find('sales');
    const saleItems = await this.find('sale_items');
    const insights = [];

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // 1. Low stock detection
    products.forEach(p => {
      if (p.quantity <= p.minimum_stock) {
        insights.push({
          id: `ins_low_${p.id}`,
          type: 'low_stock',
          priority: 'high',
          ref_id: p.id,
          message: `⚠️ Low Stock Alert: ${p.name} is running low.`,
          recommendation: `Current stock: ${p.quantity} units. Minimum required: ${p.minimum_stock} units. We recommend restocking at least ${Math.max(10, p.minimum_stock * 2 - p.quantity)} units.`,
          created_at: new Date().toISOString()
        });
      }
    });

    // 2. Slow moving stock detection
    const recentSaleItems = saleItems.filter(item => new Date(item.created_at) >= sevenDaysAgo);
    
    products.forEach(p => {
      if (p.quantity > p.minimum_stock && p.quantity > 10) {
        const unitsSoldRecently = recentSaleItems
          .filter(item => item.product_id === p.id)
          .reduce((sum, item) => sum + item.quantity, 0);

        if (unitsSoldRecently <= 2) {
          const profitMargin = ((p.selling_price - p.purchase_price) / p.selling_price) * 100;
          let rec = `Stock is high (${p.quantity} units) with only ${unitsSoldRecently} sold this week. `;
          
          if (profitMargin > 15) {
            rec += `You have a healthy profit margin of ${profitMargin.toFixed(0)}%. We recommend creating a 10% promotional offer to accelerate sales.`;
          } else {
            rec += `Your profit margin is tight (${profitMargin.toFixed(0)}%). Consider bundling this with a faster-moving product as a combo deal.`;
          }

          insights.push({
            id: `ins_slow_${p.id}`,
            type: 'slow_moving',
            priority: 'medium',
            ref_id: p.id,
            message: `📦 Slow-Moving Stock: ${p.name} has high inventory and slow sales.`,
            recommendation: rec,
            created_at: new Date().toISOString()
          });
        }
      }
    });

    // 3. Sales champion profit tip
    if (sales.length > 0) {
      const topSellingProduct = await this.getTopSellingProduct();
      if (topSellingProduct) {
        insights.push({
          id: `ins_top_${topSellingProduct.id}`,
          type: 'profit_tip',
          priority: 'low',
          ref_id: topSellingProduct.id,
          message: `💰 Sales Champion: ${topSellingProduct.name} is your top seller.`,
          recommendation: `This product generated ₹${topSellingProduct.revenue.toLocaleString('en-IN')} in revenue recently. Keep it well-stocked and prominently displayed at the front of your store.`,
          created_at: new Date().toISOString()
        });
      }
    }

    if (supabase) {
      try {
        const shopList = await this.find('shops');
        const shop_id = shopList.length > 0 ? shopList[0].id : null;
        
        // Clear old insights first
        await supabase.from('ai_insights').delete().neq('id', 'x');

        // Insert new ones
        if (insights.length > 0) {
          await supabase.from('ai_insights').insert(
            insights.map(ins => ({ ...ins, shop_id }))
          );
        }
        return;
      } catch (err) {
        console.error('Supabase write insights error:', err.message);
      }
    }

    writeCollection('ai_insights', insights);
  },

  async getTopSellingProduct() {
    const saleItems = await this.find('sale_items');
    const products = await this.find('products');
    if (saleItems.length === 0) return null;

    const productSalesMap = {};
    saleItems.forEach(item => {
      if (!productSalesMap[item.product_id]) {
        productSalesMap[item.product_id] = { qty: 0, revenue: 0 };
      }
      productSalesMap[item.product_id].qty += item.quantity;
      productSalesMap[item.product_id].revenue += item.quantity * item.selling_price;
    });

    let topProductId = null;
    let maxQty = -1;

    Object.keys(productSalesMap).forEach(pId => {
      if (productSalesMap[pId].qty > maxQty) {
        maxQty = productSalesMap[pId].qty;
        topProductId = pId;
      }
    });

    if (!topProductId) return null;
    const prod = products.find(p => p.id === topProductId);
    if (!prod) return null;

    return {
      ...prod,
      qtySold: maxQty,
      revenue: productSalesMap[topProductId].revenue
    };
  }
};

module.exports = db;

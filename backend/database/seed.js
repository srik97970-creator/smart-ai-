const fs = require('fs');
const path = require('path');
const db = require('./db');

const DATA_DIR = path.join(__dirname, 'data');

// Clean data files first
const files = fs.readdirSync(DATA_DIR);
files.forEach(file => {
  if (file.endsWith('.json')) {
    fs.writeFileSync(path.join(DATA_DIR, file), '[]');
  }
});

console.log('Database cleared for seeding...');

// 1. Seed Shop Profile
const shop = db.insert('shops', {
  id: 'shop_srilakshmi_1',
  shop_name: 'Sri Lakshmi Stores',
  owner_name: 'Lakshmi Prasad',
  phone: '9876543210',
  address: 'D.No. 45-12-8, Main Road, Dwaraka Nagar, Visakhapatnam, Andhra Pradesh',
  logo_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&h=200&fit=crop&q=60',
  designer_cost: 500 // Estimated external flyer design cost in ₹
});

console.log('Shop profile seeded.');

// 2. Seed Customers
const customersData = [
  { id: 'cust_1', name: 'Kalyan Kumar', phone: '9440123456', total_spending: 0, last_purchase: null },
  { id: 'cust_2', name: 'Srinivas Rao', phone: '9848098765', total_spending: 0, last_purchase: null },
  { id: 'cust_3', name: 'J. Rajesh', phone: '9000123987', total_spending: 0, last_purchase: null },
  { id: 'cust_4', name: 'M. Padmavathi', phone: '8919012345', total_spending: 0, last_purchase: null },
  { id: 'cust_5', name: 'N. Rama Devi', phone: '7702987654', total_spending: 0, last_purchase: null }
];
customersData.forEach(c => db.insert('customers', c));
console.log('Customers seeded.');

// 3. Seed Products
const productsData = [
  // Grains & Atta
  { id: 'prod_rice_5k', name: 'Rice Premium Kolam 5kg', category: 'Grains', sku: 'RICE-KOL-5K', barcode: '890123450001', purchase_price: 270, selling_price: 320, quantity: 7, minimum_stock: 15, brand: 'Lalitha', supplier: 'Venkata Sai Traders', expiry_date: null },
  { id: 'prod_atta_10k', name: 'Aashirvaad Shudh Chakki Atta 10kg', category: 'Grains', sku: 'AASH-ATTA-10K', barcode: '890123450002', purchase_price: 380, selling_price: 450, quantity: 20, minimum_stock: 10, brand: 'ITC Aashirvaad', supplier: 'Venkata Sai Traders', expiry_date: null },
  
  // Grocery & Baking
  { id: 'prod_sugar_1k', name: 'Madhur Pure Sugar 1kg', category: 'Grocery', sku: 'SUG-MAD-1K', barcode: '890123450003', purchase_price: 36, selling_price: 45, quantity: 45, minimum_stock: 15, brand: 'Madhur', supplier: 'Siva Distributors', expiry_date: '2027-12-31' },
  { id: 'prod_oil_1l', name: 'Freedom Sunflower Oil 1L', category: 'Grocery', sku: 'OIL-FREE-1L', barcode: '890123450004', purchase_price: 120, selling_price: 145, quantity: 32, minimum_stock: 10, brand: 'Freedom', supplier: 'Siva Distributors', expiry_date: '2027-06-30' },
  { id: 'prod_butter_500', name: 'Amul Butter 500g', category: 'Grocery', sku: 'BUT-AMUL-500', barcode: '890123450005', purchase_price: 230, selling_price: 275, quantity: 18, minimum_stock: 6, brand: 'Amul', supplier: 'Vizag Dairy Agencies', expiry_date: '2026-11-15' },
  { id: 'prod_maggi', name: 'Maggi 2-Minute Noodles 280g', category: 'Grocery', sku: 'MAGG-280G', barcode: '890123450006', purchase_price: 24, selling_price: 30, quantity: 58, minimum_stock: 15, brand: 'Nestle Maggi', supplier: 'Siva Distributors', expiry_date: '2027-03-31' },
  { id: 'prod_salt', name: 'Tata Salt Vaccum Evaporated 1kg', category: 'Grocery', sku: 'SALT-TATA-1K', barcode: '890123450007', purchase_price: 18, selling_price: 24, quantity: 42, minimum_stock: 12, brand: 'Tata', supplier: 'Siva Distributors', expiry_date: null },

  // Household
  { id: 'prod_detergent_1k', name: 'Surf Excel Easy Wash 1kg', category: 'Household', sku: 'SURF-EASY-1K', barcode: '890123450008', purchase_price: 110, selling_price: 140, quantity: 38, minimum_stock: 8, brand: 'Surf Excel', supplier: 'Hindustan Unilever', expiry_date: null }, // high stock, slow moving
  { id: 'prod_dishwash_500', name: 'Vim Liquid Gel 500ml', category: 'Household', sku: 'VIM-GEL-500', barcode: '890123450009', purchase_price: 80, selling_price: 99, quantity: 14, minimum_stock: 5, brand: 'Vim', supplier: 'Hindustan Unilever', expiry_date: null },
  { id: 'prod_floor_cleaner', name: 'Lizol Floor Cleaner Citrus 500ml', category: 'Household', sku: 'LIZ-CIT-500', barcode: '890123450010', purchase_price: 78, selling_price: 95, quantity: 12, minimum_stock: 5, brand: 'Lizol', supplier: 'Reckitt Benckiser', expiry_date: '2028-01-01' },
  { id: 'prod_vim_bar', name: 'Vim Dishwash Bar 150g', category: 'Household', sku: 'VIM-BAR-150', barcode: '890123450011', purchase_price: 12, selling_price: 15, quantity: 85, minimum_stock: 20, brand: 'Vim', supplier: 'Hindustan Unilever', expiry_date: null },

  // Beverages
  { id: 'prod_tea_1k', name: 'Tata Tea Premium 1kg', category: 'Beverages', sku: 'TEA-TATA-1K', barcode: '890123450012', purchase_price: 320, selling_price: 380, quantity: 16, minimum_stock: 8, brand: 'Tata Tea', supplier: 'Siva Distributors', expiry_date: '2028-06-30' },
  { id: 'prod_coffee_100', name: 'Nescafe Classic Coffee 100g', category: 'Beverages', sku: 'COF-NES-100', barcode: '890123450013', purchase_price: 210, selling_price: 250, quantity: 24, minimum_stock: 5, brand: 'Nescafe', supplier: 'Siva Distributors', expiry_date: '2027-09-30' },
  { id: 'prod_milk_1l', name: 'Nandini GoodLife Milk 1L', category: 'Beverages', sku: 'MILK-NAND-1L', barcode: '890123450014', purchase_price: 46, selling_price: 54, quantity: 48, minimum_stock: 10, brand: 'Nandini', supplier: 'Vizag Dairy Agencies', expiry_date: '2026-10-15' },
  { id: 'prod_red_label_250', name: 'Brooke Bond Red Label Tea 250g', category: 'Beverages', sku: 'TEA-BBRL-250', barcode: '890123450015', purchase_price: 90, selling_price: 115, quantity: 3, minimum_stock: 8, brand: 'Brooke Bond', supplier: 'Hindustan Unilever', expiry_date: '2028-03-31' },

  // Personal Care
  { id: 'prod_toothpaste', name: 'Colgate Strong Teeth Toothpaste 200g', category: 'Personal Care', sku: 'COL-ST-200', barcode: '890123450016', purchase_price: 85, selling_price: 110, quantity: 28, minimum_stock: 10, brand: 'Colgate', supplier: 'Colgate Palmolive Ltd', expiry_date: '2028-08-31' },
  { id: 'prod_soap', name: 'Dettol Original Soap 125g (Pack of 3)', category: 'Personal Care', sku: 'DET-SOP-3P', barcode: '890123450017', purchase_price: 110, selling_price: 135, quantity: 22, minimum_stock: 8, brand: 'Dettol', supplier: 'Reckitt Benckiser', expiry_date: null },
  { id: 'prod_shampoo', name: 'Head & Shoulders Anti Dandruff Shampoo 340ml', category: 'Personal Care', sku: 'HS-AD-340', barcode: '890123450018', purchase_price: 240, selling_price: 299, quantity: 15, minimum_stock: 5, brand: 'Head & Shoulders', supplier: 'P&G Agencies', expiry_date: '2027-10-31' },

  // Snacks & Biscuits
  { id: 'prod_goodday', name: 'Britannia Good Day Cashew 200g', category: 'Snacks', sku: 'BRIT-GD-200', barcode: '890123450019', purchase_price: 28, selling_price: 35, quantity: 65, minimum_stock: 15, brand: 'Britannia', supplier: 'Siva Distributors', expiry_date: '2027-02-28' },
  { id: 'prod_dark_fantasy', name: 'Sunfeast Dark Fantasy Choco Fills 300g', category: 'Snacks', sku: 'SUN-DF-300', barcode: '890123450020', purchase_price: 95, selling_price: 120, quantity: 18, minimum_stock: 6, brand: 'Sunfeast', supplier: 'Venkata Sai Traders', expiry_date: '2027-01-31' }
];

productsData.forEach(p => db.insert('products', p));
console.log('Products seeded.');

// 4. Seed Expenses (last 30 days)
const expensesData = [
  { id: 'exp_rent_aug', category: 'Rent', amount: 12000, description: 'Shop rent for August 2026', expense_date: '2026-08-01' },
  { id: 'exp_salary_aug', category: 'Salary', amount: 8000, description: 'Monthly helper salary', expense_date: '2026-08-28' },
  { id: 'exp_power_aug', category: 'Electricity', amount: 2450, description: 'APSPDCL electricity bill', expense_date: '2026-08-15' },
  { id: 'exp_transport_1', category: 'Transport', amount: 1200, description: 'Stock loading and transport', expense_date: '2026-08-10' },
  { id: 'exp_transport_2', category: 'Transport', amount: 1500, description: 'Emergency stock fetching', expense_date: '2026-08-25' },
  { id: 'exp_pkg', category: 'Packaging', amount: 650, description: 'Carry bags and packing wraps', expense_date: '2026-08-18' }
];
expensesData.forEach(e => db.insert('expenses', e));
console.log('Expenses seeded.');

// 5. Seed Offers
const offersData = [
  {
    id: 'off_atta_discount',
    product_id: 'prod_atta_10k',
    offer_type: 'Percentage Discount',
    original_price: 450,
    discount: 10, // 10%
    offer_price: 405,
    start_date: '2026-08-20',
    end_date: '2026-09-10',
    status: 'active'
  },
  {
    id: 'off_coffee_combo',
    product_id: 'prod_coffee_100',
    offer_type: 'Flat Discount',
    original_price: 250,
    discount: 25, // ₹25 off
    offer_price: 225,
    start_date: '2026-08-25',
    end_date: '2026-09-05',
    status: 'active'
  }
];
offersData.forEach(o => db.insert('offers', o));
console.log('Offers seeded.');

// 6. Seed Pamphlets
const pamphletsData = [
  {
    id: 'pam_atta_1',
    offer_id: 'off_atta_discount',
    shop_id: 'shop_srilakshmi_1',
    template: 'Discount Offer',
    language: 'en',
    title: 'Aashirvaad Atta Fest!',
    description: 'Get premium quality Aashirvaad Atta 10kg now at an amazing discount of 10%! Offer valid till September 10th.',
    image_url: '',
    generated_date: '2026-08-20T10:00:00.000Z'
  }
];
pamphletsData.forEach(p => db.insert('pamphlets', p));
console.log('Pamphlets seeded.');

// 7. Seed 30+ Sales Transactions spanning 30 days
// We will insert sales manually to bypass standard stock check/reductions, or simulate it.
// Let's write them directly using fs to ensure we have a solid history without emptying our stock.
const sales = [];
const saleItems = [];

const products = db.find('products');
const customers = db.find('customers');

const now = new Date();

// Create 30 days of sales
for (let i = 29; i >= 0; i--) {
  const saleDate = new Date();
  saleDate.setDate(now.getDate() - i);
  // Introduce variance: weekend sales are higher, week days are moderate
  const dayOfWeek = saleDate.getDay();
  const numSales = (dayOfWeek === 0 || dayOfWeek === 6) ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 2) + 1;

  for (let s = 0; s < numSales; s++) {
    const saleId = `sale_hist_${i}_${s}`;
    
    // Choose 1-4 random products
    const itemsCount = Math.floor(Math.random() * 3) + 1;
    const itemsSelected = [];
    let saleTotal = 0;
    let saleCost = 0;
    let saleProfit = 0;

    const chosenProducts = [];
    while (chosenProducts.length < itemsCount) {
      const p = products[Math.floor(Math.random() * products.length)];
      if (!chosenProducts.includes(p.id)) {
        chosenProducts.push(p.id);
      }
    }

    chosenProducts.forEach((pId, idx) => {
      const prod = products.find(p => p.id === pId);
      const qty = Math.floor(Math.random() * 3) + 1; // 1 to 3 units
      const sellingPrice = prod.selling_price;
      const purchasePrice = prod.purchase_price;

      const itemCost = purchasePrice * qty;
      const itemRevenue = sellingPrice * qty;
      const itemProfit = itemRevenue - itemCost;

      saleTotal += itemRevenue;
      saleCost += itemCost;
      saleProfit += itemProfit;

      saleItems.push({
        id: `sitem_hist_${i}_${s}_${idx}`,
        sale_id: saleId,
        product_id: prod.id,
        quantity: qty,
        selling_price: sellingPrice,
        purchase_price: purchasePrice,
        profit: itemProfit,
        created_at: saleDate.toISOString()
      });
    });

    const cust = Math.random() > 0.4 ? customers[Math.floor(Math.random() * customers.length)] : null;

    sales.push({
      id: saleId,
      customer_id: cust ? cust.id : null,
      total_amount: saleTotal,
      total_cost: saleCost,
      total_profit: saleProfit,
      sale_date: saleDate.toISOString()
    });

    if (cust) {
      cust.total_spending += saleTotal;
      cust.last_purchase = saleDate.toISOString();
    }
  }
}

// Write to files
fs.writeFileSync(path.join(DATA_DIR, 'sales.json'), JSON.stringify(sales, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'sale_items.json'), JSON.stringify(saleItems, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'customers.json'), JSON.stringify(customers, null, 2));

console.log(`Seeded ${sales.length} sales and ${saleItems.length} items.`);

// Re-generate proactive insights based on the new seed data
db.generateAiInsights();
console.log('AI Insights updated post-seeding.');
console.log('Database seeding successfully completed!');

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  History, 
  Receipt,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { t } from '../utils/translations';

export default function Sales({ lang, navigateTo }) {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'history'
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // POS State
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [dueDateType, setDueDateType] = useState('7days');
  const [customDueDate, setCustomDueDate] = useState('');
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [warningDetails, setWarningDetails] = useState({ outstanding: 0, newCredit: 0, limit: 5000, total: 0 });
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);
  
  // Quick Customer Creation
  const [showAddCustModal, setShowAddCustModal] = useState(false);
  const [custForm, setCustForm] = useState({ name: '', phone: '' });
  const [custError, setCustError] = useState('');

  // Quick Product Creation
  const [showAddProdModal, setShowAddProdModal] = useState(false);
  const [prodForm, setProdForm] = useState({
    name: '',
    category: 'Grocery',
    brand: '',
    sku: '',
    barcode: '',
    purchase_price: '',
    selling_price: '',
    quantity: 20,
    minimum_stock: 5
  });
  const [prodError, setProdError] = useState('');

  const handleCreateProduct = (e) => {
    e.preventDefault();
    setProdError('');

    if (!prodForm.name.trim() || !prodForm.purchase_price || !prodForm.selling_price) {
      return setProdError('Product Name, Purchase Price, and Selling Price are required');
    }

    if (Number(prodForm.purchase_price) < 0 || Number(prodForm.selling_price) < 0 || Number(prodForm.quantity) < 0) {
      return setProdError('Prices and stock quantity cannot be negative');
    }

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...prodForm,
        purchase_price: Number(prodForm.purchase_price),
        selling_price: Number(prodForm.selling_price),
        quantity: Number(prodForm.quantity),
        minimum_stock: Number(prodForm.minimum_stock)
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create product');
        return data;
      })
      .then(newProd => {
        setProducts([...products, newProd]);
        addToCart(newProd);
        setShowAddProdModal(false);
        setProdForm({
          name: '',
          category: 'Grocery',
          brand: '',
          sku: '',
          barcode: '',
          purchase_price: '',
          selling_price: '',
          quantity: 20,
          minimum_stock: 5
        });
      })
      .catch(err => setProdError(err.message));
  };

  const categories = ['Grains', 'Grocery', 'Household', 'Beverages', 'Personal Care', 'Snacks'];

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchSalesHistory();
  }, [activeTab]);

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products for POS:', err));
  };

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error('Error fetching customers for POS:', err));
  };

  const fetchSalesHistory = () => {
    setLoading(true);
    fetch('/api/sales')
      .then(res => res.json())
      .then(data => {
        setSalesHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching sales history:', err);
        setLoading(false);
      });
  };

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      alert(`${product.name} is out of stock!`);
      return;
    }

    const existingIndex = cart.findIndex(item => item.product_id === product.id);
    
    // Check if adding exceeds stock
    const currentQtyInCart = existingIndex !== -1 ? cart[existingIndex].quantity : 0;
    if (currentQtyInCart >= product.quantity) {
      alert(`Cannot add more. Only ${product.quantity} units are available in stock.`);
      return;
    }

    // Check for active offer discount
    fetch(`/api/offers`)
      .then(res => res.json())
      .then(offers => {
        const nowStr = new Date().toISOString().split('T')[0];
        const activeOffer = offers.find(o => 
          o.product_id === product.id && 
          o.status === 'active' && 
          o.start_date <= nowStr && 
          o.end_date >= nowStr
        );

        const sellingPrice = activeOffer ? activeOffer.offer_price : product.selling_price;
        const discountAmt = activeOffer ? (product.selling_price - activeOffer.offer_price) : 0;

        if (existingIndex !== -1) {
          const updatedCart = [...cart];
          updatedCart[existingIndex].quantity += 1;
          setCart(updatedCart);
        } else {
          setCart([...cart, {
            product_id: product.id,
            name: product.name,
            original_price: product.selling_price,
            selling_price: sellingPrice,
            purchase_price: product.purchase_price,
            discount: discountAmt,
            quantity: 1,
            maxQuantity: product.quantity
          }]);
        }
      });
  };

  const updateCartQty = (productId, amount) => {
    const itemIndex = cart.findIndex(item => item.product_id === productId);
    if (itemIndex === -1) return;

    const updatedCart = [...cart];
    const item = updatedCart[itemIndex];
    const newQty = item.quantity + amount;

    if (newQty <= 0) {
      updatedCart.splice(itemIndex, 1);
    } else if (newQty > item.maxQuantity) {
      alert(`Cannot adjust. Only ${item.maxQuantity} units are in stock.`);
      return;
    } else {
      item.quantity = newQty;
    }
    setCart(updatedCart);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.original_price * item.quantity, 0);
  const cartDiscount = cart.reduce((sum, item) => sum + item.discount * item.quantity, 0);
  const cartTotal = cartSubtotal - cartDiscount;
  const cartEstProfit = cart.reduce((sum, item) => sum + (item.selling_price - item.purchase_price) * item.quantity, 0);

  const handleCheckout = (e, forceBypass = false) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return alert('Your shopping cart is empty!');

    const isDebt = paymentMethod === 'debt';
    const amountPaid = isDebt ? (amountPaidInput !== '' ? Number(amountPaidInput) : 0) : cartTotal;
    const creditAmt = isDebt ? Math.max(0, cartTotal - amountPaid) : 0;

    if (isDebt && !selectedCustomerId) {
      alert('You must select a registered customer to save this transaction as credit debt (Udhar).');
      return;
    }

    if (isDebt && !forceBypass && selectedCustomerId) {
      const cust = customers.find(c => c.id === selectedCustomerId);
      if (cust) {
        const outstanding = Number(cust.debt_balance) || 0;
        const limit = Number(cust.credit_limit) || 5000;
        const projectedOutstanding = outstanding + creditAmt;
        if (projectedOutstanding > limit) {
          setWarningDetails({ outstanding, newCredit: creditAmt, limit, total: projectedOutstanding });
          setShowLimitWarning(true);
          return;
        }
      }
    }

    // Compute due date
    let dueDate = null;
    if (isDebt) {
      const now = new Date();
      if (dueDateType === 'today') {
        now.setHours(23, 59, 59, 999);
        dueDate = now.toISOString();
      } else if (dueDateType === 'tomorrow') {
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        tomorrow.setHours(23, 59, 59, 999);
        dueDate = tomorrow.toISOString();
      } else if (dueDateType === '3days') {
        const d3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        dueDate = d3.toISOString();
      } else if (dueDateType === '7days') {
        const d7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        dueDate = d7.toISOString();
      } else if (dueDateType === 'custom' && customDueDate) {
        dueDate = new Date(customDueDate).toISOString();
      } else {
        dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const saleData = {
      customer_id: selectedCustomerId || null,
      payment_method: paymentMethod,
      amount_paid: amountPaid,
      due_date: dueDate,
      notes: isDebt ? `POS Credit Purchase (Paid ₹${amountPaid})` : 'POS Paid Purchase',
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    })
      .then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.error || 'Checkout failed') });
        return res.json();
      })
      .then(data => {
        setLastInvoice(data.sale);
        setCheckoutSuccess(true);
        setCart([]);
        setSelectedCustomerId('');
        setPaymentMethod('cash');
        setAmountPaidInput('');
        setDueDateType('7days');
        setCustomDueDate('');
        setShowLimitWarning(false);
        fetchProducts(); // Refresh stock levels
        fetchCustomers(); // Refresh customer debt details
      })
      .catch(err => alert(err.message));
  };

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!custForm.name.trim() || !custForm.phone.trim()) {
      return setCustError('Name and phone number are required');
    }

    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custForm)
    })
      .then(res => {
        if (!res.ok) throw new Error('Customer exists or details invalid');
        return res.json();
      })
      .then(data => {
        setCustomers([...customers, data]);
        setSelectedCustomerId(data.id);
        setShowAddCustModal(false);
        setCustForm({ name: '', phone: '' });
      })
      .catch(err => setCustError(err.message));
  };

  // Filter products list
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (prod.brand && prod.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (prod.barcode && prod.barcode.includes(searchQuery));
    
    const matchesCategory = selectedCategory ? prod.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-gray-700">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">{t(lang, 'sales')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Checkout purchases in real-time or examine invoicing records.
          </p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-750 p-1 rounded-xl self-start">
          <button
            onClick={() => { setActiveTab('pos'); setCheckoutSuccess(false); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'pos' ? 'bg-white dark:bg-gray-650 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <ShoppingCart size={16} /> Cashier POS
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-white dark:bg-gray-650 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <History size={16} /> Invoice Ledger
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        // POS interface split
        checkoutSuccess ? (
          // Success Screen
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 max-w-md mx-auto text-center flex flex-col items-center gap-4 shadow-lg">
            <div className="p-4 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full">
              <CheckCircle2 size={48} className="pulse-active" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Transaction Success!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-normal">
              Sale record updated. Products inventory reduced, and financial statistics updated on the dashboard.
            </p>
            {lastInvoice && (
              <div className="w-full flex flex-col gap-2">
                <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-xl border w-full text-left font-mono text-xs flex flex-col gap-1.5">
                  <p className="font-bold flex justify-between"><span>Invoice:</span> <span>{lastInvoice.id}</span></p>
                  <p className="flex justify-between"><span>Date:</span> <span>{new Date(lastInvoice.sale_date).toLocaleString('en-IN')}</span></p>
                  <p className="flex justify-between font-bold border-t pt-1.5 mt-1"><span>Amount Paid:</span> <span className="text-green-600 dark:text-green-400">₹{lastInvoice.total_amount}</span></p>
                  <p className="flex justify-between text-gray-400"><span>Estimated Profit:</span> <span>₹{lastInvoice.total_profit}</span></p>
                </div>
                {lastInvoice.customer_id && (
                  (() => {
                    const c = customers.find(cust => cust.id === lastInvoice.customer_id);
                    if (c) {
                      const receiptText = `🏪 *SmartShop Store*\n\nThank you for your purchase, *${c.name}*!\n\n🧾 *Invoice Details:*\n• Invoice ID: ${lastInvoice.id}\n• Date: ${new Date(lastInvoice.sale_date).toLocaleDateString('en-IN')}\n• Total Amount: *₹${lastInvoice.total_amount}*\n\nThank you for shopping with us! Have a great day!`;
                      return (
                        <button
                          onClick={() => window.open(`https://api.whatsapp.com/send?phone=91${c.phone.trim()}&text=${encodeURIComponent(receiptText)}`, '_blank')}
                          className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          Send Receipt via WhatsApp
                        </button>
                      );
                    }
                  })()
                )}
              </div>
            )}
            <button
              onClick={() => setCheckoutSuccess(false)}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white py-2.5 rounded-xl font-bold transition shadow-md mt-2"
            >
              New Sale Invoice
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side: Product Catalogue selector */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search catalog by name, brand, barcode..."
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-755 border border-gray-200 dark:border-gray-655 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddProdModal(true)}
                  className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs transition flex items-center gap-1 shrink-0"
                >
                  + Add Product
                </button>
              </div>

              {/* Product grid list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
                {filteredProducts.map((prod) => {
                  const outOfStock = prod.quantity <= 0;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => addToCart(prod)}
                      disabled={outOfStock}
                      className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-2xl p-3 text-left hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition duration-150 flex flex-col justify-between min-h-[140px] disabled:opacity-50 relative group"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-bold text-gray-500">{prod.category}</span>
                          {prod.quantity <= prod.minimum_stock && (
                            <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold px-1 rounded flex items-center">
                              Low Stock
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm text-gray-800 dark:text-white mt-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {prod.name}
                        </h4>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-end border-t pt-2 border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="text-[10px] text-gray-400">Price:</p>
                          <p className="font-extrabold text-base text-gray-900 dark:text-white">₹{prod.selling_price}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${outOfStock ? 'bg-red-50 text-red-500' : 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400'}`}>
                          {outOfStock ? 'Sold Out' : `${prod.quantity} left`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: POS Cart ledger */}
            <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm p-4 lg:p-5 flex flex-col gap-4 sticky top-20">
              <div className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
                <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  <ShoppingCart size={18} className="text-primary-500" /> Active Cart
                </h3>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-bold text-gray-500">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>

              {/* Cart items scrollbox */}
              <div className="flex-1 max-h-[30vh] overflow-y-auto flex flex-col gap-2.5 pr-1">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">Shopping cart is empty. Click items on the left to add.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center gap-3 bg-gray-50 dark:bg-gray-750/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex-1">
                        <p className="font-bold text-xs text-gray-800 dark:text-white leading-tight">{item.name}</p>
                        <p className="text-[10px] text-gray-400 mt-1">₹{item.selling_price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQty(item.product_id, -1)}
                          className="p-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg hover:bg-gray-50"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-bold text-xs min-w-[20px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.product_id, 1)}
                          className="p-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg hover:bg-gray-50"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950 p-1.5 rounded-lg transition ml-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Billing Customer Picker */}
              <div className="flex flex-col gap-1 border-t pt-3 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase">Select Customer (Optional)</label>
                  <button 
                    onClick={() => setShowAddCustModal(true)}
                    className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-0.5 hover:underline"
                  >
                    <UserPlus size={12} /> Quick Add
                  </button>
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                >
                  <option value="">Guest Walk-In Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {/* Payment Mode Selector */}
              <div className="flex flex-col gap-2.5 border-t pt-3 dark:border-gray-700">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Payment Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full font-bold text-gray-800 dark:text-gray-200"
                  >
                    <option value="cash">💵 Cash / UPI / Card</option>
                    <option value="debt">📝 Store Credit / Debt (Udhar)</option>
                  </select>
                </div>

                {paymentMethod === 'debt' && (
                  <div className="flex flex-col gap-2 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-3 rounded-xl">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Amount Paid Now (₹)</label>
                      <input 
                        type="number"
                        value={amountPaidInput}
                        onChange={(e) => setAmountPaidInput(e.target.value)}
                        placeholder="₹0 (Leave empty for full credit)"
                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Due Date Schedule</label>
                      <select
                        value={dueDateType}
                        onChange={(e) => setDueDateType(e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"
                      >
                        <option value="today">Due Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="3days">3 Days</option>
                        <option value="7days">7 Days</option>
                        <option value="custom">Custom Date</option>
                      </select>
                    </div>

                    {dueDateType === 'custom' && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Select Custom Date</label>
                        <input 
                          type="date"
                          value={customDueDate}
                          onChange={(e) => setCustomDueDate(e.target.value)}
                          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"
                        />
                      </div>
                    )}

                    <p className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                      ⚠️ Registers ₹{Math.max(0, cartTotal - (amountPaidInput !== '' ? Number(amountPaidInput) : 0))} to credit ledger.
                    </p>
                  </div>
                )}
              </div>

              {/* Totals Summary */}
              <div className="bg-gray-50 dark:bg-gray-750 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 text-xs flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>Offer Discount:</span>
                  <span>-₹{cartDiscount}</span>
                </div>
                <div className="flex justify-between font-black text-sm border-t border-dashed pt-2 mt-1">
                  <span>Grand Total:</span>
                  <span className="text-primary-600 dark:text-primary-400 text-base">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 border-t pt-1.5 mt-1">
                  <span>Estimated Profit on Sale:</span>
                  <span>₹{cartEstProfit}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Receipt size={18} /> Complete Sale Invoice
              </button>
            </div>

          </div>
        )
      ) : (
        // Sales History view
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-750/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-150 dark:border-gray-700">
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Transaction Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4 text-right">Invoice Amount</th>
                  <th className="p-4 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">Loading sales records...</td>
                  </tr>
                ) : salesHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">No sales transactions recorded yet.</td>
                  </tr>
                ) : (
                  salesHistory.map((sale) => {
                    const c = customers.find(cust => cust.id === sale.customer_id);
                    return (
                      <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition">
                        <td className="p-4 font-mono font-bold text-primary-600 dark:text-primary-400">{sale.id}</td>
                        <td className="p-4 text-gray-500 dark:text-gray-400">{new Date(sale.sale_date).toLocaleString('en-IN')}</td>
                        <td className="p-4 font-semibold">{c ? `${c.name} (${c.phone})` : 'Walk-In Guest'}</td>
                        <td className="p-4 text-right font-black text-gray-900 dark:text-white">₹{sale.total_amount}</td>
                        <td className="p-4 text-right font-bold text-green-600 dark:text-green-400">₹{sale.total_profit}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-150 dark:border-gray-700">
            <h3 className="text-lg font-black text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700">
              Create Customer Profile
            </h3>

            {custError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg mt-4 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{custError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Customer Name</label>
                <input
                  type="text"
                  value={custForm.name}
                  onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                  placeholder="e.g. Kalyan Kumar"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                <input
                  type="tel"
                  value={custForm.phone}
                  onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                  placeholder="e.g. 9848012345"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-2 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddCustModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold shadow-md transition"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-150 dark:border-gray-700">
            <h3 className="text-lg font-black text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700">
              Add Product to Store Inventory
            </h3>

            {prodError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg mt-4 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{prodError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Product Name *</label>
                  <input
                    type="text"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    placeholder="e.g. Lalitha Kolam Rice 10kg"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-850 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Category *</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-850 dark:text-white font-medium"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Brand</label>
                  <input
                    type="text"
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    placeholder="e.g. Lalitha"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-855 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Purchase Price (₹) *</label>
                  <input
                    type="number"
                    value={prodForm.purchase_price}
                    onChange={(e) => setProdForm({ ...prodForm, purchase_price: e.target.value })}
                    placeholder="Buy price"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-855 dark:text-white font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={prodForm.selling_price}
                    onChange={(e) => setProdForm({ ...prodForm, selling_price: e.target.value })}
                    placeholder="Sell price"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-855 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Initial Quantity *</label>
                  <input
                    type="number"
                    value={prodForm.quantity}
                    onChange={(e) => setProdForm({ ...prodForm, quantity: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-705 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-850 dark:text-white font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Min Stock Alert</label>
                  <input
                    type="number"
                    value={prodForm.minimum_stock}
                    onChange={(e) => setProdForm({ ...prodForm, minimum_stock: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-855 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Barcode</label>
                  <input
                    type="text"
                    value={prodForm.barcode}
                    onChange={(e) => setProdForm({ ...prodForm, barcode: e.target.value })}
                    placeholder="e.g. 890123..."
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-855 dark:text-white font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">SKU</label>
                  <input
                    type="text"
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    placeholder="e.g. RICE-LAL-10K"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-855 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-2 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddProdModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold shadow-md transition"
                >
                  Create & Add to Cart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credit Limit Warning Modal */}
      {showLimitWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-150 dark:border-gray-700 animate-scaleUp">
            <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400 border-b pb-3 dark:border-gray-700">
              <AlertTriangle className="animate-bounce" size={24} />
              <h3 className="text-lg font-black tracking-tight">Credit Limit Warning</h3>
            </div>

            <div className="mt-4 flex flex-col gap-3 text-xs">
              <p className="text-gray-500 leading-relaxed">
                This transaction exceeds the customer's allocated store credit limit.
              </p>

              <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-150 dark:border-gray-750 flex flex-col gap-2 font-medium">
                <div className="flex justify-between">
                  <span className="text-gray-450">Current Outstanding:</span>
                  <span className="text-gray-700 dark:text-gray-300">₹{warningDetails.outstanding.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-450">New Credit:</span>
                  <span className="text-gray-700 dark:text-gray-300">₹{warningDetails.newCredit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-red-500 font-bold">
                  <span>Projected Debt:</span>
                  <span>₹{warningDetails.total.toLocaleString('en-IN')}</span>
                </div>
                <hr className="border-dashed border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between font-bold">
                  <span className="text-gray-450">Credit Limit:</span>
                  <span className="text-gray-700 dark:text-gray-300">₹{warningDetails.limit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-red-650 font-black">
                  <span>Limit Exceeded By:</span>
                  <span>₹{Math.max(0, warningDetails.total - warningDetails.limit).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4 mt-5 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowLimitWarning(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel Sale
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLimitWarning(false);
                  handleCheckout(null, true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow-md transition"
              >
                Approve Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

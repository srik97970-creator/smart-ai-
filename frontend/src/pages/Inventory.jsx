import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';
import { t } from '../utils/translations';

export default function Inventory({ lang, navigateTo, params }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  
  // Active selected product
  const [activeProduct, setActiveProduct] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grocery',
    brand: '',
    sku: '',
    barcode: '',
    purchase_price: 0,
    selling_price: 0,
    quantity: 0,
    minimum_stock: 5,
    supplier: '',
    expiry_date: ''
  });
  const [adjustQty, setAdjustQty] = useState(10);
  const [errorMsg, setErrorMsg] = useState('');

  // Categories list
  const categories = ['Grains', 'Grocery', 'Household', 'Beverages', 'Personal Care', 'Snacks'];

  useEffect(() => {
    fetchProducts();
  }, []);

  // Listen for restock parameter from dashboard action click
  useEffect(() => {
    if (products.length > 0 && params && params.autoRestockProdId) {
      const prod = products.find(p => p.id === params.autoRestockProdId);
      if (prod) {
        openAdjustModal(prod);
      }
    }
  }, [products, params]);

  const fetchProducts = () => {
    setLoading(true);
    let url = '/api/products';
    const queryParams = [];
    if (selectedCategory) queryParams.push(`category=${encodeURIComponent(selectedCategory)}`);
    if (searchQuery) queryParams.push(`search=${encodeURIComponent(searchQuery)}`);
    
    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading inventory products:', err);
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddModal = () => {
    setErrorMsg('');
    setFormData({
      name: '',
      category: 'Grocery',
      brand: '',
      sku: '',
      barcode: '',
      purchase_price: 0,
      selling_price: 0,
      quantity: 0,
      minimum_stock: 5,
      supplier: '',
      expiry_date: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setErrorMsg('');
    setActiveProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      quantity: product.quantity,
      minimum_stock: product.minimum_stock,
      supplier: product.supplier || '',
      expiry_date: product.expiry_date || ''
    });
    setShowEditModal(true);
  };

  const openAdjustModal = (product) => {
    setErrorMsg('');
    setActiveProduct(product);
    setAdjustQty(Math.max(10, product.minimum_stock * 2 - product.quantity));
    setShowAdjustModal(true);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setErrorMsg('Product name is required');
    if (formData.purchase_price < 0 || formData.selling_price < 0 || formData.quantity < 0) {
      return setErrorMsg('Prices and stock quantity cannot be negative values');
    }
    if (Number(formData.selling_price) < Number(formData.purchase_price)) {
      return setErrorMsg('Warning: Selling price is less than purchase price!');
    }

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create product');
        return res.json();
      })
      .then(() => {
        setShowAddModal(false);
        fetchProducts();
      })
      .catch(err => setErrorMsg(err.message));
  };

  const handleEditProduct = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setErrorMsg('Product name is required');
    if (formData.purchase_price < 0 || formData.selling_price < 0 || formData.quantity < 0) {
      return setErrorMsg('Prices and stock quantity cannot be negative values');
    }

    fetch(`/api/products/${activeProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update product');
        return res.json();
      })
      .then(() => {
        setShowEditModal(false);
        fetchProducts();
      })
      .catch(err => setErrorMsg(err.message));
  };

  const handleAdjustStock = (e) => {
    e.preventDefault();
    if (!adjustQty || isNaN(adjustQty)) return setErrorMsg('Please enter a valid number');

    fetch(`/api/products/${activeProduct.id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: Number(adjustQty) })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to adjust stock');
        return res.json();
      })
      .then(() => {
        setShowAdjustModal(false);
        fetchProducts();
      })
      .catch(err => setErrorMsg(err.message));
  };

  const handleDeleteProduct = (id) => {
    if (!confirm('Are you sure you want to delete this product from your inventory?')) return;
    
    fetch(`/api/products/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete product');
        fetchProducts();
      })
      .catch(err => alert(err.message));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">{t(lang, 'inventory')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add products, trace low stock levels, and replenish store items.
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-primary-500/10 transition self-start"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            placeholder="Search by product name, SKU, brand, or barcode..."
            className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-650 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={fetchProducts}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-150 dark:border-gray-700">
                <th className="p-4">Product details</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Purchase Price</th>
                <th className="p-4 text-right">Selling Price</th>
                <th className="p-4 text-center">Stock Quantity</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">Loading inventory items...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">No products found matching filters.</td>
                </tr>
              ) : (
                products.map((prod) => {
                  const isLow = prod.quantity <= prod.minimum_stock;
                  return (
                    <tr 
                      key={prod.id} 
                      className={`hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition ${isLow ? 'bg-red-50/10 dark:bg-red-950/5' : ''}`}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{prod.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">SKU: {prod.sku || 'N/A'} | Brand: {prod.brand || 'Local'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-450">{prod.category}</td>
                      <td className="p-4 text-right font-medium text-gray-500 dark:text-gray-400">₹{prod.purchase_price}</td>
                      <td className="p-4 text-right font-extrabold text-gray-900 dark:text-white">₹{prod.selling_price}</td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${isLow ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/30' : 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'}`}>
                            {prod.quantity} units
                          </span>
                          {isLow && (
                            <span className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">
                              <AlertTriangle size={10} /> Low (min {prod.minimum_stock})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openAdjustModal(prod)}
                            className="bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-850 px-2.5 py-1 rounded font-bold text-xs hover:bg-primary-100 transition"
                            title="Adjust stock (Replenish)"
                          >
                            Restock
                          </button>
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            title="Edit Product"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit / Adjust Modals */}
      {(showAddModal || showEditModal || showAdjustModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-150 dark:border-gray-700">
            <h3 className="text-lg font-black text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700">
              {showAddModal ? 'Add New Product' : (showEditModal ? 'Edit Product Details' : `Adjust Stock: ${activeProduct?.name}`)}
            </h3>

            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg mt-4 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {showAdjustModal ? (
              // Stock Adjustment Form
              <form onSubmit={handleAdjustStock} className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Adjustment quantity (Restock units)</label>
                  <input 
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    placeholder="Enter units to add e.g. 20"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <p className="text-[10px] text-gray-400">Enter a positive number to add stock, or a negative number to reduce stock.</p>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4 mt-2 dark:border-gray-700">
                  <button 
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-bold shadow-md transition"
                  >
                    Apply Adjustment
                  </button>
                </div>
              </form>
            ) : (
              // Add / Edit Product Form
              <form onSubmit={showAddModal ? handleAddProduct : handleEditProduct} className="mt-4 flex flex-col gap-4 overflow-y-auto max-h-[60vh] pr-1">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Product Name *</label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Rice 5kg"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Brand</label>
                    <input 
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g. Lalitha"
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">SKU Code</label>
                    <input 
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="e.g. RICE-5K"
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Barcode</label>
                    <input 
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      placeholder="e.g. 890123450001"
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Purchase Price (₹) *</label>
                    <input 
                      type="number"
                      name="purchase_price"
                      value={formData.purchase_price}
                      onChange={handleInputChange}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Selling Price (₹) *</label>
                    <input 
                      type="number"
                      name="selling_price"
                      value={formData.selling_price}
                      onChange={handleInputChange}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Initial Stock Quantity *</label>
                    <input 
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      disabled={showEditModal} // Disable stock modification here, use Adjust Stock modal
                      className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Minimum Stock Alert Level *</label>
                    <input 
                      type="number"
                      name="minimum_stock"
                      value={formData.minimum_stock}
                      onChange={handleInputChange}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Supplier</label>
                    <input 
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      placeholder="e.g. Venkata Sai Traders"
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
                    <input 
                      type="date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleInputChange}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4 mt-2 dark:border-gray-700">
                  <button 
                    type="button"
                    onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-bold shadow-md transition"
                  >
                    {showAddModal ? 'Create Product' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Store, DollarSign, Check, AlertTriangle } from 'lucide-react';

export default function Settings({ lang, shopInfo, setShopInfo }) {
  const [formData, setFormData] = useState({
    shop_name: '',
    owner_name: '',
    phone: '',
    address: '',
    logo_url: '',
    designer_cost: 500
  });
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'admin' });
  const [userSuccess, setUserSuccess] = useState('');
  const [userError, setUserError] = useState('');

  useEffect(() => {
    if (shopInfo) {
      setFormData({
        shop_name: shopInfo.shop_name || '',
        owner_name: shopInfo.owner_name || '',
        phone: shopInfo.phone || '',
        address: shopInfo.address || '',
        logo_url: shopInfo.logo_url || '',
        designer_cost: shopInfo.designer_cost || 500
      });
    }
    fetchUsers();
  }, [shopInfo]);

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    setUserSuccess('');
    setUserError('');

    if (!userForm.username.trim() || !userForm.password.trim()) {
      return setUserError('Username and password are required');
    }

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create user');
        return data;
      })
      .then(data => {
        setUserSuccess(`Account "${data.username}" created successfully!`);
        setUserForm({ username: '', password: '', role: 'admin' });
        fetchUsers();
      })
      .catch(err => setUserError(err.message));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess(false);
    setErrorMsg('');

    if (!formData.shop_name.trim()) return setErrorMsg('Shop Name is required');
    if (formData.designer_cost < 0) return setErrorMsg('Designer fee cannot be negative');

    fetch('/api/shop', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        designer_cost: Number(formData.designer_cost)
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update shop details');
        return res.json();
      })
      .then(updatedData => {
        setShopInfo(updatedData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      })
      .catch(err => setErrorMsg(err.message));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure shop metadata profiles and estimated designer fee calculators.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm max-w-2xl">
        <h3 className="font-extrabold text-gray-900 dark:text-white border-b pb-3 mb-5 dark:border-gray-700 flex items-center gap-1.5">
          <Store size={18} className="text-primary-500" /> Shop Profile Settings
        </h3>

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg mb-5 flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 text-xs p-3 rounded-lg mb-5 flex items-center gap-2">
            <Check size={16} />
            <span>Shop profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Shop / Store Name *</label>
              <input 
                type="text"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleInputChange}
                placeholder="e.g. Sri Lakshmi Stores"
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Owner Name</label>
              <input 
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleInputChange}
                placeholder="e.g. Lakshmi Prasad"
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Contact Phone Number</label>
              <input 
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. 9876543210"
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Estimated Designer Fee per Flyer (₹)</label>
              <input 
                type="number"
                name="designer_cost"
                value={formData.designer_cost}
                onChange={handleInputChange}
                placeholder="e.g. 500"
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Shop Logo URL</label>
            <input 
              type="text"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleInputChange}
              placeholder="e.g. https://images.unsplash.com/photo..."
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Shop Address</label>
            <textarea 
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g. Dwaraka Nagar, Visakhapatnam"
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[70px] resize-none"
            />
          </div>

          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 rounded-xl shadow-md transition self-end px-6 mt-2"
          >
            Save Settings
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm max-w-2xl">
        <h3 className="font-extrabold text-gray-900 dark:text-white border-b pb-3 mb-5 dark:border-gray-700 flex items-center gap-1.5">
          👥 Admin & Employee Accounts
        </h3>

        {userError && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg mb-4">
            {userError}
          </div>
        )}

        {userSuccess && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 text-xs p-3 rounded-lg mb-4">
            {userSuccess}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">New Username *</label>
              <input 
                type="text"
                value={userForm.username}
                onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="e.g. kiran_cashier"
                className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-300 font-medium"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Account Role</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-300 font-medium"
              >
                <option value="admin">Admin / Store Owner</option>
                <option value="cashier">Cashier / Staff</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Password *</label>
            <input 
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter secure password"
              className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-300 font-medium"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 rounded-xl shadow-md transition self-end px-6 mt-2"
          >
            Create User Account
          </button>
        </form>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-5 pt-4">
          <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">Registered User Accounts:</h4>
          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
            {users.map(u => (
              <div key={u.id} className="p-3 bg-gray-550 dark:bg-gray-850 border border-gray-150 dark:border-gray-750 rounded-xl flex items-center justify-between text-xs font-medium">
                <span className="text-gray-800 dark:text-gray-250 font-semibold">👤 {u.username}</span>
                <span className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] ${u.role === 'admin' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/30' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-150 dark:border-amber-900/30'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

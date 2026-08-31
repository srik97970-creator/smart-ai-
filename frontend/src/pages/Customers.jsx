import React, { useState, useEffect } from 'react';
import { Users, Phone, Calendar, IndianRupee, Search, User } from 'lucide-react';
import { t } from '../utils/translations';

export default function Customers({ lang }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = () => {
    setLoading(true);
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching customers:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSettleDebt = (customer) => {
    const amount = prompt(`Enter repayment amount collected from ${customer.name} (Outstanding Debt: ₹${customer.debt_balance || 0}):`, customer.debt_balance);
    if (amount === null) return;
    const repayVal = Number(amount);
    if (isNaN(repayVal) || repayVal <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    fetch(`/api/customers/${customer.id}/repay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: repayVal })
    })
      .then(res => {
        if (!res.ok) throw new Error('Repayment failed');
        return res.json();
      })
      .then(() => {
        fetchCustomers();
      })
      .catch(err => alert(err.message));
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">{t(lang, 'customers')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage profiles, trace lifetime store spending, and check recent purchases.
        </p>
      </div>

      {/* Search Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name or phone number..."
          className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-650 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Customers List Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-150 dark:border-gray-700">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">Last Purchased Item</th>
                <th className="p-4 text-right">Outstanding Debt</th>
                <th className="p-4 text-right">Total Store Spending</th>
                <th className="p-4 text-right">Last Purchase Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">Loading customer profiles...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">No customer records found.</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-lg"><User size={16} /></span>
                        <span className="font-extrabold text-gray-900 dark:text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-550 dark:text-gray-400 font-mono">
                      <span className="inline-flex items-center gap-1"><Phone size={12} /> {c.phone}</span>
                    </td>
                    <td className="p-4">
                      {c.last_purchase_item ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{c.last_purchase_item}</span>
                          <span className="text-[10px] text-gray-400 font-medium">Qty: {c.last_purchase_qty} @ ₹{c.last_purchase_rate}/unit</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">No purchase yet</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {Number(c.debt_balance || 0) > 0 ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 px-2 py-0.5 rounded-lg text-xs">
                            ₹{Number(c.debt_balance).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => handleSettleDebt(c)}
                            className="bg-green-600 hover:bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg transition shrink-0 shadow-sm"
                          >
                            Settle
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-black text-gray-900 dark:text-white">
                      ₹{(c.total_spending || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right text-gray-550 dark:text-gray-405 font-mono text-xs">
                      {c.last_purchase ? (
                        <span className="inline-flex items-center gap-1 justify-end"><Calendar size={12} /> {new Date(c.last_purchase).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      ) : (
                        'No purchase yet'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

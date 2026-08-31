import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Receipt, 
  Calendar, 
  AlertTriangle, 
  PieChart, 
  TrendingDown,
  Trash2
} from 'lucide-react';

export default function Expenses({ lang }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    category: 'Rent',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Rent', 'Electricity', 'Transport', 'Salary', 'Packaging', 'Maintenance', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = () => {
    setLoading(true);
    fetch('/api/expenses')
      .then(res => res.json())
      .then(data => {
        setExpenses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching expenses:', err);
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      return setErrorMsg('Please enter a valid expense amount greater than 0');
    }
    if (!formData.expense_date) {
      return setErrorMsg('Please select a valid date');
    }

    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        amount: Number(formData.amount)
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to record expense');
        return res.json();
      })
      .then(() => {
        setFormData({
          category: 'Rent',
          amount: '',
          description: '',
          expense_date: new Date().toISOString().split('T')[0]
        });
        fetchExpenses();
      })
      .catch(err => setErrorMsg(err.message));
  };

  // Compile calculations
  const totalExpensesAmt = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for visual percentage bars
  const categoryTotals = {};
  categories.forEach(c => { categoryTotals[c] = 0; });
  expenses.forEach(e => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += e.amount;
    } else {
      categoryTotals[e.category] = e.amount;
    }
  });

  // Color schemes for categories
  const categoryColors = {
    Rent: 'bg-red-500',
    Electricity: 'bg-yellow-500',
    Transport: 'bg-blue-500',
    Salary: 'bg-green-500',
    Packaging: 'bg-indigo-500',
    Maintenance: 'bg-orange-500',
    Other: 'bg-gray-500'
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Expense Ledger</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Record helper wages, utilities, transport, and packaging costs. These automatically deduct from your net profits.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Ledger Form and Stats */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Stats Box */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider font-extrabold text-gray-500">Cumulative Expenses</span>
              <span className="p-2 bg-red-50 dark:bg-red-950 text-red-500 rounded-xl"><TrendingDown size={18} /></span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">₹{totalExpensesAmt.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-gray-400">Total expense receipts recorded: {expenses.length}</p>
          </div>

          {/* Form Receipt entry */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
            <h3 className="font-extrabold text-gray-900 dark:text-white border-b pb-3 mb-4 dark:border-gray-700 flex items-center gap-1.5">
              <Plus size={18} className="text-red-500" /> Log New Expense
            </h3>

            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg mb-4 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Expense Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="bg-gray-50 dark:bg-gray-705 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Amount Paid (₹) *</label>
                <input 
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="e.g. 1500"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Expense Date</label>
                <input 
                  type="date"
                  name="expense_date"
                  value={formData.expense_date}
                  onChange={handleInputChange}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Description / Details</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Paid cash for electricity bill"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full min-h-[60px] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 rounded-xl shadow-md transition"
              >
                Add to ledger
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Ledger list & Category bars */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Category split visualizers */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
              <PieChart size={18} className="text-indigo-500" /> Expense Category Splits
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              {categories.map(cat => {
                const total = categoryTotals[cat];
                const pct = totalExpensesAmt > 0 ? (total / totalExpensesAmt) * 100 : 0;
                return (
                  <div key={cat} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-500">{cat}</span>
                      <span className="text-gray-900 dark:text-slate-200">₹{total.toLocaleString('en-IN')} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${categoryColors[cat] || 'bg-gray-500'}`} 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Entries table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-750/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-150 dark:border-gray-700">
                    <th className="p-4">Category</th>
                    <th className="p-4">Receipt Date</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">Loading cost ledgers...</td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">No expense records found.</td>
                    </tr>
                  ) : (
                    expenses.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date)).map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition">
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                            exp.category === 'Rent' ? 'bg-red-50 dark:bg-red-950 text-red-500' :
                            exp.category === 'Electricity' ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-500' :
                            exp.category === 'Transport' ? 'bg-blue-50 dark:bg-blue-950 text-blue-500' :
                            exp.category === 'Salary' ? 'bg-green-50 dark:bg-green-950 text-green-500' :
                            'bg-gray-50 dark:bg-gray-750 text-gray-500'
                          }`}>
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-gray-400">{new Date(exp.expense_date).toLocaleDateString('en-IN')}</td>
                        <td className="p-4 font-medium text-gray-700 dark:text-gray-300">{exp.description || 'N/A'}</td>
                        <td className="p-4 text-right font-black text-red-500">₹{exp.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

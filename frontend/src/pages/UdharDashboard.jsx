import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  User, 
  UserPlus, 
  Phone, 
  CheckCircle, 
  ChevronRight, 
  Share2, 
  Clipboard, 
  Edit3, 
  X, 
  RefreshCw,
  TrendingUp,
  BookOpen
} from 'lucide-react';

export default function UdharDashboard({ lang }) {
  const [summary, setSummary] = useState({
    totalOutstanding: 0,
    dueToday: 0,
    overdue: 0,
    activeUdharCount: 0,
    creditGivenThisMonth: 0,
    creditRecoveredThisMonth: 0
  });
  
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'debtors', 'limit_exceeded'
  const [sortBy, setSortBy] = useState('highest'); // 'highest', 'lowest', 'name'
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddUdhar, setShowAddUdhar] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Add Udhar Form state
  const [udharForm, setUdharForm] = useState({
    customer_id: '',
    product_name: '',
    total_bill: '',
    amount_paid: '',
    due_date: '',
    notes: ''
  });
  const [udharError, setUdharError] = useState('');

  // Record Payment Form state
  const [paymentForm, setPaymentForm] = useState({
    customer_id: '',
    amount: '',
    payment_method: 'cash',
    notes: ''
  });
  const [paymentError, setPaymentError] = useState('');

  // Edit Limit State
  const [showEditLimit, setShowEditLimit] = useState(false);
  const [newLimitVal, setNewLimitVal] = useState('');

  // Reminder message config
  const [reminderLang, setReminderLang] = useState('en');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/udhar/summary').then(res => res.json()),
      fetch('/api/customers').then(res => res.json())
    ])
      .then(([summaryData, customerData]) => {
        setSummary(summaryData);
        setCustomers(Array.isArray(customerData) ? customerData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading Udhar data:', err);
        setLoading(false);
      });
  };

  const handleOpenLedger = (customer) => {
    setSelectedLedgerCustomer(customer);
    setLoadingLedger(true);
    setLedgerData(null);
    setReminderLang(customer.preferred_language || 'en');

    fetch(`/api/customers/${customer.id}/ledger`)
      .then(res => res.json())
      .then(data => {
        setLedgerData(data);
        setLoadingLedger(false);
      })
      .catch(err => {
        console.error('Error loading customer ledger:', err);
        setLoadingLedger(false);
      });
  };

  const handleAddUdharSubmit = (e) => {
    e.preventDefault();
    setUdharError('');

    if (!udharForm.customer_id || !udharForm.total_bill) {
      return setUdharError('Customer and Total Bill are required.');
    }

    const bill = Number(udharForm.total_bill);
    const paid = Number(udharForm.amount_paid || 0);
    const credit = bill - paid;

    if (credit <= 0) {
      return setUdharError('Paid amount cannot equal or exceed Total Bill. Settle as Cash POS sale instead.');
    }

    // Credit limit warning checks
    const selectedCust = customers.find(c => c.id === udharForm.customer_id);
    if (selectedCust) {
      const outstanding = Number(selectedCust.debt_balance) || 0;
      const limit = Number(selectedCust.credit_limit) || 5000;
      if (outstanding + credit > limit) {
        const confirmBypass = window.confirm(`⚠️ Warning: This exceeds the customer's credit limit of ₹${limit} by ₹${outstanding + credit - limit}. Approve anyway?`);
        if (!confirmBypass) return;
      }
    }

    fetch('/api/credit/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(udharForm)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to record credit');
        return data;
      })
      .then(() => {
        setShowAddUdhar(false);
        setUdharForm({
          customer_id: '',
          product_name: '',
          total_bill: '',
          amount_paid: '',
          due_date: '',
          notes: ''
        });
        fetchData();
      })
      .catch(err => setUdharError(err.message));
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setPaymentError('');

    if (!paymentForm.customer_id || !paymentForm.amount || Number(paymentForm.amount) <= 0) {
      return setPaymentError('Please select a customer and enter a valid positive payment amount.');
    }

    fetch('/api/credit/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentForm)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to record payment');
        return data;
      })
      .then(() => {
        setShowRecordPayment(false);
        setPaymentForm({
          customer_id: '',
          amount: '',
          payment_method: 'cash',
          notes: ''
        });
        fetchData();
        if (selectedLedgerCustomer) {
          // Refresh ledger drawer if open
          handleOpenLedger(selectedLedgerCustomer);
        }
      })
      .catch(err => setPaymentError(err.message));
  };

  const handleUpdateLimit = (e) => {
    e.preventDefault();
    if (!newLimitVal || Number(newLimitVal) < 0) return alert('Enter a valid limit amount.');

    fetch(`/api/customers/${selectedLedgerCustomer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...selectedLedgerCustomer,
        credit_limit: Number(newLimitVal)
      })
    })
      .then(res => res.json())
      .then(updatedCustomer => {
        setShowEditLimit(false);
        setNewLimitVal('');
        setSelectedLedgerCustomer(updatedCustomer);
        fetchData();
        handleOpenLedger(updatedCustomer);
      })
      .catch(err => alert('Failed to update credit limit'));
  };

  const generateReminderText = (customer, balance, dueStr) => {
    const formattedDue = dueStr ? new Date(dueStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'today';
    
    if (reminderLang === 'te') {
      return `🏪 శ్రీ లక్ష్మీ స్టోర్స్\n\nనమస్కారం ${customer.name} గారు,\n\nమీ ఖాతాలో బకాయి మొత్తం: ₹${balance.toLocaleString('en-IN')}.\n\nదయచేసి ఈ మొత్తాన్ని ${formattedDue} నాటికి చెల్లించి సహకరించగలరు.\n\nధన్యవాదాలు.`;
    }
    if (reminderLang === 'hi') {
      return `🏪 श्री लक्ष्मी स्टोर्स\n\nनमस्ते ${customer.name},\n\nआपकी लंबित उधार राशि: ₹${balance.toLocaleString('en-IN')} है।\n\nकृपया इस राशि का भुगतान ${formattedDue} तक करने का कष्ट करें।\n\nधन्यवाद।`;
    }
    return `🏪 Sri Lakshmi Stores\n\nHello ${customer.name},\n\nThis is a polite reminder that your pending outstanding Udhar balance is: ₹${balance.toLocaleString('en-IN')}.\n\nPlease clear the pending amount by ${formattedDue}.\n\nThank you for shopping with us!`;
  };

  const handleCopyReminder = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter & Sort logic
  const filteredCustomers = customers
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
      const isDebtor = Number(c.debt_balance || 0) > 0;
      
      if (!matchSearch) return false;
      if (filterType === 'all') return true;
      if (filterType === 'debtors') return isDebtor;
      if (filterType === 'limit_exceeded') return isDebtor && Number(c.debt_balance) > (Number(c.credit_limit) || 5000);
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'highest') return Number(b.debt_balance || 0) - Number(a.debt_balance || 0);
      if (sortBy === 'lowest') return Number(a.debt_balance || 0) - Number(b.debt_balance || 0);
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2">
            <BookOpen className="text-primary-500" /> Smart Udhar Book
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Automated customer credit accounting ledger and collection reminders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddUdhar(true)}
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md"
          >
            ➕ ADD UDHAR
          </button>
          <button
            onClick={() => setShowRecordPayment(true)}
            className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md"
          >
            💰 RECORD PAYMENT
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Outstanding</p>
          <h3 className="text-xl lg:text-2xl font-black text-red-655 mt-2">
            ₹{(summary.totalOutstanding || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[9px] text-gray-450 mt-1">{summary.activeUdharCount} customers pending</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Due Today</p>
          <h3 className="text-xl lg:text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            ₹{(summary.dueToday || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[9px] text-gray-450 mt-1">Require collection follow-ups</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Overdue Balance</p>
          <h3 className="text-xl lg:text-2xl font-black text-red-500 mt-2">
            ₹{(summary.overdue || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[9px] text-red-500/80 mt-1 font-semibold flex items-center gap-0.5">
            ⚠️ Passed due date thresholds
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">MTD Credit Recovered</p>
          <h3 className="text-xl lg:text-2xl font-black text-green-655 mt-2">
            ₹{(summary.creditRecoveredThisMonth || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[9px] text-gray-450 mt-1">Given: ₹{(summary.creditGivenThisMonth || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Main Customers List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 dark:bg-gray-750/30 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by debtor name or phone..."
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-750 dark:text-gray-200"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-lg px-2.5 py-1.5 focus:outline-none text-gray-700 dark:text-gray-300 font-medium"
            >
              <option value="all">All Customers</option>
              <option value="debtors">Active Debtors</option>
              <option value="limit_exceeded">Credit Limit Exceeded</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-gray-250 dark:border-gray-655 rounded-lg px-2.5 py-1.5 focus:outline-none text-gray-700 dark:text-gray-300 font-medium"
            >
              <option value="highest">Highest Debt First</option>
              <option value="lowest">Lowest Debt First</option>
              <option value="name">Alphabetical</option>
            </select>

            <button 
              onClick={fetchData}
              className="p-1.5 bg-white dark:bg-gray-700 hover:bg-gray-50 border border-gray-200 dark:border-gray-655 rounded-lg text-gray-550 transition shrink-0"
              title="Refresh ledger"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Customer list table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-150 dark:border-gray-700">
                <th className="p-4">Debtor Details</th>
                <th className="p-4">Credit Limit</th>
                <th className="p-4 text-right">Outstanding Balance</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-450 italic">Retrieving debtor ledgers...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-450 italic">No credit records matching selected filters.</td>
                </tr>
              ) : (
                filteredCustomers.map(c => {
                  const limit = c.credit_limit || 5000;
                  const balance = Number(c.debt_balance || 0);
                  const isExceeded = balance > limit;

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 bg-primary-50 dark:bg-primary-950 text-primary-655 dark:text-primary-400 rounded-xl"><User size={16} /></span>
                          <div>
                            <p className="font-extrabold text-gray-900 dark:text-white">{c.name}</p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-0.5"><Phone size={10} /> {c.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 font-mono font-medium">
                        ₹{limit.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right font-black text-gray-900 dark:text-white font-mono">
                        ₹{balance.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-center">
                        {balance === 0 ? (
                          <span className="bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30 text-[9px] uppercase px-2.5 py-0.5 rounded-full font-black">Paid</span>
                        ) : isExceeded ? (
                          <span className="bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-[9px] uppercase px-2.5 py-0.5 rounded-full font-black">Limit Exceeded</span>
                        ) : (
                          <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 text-[9px] uppercase px-2.5 py-0.5 rounded-full font-black">Payment Pending</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenLedger(c)}
                          className="bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold px-3 py-1.5 rounded-lg text-xs transition inline-flex items-center gap-0.5 shadow-sm"
                        >
                          View Ledger <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Udhar Modal */}
      {showAddUdhar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-150 dark:border-gray-700 animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Record Credit Transaction (Udhar)</h3>
              <button onClick={() => setShowAddUdhar(false)} className="text-gray-400 hover:text-gray-500"><X size={18} /></button>
            </div>

            {udharError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 text-xs p-3 rounded-lg mt-4 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{udharError}</span>
              </div>
            )}

            <form onSubmit={handleAddUdharSubmit} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Select Debtor *</label>
                <select
                  value={udharForm.customer_id}
                  onChange={(e) => setUdharForm({ ...udharForm, customer_id: e.target.value })}
                  className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Product Description / Category</label>
                <input
                  type="text"
                  value={udharForm.product_name}
                  onChange={(e) => setUdharForm({ ...udharForm, product_name: e.target.value })}
                  placeholder="e.g. Household Groceries"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Total Bill Amount *</label>
                  <input
                    type="number"
                    value={udharForm.total_bill}
                    onChange={(e) => setUdharForm({ ...udharForm, total_bill: e.target.value })}
                    placeholder="Total ₹"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-850 dark:text-white font-mono"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Amount Paid Now</label>
                  <input
                    type="number"
                    value={udharForm.amount_paid}
                    onChange={(e) => setUdharForm({ ...udharForm, amount_paid: e.target.value })}
                    placeholder="Paid ₹ (or empty)"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-850 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Payment Due Date</label>
                <input
                  type="date"
                  value={udharForm.due_date}
                  onChange={(e) => setUdharForm({ ...udharForm, due_date: e.target.value })}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Memo Notes</label>
                <textarea
                  value={udharForm.notes}
                  onChange={(e) => setUdharForm({ ...udharForm, notes: e.target.value })}
                  placeholder="Additional ledger remarks..."
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white h-[60px] resize-none"
                />
              </div>

              <div className="border-t border-dashed pt-3 mt-1 flex justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Pending credit to record:</span>
                <span className="text-sm font-black">
                  ₹{Math.max(0, Number(udharForm.total_bill || 0) - Number(udharForm.amount_paid || 0))}
                </span>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-2 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddUdhar(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold shadow-md transition"
                >
                  Record Udhar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-150 dark:border-gray-700 animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">💰 Record Payment Received</h3>
              <button onClick={() => setShowRecordPayment(false)} className="text-gray-400 hover:text-gray-500"><X size={18} /></button>
            </div>

            {paymentError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-655 dark:text-red-400 text-xs p-3 rounded-lg mt-4 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{paymentError}</span>
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Select Debtor *</label>
                <select
                  value={paymentForm.customer_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, customer_id: e.target.value })}
                  className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-850 dark:text-white"
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.filter(c => Number(c.debt_balance) > 0).map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Udhar: ₹{c.debt_balance})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Repayment Amount (₹) *</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="Repaid ₹"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-805 dark:text-white font-mono font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Payment Mode</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-655 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white font-medium"
                >
                  <option value="cash">💵 Cash</option>
                  <option value="upi">📱 UPI (GPay / PhonePe / Paytm)</option>
                  <option value="bank">🏦 Bank Transfer</option>
                  <option value="other">📝 Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Memo Notes</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="e.g. Settled in shop"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-2 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowRecordPayment(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold shadow-md transition"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expanded Customer Ledger Drawer/Drawer Wrapper */}
      {selectedLedgerCustomer && (
        <div className="fixed inset-0 bg-black/60 z-40 flex justify-end backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto flex flex-col gap-6 animate-slideLeft border-l dark:border-gray-750">
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b pb-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-2xl"><User size={24} /></span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">{selectedLedgerCustomer.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedLedgerCustomer.phone}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLedgerCustomer(null)}
                className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl transition text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {loadingLedger ? (
              <div className="text-center py-20 text-gray-400 italic">Retrieving transaction ledger timelines...</div>
            ) : (
              ledgerData && (
                <div className="flex flex-col gap-5 flex-1">
                  
                  {/* Debt Summary Profile Card */}
                  <div className="bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-755 rounded-2xl p-5 flex flex-col gap-4 font-medium text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-450 text-[10px] font-bold uppercase tracking-wider">Current Outstanding</span>
                        <h4 className="text-xl font-black text-red-600 dark:text-red-400 mt-1">
                          ₹{Number(ledgerData.customer.debt_balance || 0).toLocaleString('en-IN')}
                        </h4>
                      </div>
                      <div>
                        <span className="text-gray-450 text-[10px] font-bold uppercase tracking-wider">Credit Limit</span>
                        <div className="flex items-center gap-1 mt-1">
                          <h4 className="text-base font-extrabold text-gray-800 dark:text-gray-200">
                            ₹{(ledgerData.customer.credit_limit || 5000).toLocaleString('en-IN')}
                          </h4>
                          <button 
                            onClick={() => {
                              setNewLimitVal(ledgerData.customer.credit_limit || 5000);
                              setShowEditLimit(true);
                            }}
                            className="p-1 bg-white dark:bg-gray-750 rounded hover:bg-gray-50 border border-gray-200 dark:border-gray-650 text-gray-450 transition"
                            title="Edit Credit Limit"
                          >
                            <Edit3 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {showEditLimit && (
                      <form onSubmit={handleUpdateLimit} className="flex items-center gap-2 border-t pt-3 mt-1">
                        <input 
                          type="number"
                          value={newLimitVal}
                          onChange={(e) => setNewLimitVal(e.target.value)}
                          placeholder="New credit threshold Limit ₹"
                          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                          required
                        />
                        <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition">Save</button>
                        <button type="button" onClick={() => setShowEditLimit(false)} className="text-gray-400 text-xs font-bold px-2">Cancel</button>
                      </form>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 grid grid-cols-2 gap-4 text-[10px] uppercase font-bold text-gray-450 tracking-wider">
                      <div>MTD Credit: <span className="text-gray-800 dark:text-gray-200 font-extrabold ml-1">₹{ledgerData.summary.creditGivenThisMonth}</span></div>
                      <div>MTD Recovered: <span className="text-green-600 dark:text-green-400 font-extrabold ml-1">₹{ledgerData.summary.creditRecoveredThisMonth}</span></div>
                    </div>
                  </div>

                  {/* Payment Message Template Actions */}
                  {Number(ledgerData.customer.debt_balance) > 0 && (
                    <div className="bg-amber-50/50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-extrabold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          📱 Send Payment Reminder
                        </h4>
                        
                        {/* Language Selection */}
                        <div className="flex gap-1">
                          {['en', 'te', 'hi'].map(l => (
                            <button
                              key={l}
                              onClick={() => setReminderLang(l)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase transition ${reminderLang === l ? 'bg-amber-200 dark:bg-amber-900 text-amber-850 dark:text-amber-300' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-650'}`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reminder Message Box */}
                      <div className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/40 text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">
                        {generateReminderText(ledgerData.customer, Number(ledgerData.customer.debt_balance), null)}
                      </div>

                      {/* Reminder Action controls */}
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          onClick={() => handleCopyReminder(generateReminderText(ledgerData.customer, Number(ledgerData.customer.debt_balance), null))}
                          className="bg-white dark:bg-gray-750 hover:bg-gray-50 border border-gray-250 dark:border-gray-650 text-gray-700 dark:text-gray-300 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition shadow-sm"
                        >
                          <Clipboard size={14} /> {copied ? 'Copied!' : 'Copy Text'}
                        </button>
                        <button
                          onClick={() => window.open(`https://api.whatsapp.com/send?phone=91${ledgerData.customer.phone.trim()}&text=${encodeURIComponent(generateReminderText(ledgerData.customer, Number(ledgerData.customer.debt_balance), null))}`, '_blank')}
                          className="bg-green-655 hover:bg-green-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition shadow-sm"
                        >
                          <Share2 size={14} /> Send WhatsApp
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Transaction Ledger Timeline */}
                  <div className="flex-1 flex flex-col gap-3 min-h-0">
                    <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Transaction History Log</h4>
                    
                    <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 max-h-[300px]">
                      {ledgerData.timeline.length === 0 ? (
                        <p className="text-xs text-gray-450 italic py-6 text-center">No transaction logs available for this customer.</p>
                      ) : (
                        ledgerData.timeline.map((tx, idx) => {
                          const isCredit = tx.type === 'credit';
                          return (
                            <div key={idx} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <span className={`p-1.5 rounded-full ${isCredit ? 'bg-red-50 dark:bg-red-950/40 text-red-500' : 'bg-green-50 dark:bg-green-950/40 text-green-500'}`}>
                                  <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                </span>
                                <div className="w-px bg-gray-200 dark:bg-gray-700 flex-1 my-1" />
                              </div>
                              <div className="flex-1 bg-gray-50 dark:bg-gray-850/50 border border-gray-150 dark:border-gray-750 p-3 rounded-xl flex items-center justify-between text-xs gap-3">
                                <div>
                                  <p className="font-extrabold text-gray-800 dark:text-gray-200">{tx.description}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`font-black text-sm ${isCredit ? 'text-red-600' : 'text-green-600 dark:text-green-400'}`}>
                                    {isCredit ? '+' : '-'}₹{tx.amount}
                                  </p>
                                  {isCredit && Number(tx.outstanding) > 0 && (
                                    <p className="text-[9px] text-gray-450 mt-0.5">Bal: ₹{tx.outstanding}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="border-t pt-4 dark:border-gray-700 flex gap-2">
                    <button
                      onClick={() => {
                        setPaymentForm(prev => ({ ...prev, customer_id: selectedLedgerCustomer.id }));
                        setShowRecordPayment(true);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1"
                    >
                      💰 Collect Repayment
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
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
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  QrCode,
  Building2,
  Wallet,
  PlusCircle,
  ArrowRightLeft,
  FileText,
  Download,
  Check,
  Tag
} from 'lucide-react';

export default function UdharDashboard({ lang: appLang }) {
  // Active Khata Book Tab: 'customers', 'suppliers', 'cashbook'
  const [activeTab, setActiveTab] = useState('customers');
  
  // Khata Books List & Active Book
  const [khataBooks, setKhataBooks] = useState([
    { id: 'kb_main', name: '🏪 Main Store Khata', type: 'store' },
    { id: 'kb_wholesale', name: '📦 Wholesale & Suppliers', type: 'wholesale' },
    { id: 'kb_personal', name: '🏠 Personal & Household', type: 'personal' }
  ]);
  const [activeBookId, setActiveBookId] = useState('kb_main');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBookName, setNewBookName] = useState('');

  // Local Language for Khata Book (defaults to appLang or 'te')
  const [khataLang, setKhataLang] = useState(appLang || 'en');

  // Customers & Summary State
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

  // Add Customer Modal State
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    credit_limit: '5000',
    opening_balance: '0',
    preferred_language: 'te'
  });

  // Suppliers State
  const [suppliers, setSuppliers] = useState([]);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierLedgerData, setSupplierLedgerData] = useState(null);
  const [loadingSupplierLedger, setLoadingSupplierLedger] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', company_name: '', phone: '', address: '', balance: '', notes: '' });

  // Cash Book State
  const [cashEntries, setCashEntries] = useState([]);
  const [cashSummary, setCashSummary] = useState({ todayIn: 0, todayOut: 0, todayNet: 0, totalIn: 0, totalOut: 0, netCashInHand: 0 });
  const [showAddCashModal, setShowAddCashModal] = useState(false);
  const [cashForm, setCashForm] = useState({ type: 'in', amount: '', category: 'sale', payment_mode: 'cash', notes: '' });

  // Quick Diya / Liya (You Gave / You Got) Universal Modal
  const [quickEntryModal, setQuickEntryModal] = useState({ open: false, type: 'gave', partyType: 'customer', targetId: '' });
  const [quickForm, setQuickForm] = useState({ amount: '', notes: '', due_date: '', bill_number: '', payment_mode: 'cash' });
  const [quickError, setQuickError] = useState('');
  
  // Inline New Party (Customer/Supplier) creation inside Quick Entry Modal
  const [isInlineNewParty, setIsInlineNewParty] = useState(false);
  const [inlinePartyForm, setInlinePartyForm] = useState({ name: '', phone: '', credit_limit: '5000', company_name: '' });

  // Customer Ledger Drawer State
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // QR Code Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCustomer, setQrCustomer] = useState(null);

  // Printable Statement Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const printRef = useRef();

  // Edit Limit State
  const [showEditLimit, setShowEditLimit] = useState(false);
  const [newLimitVal, setNewLimitVal] = useState('');

  // Reminder message config
  const [reminderLang, setReminderLang] = useState('en');
  const [copied, setCopied] = useState(false);

  // Shop Profile for Header
  const [shopInfo, setShopInfo] = useState({ shop_name: 'Sri Lakshmi Stores', phone: '9440925829', upi_id: '9440925829@ybl' });

  // Dictionary for Khata Book Terms
  const khataText = {
    en: {
      title: 'Digital Khata Book',
      subtitle: 'Digital Bahi-Khata ledger for Customers, Suppliers & Daily Cash Register',
      customersTab: '👥 Customers (Grahak)',
      suppliersTab: '🏭 Suppliers (Vyapari)',
      cashbookTab: '📖 Daily Cash Book (Rokar)',
      youGave: '🔴 YOU GAVE ₹ (Udhar)',
      youGot: '🟢 YOU GOT ₹ (Jama)',
      youWillGet: "You'll Get",
      youWillPay: "You'll Pay",
      inHandCash: 'Cash In Hand',
      addCustomer: '+ Add Customer',
      addSupplier: '+ Add Supplier',
      addCash: '+ Cash Entry',
      viewLedger: 'View Ledger',
      upiQr: 'UPI QR Code',
      statement: 'Download Statement',
      remind: 'Remind',
      balance: 'Net Balance'
    },
    te: {
      title: 'డిజిటల్ ఖాతా పుస్తకం',
      subtitle: 'కస్టమర్లు, సప్లయర్లు మరియు రోజువారీ నగదు కోసం ఆధునిక బహి-ఖాతా',
      customersTab: '👥 కస్టమర్లు (గ్రాహక్)',
      suppliersTab: '🏭 సప్లయర్లు (వ్యాపారి)',
      cashbookTab: '📖 రోజువారీ నగదు (రోకడ్)',
      youGave: '🔴 ఇచ్చాను ₹ (అప్పు / ఉధార్)',
      youGot: '🟢 వచ్చింది ₹ (జమా / చెల్లింపు)',
      youWillGet: 'రావలసిన బకాయి',
      youWillPay: 'చెల్లించవలసిన మొత్తం',
      inHandCash: 'కౌంటర్ నగదు నిల్వ',
      addCustomer: '+ కస్టమర్‌ని చేర్చండి',
      addSupplier: '+ సప్లయర్‌ని చేర్చండి',
      addCash: '+ నగదు నమోదు',
      viewLedger: 'ఖాతా చూడండి',
      upiQr: 'యూపీఐ క్యూఆర్',
      statement: 'స్టేట్‌మెంట్ ప్రింట్',
      remind: 'రిమైండర్',
      balance: 'నికర బకాయి'
    },
    hi: {
      title: 'डिजिटल खाता बुक',
      subtitle: 'ग्राहकों, सप्लायरों और दैनिक रोकड़ के लिए संपूर्ण बही-खाता',
      customersTab: '👥 ग्राहक (उधार/जमा)',
      suppliersTab: '🏭 सप्लायर (व्यापारी)',
      cashbookTab: '📖 दैनिक रोकड़ बही (Cash)',
      youGave: '🔴 मैंने दिया ₹ (उधार)',
      youGot: '🟢 मैंने लिया ₹ (जमा)',
      youWillGet: 'कुल लेना है',
      youWillPay: 'कुल देना है',
      inHandCash: 'हाथ में नकद',
      addCustomer: '+ ग्राहक जोड़ें',
      addSupplier: '+ सप्लायर जोड़ें',
      addCash: '+ नकद एंट्री',
      viewLedger: 'खाता देखें',
      upiQr: 'यूपीआई क्यूआर',
      statement: 'स्टेटमेंट डाउनलोड',
      remind: 'रिमाइंडर भेजें',
      balance: 'बकाया राशि'
    }
  };

  const t = khataText[khataLang] || khataText.en;

  useEffect(() => {
    fetchData();
    fetchShopProfile();
  }, []);

  const fetchShopProfile = () => {
    fetch('/api/shop')
      .then(res => res.json())
      .then(d => {
        if (d && d.shop_name) setShopInfo(d);
      })
      .catch(() => {});
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/udhar/summary').then(res => res.json()),
      fetch('/api/customers').then(res => res.json()),
      fetch('/api/suppliers').then(res => res.json()),
      fetch('/api/cashbook').then(res => res.json()),
      fetch('/api/cashbook/summary').then(res => res.json()),
      fetch('/api/khatabooks').then(res => res.json())
    ])
      .then(([sumData, custList, supList, cashList, cashSum, booksList]) => {
        setSummary(sumData || {});
        setCustomers(Array.isArray(custList) ? custList : []);
        setSuppliers(Array.isArray(supList) ? supList : []);
        setCashEntries(Array.isArray(cashList) ? cashList : []);
        setCashSummary(cashSum || {});
        if (Array.isArray(booksList) && booksList.length > 0) {
          setKhataBooks(booksList);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading Khata data:', err);
        setLoading(false);
      });
  };

  // Open Customer Ledger
  const handleOpenLedger = (customer) => {
    setSelectedLedgerCustomer(customer);
    setLoadingLedger(true);
    setLedgerData(null);
    setReminderLang(customer.preferred_language || khataLang || 'en');

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

  // Open Supplier Ledger
  const handleOpenSupplierLedger = (supplier) => {
    setSelectedSupplier(supplier);
    setLoadingSupplierLedger(true);
    setSupplierLedgerData(null);

    fetch(`/api/suppliers/${supplier.id}/ledger`)
      .then(res => res.json())
      .then(data => {
        setSupplierLedgerData(data);
        setLoadingSupplierLedger(false);
      })
      .catch(err => {
        console.error('Error loading supplier ledger:', err);
        setLoadingSupplierLedger(false);
      });
  };

  // Add New Khata Book
  const handleCreateBook = (e) => {
    e.preventDefault();
    if (!newBookName.trim()) return;
    fetch('/api/khatabooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBookName.trim(), type: 'store' })
    })
      .then(res => res.json())
      .then(newBook => {
        setKhataBooks(prev => [...prev, newBook]);
        setActiveBookId(newBook.id);
        setShowAddBookModal(false);
        setNewBookName('');
      })
      .catch(() => alert('Failed to create book'));
  };

  // Add Customer Submit
  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone) return alert('Name and phone number are required');
    const openBal = Number(customerForm.opening_balance) || 0;
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim(),
        credit_limit: Number(customerForm.credit_limit) || 5000,
        debt_balance: openBal,
        preferred_language: customerForm.preferred_language || 'te'
      })
    })
      .then(res => res.json())
      .then((newCust) => {
        if (openBal > 0) {
          fetch('/api/credit/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_id: newCust.id,
              credit_amount: openBal,
              amount_paid: 0,
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              notes: 'Opening Balance (Udhar)'
            })
          }).catch(() => {});
        }
        setShowAddCustomerModal(false);
        setCustomerForm({ name: '', phone: '', credit_limit: '5000', opening_balance: '0', preferred_language: 'te' });
        fetchData();
      })
      .catch(err => alert(err.message || 'Failed to add customer'));
  };

  // Add Supplier Submit
  const handleAddSupplierSubmit = (e) => {
    e.preventDefault();
    if (!supplierForm.name || !supplierForm.phone) return alert('Name and phone are required');
    fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplierForm)
    })
      .then(res => res.json())
      .then(() => {
        setShowAddSupplierModal(false);
        setSupplierForm({ name: '', company_name: '', phone: '', address: '', balance: '', notes: '' });
        fetchData();
      })
      .catch(err => alert(err.message || 'Failed to add supplier'));
  };

  // Add Cash Entry Submit
  const handleAddCashSubmit = (e) => {
    e.preventDefault();
    if (!cashForm.amount || Number(cashForm.amount) <= 0) return alert('Valid amount required');
    fetch('/api/cashbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cashForm)
    })
      .then(res => res.json())
      .then(() => {
        setShowAddCashModal(false);
        setCashForm({ type: 'in', amount: '', category: 'sale', payment_mode: 'cash', notes: '' });
        fetchData();
      })
      .catch(err => alert(err.message || 'Failed to add cash entry'));
  };

  // Quick Diya / Liya Universal Submit
  const handleQuickEntrySubmit = async (e) => {
    e.preventDefault();
    setQuickError('');
    if (!quickForm.amount || Number(quickForm.amount) <= 0) {
      return setQuickError('Please enter a valid positive amount.');
    }

    let targetId = quickEntryModal.targetId;

    // If adding a new party inline
    if (isInlineNewParty) {
      if (!inlinePartyForm.name || !inlinePartyForm.phone) {
        return setQuickError('Name and phone number are required for the new party.');
      }

      if (quickEntryModal.partyType === 'customer') {
        try {
          const res = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: inlinePartyForm.name.trim(),
              phone: inlinePartyForm.phone.trim(),
              credit_limit: Number(inlinePartyForm.credit_limit) || 5000,
              debt_balance: 0,
              preferred_language: 'te'
            })
          });
          const newCust = await res.json();
          if (!res.ok) throw new Error(newCust.error || 'Failed to create customer');
          targetId = newCust.id;
        } catch (err) {
          return setQuickError(err.message);
        }
      } else {
        try {
          const res = await fetch('/api/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: inlinePartyForm.name.trim(),
              company_name: inlinePartyForm.company_name || '',
              phone: inlinePartyForm.phone.trim(),
              balance: 0
            })
          });
          const newSup = await res.json();
          if (!res.ok) throw new Error(newSup.error || 'Failed to create supplier');
          targetId = newSup.id;
        } catch (err) {
          return setQuickError(err.message);
        }
      }
    }

    if (!targetId) {
      return setQuickError(`Please select or add a ${quickEntryModal.partyType}.`);
    }

    if (quickEntryModal.partyType === 'customer') {
      if (quickEntryModal.type === 'gave') {
        const cust = customers.find(c => c.id === targetId);
        if (cust) {
          const out = Number(cust.debt_balance || 0);
          const limit = Number(cust.credit_limit || 5000);
          if (out + Number(quickForm.amount) > limit) {
            const ok = window.confirm(`⚠️ Exceeds credit limit of ₹${limit} by ₹${out + Number(quickForm.amount) - limit}. Approve anyway?`);
            if (!ok) return;
          }
        }
      }

      fetch('/api/credit/quick-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: targetId,
          type: quickEntryModal.type,
          amount: quickForm.amount,
          notes: quickForm.notes,
          due_date: quickForm.due_date,
          bill_number: quickForm.bill_number,
          payment_mode: quickForm.payment_mode
        })
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to record entry');
          return data;
        })
        .then(() => {
          setQuickEntryModal({ open: false, type: 'gave', partyType: 'customer', targetId: '' });
          setQuickForm({ amount: '', notes: '', due_date: '', bill_number: '', payment_mode: 'cash' });
          setIsInlineNewParty(false);
          setInlinePartyForm({ name: '', phone: '', credit_limit: '5000', company_name: '' });
          fetchData();
          if (selectedLedgerCustomer && selectedLedgerCustomer.id === targetId) {
            handleOpenLedger(selectedLedgerCustomer);
          }
        })
        .catch(err => setQuickError(err.message));

    } else if (quickEntryModal.partyType === 'supplier') {
      const txType = quickEntryModal.type === 'gave' ? 'payment' : 'bill';
      fetch('/api/supplier-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: targetId,
          type: txType,
          amount: quickForm.amount,
          bill_number: quickForm.bill_number,
          payment_method: quickForm.payment_mode,
          notes: quickForm.notes,
          due_date: quickForm.due_date
        })
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to record supplier transaction');
          return data;
        })
        .then(() => {
          setQuickEntryModal({ open: false, type: 'gave', partyType: 'supplier', targetId: '' });
          setQuickForm({ amount: '', notes: '', due_date: '', bill_number: '', payment_mode: 'cash' });
          setIsInlineNewParty(false);
          setInlinePartyForm({ name: '', phone: '', credit_limit: '5000', company_name: '' });
          fetchData();
          if (selectedSupplier && selectedSupplier.id === targetId) {
            handleOpenSupplierLedger(selectedSupplier);
          }
        })
        .catch(err => setQuickError(err.message));
    }
  };

  // Update Limit
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
      .then(updated => {
        setShowEditLimit(false);
        setNewLimitVal('');
        setSelectedLedgerCustomer(updated);
        fetchData();
        handleOpenLedger(updated);
      })
      .catch(() => alert('Failed to update limit'));
  };

  // Multi-lingual Reminder Generator
  const generateReminderText = (customer, balance, dueStr) => {
    const formattedDue = dueStr ? new Date(dueStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'today';
    const storeName = shopInfo.shop_name || 'Sri Lakshmi Stores';
    
    if (reminderLang === 'te') {
      return `🏪 *${storeName}*\n\nనమస్కారం ${customer.name} గారు,\n\nమీ ఖాతాలో బకాయి మొత్తం: *₹${balance.toLocaleString('en-IN')}*.\n\nదయచేసి ఈ మొత్తాన్ని ${formattedDue} నాటికి చెల్లించి సహకరించగలరు.\n\nUPI ద్వారా చెల్లించడానికి UPI ID: ${shopInfo.upi_id || '9440925829@ybl'}\n\nధన్యవాదాలు!`;
    }
    if (reminderLang === 'hi') {
      return `🏪 *${storeName}*\n\nनमस्ते ${customer.name},\n\nआपकी लंबित उधार राशि: *₹${balance.toLocaleString('en-IN')}* है।\n\nकृपया इस राशि का भुगतान ${formattedDue} तक करने का कष्ट करें।\n\nUPI द्वारा भुगतान के लिए UPI ID: ${shopInfo.upi_id || '9440925829@ybl'}\n\nधन्यवाद!`;
    }
    return `🏪 *${storeName}*\n\nHello ${customer.name},\n\nThis is a polite reminder that your pending outstanding Udhar balance is: *₹${balance.toLocaleString('en-IN')}*.\n\nPlease clear the pending amount by ${formattedDue}.\n\nYou can also pay via UPI to: ${shopInfo.upi_id || '9440925829@ybl'}\n\nThank you for shopping with us!`;
  };

  const handleCopyReminder = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter & Sort Customer list
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

  // Filter Suppliers list
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    (s.company_name && s.company_name.toLowerCase().includes(supplierSearch.toLowerCase())) ||
    s.phone.includes(supplierSearch)
  );

  const totalSupplierPayable = suppliers.reduce((sum, s) => sum + (Number(s.balance) || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Khata Book Top Bar with Book Switcher & Language */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
            <BookOpen size={30} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight">{t.title}</h1>
              <span className="text-[10px] bg-white/20 font-black uppercase px-2.5 py-0.5 rounded-full border border-white/30">
                100% Secure & Automated
              </span>
            </div>
            <p className="text-xs text-white/80 mt-1">{t.subtitle}</p>
          </div>
        </div>

        {/* Khata Book Selector & Lang Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Book Switcher */}
          <div className="bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/20 flex items-center">
            <select
              value={activeBookId}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  setShowAddBookModal(true);
                } else {
                  setActiveBookId(e.target.value);
                }
              }}
              className="bg-transparent text-white font-bold text-xs px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              {khataBooks.map(b => (
                <option key={b.id} value={b.id} className="text-gray-900 bg-white font-medium">
                  {b.name}
                </option>
              ))}
              <option value="__add_new__" className="text-primary-600 bg-white font-bold">
                ➕ Add New Khata Book...
              </option>
            </select>
          </div>

          {/* Language Switcher */}
          <div className="bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/20 flex items-center gap-1">
            {[
              { code: 'en', label: 'ENG' },
              { code: 'te', label: 'తెలుగు' },
              { code: 'hi', label: 'हिंदी' }
            ].map(l => (
              <button
                key={l.code}
                onClick={() => setKhataLang(l.code)}
                className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition ${khataLang === l.code ? 'bg-white text-red-700 shadow-sm' : 'text-white/80 hover:text-white'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Tabs & Universal Diya/Liya Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4 dark:border-gray-750">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-fit border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${activeTab === 'customers' ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'}`}
          >
            <User size={15} /> {t.customersTab}
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${activeTab === 'suppliers' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'}`}
          >
            <Building2 size={15} /> {t.suppliersTab}
          </button>
          <button
            onClick={() => setActiveTab('cashbook')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${activeTab === 'cashbook' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'}`}
          >
            <Wallet size={15} /> {t.cashbookTab}
          </button>
        </div>

        {/* Universal Big Diya (🔴 Gave) and Liya (🟢 Got) Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsInlineNewParty(false);
              setQuickEntryModal({ open: true, type: 'gave', partyType: activeTab === 'suppliers' ? 'supplier' : 'customer', targetId: '' });
            }}
            className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2.5 rounded-2xl text-xs transition shadow-lg shadow-red-600/20 flex items-center gap-1.5"
          >
            <ArrowUpRight size={16} /> {t.youGave}
          </button>
          <button
            onClick={() => {
              setIsInlineNewParty(false);
              setQuickEntryModal({ open: true, type: 'got', partyType: activeTab === 'suppliers' ? 'supplier' : 'customer', targetId: '' });
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-2xl text-xs transition shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <ArrowDownLeft size={16} /> {t.youGot}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CUSTOMERS KHATA (GRAHAK)                                           */}
      {/* ========================================================================= */}
      {activeTab === 'customers' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Customer Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t.youWillGet}</p>
              <h3 className="text-xl lg:text-2xl font-black text-red-600 dark:text-red-400 mt-2">
                ₹{(summary.totalOutstanding || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[9px] text-gray-400 mt-1">{summary.activeUdharCount || 0} customers with balance</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Due Today</p>
              <h3 className="text-xl lg:text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
                ₹{(summary.dueToday || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[9px] text-gray-450 mt-1">Pending collections today</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Overdue Balance</p>
              <h3 className="text-xl lg:text-2xl font-black text-red-500 mt-2">
                ₹{(summary.overdue || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[9px] text-red-500 font-semibold mt-1">⚠️ Passed due dates</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">MTD Recovered</p>
              <h3 className="text-xl lg:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                ₹{(summary.creditRecoveredThisMonth || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[9px] text-gray-450 mt-1">Given: ₹{(summary.creditGivenThisMonth || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Customers List Table */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50/60 dark:bg-gray-750/40 border-b border-gray-150 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customer by name or phone..."
                  className="w-full bg-white dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-750 dark:text-gray-200"
                />
              </div>

              {/* Filters & Add Customer Button */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All Customers ({customers.length})</option>
                  <option value="debtors">Active Debtors</option>
                  <option value="limit_exceeded">Limit Exceeded</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300"
                >
                  <option value="highest">Highest Debt First</option>
                  <option value="lowest">Lowest Debt First</option>
                  <option value="name">Alphabetical</option>
                </select>

                <button 
                  onClick={() => setShowAddCustomerModal(true)}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
                >
                  <UserPlus size={14} /> {t.addCustomer}
                </button>

                <button 
                  onClick={fetchData}
                  className="p-2 bg-white dark:bg-gray-700 hover:bg-gray-50 border border-gray-250 dark:border-gray-650 rounded-xl text-gray-500 transition"
                  title="Refresh"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-750/60 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-150 dark:border-gray-700 text-xs">
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Credit Limit</th>
                    <th className="p-4 text-right">{t.youWillGet}</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                  {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-450 italic">Loading Khata records...</td></tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-450 italic">
                        No customers found. Click <strong>"{t.addCustomer}"</strong> or <strong>"{t.youGave}"</strong> to add your first customer to the Khata Book!
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(c => {
                      const limit = c.credit_limit || 5000;
                      const balance = Number(c.debt_balance || 0);
                      const isExceeded = balance > limit;

                      return (
                        <tr key={c.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750/30 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl">
                                <User size={18} />
                              </span>
                              <div>
                                <p className="font-extrabold text-gray-900 dark:text-white">{c.name}</p>
                                <p className="text-[11px] text-gray-400 flex items-center gap-1 font-mono"><Phone size={10} /> {c.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-gray-500 dark:text-gray-400 text-xs">
                            ₹{limit.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4 text-right font-black text-base font-mono">
                            <span className={balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                              ₹{balance.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {balance === 0 ? (
                              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[9px] uppercase px-2.5 py-0.5 rounded-full font-black">All Cleared</span>
                            ) : isExceeded ? (
                              <span className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-[9px] uppercase px-2.5 py-0.5 rounded-full font-black">Limit Exceeded</span>
                            ) : (
                              <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 text-[9px] uppercase px-2.5 py-0.5 rounded-full font-black">Due Pending</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {balance > 0 && (
                                <button
                                  onClick={() => { setQrCustomer(c); setShowQrModal(true); }}
                                  className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 rounded-xl transition"
                                  title="Show UPI QR Code"
                                >
                                  <QrCode size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenLedger(c)}
                                className="bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-black px-3 py-2 rounded-xl text-xs transition inline-flex items-center gap-1"
                              >
                                {t.viewLedger} <ChevronRight size={13} />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SUPPLIERS KHATA (VYAPARI)                                          */}
      {/* ========================================================================= */}
      {activeTab === 'suppliers' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Supplier Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t.youWillPay}</p>
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                ₹{totalSupplierPayable.toLocaleString('en-IN')}
              </h3>
              <p className="text-[9px] text-gray-400 mt-1">Total owed to wholesalers & distributors</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Registered Suppliers</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                {suppliers.length}
              </h3>
              <p className="text-[9px] text-gray-400 mt-1">Active vendor supply accounts</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Add New Vendor</p>
                <p className="text-xs text-gray-500 mt-1">Create a distributor account to track purchases</p>
              </div>
              <button
                onClick={() => setShowAddSupplierModal(true)}
                className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-md shadow-indigo-600/20"
              >
                <PlusCircle size={14} /> {t.addSupplier}
              </button>
            </div>
          </div>

          {/* Suppliers Table */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50/60 dark:bg-gray-750/40 border-b border-gray-150 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  placeholder="Search supplier by name, company, or phone..."
                  className="w-full bg-white dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-750 dark:text-gray-200"
                />
              </div>

              <button
                onClick={() => setShowAddSupplierModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center gap-1 shrink-0 shadow-sm"
              >
                <PlusCircle size={14} /> {t.addSupplier}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-750/60 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-150 dark:border-gray-700 text-xs">
                    <th className="p-4">Supplier / Firm Name</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">Address / Notes</th>
                    <th className="p-4 text-right">{t.youWillPay}</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-450 italic">
                        No suppliers recorded yet. Click "{t.addSupplier}" to create your first vendor Khata.
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map(s => {
                      const bal = Number(s.balance || 0);
                      return (
                        <tr key={s.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750/30 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                                <Building2 size={18} />
                              </span>
                              <div>
                                <p className="font-extrabold text-gray-900 dark:text-white">{s.name}</p>
                                {s.company_name && <p className="text-[11px] text-gray-500 font-medium">{s.company_name}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                            {s.phone}
                          </td>
                          <td className="p-4 text-xs text-gray-500 max-w-xs truncate">
                            {s.address || s.notes || '—'}
                          </td>
                          <td className="p-4 text-right font-black text-base font-mono text-indigo-600 dark:text-indigo-400">
                            ₹{bal.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleOpenSupplierLedger(s)}
                              className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-black px-3 py-2 rounded-xl text-xs transition inline-flex items-center gap-1"
                            >
                              {t.viewLedger} <ChevronRight size={13} />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DAILY CASH BOOK (ROKAR KHATA)                                      */}
      {/* ========================================================================= */}
      {activeTab === 'cashbook' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Cashbook Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Today's Cash In</p>
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><ArrowDownLeft size={16} /></span>
              </div>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                +₹{(cashSummary.todayIn || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[9px] text-gray-400 mt-1">Cash sales + debt repayments collected</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Today's Cash Out</p>
                <span className="p-1.5 bg-red-50 text-red-600 rounded-lg"><ArrowUpRight size={16} /></span>
              </div>
              <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mt-2">
                -₹{(cashSummary.todayOut || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[9px] text-gray-400 mt-1">Supplier payments + petty shop expenses</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-lg flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">{t.inHandCash}</p>
                <h3 className="text-3xl font-black mt-2">
                  ₹{(cashSummary.netCashInHand || 0).toLocaleString('en-IN')}
                </h3>
              </div>
              <button
                onClick={() => setShowAddCashModal(true)}
                className="mt-3 bg-white text-emerald-800 hover:bg-white/90 font-black py-2 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow"
              >
                <PlusCircle size={14} /> + Record Cash In/Out
              </button>
            </div>
          </div>

          {/* Cashbook Transactions Stream */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50/60 dark:bg-gray-750/40 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Wallet size={16} className="text-emerald-500" /> Daily Cash Register Log
              </h3>
              <button
                onClick={() => setShowAddCashModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
              >
                <PlusCircle size={13} /> {t.addCash}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-750/60 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-150 dark:border-gray-700 text-xs">
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Category / Purpose</th>
                    <th className="p-4">Remarks</th>
                    <th className="p-4 text-right">Cash In (+)</th>
                    <th className="p-4 text-right">Cash Out (-)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                  {cashEntries.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-450 italic">
                        No cash register entries recorded yet. Click "{t.addCash}" to log daily counter cash.
                      </td>
                    </tr>
                  ) : (
                    cashEntries.map(e => {
                      const isIn = e.type === 'in';
                      return (
                        <tr key={e.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750/30 transition">
                          <td className="p-4 text-xs font-mono text-gray-500">
                            {new Date(e.entry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4 font-bold text-xs capitalize text-gray-800 dark:text-gray-200">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase mr-2 ${isIn ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'}`}>
                              {e.category.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-600 dark:text-gray-400">
                            {e.notes || '—'}
                          </td>
                          <td className="p-4 text-right font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {isIn ? `+₹${e.amount.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="p-4 text-right font-black font-mono text-red-600 dark:text-red-400">
                            {!isIn ? `-₹${e.amount.toLocaleString('en-IN')}` : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW CUSTOMER MODAL                                                   */}
      {/* ========================================================================= */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-150 dark:border-gray-700 animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus size={18} className="text-red-500" /> {t.addCustomer}
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Customer Full Name *</label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar, Sunitha Rao"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Phone Number *</label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="e.g. 9848012345"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono font-bold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={customerForm.credit_limit}
                    onChange={(e) => setCustomerForm({ ...customerForm, credit_limit: e.target.value })}
                    placeholder="5000"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Opening Udhar (₹)</label>
                  <input
                    type="number"
                    value={customerForm.opening_balance}
                    onChange={(e) => setCustomerForm({ ...customerForm, opening_balance: e.target.value })}
                    placeholder="0.00"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Preferred Language</label>
                  <select
                    value={customerForm.preferred_language}
                    onChange={(e) => setCustomerForm({ ...customerForm, preferred_language: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold"
                  >
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UNIVERSAL QUICK DIYA / LIYA (GAVE / GOT) MODAL                           */}
      {/* ========================================================================= */}
      {quickEntryModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-150 dark:border-gray-700 animate-scaleUp">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className={`p-2 rounded-xl text-white ${quickEntryModal.type === 'gave' ? 'bg-red-600' : 'bg-emerald-600'}`}>
                  {quickEntryModal.type === 'gave' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                </span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {quickEntryModal.type === 'gave' ? '🔴 YOU GAVE ₹ (Maine Diya / Udhar)' : '🟢 YOU GOT ₹ (Maine Liya / Jama)'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {quickEntryModal.partyType === 'customer' ? 'Customer Credit Ledger' : 'Supplier Payment Ledger'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setQuickEntryModal({ open: false, type: 'gave', partyType: 'customer', targetId: '' });
                  setIsInlineNewParty(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {quickError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 text-xs p-3 rounded-xl mt-4 flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>{quickError}</span>
              </div>
            )}

            <form onSubmit={handleQuickEntrySubmit} className="mt-4 flex flex-col gap-4">
              {/* Select Customer / Supplier OR Add New Customer on the fly */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    {quickEntryModal.partyType === 'customer' ? 'Customer Name' : 'Supplier Name'} *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInlineNewParty(!isInlineNewParty);
                      if (!isInlineNewParty) setQuickEntryModal(prev => ({ ...prev, targetId: '' }));
                    }}
                    className="text-[11px] text-primary-600 font-extrabold hover:underline"
                  >
                    {isInlineNewParty ? '← Choose Existing' : `+ Add New ${quickEntryModal.partyType === 'customer' ? 'Customer' : 'Supplier'}`}
                  </button>
                </div>

                {!isInlineNewParty ? (
                  <select
                    value={quickEntryModal.targetId}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsInlineNewParty(true);
                      } else {
                        setQuickEntryModal(prev => ({ ...prev, targetId: e.target.value }));
                      }
                    }}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                    required
                  >
                    <option value="">-- Choose {quickEntryModal.partyType === 'customer' ? 'Customer' : 'Supplier'} --</option>
                    {quickEntryModal.partyType === 'customer'
                      ? customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone}) - Udhar: ₹{c.debt_balance || 0}</option>)
                      : suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.company_name || s.phone}) - Owe: ₹{s.balance || 0}</option>)
                    }
                    <option value="__add_new__" className="text-primary-600 font-black">
                      ➕ + Add New {quickEntryModal.partyType === 'customer' ? 'Customer' : 'Supplier'}...
                    </option>
                  </select>
                ) : (
                  /* Inline New Customer / Supplier Form */
                  <div className="bg-gray-50 dark:bg-gray-750 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">
                        {quickEntryModal.partyType === 'customer' ? 'Customer Name' : 'Contact Person Name'} *
                      </label>
                      <input
                        type="text"
                        value={inlinePartyForm.name}
                        onChange={(e) => setInlinePartyForm({ ...inlinePartyForm, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="bg-white dark:bg-gray-700 border border-gray-250 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Phone Number *</label>
                        <input
                          type="tel"
                          value={inlinePartyForm.phone}
                          onChange={(e) => setInlinePartyForm({ ...inlinePartyForm, phone: e.target.value })}
                          placeholder="e.g. 9848012345"
                          className="bg-white dark:bg-gray-700 border border-gray-250 rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">
                          {quickEntryModal.partyType === 'customer' ? 'Credit Limit ₹' : 'Company Name'}
                        </label>
                        <input
                          type="text"
                          value={quickEntryModal.partyType === 'customer' ? inlinePartyForm.credit_limit : inlinePartyForm.company_name}
                          onChange={(e) => setInlinePartyForm({ 
                            ...inlinePartyForm, 
                            [quickEntryModal.partyType === 'customer' ? 'credit_limit' : 'company_name']: e.target.value 
                          })}
                          placeholder={quickEntryModal.partyType === 'customer' ? '5000' : 'e.g. Balaji Traders'}
                          className="bg-white dark:bg-gray-700 border border-gray-250 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-base">₹</span>
                  <input
                    type="number"
                    value={quickForm.amount}
                    onChange={(e) => setQuickForm({ ...quickForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl pl-8 pr-4 py-3 text-lg font-black font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              {/* Bill Number & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Bill / Invoice #</label>
                  <input
                    type="text"
                    value={quickForm.bill_number}
                    onChange={(e) => setQuickForm({ ...quickForm, bill_number: e.target.value })}
                    placeholder="e.g. INV-102"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Due Date</label>
                  <input
                    type="date"
                    value={quickForm.due_date}
                    onChange={(e) => setQuickForm({ ...quickForm, due_date: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Payment Mode</label>
                <select
                  value={quickForm.payment_mode}
                  onChange={(e) => setQuickForm({ ...quickForm, payment_mode: e.target.value })}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="cash">💵 Cash (Auto-adds to Cashbook)</option>
                  <option value="upi">📱 UPI / PhonePe / GPay / Paytm</option>
                  <option value="bank">🏦 Bank Transfer</option>
                  <option value="credit">📝 Credit Record</option>
                </select>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Notes / Items Description</label>
                <input
                  type="text"
                  value={quickForm.notes}
                  onChange={(e) => setQuickForm({ ...quickForm, notes: e.target.value })}
                  placeholder="e.g. Groceries, Rice bag, Milk, etc."
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 border-t pt-4 mt-2 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setQuickEntryModal({ open: false, type: 'gave', partyType: 'customer', targetId: '' });
                    setIsInlineNewParty(false);
                  }}
                  className="px-4 py-2 border border-gray-250 dark:border-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-white rounded-xl text-xs font-black shadow-lg transition ${quickEntryModal.type === 'gave' ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOMER LEDGER DRAWER WITH TIMELINE & REMINDER & STATEMENTS             */}
      {/* ========================================================================= */}
      {selectedLedgerCustomer && (
        <div className="fixed inset-0 bg-black/60 z-40 flex justify-end backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto flex flex-col gap-6 animate-slideLeft border-l dark:border-gray-750">
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b pb-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-2xl">
                  <User size={24} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">{selectedLedgerCustomer.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedLedgerCustomer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-500 transition"
                  title="Print / PDF Statement"
                >
                  <Printer size={18} />
                </button>
                <button 
                  onClick={() => setSelectedLedgerCustomer(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-500 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {loadingLedger ? (
              <div className="text-center py-20 text-gray-400 italic">Retrieving customer ledger statement...</div>
            ) : (
              ledgerData && (
                <div className="flex flex-col gap-5 flex-1">
                  {/* Balance Summary Card */}
                  <div className="bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-750 rounded-2xl p-5 flex flex-col gap-4 font-medium text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-450 text-[10px] font-bold uppercase tracking-wider">{t.youWillGet}</span>
                        <h4 className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
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
                            className="p-1 bg-white dark:bg-gray-750 rounded border border-gray-250 dark:border-gray-650 text-gray-450 hover:text-gray-700"
                            title="Edit Limit"
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
                          placeholder="New credit limit ₹"
                          className="bg-white dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-2.5 py-1.5 text-xs w-full font-bold"
                          required
                        />
                        <button type="submit" className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs">Save</button>
                        <button type="button" onClick={() => setShowEditLimit(false)} className="text-gray-400 text-xs font-bold px-2">Cancel</button>
                      </form>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 grid grid-cols-2 gap-4 text-[10px] uppercase font-bold text-gray-450 tracking-wider">
                      <div>MTD Given: <span className="text-gray-800 dark:text-gray-200 font-extrabold ml-1">₹{ledgerData.summary.creditGivenThisMonth}</span></div>
                      <div>MTD Collected: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold ml-1">₹{ledgerData.summary.creditRecoveredThisMonth}</span></div>
                    </div>
                  </div>

                  {/* QR Code & Direct Actions */}
                  {Number(ledgerData.customer.debt_balance) > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setQrCustomer(ledgerData.customer); setShowQrModal(true); }}
                        className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 text-purple-700 dark:text-purple-300 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition hover:bg-purple-100"
                      >
                        <QrCode size={16} /> Show UPI QR Code
                      </button>
                      <button
                        onClick={() => setShowPrintModal(true)}
                        className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition hover:bg-blue-100"
                      >
                        <FileText size={16} /> Print Statement
                      </button>
                    </div>
                  )}

                  {/* Payment Reminder WhatsApp Section */}
                  {Number(ledgerData.customer.debt_balance) > 0 && (
                    <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          📱 {t.remind} (WhatsApp / SMS)
                        </h4>
                        
                        {/* Language Selection */}
                        <div className="flex gap-1">
                          {['en', 'te', 'hi'].map(l => (
                            <button
                              key={l}
                              onClick={() => setReminderLang(l)}
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition ${reminderLang === l ? 'bg-amber-300 text-amber-900 font-black' : 'bg-white dark:bg-gray-700 border border-gray-250 text-gray-600'}`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                        {generateReminderText(ledgerData.customer, Number(ledgerData.customer.debt_balance), null)}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleCopyReminder(generateReminderText(ledgerData.customer, Number(ledgerData.customer.debt_balance), null))}
                          className="bg-white dark:bg-gray-700 hover:bg-gray-50 border border-gray-250 dark:border-gray-650 text-gray-700 dark:text-gray-300 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                        >
                          <Clipboard size={14} /> {copied ? 'Copied!' : 'Copy Text'}
                        </button>
                        <button
                          onClick={() => window.open(`https://api.whatsapp.com/send?phone=91${ledgerData.customer.phone.trim()}&text=${encodeURIComponent(generateReminderText(ledgerData.customer, Number(ledgerData.customer.debt_balance), null))}`, '_blank')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition shadow-sm"
                        >
                          <Share2 size={14} /> Send WhatsApp
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Transaction Timeline */}
                  <div className="flex-1 flex flex-col gap-3 min-h-0">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Account Statement Timeline</h4>
                    <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 max-h-[300px]">
                      {ledgerData.timeline.length === 0 ? (
                        <p className="text-xs text-gray-450 italic py-6 text-center">No transactions recorded yet.</p>
                      ) : (
                        ledgerData.timeline.map((tx, idx) => {
                          const isCredit = tx.type === 'credit';
                          return (
                            <div key={idx} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <span className={`p-1.5 rounded-full ${isCredit ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                  <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                </span>
                                <div className="w-px bg-gray-200 dark:bg-gray-700 flex-1 my-1" />
                              </div>
                              <div className="flex-1 bg-gray-50 dark:bg-gray-850 p-3 rounded-2xl border border-gray-150 dark:border-gray-750 flex items-center justify-between text-xs gap-3">
                                <div>
                                  <p className="font-extrabold text-gray-800 dark:text-gray-200">{tx.description}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`font-black text-sm font-mono ${isCredit ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {isCredit ? '+' : '-'}₹{tx.amount}
                                  </p>
                                  {isCredit && Number(tx.outstanding) > 0 && (
                                    <p className="text-[9px] text-gray-400 mt-0.5">Bal: ₹{tx.outstanding}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Drawer Footer Buttons */}
                  <div className="border-t pt-4 dark:border-gray-700 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setQuickEntryModal({ open: true, type: 'gave', partyType: 'customer', targetId: selectedLedgerCustomer.id })}
                      className="bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow"
                    >
                      <ArrowUpRight size={15} /> + Add Udhar
                    </button>
                    <button
                      onClick={() => setQuickEntryModal({ open: true, type: 'got', partyType: 'customer', targetId: selectedLedgerCustomer.id })}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow"
                    >
                      <ArrowDownLeft size={15} /> 💰 Collect Payment
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUPPLIER LEDGER DRAWER                                                   */}
      {/* ========================================================================= */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/60 z-40 flex justify-end backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto flex flex-col gap-6 animate-slideLeft border-l dark:border-gray-750">
            <div className="flex justify-between items-start border-b pb-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Building2 size={24} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">{selectedSupplier.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedSupplier.company_name || selectedSupplier.phone}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSupplier(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {loadingSupplierLedger ? (
              <div className="text-center py-20 text-gray-400 italic">Retrieving supplier ledger...</div>
            ) : (
              supplierLedgerData && (
                <div className="flex flex-col gap-5 flex-1">
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 p-5 rounded-2xl flex flex-col gap-3">
                    <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Total You Owe Supplier</p>
                    <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      ₹{Number(supplierLedgerData.supplier.balance || 0).toLocaleString('en-IN')}
                    </h4>
                    <div className="border-t border-indigo-200/50 pt-2 grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-gray-500">
                      <div>Total Bills: <span className="font-extrabold text-gray-800 dark:text-gray-200">₹{supplierLedgerData.summary.totalBills}</span></div>
                      <div>Total Paid: <span className="font-extrabold text-emerald-600">₹{supplierLedgerData.summary.totalPayments}</span></div>
                    </div>
                  </div>

                  {/* Supplier Transactions Timeline */}
                  <div className="flex-1 flex flex-col gap-3 min-h-0">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Purchase & Payment Logs</h4>
                    <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 max-h-[350px]">
                      {supplierLedgerData.transactions.length === 0 ? (
                        <p className="text-xs text-gray-450 italic py-6 text-center">No bills or payments logged yet.</p>
                      ) : (
                        supplierLedgerData.transactions.map((tx, idx) => {
                          const isBill = tx.type === 'bill';
                          return (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-850 p-3.5 rounded-2xl border border-gray-150 dark:border-gray-750 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-extrabold text-gray-800 dark:text-gray-200">
                                  {isBill ? `📦 Purchase Bill ${tx.bill_number ? `(#${tx.bill_number})` : ''}` : `💰 Payment to Supplier (${tx.payment_method})`}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {new Date(tx.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  {tx.notes && ` • ${tx.notes}`}
                                </p>
                              </div>
                              <p className={`font-black text-sm font-mono ${isBill ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                {isBill ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="border-t pt-4 dark:border-gray-700 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setQuickEntryModal({ open: true, type: 'got', partyType: 'supplier', targetId: selectedSupplier.id })}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow"
                    >
                      + Add Purchase Bill
                    </button>
                    <button
                      onClick={() => setQuickEntryModal({ open: true, type: 'gave', partyType: 'supplier', targetId: selectedSupplier.id })}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow"
                    >
                      💰 Record Payment
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSTANT UPI QR CODE MODAL                                                */}
      {/* ========================================================================= */}
      {showQrModal && qrCustomer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-150 dark:border-gray-700 text-center animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
              <h3 className="text-sm font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <QrCode size={18} /> Scan & Pay via UPI
              </h3>
              <button onClick={() => setShowQrModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="my-5 flex flex-col items-center">
              <p className="text-xs font-bold text-gray-500">Customer: <span className="text-gray-900 dark:text-white">{qrCustomer.name}</span></p>
              <h4 className="text-3xl font-black text-red-600 dark:text-red-400 mt-1 font-mono">
                ₹{Number(qrCustomer.debt_balance || 0).toLocaleString('en-IN')}
              </h4>

              {/* Dynamic QR Code Image using UPI standard link */}
              <div className="p-3 bg-white rounded-2xl border-2 border-purple-500 shadow-md mt-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${shopInfo.upi_id || '9440925829@ybl'}&pn=${encodeURIComponent(shopInfo.shop_name || 'Sri Lakshmi Stores')}&am=${qrCustomer.debt_balance || 0}&cu=INR`)}`}
                  alt="UPI QR Code" 
                  className="w-44 h-44 rounded-lg"
                />
              </div>

              <p className="text-[11px] text-gray-400 mt-3 font-medium">
                Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI app
              </p>
              <p className="text-[10px] font-mono text-purple-600 dark:text-purple-400 mt-1">
                UPI ID: {shopInfo.upi_id || '9440925829@ybl'}
              </p>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE KHATA STATEMENT MODAL                                          */}
      {/* ========================================================================= */}
      {showPrintModal && selectedLedgerCustomer && ledgerData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white text-gray-900 rounded-3xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 no-print">
              <h3 className="text-sm font-black uppercase text-gray-700 flex items-center gap-1.5">
                <FileText size={18} /> Official Account Statement
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
                >
                  <Printer size={14} /> Print Statement
                </button>
                <button onClick={() => setShowPrintModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
            </div>

            {/* Printable Statement Canvas */}
            <div ref={printRef} className="p-4 flex flex-col gap-5">
              <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4">
                <div>
                  <h2 className="text-2xl font-black">{shopInfo.shop_name || 'Sri Lakshmi Stores'}</h2>
                  <p className="text-xs text-gray-500">{shopInfo.address || 'Retail Store'}</p>
                  <p className="text-xs text-gray-500 font-mono">Phone: {shopInfo.phone || '9440925829'} | UPI: {shopInfo.upi_id || '9440925829@ybl'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black uppercase bg-gray-100 px-3 py-1 rounded-full border">
                    Customer Khata Statement
                  </span>
                  <p className="text-[10px] text-gray-400 mt-2 font-mono">Generated: {new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Customer Box */}
              <div className="bg-gray-50 p-4 rounded-2xl border flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-gray-500 uppercase text-[10px]">Customer Name</p>
                  <h4 className="text-base font-black text-gray-900">{selectedLedgerCustomer.name}</h4>
                  <p className="text-gray-500 font-mono">{selectedLedgerCustomer.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-500 uppercase text-[10px]">Total Outstanding Balance</p>
                  <h4 className="text-2xl font-black text-red-600 font-mono">
                    ₹{Number(selectedLedgerCustomer.debt_balance || 0).toLocaleString('en-IN')}
                  </h4>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left border-collapse text-xs mt-2">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 font-bold">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Details</th>
                    <th className="p-2.5 text-right">Debit (You Gave)</th>
                    <th className="p-2.5 text-right">Credit (You Got)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ledgerData.timeline.map((tx, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-mono text-gray-500">{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-2.5 font-bold">{tx.description}</td>
                      <td className="p-2.5 text-right font-black font-mono text-red-600">
                        {tx.type === 'credit' ? `₹${tx.amount}` : '—'}
                      </td>
                      <td className="p-2.5 text-right font-black font-mono text-emerald-600">
                        {tx.type === 'payment' ? `₹${tx.amount}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signature Footer */}
              <div className="border-t pt-8 mt-6 flex justify-between text-xs text-gray-500">
                <div>
                  <p className="italic">Thank you for your business!</p>
                </div>
                <div className="text-center border-t border-dashed pt-2 w-44">
                  <p className="font-bold">Authorized Signature / Stamp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW KHATA BOOK MODAL                                                 */}
      {/* ========================================================================= */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-150 dark:border-gray-700 animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={16} className="text-red-500" /> Add New Khata Book
              </h3>
              <button onClick={() => setShowAddBookModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateBook} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Khata Book Name *</label>
                <input
                  type="text"
                  value={newBookName}
                  onChange={(e) => setNewBookName(e.target.value)}
                  placeholder="e.g. 🏢 Wholesaler Book, 🏠 Home Khata"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow"
                >
                  Create Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW SUPPLIER MODAL                                                   */}
      {/* ========================================================================= */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-150 dark:border-gray-700 animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={18} className="text-indigo-500" /> Add New Supplier / Vendor
              </h3>
              <button onClick={() => setShowAddSupplierModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Contact Person Name *</label>
                <input
                  type="text"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Reddy"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Company / Firm Name</label>
                <input
                  type="text"
                  value={supplierForm.company_name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, company_name: e.target.value })}
                  placeholder="e.g. Sri Balaji Wholesalers"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Phone Number *</label>
                  <input
                    type="tel"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="e.g. 9848011223"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Opening Balance ₹</label>
                  <input
                    type="number"
                    value={supplierForm.balance}
                    onChange={(e) => setSupplierForm({ ...supplierForm, balance: e.target.value })}
                    placeholder="0.00"
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Address / Notes</label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="e.g. Market Yard, Shop #12"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD CASH ENTRY MODAL                                                     */}
      {/* ========================================================================= */}
      {showAddCashModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-150 dark:border-gray-700 animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Wallet size={16} className="text-emerald-500" /> Daily Cash Counter Entry
              </h3>
              <button onClick={() => setShowAddCashModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddCashSubmit} className="mt-4 flex flex-col gap-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setCashForm({ ...cashForm, type: 'in' })}
                  className={`py-2 rounded-xl text-xs font-black transition ${cashForm.type === 'in' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  🟢 Cash In (+)
                </button>
                <button
                  type="button"
                  onClick={() => setCashForm({ ...cashForm, type: 'out' })}
                  className={`py-2 rounded-xl text-xs font-black transition ${cashForm.type === 'out' ? 'bg-red-600 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  🔴 Cash Out (-)
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Amount (₹) *</label>
                <input
                  type="number"
                  value={cashForm.amount}
                  onChange={(e) => setCashForm({ ...cashForm, amount: e.target.value })}
                  placeholder="₹ 0.00"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2.5 text-base font-black font-mono focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                <select
                  value={cashForm.category}
                  onChange={(e) => setCashForm({ ...cashForm, category: e.target.value })}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  {cashForm.type === 'in' ? (
                    <>
                      <option value="sale">Cash Sale</option>
                      <option value="debt_collected">Customer Debt Payment</option>
                      <option value="other_income">Other Cash In</option>
                    </>
                  ) : (
                    <>
                      <option value="expense">Shop Daily Expense</option>
                      <option value="supplier_payment">Supplier Payment</option>
                      <option value="petty_cash">Personal / Petty Cash</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Remarks / Notes</label>
                <input
                  type="text"
                  value={cashForm.notes}
                  onChange={(e) => setCashForm({ ...cashForm, notes: e.target.value })}
                  placeholder="e.g. Milk packet purchase, tea expense..."
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddCashModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl text-xs font-black shadow ${cashForm.type === 'in' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}
                >
                  Save Cash Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

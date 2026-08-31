import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  FileImage, 
  Bot, 
  BarChart3, 
  FileText, 
  Settings as SettingsIcon,
  Languages,
  Moon,
  Sun,
  Menu,
  X,
  IndianRupee,
  Receipt,
  LogOut,
  BookOpen
} from 'lucide-react';

import { t } from './utils/translations';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Expenses from './pages/Expenses';
import Offers from './pages/Offers';
import PamphletGenerator from './pages/PamphletGenerator';
import AiAgent from './pages/AiAgent';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import UdharDashboard from './pages/UdharDashboard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto my-12 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl shadow text-red-800 dark:text-red-400">
          <h2 className="text-xl font-bold flex items-center gap-2">⚠️ Application Render Crash</h2>
          <p className="text-sm mt-2 font-semibold">{this.state.error?.toString()}</p>
          <pre className="mt-4 p-4 bg-gray-900 text-red-300 text-xs rounded-xl overflow-x-auto whitespace-pre-wrap max-h-65 font-mono">
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('smartshop_logged_in') === 'true';
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid credentials');
        return data;
      })
      .then(data => {
        setIsLoggedIn(true);
        localStorage.setItem('smartshop_logged_in', 'true');
        setLoginError('');
      })
      .catch(err => {
        setLoginError(err.message || 'Invalid username or password.');
      });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('smartshop_logged_in');
    setPage('landing');
  };

  const [page, setPage] = useState('landing');
  const [lang, setLang] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [shopInfo, setShopInfo] = useState({
    shop_name: 'SmartShop AI',
    owner_name: 'Store Owner',
    phone: '9999999999',
    address: 'Store Address',
    designer_cost: 500,
    logo_url: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Parameter passed to jump to pages directly from AI or dashboard actions
  const [pageParams, setPageParams] = useState(null);

  // Check viewport width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch Shop Profile on load
  useEffect(() => {
    fetch('/api/shop')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setShopInfo(data);
      })
      .catch(err => console.log('Failed to fetch shop info, using fallback.'));
  }, [page]);

  // Dark Mode side effects
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Page Routing Helper
  const navigateTo = (targetPage, params = null) => {
    setPage(targetPage);
    setPageParams(params);
    setMobileMenuOpen(false);
    setSidebarOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: t(lang, 'dashboard'), icon: LayoutDashboard },
    { id: 'inventory', label: t(lang, 'inventory'), icon: Package },
    { id: 'sales', label: t(lang, 'sales'), icon: ShoppingCart },
    { id: 'customers', label: t(lang, 'customers'), icon: Users },
    { id: 'udhar', label: 'Smart Udhar', icon: BookOpen },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'offers', label: t(lang, 'offers'), icon: Tag },
    { id: 'pamphlet', label: t(lang, 'pamphlet'), icon: FileImage },
    { id: 'aiAgent', label: t(lang, 'aiAgent'), icon: Bot },
    { id: 'analytics', label: t(lang, 'analytics'), icon: BarChart3 },
    { id: 'reports', label: t(lang, 'reports'), icon: FileText },
    { id: 'settings', label: t(lang, 'settings'), icon: SettingsIcon },
  ];

  // Login Screen handler
  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-150 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
        <div className={`p-8 rounded-2xl border max-w-sm w-full shadow-2xl flex flex-col gap-5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-center">
            <span className="text-4xl">🏪</span>
            <h1 className="text-2xl font-black mt-2 bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">SmartShop AI</h1>
            <p className="text-xs text-gray-400 mt-1">Sign in to manage your retail business</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Username</label>
              <input 
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
                className={`border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-850'}`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Password</label>
              <input 
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
                className={`border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-855'}`}
              />
            </div>

            {loginError && <p className="text-xs font-semibold text-red-500 text-center">{loginError}</p>}

            <button 
              type="submit"
              className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold shadow-lg transition duration-150"
            >
              Sign In
            </button>
          </form>
          
          <div className={`border-t pt-3 text-center ${darkMode ? 'border-gray-700' : 'border-gray-150'}`}>
            <p className="text-[10px] text-gray-400">Demo Login Details:</p>
            <p className="text-[11px] font-mono text-gray-500 mt-1">User: <span className="text-primary-500 font-bold">admin</span> | Pass: <span className="text-primary-500 font-bold">smartshop</span></p>
          </div>
        </div>
      </div>
    );
  }

  // Landing Page handler
  if (page === 'landing') {
    return (
      <LandingPage 
        onEnterDemo={() => navigateTo('dashboard')} 
        lang={lang} 
        setLang={setLang}
        shopInfo={shopInfo}
      />
    );
  }

  // Render correct page component
  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard lang={lang} navigateTo={navigateTo} />;
      case 'inventory':
        return <Inventory lang={lang} navigateTo={navigateTo} params={pageParams} />;
      case 'sales':
        return <Sales lang={lang} navigateTo={navigateTo} />;
      case 'customers':
        return <Customers lang={lang} />;
      case 'udhar':
        return <UdharDashboard lang={lang} />;
      case 'expenses':
        return <Expenses lang={lang} />;
      case 'offers':
        return <Offers lang={lang} navigateTo={navigateTo} params={pageParams} />;
      case 'pamphlet':
        return <PamphletGenerator lang={lang} navigateTo={navigateTo} params={pageParams} shopInfo={shopInfo} />;
      case 'aiAgent':
        return <AiAgent lang={lang} navigateTo={navigateTo} params={pageParams} />;
      case 'analytics':
        return <Analytics lang={lang} />;
      case 'reports':
        return <Reports lang={lang} />;
      case 'settings':
        return <Settings lang={lang} shopInfo={shopInfo} setShopInfo={setShopInfo} />;
      default:
        return <Dashboard lang={lang} navigateTo={navigateTo} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-150 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* Top Header */}
      <header className={`h-16 px-4 flex items-center justify-between border-b sticky top-0 z-30 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          {!isMobile && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg hover:bg-opacity-80 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Menu size={20} />
            </button>
          )}
          {isMobile && (
            <span className="text-xl font-bold flex items-center gap-1 text-primary-600 dark:text-primary-400">
              🏪 SmartShop
            </span>
          )}
          {!isMobile && (
            <span className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-primary-600 dark:text-primary-400">
              🏪 {shopInfo.shop_name || 'SmartShop AI'}
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                AI Business Assistant
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language Picker */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <Languages size={16} className="mx-1 text-gray-500" />
            {['en', 'te', 'hi'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs px-2 py-1 rounded font-semibold uppercase transition-all ${lang === l ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg hover:bg-opacity-80 transition-all ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Logout/Landing shortcut */}
          <button
            onClick={handleLogout}
            className={`p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all`}
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className={`transition-all duration-300 flex flex-col border-r sticky top-16 h-[calc(100vh-4rem)] z-20 ${sidebarOpen ? 'w-64' : 'w-20'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = page === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all group font-medium ${
                      isActive 
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                        : `hover:bg-opacity-85 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    <IconComponent size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'} />
                    {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
              {sidebarOpen ? (
                <p className="text-xs text-gray-400 font-medium">© 2026 SmartShop AI</p>
              ) : (
                <span className="text-sm">🏪</span>
              )}
            </div>
          </aside>
        )}

        {/* Core Screen Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
          <ErrorBoundary>
            {renderPage()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className={`fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around z-40 px-2 shadow-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <button 
            onClick={() => navigateTo('dashboard')} 
            className={`flex flex-col items-center gap-0.5 justify-center flex-1 ${page === 'dashboard' ? 'text-primary-500 font-bold' : 'text-gray-400'}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px]">{t(lang, 'dashboard')}</span>
          </button>
          
          <button 
            onClick={() => navigateTo('inventory')} 
            className={`flex flex-col items-center gap-0.5 justify-center flex-1 ${page === 'inventory' ? 'text-primary-500 font-bold' : 'text-gray-400'}`}
          >
            <Package size={20} />
            <span className="text-[10px]">Stock</span>
          </button>
          
          <button 
            onClick={() => navigateTo('sales')} 
            className={`flex flex-col items-center gap-0.5 justify-center flex-1 ${page === 'sales' ? 'text-primary-500 font-bold' : 'text-gray-400'}`}
          >
            <ShoppingCart size={20} />
            <span className="text-[10px]">Sales</span>
          </button>

          <button 
            onClick={() => navigateTo('aiAgent')} 
            className={`flex flex-col items-center gap-0.5 justify-center flex-1 relative ${page === 'aiAgent' ? 'text-primary-500 font-bold' : 'text-gray-400'}`}
          >
            <span className="absolute -top-3 bg-primary-500 text-white p-2 rounded-full shadow-lg border border-white dark:border-gray-800">
              <Bot size={20} />
            </span>
            <span className="text-[10px] mt-4">AI Agent</span>
          </button>

          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className={`flex flex-col items-center gap-0.5 justify-center flex-1 ${mobileMenuOpen ? 'text-primary-500 font-bold' : 'text-gray-400'}`}
          >
            <Menu size={20} />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      )}

      {/* Mobile "More" Full Screen Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className={`w-80 h-full flex flex-col p-4 shadow-xl transition-all transform duration-200 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold">More Options</h2>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded bg-gray-100 dark:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {navItems.filter(item => !['dashboard', 'inventory', 'sales', 'aiAgent'].includes(item.id)).map(item => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left ${page === item.id ? 'bg-primary-500 text-white font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <IconComp size={18} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="border-t pt-4 border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-400">SmartShop AI v1.0</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

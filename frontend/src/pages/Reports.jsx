import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  ArrowRight, 
  TrendingUp,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { t } from '../utils/translations';

export default function Reports({ lang }) {
  const [range, setRange] = useState('month'); // 'today' | '7days' | 'month' | 'custom'
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [range]);

  const fetchReport = () => {
    setLoading(true);
    let url = `/api/reports?range=${range}`;
    if (range === 'custom') {
      url += `&start=${startDate}&end=${endDate}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setReportData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error generating report:', err);
        setLoading(false);
      });
  };

  const handleCustomFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    const { summary, bestSellers } = reportData;
    const csvRows = [
      ['SmartShop AI - Business Performance Report'],
      [`Date Range: ${new Date(reportData.dateRange.start).toLocaleDateString()} to ${new Date(reportData.dateRange.end).toLocaleDateString()}`],
      [],
      ['Metric', 'Value (INR)'],
      ['Total Sales Revenue', summary.revenue],
      ['Product Cost of Goods Sold', summary.cost],
      ['Gross Profit Margin', summary.grossProfit],
      ['Logged Expenses', summary.expenses],
      ['Net Shop Profit', summary.netProfit],
      ['Number of Sales Transactions', summary.transactions],
      ['Total Product Units Sold', summary.productsSold],
      [],
      ['Top Selling Products'],
      ['Product Name', 'Quantity Sold']
    ];

    bestSellers.forEach(item => {
      csvRows.push([item.product_name, item.quantity]);
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SmartShop_Report_${range}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Print layout titles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-gray-700 print:hidden">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">{t(lang, 'reports')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Export monthly business stats or print daily revenue summaries.
          </p>
        </div>

        {/* Range selectors */}
        <div className="flex flex-wrap gap-2 items-center bg-gray-100 dark:bg-gray-755 p-1 rounded-xl self-start">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'custom', label: 'Custom Range' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setRange(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === opt.id ? 'bg-white dark:bg-gray-650 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Print header display (Visible ONLY during print layout) */}
      <div className="hidden print:flex flex-col gap-2 border-b pb-6 mb-4">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">SmartShop AI Business Report</h1>
        <p className="text-sm text-gray-500">Shop Performance Aggregations</p>
        {reportData && (
          <p className="text-xs font-mono text-gray-400">
            Period: {new Date(reportData.dateRange.start).toLocaleString('en-IN')} to {new Date(reportData.dateRange.end).toLocaleString('en-IN')}
          </p>
        )}
      </div>

      {/* Custom Range picker inputs */}
      {range === 'custom' && (
        <form onSubmit={handleCustomFilter} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-end gap-3 print:hidden">
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-bold text-xs shadow transition w-full sm:w-auto"
          >
            Apply Filters
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center p-12 text-gray-400 text-sm">Compiling financial performance summary...</div>
      ) : reportData ? (
        <div className="flex flex-col gap-6">
          
          {/* Action buttons (Print and Export) */}
          <div className="flex justify-end gap-2.5 print:hidden">
            <button
              onClick={handleExportCSV}
              className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-emerald-100 transition shadow-sm"
            >
              <FileSpreadsheet size={15} /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-sm"
            >
              <Printer size={15} /> Print / Save PDF
            </button>
          </div>

          {/* Core financial numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Sales Revenue */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Sales Revenue</span>
              <h3 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white mt-1">₹{reportData.summary.revenue.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Total revenue generated from sales transactions</p>
            </div>

            {/* Product Costs (COGS) */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Product Costs</span>
              <h3 className="text-xl lg:text-2xl font-black text-gray-500 mt-1">₹{reportData.summary.cost.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Total wholesale cost of products sold</p>
            </div>

            {/* Logged Expenses */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Shop Expenses</span>
              <h3 className="text-xl lg:text-2xl font-black text-red-500 mt-1">₹{reportData.summary.expenses.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Total utilities, helper wages, packaging logged</p>
            </div>

            {/* Gross Profit */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Gross Profit</span>
              <h3 className="text-xl lg:text-2xl font-black text-green-600 dark:text-green-400 mt-1">₹{reportData.summary.grossProfit.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Revenue minus COGS</p>
            </div>

            {/* Net Profit */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm col-span-2 lg:col-span-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Net Profit</span>
              <h3 className={`text-xl lg:text-2xl font-black mt-1 ${reportData.summary.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                ₹{reportData.summary.netProfit.toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Gross profit minus expenses</p>
            </div>
          </div>

          {/* Split block: volumes summary and top products sold list */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Sales Volume Summary */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2.5 dark:border-gray-700">
                <FileText size={16} className="text-primary-500" /> Sales Volumes
              </h3>

              <div className="flex flex-col gap-4 text-xs font-semibold">
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-500">Total Sales Transactions:</span>
                  <span className="text-gray-800 dark:text-gray-200">{reportData.summary.transactions} invoices</span>
                </div>
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-500">Product Units Sold:</span>
                  <span className="text-gray-800 dark:text-gray-200">{reportData.summary.productsSold} items</span>
                </div>
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-500">Average Cart Basket Size:</span>
                  <span className="text-gray-850 dark:text-gray-200">
                    ₹{reportData.summary.transactions > 0 ? (reportData.summary.revenue / reportData.summary.transactions).toFixed(0) : 0} per cart
                  </span>
                </div>
              </div>
            </div>

            {/* Best Sellers lists */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2.5 dark:border-gray-700">
                <TrendingUp size={16} className="text-primary-500" /> Top Selling Items in Range
              </h3>
              
              <div className="flex flex-col gap-2.5 text-xs">
                {reportData.bestSellers.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No products sold in range</p>
                ) : (
                  reportData.bestSellers.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-750 p-2.5 rounded-lg">
                      <span className="font-bold text-gray-850 dark:text-gray-200">{item.product_name}</span>
                      <span className="bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 px-2.5 py-0.5 rounded font-black">{item.quantity} sold</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      ) : null}
    </div>
  );
}

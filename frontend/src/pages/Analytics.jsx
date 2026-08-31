import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Award } from 'lucide-react';
import { t } from '../utils/translations';

export default function Analytics({ lang }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading analytics chart data:', err);
        setLoading(false);
      });
  }, []);

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#10b981'];

  if (loading) {
    return <div className="text-center p-12 text-gray-400 text-sm">Loading analytics charts...</div>;
  }

  if (!data) {
    return <div className="text-center p-12 text-gray-400 text-sm">No analytics records available.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">{t(lang, 'analytics')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Detailed sales projections, profit trends, category splits, and best seller indices.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* 1. Daily Sales & Profits Trend */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
            <TrendingUp size={18} className="text-primary-500" /> Sales & Net Profit Trends (Last 7 Days)
          </h3>
          <div className="w-full h-80 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={value => [`₹${value}`, 'Amount']} labelStyle={{ color: '#1e293b' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Sales Revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Expense Category Splits */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
            <PieIcon size={18} className="text-red-500" /> Expense Category Splits
          </h3>
          <div className="w-full h-80 flex items-center justify-center text-xs">
            {data.expenseChartData.length === 0 ? (
              <p className="text-center text-gray-400">No expenses logged yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.expenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => `₹${v}`} />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. Top-selling products */}
        <div className="lg:col-span-6 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Award size={18} className="text-yellow-500" /> Top-Selling Products (Units Sold)
          </h3>
          <div className="w-full h-80 text-xs">
            {data.bestSellingList.length === 0 ? (
              <p className="text-center text-gray-400 py-24">No products sold yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.bestSellingList} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                  <Tooltip />
                  <Bar dataKey="sales" name="Qty Sold" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 4. Category Stock Volume distribution */}
        <div className="lg:col-span-6 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
            <BarChart3 size={18} className="text-indigo-500" /> Category Inventory Shares (Volume)
          </h3>
          <div className="w-full h-80 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" name="Current Stock" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

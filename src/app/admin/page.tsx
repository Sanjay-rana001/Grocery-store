'use client';

import React, { useEffect, useMemo } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboard() {
  const { stats, orders, loadAllData, isLoading } = useAdminStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Last 5 orders
  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  if (isLoading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="material-symbols-outlined text-[48px] animate-spin text-secondary">
          progress_activity
        </span>
        <p className="font-semibold text-sm">Collating business analytics...</p>
      </div>
    );
  }

  // Helper for generating custom SVG points on line charts
  const revenuePoints = stats.dailyRevenue || [];
  const maxRev = Math.max(...revenuePoints.map(d => d.amount), 50) * 1.1;

  const svgPath = useMemo(() => {
    if (revenuePoints.length === 0) return '';
    const width = 500;
    const height = 180;
    const padding = 30;
    const activeW = width - padding * 2;
    const activeH = height - padding * 2;

    const points = revenuePoints.map((d, index) => {
      const x = padding + (index / (revenuePoints.length - 1)) * activeW;
      const y = padding + activeH - (d.amount / maxRev) * activeH;
      return { x, y };
    });

    // Generate standard line SVG path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    // Generate area-filled path for gradient below
    const areaPath = `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { line: path, area: areaPath, points };
  }, [revenuePoints, maxRev]);

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      growth: `+${stats.revenueGrowth}%`,
      desc: 'vs last month',
      icon: 'payments',
      color: 'bg-secondary-container/10 text-secondary'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      growth: `+${stats.ordersGrowth}%`,
      desc: 'vs last month',
      icon: 'shopping_basket',
      color: 'bg-primary-fixed/20 text-primary'
    },
    {
      title: 'Avg Basket Value',
      value: formatCurrency(stats.averageBasket),
      growth: `+${stats.basketGrowth}%`,
      desc: 'vs last month',
      icon: 'receipt_long',
      color: 'bg-tertiary-fixed/20 text-on-tertiary-fixed'
    },
    {
      title: 'Active Customers',
      value: stats.totalCustomers.toString(),
      growth: `+${stats.customersGrowth}%`,
      desc: 'vs last month',
      icon: 'group',
      color: 'bg-surface-container text-outline'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div 
            key={card.title} 
            className="bg-white rounded-[24px] p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/10 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-outline">{card.title}</p>
              <h3 className="font-display font-extrabold text-2xl text-primary mt-1.5">{card.value}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] font-black text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-full">
                  {card.growth}
                </span>
                <span className="text-[10px] text-outline font-semibold">{card.desc}</span>
              </div>
            </div>

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}>
              <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-primary">Revenue Pipeline</h3>
              <p className="text-xs text-outline font-medium">Daily transaction volumes over the last 7 days</p>
            </div>
            <span className="bg-secondary-container/10 border border-secondary-container/20 text-secondary text-[11px] font-bold px-3 py-1 rounded-full">
              Live Monitor
            </span>
          </div>

          {/* SVG Custom Line Chart */}
          {revenuePoints.length > 0 ? (
            <div className="relative w-full overflow-hidden">
              <svg viewBox="0 0 500 180" className="w-full h-auto overflow-visible">
                <defs>
                  {/* Under-curve fill gradient */}
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#006c49" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#006c49" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Grid Lines */}
                <line x1="30" y1="30" x2="470" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="75" x2="470" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="120" x2="470" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="150" x2="470" y2="150" stroke="#eff4ff" strokeWidth="1.5" />

                {/* Filled Area Gradient */}
                {svgPath && <path d={svgPath.area} fill="url(#chartGradient)" />}

                {/* Line path */}
                {svgPath && (
                  <path 
                    d={svgPath.line} 
                    fill="none" 
                    stroke="#006c49" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                )}

                {/* Point Dots */}
                {svgPath && svgPath.points.map((pt, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r="6.5" 
                      fill="#ffffff" 
                      stroke="#006c49" 
                      strokeWidth="2.5" 
                      className="transition-all duration-200 hover:scale-125"
                    />
                    <circle cx={pt.x} cy={pt.y} r="3" fill="#006c49" />
                  </g>
                ))}

                {/* X-axis labels */}
                {revenuePoints.map((d, index) => {
                  const x = 30 + (index / (revenuePoints.length - 1)) * 440;
                  return (
                    <text 
                      key={index} 
                      x={x} 
                      y="168" 
                      fill="#707974" 
                      fontSize="9" 
                      fontWeight="600" 
                      textAnchor="middle"
                    >
                      {d.date}
                    </text>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-outline text-xs">
              No revenue transactions recorded.
            </div>
          )}
        </div>

        {/* Category Sales Distribution Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-outline-variant/10">
          <h3 className="font-display font-bold text-base sm:text-lg text-primary mb-1">Category Distribution</h3>
          <p className="text-xs text-outline font-medium mb-6">Gross product category splits</p>

          <div className="space-y-4">
            {stats.categorySales.map((cat) => {
              const totalCatRev = stats.categorySales.reduce((sum, c) => sum + c.amount, 0) || 1;
              const percent = Math.round((cat.amount / totalCatRev) * 100);

              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-primary">
                    <span className="capitalize">{cat.category}</span>
                    <span>{formatCurrency(cat.amount)} ({percent}%)</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Ledger Card */}
      <div className="bg-white rounded-[32px] p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-outline-variant/10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-primary">Recent Orders Ledger</h3>
            <p className="text-xs text-outline font-medium">Verify incoming sales and customer shipments</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-secondary hover:underline cursor-pointer flex items-center gap-1 bg-surface-container-low px-4 py-2 rounded-xl"
          >
            <span>Inspect All</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-outline text-xs">
            No customer orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/10">
            <table className="w-full text-left text-xs font-semibold text-primary border-collapse">
              <thead>
                <tr className="bg-surface-container-low/60 text-outline border-b border-outline-variant/10">
                  <th className="p-4 font-bold">Order ID</th>
                  <th className="p-4 font-bold">Customer Name</th>
                  <th className="p-4 font-bold">Placed Date</th>
                  <th className="p-4 font-bold">Total Items</th>
                  <th className="p-4 font-bold">Revenue</th>
                  <th className="p-4 font-bold">Shipping Status</th>
                  <th className="p-4 font-bold">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {recentOrders.map((order) => {
                  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <tr key={order.id} className="hover:bg-surface-container-low/20 transition-colors">
                      <td className="p-4 font-bold font-mono text-secondary">{order.id}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-bold">{order.userName}</p>
                          <p className="text-[10px] text-outline truncate max-w-[140px] font-medium">{order.userEmail}</p>
                        </div>
                      </td>
                      <td className="p-4 text-outline font-medium">{formatDate(order.createdAt)}</td>
                      <td className="p-4 font-bold text-center sm:text-left">{itemsCount} units</td>
                      <td className="p-4 font-bold text-secondary-fixed-variant">{formatCurrency(order.total)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border ${
                          order.status === 'delivered' 
                            ? 'bg-secondary-container/10 border-secondary-container/30 text-secondary' 
                            : order.status === 'shipping' 
                              ? 'bg-primary-fixed/20 border-primary-fixed/30 text-primary'
                              : order.status === 'packing'
                                ? 'bg-amber-100 border-amber-200 text-amber-800'
                                : 'bg-surface-container border-outline-variant/20 text-outline'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center text-[10px] font-bold ${
                          order.paymentStatus === 'paid' ? 'text-secondary' : 'text-error'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

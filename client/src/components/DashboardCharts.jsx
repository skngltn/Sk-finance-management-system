import { useState } from 'react';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  CreditCard,
  Plus,
  RotateCcw,
  Users,
  Calendar,
  ChevronDown,
} from 'lucide-react';

export function DashboardCharts({ onOpenNewEntryModal }) {
  const [timeframe, setTimeframe] = useState('Monthly');
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredPie, setHoveredPie] = useState(null);

  // Bar chart data (Jan - Sep)
  const barData = [
    { month: 'Jan', sales: 24, payments: 18, salesVal: '$24,000', payVal: '$18,000' },
    { month: 'Feb', sales: 32, payments: 28, salesVal: '$32,000', payVal: '$28,000' },
    { month: 'Mar', sales: 48, payments: 36, salesVal: '$48,000', payVal: '$36,000' },
    { month: 'Apr', sales: 62, payments: 50, salesVal: '$62,000', payVal: '$50,000' },
    { month: 'May', sales: 74, payments: 60, salesVal: '$74,000', payVal: '$60,000' },
    { month: 'Jun', sales: 88, payments: 72, salesVal: '$88,000', payVal: '$72,000' },
    { month: 'Jul', sales: 104, payments: 86, salesVal: '$104,000', payVal: '$86,000' },
    { month: 'Aug', sales: 96, payments: 78, salesVal: '$96,000', payVal: '$78,000' },
    { month: 'Sep', sales: 90, payments: 80, salesVal: '$90,000', payVal: '$80,000' },
  ];

  // Pie chart segments
  // Circumference = 2 * PI * 40 = 251.32
  // Total = 248 invoices
  const pieSegments = [
    { label: 'Paid', count: 152, pct: 61, color: '#059669', offset: 0, length: 153 },
    { label: 'Pending', count: 48, pct: 19, color: '#F59E0B', offset: -155, length: 48 },
    { label: 'Overdue', count: 32, pct: 13, color: '#EF4444', offset: -205, length: 33 },
    { label: 'Partially Paid', count: 16, pct: 7, color: '#94A3B8', offset: -240, length: 17 },
  ];

  // Top Customers
  const topCustomers = [
    { id: 1, name: 'ABC Industries', amount: '$348,500' },
    { id: 2, name: 'XYZ Pvt Ltd', amount: '$284,000' },
    { id: 3, name: 'Global Traders', amount: '$192,300' },
    { id: 4, name: 'CleanRide Solutions', amount: '$124,000' },
    { id: 5, name: 'Metro Automobiles', amount: '$98,500' },
  ];

  // Recent Activity
  const recentActivities = [
    {
      id: 1,
      title: 'Payment received',
      desc: '$25,000 from ABC Industries',
      time: '2 hours ago',
      icon: CreditCard,
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      id: 2,
      title: 'Invoice created',
      desc: 'INV-1024 for XYZ Pvt Ltd',
      time: '5 hours ago',
      icon: FileText,
      color: '#2563EB',
      bg: '#EFF6FF',
    },
    {
      id: 3,
      title: 'Credit entry posted',
      desc: 'CE-0042 for Global Traders',
      time: '1 day ago',
      icon: RotateCcw,
      color: '#7C3AED',
      bg: '#F5F3FF',
    },
    {
      id: 4,
      title: 'New customer added',
      desc: 'Auto Care Services',
      time: '1 day ago',
      icon: Users,
      color: '#0D9488',
      bg: '#F0FDFA',
    },
  ];

  return (
    <div className="erp-charts-super-container">
      {/* ROW 1: Sales Bar Chart (60%) + Invoice Donut Pie Chart (40%) + Quick Actions */}
      <div className="erp-charts-row-top">
        {/* Card 1: Sales Overview Bar Graph */}
        <div className="erp-chart-card sales-overview-card">
          <div className="chart-card-header">
            <div className="chart-card-title-group">
              <h3 className="chart-card-title">Sales Overview</h3>
              <span className="chart-card-subtitle">Revenue vs Payments comparison</span>
            </div>
            <div className="chart-time-select-wrap">
              <select
                className="chart-time-select"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="sales-chart-wrapper">
            <div className="sales-y-axis">
              <span>80k</span>
              <span>60k</span>
              <span>40k</span>
              <span>20k</span>
              <span>0</span>
            </div>

            <div className="sales-bars-area">
              <svg
                viewBox="0 0 540 160"
                className="sales-bar-svg"
                preserveAspectRatio="none"
              >
                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="540" y2="20" stroke="#F1F5F9" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="540" y2="60" stroke="#F1F5F9" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="540" y2="100" stroke="#F1F5F9" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="540" y2="140" stroke="#E2E8F0" />

                {barData.map((item, idx) => {
                  const xBase = 20 + idx * 58;
                  const salesHeight = (item.sales / 120) * 125;
                  const payHeight = (item.payments / 120) * 125;
                  const isHovered = hoveredBar === idx;

                  return (
                    <g
                      key={item.month}
                      className="bar-group"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Sales Bar (Emerald Green) */}
                      <rect
                        x={xBase}
                        y={140 - salesHeight}
                        width="14"
                        height={salesHeight}
                        rx="4"
                        fill={isHovered ? '#047857' : '#059669'}
                        className="sales-bar"
                      />
                      {/* Payments Bar (Soft Mint/Teal) */}
                      <rect
                        x={xBase + 16}
                        y={140 - payHeight}
                        width="14"
                        height={payHeight}
                        rx="4"
                        fill={isHovered ? '#6EE7B7' : '#A7F3D0'}
                        className="pay-bar"
                      />

                      {/* Month Label */}
                      <text
                        x={xBase + 15}
                        y="156"
                        textAnchor="middle"
                        fontSize="11"
                        fill={isHovered ? '#111827' : '#6B7280'}
                        fontWeight={isHovered ? '700' : '500'}
                      >
                        {item.month}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Interactive Bar Tooltip */}
              {hoveredBar !== null && (
                <div
                  className="sales-bar-floating-tooltip"
                  style={{ left: `${30 + hoveredBar * 10.5}%` }}
                >
                  <div className="tooltip-title">{barData[hoveredBar].month} Performance</div>
                  <div className="tooltip-row green">
                    <span className="dot" /> Sales: {barData[hoveredBar].salesVal}
                  </div>
                  <div className="tooltip-row teal">
                    <span className="dot" /> Payments: {barData[hoveredBar].payVal}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="chart-legend-row">
            <div className="chart-legend-item">
              <span className="legend-indicator-dot" style={{ background: '#059669' }} />
              <span>Sales</span>
            </div>
            <div className="chart-legend-item">
              <span className="legend-indicator-dot" style={{ background: '#A7F3D0' }} />
              <span>Payments</span>
            </div>
          </div>
        </div>

        {/* Card 2: Invoice Status Circle / Donut Pie Chart */}
        <div className="erp-chart-card invoice-donut-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">Invoice Status</h3>
              <span className="chart-card-subtitle">Distribution breakdown</span>
            </div>
          </div>

          <div className="donut-chart-flex-wrap">
            {/* SVG Donut Ring with Circle Styles */}
            <div className="donut-svg-container">
              <svg viewBox="0 0 100 100" className="donut-svg-element">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F3F4F6"
                  strokeWidth="11"
                />

                {/* Slices */}
                {pieSegments.map((seg, idx) => (
                  <circle
                    key={seg.label}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={hoveredPie === idx ? '13' : '11'}
                    strokeDasharray={`${seg.length} 252`}
                    strokeDashoffset={seg.offset}
                    className="donut-segment"
                    onMouseEnter={() => setHoveredPie(idx)}
                    onMouseLeave={() => setHoveredPie(null)}
                    style={{
                      transition: 'all 0.25s ease',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </svg>

              {/* Center Counter */}
              <div className="donut-center-badge">
                <span className="donut-center-number">248</span>
                <span className="donut-center-label">Total Invoices</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="donut-legend-column">
              {pieSegments.map((seg, idx) => (
                <div
                  key={seg.label}
                  className={`donut-legend-entry ${hoveredPie === idx ? 'highlight' : ''}`}
                  onMouseEnter={() => setHoveredPie(idx)}
                  onMouseLeave={() => setHoveredPie(null)}
                >
                  <div className="entry-left">
                    <span
                      className="legend-circle-bullet"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="legend-name-text">{seg.label}</span>
                  </div>
                  <div className="entry-right">
                    <span className="legend-count-text">{seg.count}</span>
                    <span className="legend-pct-text">({seg.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Quick Actions */}
        <div className="erp-chart-card quick-actions-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">Quick Actions</h3>
              <span className="chart-card-subtitle">Common operations</span>
            </div>
          </div>

          <div className="quick-actions-list">
            <button className="quick-action-row-btn" onClick={onOpenNewEntryModal}>
              <div className="qa-icon-wrap green">
                <Plus size={14} />
              </div>
              <span>Create Estimate</span>
            </button>
            <button className="quick-action-row-btn" onClick={onOpenNewEntryModal}>
              <div className="qa-icon-wrap teal">
                <FileText size={14} />
              </div>
              <span>Create Quotation</span>
            </button>
            <button className="quick-action-row-btn" onClick={onOpenNewEntryModal}>
              <div className="qa-icon-wrap blue">
                <Plus size={14} />
              </div>
              <span>Create Invoice</span>
            </button>
            <button className="quick-action-row-btn" onClick={onOpenNewEntryModal}>
              <div className="qa-icon-wrap emerald">
                <CreditCard size={14} />
              </div>
              <span>Record Payment</span>
            </button>
            <button className="quick-action-row-btn" onClick={onOpenNewEntryModal}>
              <div className="qa-icon-wrap purple">
                <RotateCcw size={14} />
              </div>
              <span>Credit Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2: Outstanding Receivables + Top Customers + Recent Activity */}
      <div className="erp-charts-row-bottom">
        {/* Outstanding Receivables */}
        <div className="erp-sub-widget-card">
          <div className="widget-header-row">
            <h4 className="widget-title">Outstanding Receivables</h4>
            <span className="widget-link-action">View All</span>
          </div>

          <div className="receivables-list">
            <div className="receivable-item">
              <div className="item-left">
                <div className="circle-status-icon red">
                  <Clock size={16} />
                </div>
                <span className="item-label">Overdue</span>
              </div>
              <div className="item-right">
                <span className="item-amount red">$84,500</span>
                <span className="item-invoices">12 invoices</span>
              </div>
            </div>

            <div className="receivable-item">
              <div className="item-left">
                <div className="circle-status-icon amber">
                  <AlertCircle size={16} />
                </div>
                <span className="item-label">Due This Month</span>
              </div>
              <div className="item-right">
                <span className="item-amount amber">$124,000</span>
                <span className="item-invoices">18 invoices</span>
              </div>
            </div>

            <div className="receivable-item">
              <div className="item-left">
                <div className="circle-status-icon green">
                  <CheckCircle2 size={16} />
                </div>
                <span className="item-label">Not Due</span>
              </div>
              <div className="item-right">
                <span className="item-amount green">$116,000</span>
                <span className="item-invoices">26 invoices</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Customers by Sales */}
        <div className="erp-sub-widget-card">
          <div className="widget-header-row">
            <h4 className="widget-title">Top Customers by Sales</h4>
            <span className="widget-link-action">View All</span>
          </div>

          <div className="top-customers-list">
            {topCustomers.map((cust) => (
              <div key={cust.id} className="top-customer-row">
                <div className="customer-rank-wrap">
                  <span className="rank-circle">{cust.id}</span>
                  <span className="customer-title">{cust.name}</span>
                </div>
                <span className="customer-total-val">{cust.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="erp-sub-widget-card">
          <div className="widget-header-row">
            <h4 className="widget-title">Recent Activity</h4>
            <span className="widget-link-action">View All</span>
          </div>

          <div className="recent-activities-list">
            {recentActivities.map((act) => {
              const IconComp = act.icon;
              return (
                <div key={act.id} className="recent-act-item">
                  <div className="act-icon-circle" style={{ background: act.bg, color: act.color }}>
                    <IconComp size={15} />
                  </div>
                  <div className="act-details">
                    <span className="act-main-title">{act.title}</span>
                    <span className="act-sub-desc">{act.desc}</span>
                  </div>
                  <span className="act-time-ago">{act.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample financial data for initial overview
  const transactions = [
    { id: 'TX-1094', client: 'Apex Logistics Inc.', type: 'Invoice', date: 'Today, 2:15 PM', amount: '$4,250.00', status: 'paid' },
    { id: 'TX-1093', client: 'Metro Auto Detailing', type: 'Credit Note', date: 'Yesterday', amount: '$1,820.00', status: 'pending' },
    { id: 'TX-1092', client: 'Horizon Retailers', type: 'Invoice', date: 'Sep 15, 2026', amount: '$6,400.00', status: 'paid' },
    { id: 'TX-1091', client: 'Quantum Cloud Ltd', type: 'Estimate', date: 'Sep 14, 2026', amount: '$3,100.00', status: 'pending' },
    { id: 'TX-1090', client: 'Prime Freight Services', type: 'Invoice', date: 'Sep 12, 2026', amount: '$2,750.00', status: 'overdue' },
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loader-screen">
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></span>
        <p>Loading SK Finance workspace...</p>
      </div>
    );
  }

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo-box">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="navbar-brand-name">SK Finance</span>
          <span className="navbar-brand-tag">Enterprise</span>
        </div>

        <div className="navbar-actions">
          <div className="user-badge">
            <span className="user-avatar">{userInitial}</span>
            <span>{user?.email}</span>
          </div>

          <button onClick={handleLogout} className="btn btn-danger-outline">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="dashboard-container">
        {/* Hero Welcome */}
        <div className="dashboard-hero">
          <div>
            <h1 className="dashboard-heading">Finance Overview</h1>
            <p className="dashboard-subtitle">
              Real-time cash flow, accounts receivable, and customer credit ledger.
            </p>
          </div>

          <div className="hero-btn-group">
            <button className="btn btn-secondary">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
            <button className="btn btn-primary" style={{ width: 'auto' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Transaction
            </button>
          </div>
        </div>

        {/* 4 Key Metrics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Total Revenue</span>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="stat-value">$148,250.00</div>
            <span className="stat-change positive">↑ +12.4% vs last month</span>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Outstanding Credit</span>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <div className="stat-value">$24,800.00</div>
            <span className="stat-change warning">⚠ 3 accounts pending</span>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Net Cash Flow</span>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="stat-value">+$84,620.00</div>
            <span className="stat-change positive">↑ +8.2% positive growth</span>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Active Invoices</span>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="stat-value">18 Active</div>
            <span className="stat-change neutral">6 pending approvals</span>
          </div>
        </div>

        {/* Ledger & Recent Activity Table */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Recent Transactions & Ledger Activity</h2>
            <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
              View All Ledgers
            </button>
          </div>

          <div className="table-responsive">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Client / Account</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tx.id}</td>
                    <td>{tx.client}</td>
                    <td>{tx.type}</td>
                    <td>{tx.date}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{tx.amount}</td>
                    <td>
                      <span className={`status-pill ${tx.status}`}>
                        ● {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
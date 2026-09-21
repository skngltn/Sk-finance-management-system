import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  MoreHorizontal,
  Check,
  BookOpen,
  CreditCard,
  FileText,
  TrendingUp,
  Settings,
  Sparkles,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Plus,
  CalendarDays,
} from 'lucide-react';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import NewEntryModal from '../components/NewEntryModal';
import MainMenuPage from './MainMenuPage';
import SubMenuPage from './SubMenuPage';
import PermissionPage from './PermissionPage';
import NewEstimatePage from './NewEstimatePage';

const iconMap = {
  BookOpen,
  CreditCard,
  FileText,
  TrendingUp,
  Settings,
  MoreHorizontal
};

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Main Menu & Sub Menu state
  const [expandedMenus, setExpandedMenus] = useState({});
  const [activeSubMenu, setActiveSubMenu] = useState('');
  const [menuStructure, setMenuStructure] = useState([]);

  useEffect(() => {
    const fetchMenuStructure = async () => {
      const { data: mainData, error: mainError } = await supabase.from('mainmenu').select('*').order('sort_order', { ascending: true });
      if (mainError) {
        console.error('Error fetching mainmenu:', mainError);
        return;
      }

      const { data: subData, error: subError } = await supabase.from('submenu').select('*').order('sort_by', { ascending: true });
      if (subError) {
        console.error('Error fetching submenu:', subError);
        return;
      }

      const dynamicMenu = (mainData || []).map((main) => {
        const subMenusForMain = (subData || [])
          .filter((sub) => sub.menu_id === main.id)
          .map((sub) => ({
            id: sub.id,
            label: sub.submenu_name,
            tab: sub.path ? sub.path.split('/').filter(Boolean).pop().toLowerCase() : 'all'
          }));

        const IconComp = iconMap[main.icon] || BookOpen;

        return {
          id: main.id,
          label: main.menu_name,
          icon: IconComp,
          path: main.path ? main.path.split('/').filter(Boolean).pop().toLowerCase() : 'all',
          subMenus: subMenusForMain,
        };
      });

      setMenuStructure(dynamicMenu);

      const initialExpanded = {};
      dynamicMenu.forEach(m => {
        initialExpanded[m.id] = true;
      });
      setExpandedMenus(prev => Object.keys(prev).length > 0 ? prev : initialExpanded);
      setActiveSubMenu(prev => prev || (dynamicMenu[0]?.subMenus[0]?.id || ''));
      setActiveTab(prev => (prev === 'all' && dynamicMenu[0]?.subMenus[0]?.tab) ? dynamicMenu[0].subMenus[0].tab : prev);
    };

    fetchMenuStructure();
  }, []);

  const toggleMainMenu = (menuId) => {
    const menu = menuStructure.find((m) => m.id === menuId);
    // If the main menu has no submenus, clicking it should navigate directly
    if (menu && menu.subMenus.length === 0) {
      setActiveSubMenu(menu.id);
      setActiveTab(menu.path);
      if (isSidebarCollapsed) setIsSidebarCollapsed(false);
      return;
    }

    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setExpandedMenus((prev) => ({ ...prev, [menuId]: true }));
      return;
    }
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleSelectSubMenu = (menuId, sub) => {
    setActiveSubMenu(sub.id);
    setActiveTab(sub.tab);
  };

  // New entry form state
  const [newCustomer, setNewCustomer] = useState('');
  const [newType, setNewType] = useState('Customer Ledger');
  const [newAmount, setNewAmount] = useState('');

  // Financial ledger, credit entries, and estimates
  const [entries, setEntries] = useState([
    {
      id: 1,
      customer: 'Apex Logistics Inc.',
      type: 'Customer Ledger',
      typeClass: 'pill-cyan-bg pill-cyan-text',
      date: 'Today, 2:15 PM',
      amount: '$4,250.00',
      settled: false,
    },
    {
      id: 2,
      customer: 'Metro Auto Detailing',
      type: 'Credit Entry',
      typeClass: 'pill-purple-bg pill-purple-text',
      date: 'Yesterday, 5:40 PM',
      amount: '$1,820.00',
      settled: false,
    },
    {
      id: 3,
      customer: 'Quantum Cloud Ltd',
      type: 'Estimate',
      typeClass: 'pill-coral-bg pill-coral-text',
      date: 'Sep 17, 2026',
      amount: '$3,100.00',
      settled: false,
    },
    {
      id: 4,
      customer: 'Horizon Retailers',
      type: 'Customer Ledger',
      typeClass: 'pill-cyan-bg pill-cyan-text',
      date: 'Sep 15, 2026',
      amount: '$6,400.00',
      settled: true,
    },
    {
      id: 5,
      customer: 'Prime Freight Services',
      type: 'Credit Entry',
      typeClass: 'pill-purple-bg pill-purple-text',
      date: 'Sep 14, 2026',
      amount: '$2,750.00',
      settled: false,
    },
  ]);

  // Upcoming settlement milestones
  const upcomingMilestones = [
    {
      id: 'm1',
      client: 'Apex Logistics Inc.',
      amount: '$4,250.00',
      due: 'Due in 2 days (Sep 20)',
      badge: 'Credit Due',
      badgeClass: 'pill-coral-bg pill-coral-text',
      icon: Clock,
    },
    {
      id: 'm2',
      client: 'Metro Auto Detailing',
      amount: '$1,820.00',
      due: 'Sep 22, 2026',
      badge: 'Estimate Review',
      badgeClass: 'pill-cyan-bg pill-cyan-text',
      icon: FileText,
    },
    {
      id: 'm3',
      client: 'Horizon Retailers',
      amount: '$6,400.00',
      due: 'Sep 25, 2026',
      badge: 'Settled Check',
      badgeClass: 'pill-green-bg pill-green-text',
      icon: CheckCircle2,
    },
    {
      id: 'm4',
      client: 'Quantum Cloud Ltd',
      amount: '$3,100.00',
      due: 'Sep 28, 2026',
      badge: 'Estimate Approval',
      badgeClass: 'pill-purple-bg pill-purple-text',
      icon: ArrowUpRight,
    },
  ];

  useEffect(() => {
    const fetchUserProfile = async (sessionUser) => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, full_name, role')
          .eq('id', sessionUser.id)
          .maybeSingle();

        setUser({
          ...sessionUser,
          profile: profile || null,
        });
      } catch (err) {
        console.warn('Could not fetch user profile:', err);
        setUser(sessionUser);
      }
    };

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchUserProfile(session.user);
          setLoading(false);
          return;
        }

        const demoUser = localStorage.getItem('sk_demo_user');
        if (demoUser) {
          setUser(JSON.parse(demoUser));
          setLoading(false);
          return;
        }

        navigate('/login');
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await fetchUserProfile(session.user);
      } else {
        const demoUser = localStorage.getItem('sk_demo_user');
        if (demoUser) {
          setUser(JSON.parse(demoUser));
        } else {
          navigate('/login');
        }
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem('sk_demo_user');
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleSettle = (id) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, settled: !e.settled } : e))
    );
  };

  const handleCreateEntry = (e) => {
    e.preventDefault();
    if (!newCustomer.trim() || !newAmount.trim()) return;

    let typeClass = 'pill-cyan-bg pill-cyan-text';
    if (newType === 'Credit Entry') typeClass = 'pill-purple-bg pill-purple-text';
    if (newType === 'Estimate') typeClass = 'pill-coral-bg pill-coral-text';

    const formattedAmount = newAmount.startsWith('$') ? newAmount : `$${newAmount}`;

    const newEntry = {
      id: Date.now(),
      customer: newCustomer.trim(),
      type: newType,
      typeClass,
      date: 'Just now',
      amount: formattedAmount,
      settled: false,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setNewCustomer('');
    setNewAmount('');
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="loader-screen-cream">
        <div className="spinner-cream" />
        <p>Loading SK Finance workspace...</p>
      </div>
    );
  }

  const profile = user?.profile;
  const rawEmail = profile?.email || user?.email || 'sara.connor@gmail.com';
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (rawEmail.includes('@') ? rawEmail.split('@')[0] : rawEmail);
  const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const userRole = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : 'Finance Admin';

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Filter entries based on search query and active tab
  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.type.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'ledger') return e.type === 'Customer Ledger';
    if (activeTab === 'credit') return e.type === 'Credit Entry';
    if (activeTab === 'estimate') return e.type === 'Estimate';
    if (activeTab === 'settled') return e.settled === true;
    return true;
  });

  return (
    <div className="app-root-shell">
      {/* 1. Global Header Component */}
      <Header
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewEntryModal={() => setIsModalOpen(true)}
        onOpenNewEstimate={() => setActiveTab('new-estimate')}
        formattedName={formattedName}
        userRole={userRole}
      />

      {/* 2. Main Layout Area */}
      <div className="app-main-layout">
        {/* Sidebar Component with Main & Sub Menus */}
        <Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          expandedMenus={expandedMenus}
          onToggleMainMenu={toggleMainMenu}
          activeSubMenu={activeSubMenu}
          onSelectSubMenu={handleSelectSubMenu}
          menuStructure={menuStructure}
          onLogout={handleLogout}
        />

        {/* Enhanced Dashboard Workspace */}
        <main className="dashboard-workspace-scroll">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'new-estimate' ? (
              <NewEstimatePage
                onBack={() => setActiveTab('all')}
                onEstimateSaved={(newEst) => {
                  setEntries((prev) => [newEst, ...prev]);
                  setActiveTab('all');
                }}
              />
            ) : activeTab.includes('mainmenu') ? (
              <MainMenuPage />
            ) : activeTab.includes('submenu') ? (
              <SubMenuPage />
            ) : activeTab.includes('permission') ? (
              <PermissionPage />
            ) : (
              <>
                {/* Greeting Hero Bar */}
                <div className="workspace-hero-row">
                  <div>
                    <h1 className="workspace-greeting-title">Hello, {formattedName}</h1>
                    <p className="workspace-greeting-date">Today is {todayDateString}</p>
                  </div>

                  <div className="workspace-quick-stats-strip">
                    <div className="quick-pill-stat">
                      <ShieldCheck size={14} color="#5DBDB9" />
                      <span>Recovery Rate: <strong>94.2%</strong></span>
                    </div>
                    <div className="quick-pill-stat">
                      <Clock size={14} color="#FA6E50" />
                      <span>Pending Settled: <strong>{entries.filter((e) => !e.settled).length} Accounts</strong></span>
                    </div>
                    <div className="quick-pill-stat">
                      <TrendingUp size={14} color="#4B2850" />
                      <span>Net Cashflow: <strong>+$84,620.00</strong></span>
                    </div>
                  </div>
                </div>

                {/* 3 Signature Hero Cards (Plum, Mint Teal, Coral) */}
                <div className="hero-financial-cards-grid">
                  {/* Card 1: Plum - Customer Ledger */}
                  <div
                    className="hero-fin-card card-plum"
                    onClick={() => setActiveTab('ledger')}
                  >
                    <div className="card-top-icon-row">
                      <div className="card-round-icon-badge">
                        <BookOpen size={18} />
                      </div>
                      <button className="card-action-menu-btn" aria-label="More options">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                    <div>
                      <h3 className="card-headline-title">Customer Ledger</h3>
                      <div className="card-detail-subtext">
                        <span>$148,250.00</span>
                        <span>•</span>
                        <span>65% reconciled</span>
                      </div>
                      <div className="card-progress-bar-track">
                        <div className="card-progress-bar-fill" style={{ width: '65%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Mint Teal - Credit Entry & Disbursal */}
                  <div
                    className="hero-fin-card card-teal"
                    onClick={() => setActiveTab('credit')}
                  >
                    <div className="card-top-icon-row">
                      <div className="card-round-icon-badge">
                        <CreditCard size={18} />
                      </div>
                      <button className="card-action-menu-btn" aria-label="More options">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                    <div>
                      <h3 className="card-headline-title">Credit Entry</h3>
                      <div className="card-detail-subtext">
                        <span>$42,800.00</span>
                        <span>•</span>
                        <span>48% disbursed</span>
                      </div>
                      <div className="card-progress-bar-track">
                        <div className="card-progress-bar-fill" style={{ width: '48%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Coral - Estimates & Quotes */}
                  <div
                    className="hero-fin-card card-coral"
                    onClick={() => setActiveTab('estimate')}
                  >
                    <div className="card-top-icon-row">
                      <div className="card-round-icon-badge">
                        <FileText size={18} />
                      </div>
                      <button
                        className="card-action-menu-btn"
                        aria-label="Create New Estimate"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('new-estimate');
                        }}
                        title="Create New Estimate"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div>
                      <h3 className="card-headline-title">Active Estimates</h3>
                      <div className="card-detail-subtext">
                        <span>$86,400.00</span>
                        <span>•</span>
                        <span>75% converted</span>
                      </div>
                      <div className="card-progress-bar-track">
                        <div className="card-progress-bar-fill" style={{ width: '75%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Composite Financial Dashboard Grid */}
                <div className="dashboard-composite-grid">
                  {/* Left Section: Filter Tabs & Recent Entries */}
                  <div>
                    <div className="composite-header-row">
                      <h2 className="composite-title-text">Recent Ledger & Credit Records</h2>
                      <div className="composite-filter-tabs">
                        <button
                          className={`composite-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                          onClick={() => setActiveTab('all')}
                        >
                          All ({entries.length})
                        </button>
                        <button
                          className={`composite-tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
                          onClick={() => setActiveTab('ledger')}
                        >
                          Ledgers
                        </button>
                        <button
                          className={`composite-tab-btn ${activeTab === 'credit' ? 'active' : ''}`}
                          onClick={() => setActiveTab('credit')}
                        >
                          Credit
                        </button>
                        <button
                          className={`composite-tab-btn ${activeTab === 'estimate' ? 'active' : ''}`}
                          onClick={() => setActiveTab('estimate')}
                        >
                          Estimates
                        </button>
                        <button
                          className={`composite-tab-btn ${activeTab === 'settled' ? 'active' : ''}`}
                          onClick={() => setActiveTab('settled')}
                        >
                          Settled
                        </button>
                      </div>
                    </div>

                    <div className="financial-entries-container">
                      {filteredEntries.map((entry) => (
                        <div key={entry.id} className="fin-entry-row-card">
                          <div className="fin-entry-info">
                            <div className="fin-entry-pills-row">
                              <span className={`fin-type-pill ${entry.typeClass}`}>
                                {entry.type}
                              </span>
                              <span className="fin-date-label">{entry.date}</span>
                            </div>
                            <div className="fin-customer-headline">
                              <span
                                style={{
                                  textDecoration: entry.settled ? 'line-through' : 'none',
                                  opacity: entry.settled ? 0.6 : 1,
                                }}
                              >
                                {entry.customer}
                              </span>
                              <span className="fin-entry-amount">{entry.amount}</span>
                            </div>
                          </div>

                          <button
                            className={`btn-toggle-reconcile ${entry.settled ? 'settled' : ''}`}
                            onClick={() => toggleSettle(entry.id)}
                            title={entry.settled ? 'Mark Unsettled' : 'Mark Reconciled'}
                          >
                            <Check size={16} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Section: Credit Aging, Milestones, and Multi-Bank Sync */}
                  <div className="fin-analytics-side-col">
                    {/* Credit Aging & Settlement Health */}
                    <div className="aging-health-card">
                      <div className="card-mini-title">
                        <span>Credit Aging & Exposure</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Real-time</span>
                      </div>

                      <div className="aging-segments-bar">
                        <div className="aging-seg-current" title="Current (0-30 Days): 62%" />
                        <div className="aging-seg-30days" title="31-60 Days: 24%" />
                        <div className="aging-seg-overdue" title="60+ Days Overdue: 14%" />
                      </div>

                      <div className="aging-legend-row">
                        <div className="aging-legend-item">
                          <span className="aging-legend-header">
                            <span className="aging-legend-dot" style={{ background: 'var(--teal-primary)' }} />
                            <span>Current</span>
                          </span>
                          <span className="aging-legend-value">$91,915</span>
                        </div>

                        <div className="aging-legend-item">
                          <span className="aging-legend-header">
                            <span className="aging-legend-dot" style={{ background: 'var(--plum-primary)' }} />
                            <span>30-60d</span>
                          </span>
                          <span className="aging-legend-value">$35,580</span>
                        </div>

                        <div className="aging-legend-item">
                          <span className="aging-legend-header">
                            <span className="aging-legend-dot" style={{ background: 'var(--coral-primary)' }} />
                            <span>Overdue</span>
                          </span>
                          <span className="aging-legend-value">$20,755</span>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Settlement Milestones */}
                    <div className="settlement-milestones-card">
                      <div className="card-mini-title">
                        <span>Settlement Milestones</span>
                        <CalendarDays size={16} color="var(--text-muted)" />
                      </div>

                      <div className="milestones-list">
                        {upcomingMilestones.map((m) => {
                          const IconComp = m.icon;
                          return (
                            <div key={m.id} className="milestone-item">
                              <div className="milestone-left">
                                <div
                                  className="milestone-icon-box"
                                  style={{ background: 'rgba(235, 230, 220, 0.7)' }}
                                >
                                  <IconComp size={16} color="var(--text-primary)" />
                                </div>
                                <div className="milestone-text">
                                  <span className="milestone-client">{m.client}</span>
                                  <span className="milestone-date-due">{m.due}</span>
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 800, fontSize: 13 }}>{m.amount}</div>
                                <span className={`milestone-badge ${m.badgeClass}`}>
                                  {m.badge}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Multi-Bank Ledger Reconcile Card */}
                    <div className="pro-enterprise-card">
                      <div className="pro-enterprise-text">
                        <span className="pro-badge-tier">Instant Sync</span>
                        <h4 className="pro-enterprise-title">Multi-Bank Ledger Reconcile</h4>
                        <p className="pro-enterprise-desc">
                          Auto-match customer credit entries with live bank feeds in real-time.
                        </p>
                      </div>
                      <div className="pro-enterprise-icon-badge">
                        <Sparkles size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3. Simple Footer (Below Scroll) */}
          <Footer />
        </main>
      </div>

      {/* 4. New Entry Modal Component */}
      <NewEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        newType={newType}
        setNewType={setNewType}
        newAmount={newAmount}
        setNewAmount={setNewAmount}
        onSubmit={handleCreateEntry}
      />
    </div>
  );
}

export default Dashboard;
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
  Users,
} from 'lucide-react';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import NewEntryModal from '../components/NewEntryModal';
import MainMenuPage from './MainMenuPage';
import SubMenuPage from './SubMenuPage';
import PermissionPage from './PermissionPage';
import NewEstimatePage from './NewEstimatePage';
import EnterpriseTable from '../components/EnterpriseTable';
import { DashboardCharts } from '../components/DashboardCharts';

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

  // Financial ledger, credit entries, invoices, and estimates
  const [entries, setEntries] = useState([
    {
      id: 1,
      refNo: 'INV-1024',
      customer: 'ABC Industries',
      type: 'Invoice',
      description: 'Car Wash Service',
      typeClass: 'pill-cyan-bg pill-cyan-text',
      date: '21 Sep 2026',
      amount: '$48,500.00',
      settled: true,
      status: 'paid',
    },
    {
      id: 2,
      refNo: 'PAY-8891',
      customer: 'ABC Industries',
      type: 'Payment',
      description: 'Online Payment',
      typeClass: 'pill-purple-bg pill-purple-text',
      date: '20 Sep 2026',
      amount: '$25,000.00',
      settled: true,
      status: 'received',
    },
    {
      id: 3,
      refNo: 'CE-0042',
      customer: 'XYZ Pvt Ltd',
      type: 'Credit Entry',
      description: 'Sales Return',
      typeClass: 'pill-purple-bg pill-purple-text',
      date: '19 Sep 2026',
      amount: '$12,000.00',
      settled: true,
      status: 'posted',
    },
    {
      id: 4,
      refNo: 'EST-1028',
      customer: 'Global Traders',
      type: 'Estimate',
      description: 'Annual Maintenance',
      typeClass: 'pill-coral-bg pill-coral-text',
      date: '18 Sep 2026',
      amount: '$32,500.00',
      settled: false,
      status: 'pending',
    },
    {
      id: 5,
      refNo: 'INV-1023',
      customer: 'XYZ Pvt Ltd',
      type: 'Invoice',
      description: 'Full Car Detailing',
      typeClass: 'pill-cyan-bg pill-cyan-text',
      date: '17 Sep 2026',
      amount: '$18,750.00',
      settled: false,
      status: 'overdue',
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
      prev.map((e) => {
        if (e.id === id) {
          const nextSettled = !e.settled;
          return {
            ...e,
            settled: nextSettled,
            status: nextSettled ? 'paid' : 'pending',
          };
        }
        return e;
      })
    );
  };

  const handleUpdateEntry = (id, updatedFields) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e))
    );
  };

  const handleDeleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleCreateEntry = (e) => {
    e.preventDefault();
    if (!newCustomer.trim() || !newAmount.trim()) return;

    let typeClass = 'pill-cyan-bg pill-cyan-text';
    if (newType === 'Credit Entry') typeClass = 'pill-purple-bg pill-purple-text';
    if (newType === 'Estimate') typeClass = 'pill-coral-bg pill-coral-text';

    const formattedAmount = newAmount.startsWith('$') ? newAmount : `$${newAmount}`;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = newType === 'Credit Entry' ? 'CE-' : newType === 'Estimate' ? 'EST-' : 'INV-';

    const newEntry = {
      id: Date.now(),
      refNo: `${prefix}${randomNum}`,
      customer: newCustomer.trim(),
      type: newType,
      description: `${newType} Disbursal`,
      typeClass,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: formattedAmount,
      settled: false,
      status: 'pending',
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
                {/* 1. Greeting Hero Bar */}
                <div className="workspace-hero-row">
                  <div>
                    <h1 className="workspace-greeting-title">Good evening, {formattedName} 👋</h1>
                    <p className="workspace-greeting-date">Here's what's happening with your business today.</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div className="erp-date-range-badge">
                      <CalendarDays size={14} color="#6B7280" />
                      <span>{todayDateString}</span>
                    </div>
                    <button
                      className="btn-erp-new-entry"
                      onClick={() => setIsModalOpen(true)}
                    >
                      + New Entry
                    </button>
                  </div>
                </div>

                {/* 2. Sleek ERP Stat Cards with Decorative Circle Styles (Matching Reference Design) */}
                <div className="stonemart-stat-cards-grid">
                  {/* Card 1: Blue - Total Revenue */}
                  <div className="stonemart-stat-card theme-blue">
                    <div className="card-corner-circle circle-blue" />
                    <div className="card-squircle-icon icon-blue">
                      <TrendingUp size={20} color="#FFFFFF" />
                    </div>
                    <div className="card-metric-info">
                      <span className="card-metric-label">Total Revenue</span>
                      <h3 className="card-metric-value">$148,250</h3>
                      <span className="card-metric-subtext">↑ 14.8% vs last month</span>
                    </div>
                  </div>

                  {/* Card 2: Purple - Receivables */}
                  <div className="stonemart-stat-card theme-purple">
                    <div className="card-corner-circle circle-purple" />
                    <div className="card-squircle-icon icon-purple">
                      <CreditCard size={20} color="#FFFFFF" />
                    </div>
                    <div className="card-metric-info">
                      <span className="card-metric-label">Receivables</span>
                      <h3 className="card-metric-value">$32,450</h3>
                      <span className="card-metric-subtext">24 invoices pending</span>
                    </div>
                  </div>

                  {/* Card 3: Green - Payments Received */}
                  <div className="stonemart-stat-card theme-green">
                    <div className="card-corner-circle circle-green" />
                    <div className="card-squircle-icon icon-green">
                      <CheckCircle2 size={20} color="#FFFFFF" />
                    </div>
                    <div className="card-metric-info">
                      <span className="card-metric-label">Payments Received</span>
                      <h3 className="card-metric-value">$89,240</h3>
                      <span className="card-metric-subtext">↑ 12.1% vs last month</span>
                    </div>
                  </div>

                  {/* Card 4: Orange - Active Clients */}
                  <div className="stonemart-stat-card theme-orange">
                    <div className="card-corner-circle circle-orange" />
                    <div className="card-squircle-icon icon-orange">
                      <Users size={20} color="#FFFFFF" />
                    </div>
                    <div className="card-metric-info">
                      <span className="card-metric-label">Active Clients</span>
                      <h3 className="card-metric-value">1,284</h3>
                      <span className="card-metric-subtext">+18 new this month</span>
                    </div>
                  </div>

                  {/* Card 5: Teal - Customer Ledgers */}
                  <div className="stonemart-stat-card theme-teal">
                    <div className="card-corner-circle circle-teal" />
                    <div className="card-squircle-icon icon-teal">
                      <BookOpen size={20} color="#FFFFFF" />
                    </div>
                    <div className="card-metric-info">
                      <span className="card-metric-label">Customer Ledgers</span>
                      <h3 className="card-metric-value">342</h3>
                      <span className="card-metric-subtext">94.2% reconciled</span>
                    </div>
                  </div>
                </div>

                {/* 3. Interactive Charts & Widgets (Bar Graph, Donut Pie Circle Chart, Quick Actions, Receivables, Top Customers, Activity) */}
                <DashboardCharts onOpenNewEntryModal={() => setIsModalOpen(true)} />

                {/* 4. Full-Width Recent Transactions Table (Reference Design) */}
                <div className="dashboard-table-fullwidth">
                  <EnterpriseTable
                    entries={entries}
                    onToggleSettle={toggleSettle}
                    onDeleteEntry={handleDeleteEntry}
                    onUpdateEntry={handleUpdateEntry}
                    onOpenNewEntryModal={() => setIsModalOpen(true)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
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
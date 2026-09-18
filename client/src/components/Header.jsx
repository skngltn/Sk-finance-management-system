import { Menu, Search, Plus, Bell } from 'lucide-react';

function Header({
  isSidebarCollapsed,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onOpenNewEntryModal,
  formattedName = 'Sara',
}) {
  return (
    <header className="app-top-header">
      <div className="header-left-cluster">
        <button
          className="header-hamburger-button"
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? 'Expand Menu' : 'Collapse Menu'}
        >
          <Menu size={19} />
        </button>

        <div className="header-brand-logo">
          <div className="brand-dots-box">
            <span className="b-1" />
            <span className="b-2" />
            <span className="b-3" />
          </div>
          <span className="header-brand-title">SK Finance</span>
        </div>

        <span className="header-workspace-badge">Enterprise Workspace</span>
      </div>

      {/* Center Search Pill Bar */}
      <div className="header-center-search">
        <Search size={16} className="header-search-icon" />
        <input
          type="text"
          placeholder="Search customer ledger, credit entry, estimate..."
          className="header-search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Right Header Controls */}
      <div className="header-right-cluster">
        <button className="header-icon-btn" title="Notifications">
          <Bell size={17} />
          <span className="notif-unread-dot" />
        </button>

        <button
          className="btn-header-action"
          onClick={onOpenNewEntryModal}
        >
          <Plus size={16} />
          <span>New Credit Entry</span>
        </button>

        <div className="header-account-tag">
          <span className="header-user-name">{formattedName}</span>
          <span className="header-user-role">Finance Admin</span>
        </div>
      </div>
    </header>
  );
}

export default Header;

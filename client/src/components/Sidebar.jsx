import { LogOut, ChevronDown } from 'lucide-react';

function Sidebar({
  isSidebarCollapsed,
  expandedMenus,
  onToggleMainMenu,
  activeSubMenu,
  onSelectSubMenu,
  menuStructure = [],
  onLogout,
}) {
  return (
    <aside
      className={`app-collapsible-sidebar ${isSidebarCollapsed ? 'collapsed' : 'expanded'
        }`}
    >
      <nav className="sidebar-nav-group">
        {menuStructure.map((menu) => {
          const IconComp = menu.icon;
          const isExpanded = expandedMenus[menu.id];
          const isParentActive = menu.subMenus.some((sub) => sub.id === activeSubMenu);

          return (
            <div key={menu.id} className="sidebar-main-menu-item">
              <button
                className={`sidebar-main-btn ${isParentActive ? 'is-active-parent' : ''}`}
                onClick={() => onToggleMainMenu(menu.id)}
                title={menu.label}
              >
                <div className="sidebar-main-btn-left">
                  <span className="sidebar-btn-icon">
                    <IconComp size={18} />
                  </span>
                  {!isSidebarCollapsed && <span>{menu.label}</span>}
                </div>

                {!isSidebarCollapsed && (
                  <ChevronDown
                    size={15}
                    className={`sidebar-chevron-icon ${isExpanded ? 'is-open' : ''}`}
                  />
                )}
              </button>

              {/* Sub Menu Items */}
              {!isSidebarCollapsed && isExpanded && (
                <div className="sidebar-submenu-list">
                  {menu.subMenus.map((sub) => (
                    <button
                      key={sub.id}
                      className={`sidebar-submenu-btn ${activeSubMenu === sub.id ? 'active' : ''}`}
                      onClick={() => onSelectSubMenu(menu.id, sub)}
                    >
                      <span className="submenu-dot" />
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-bottom-actions">
        <button
          onClick={onLogout}
          className="btn-sidebar-signout"
          title="Sign Out"
        >
          <LogOut size={16} />
          {!isSidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

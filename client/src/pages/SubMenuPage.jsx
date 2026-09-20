import React, { useState, useEffect } from 'react';
import { Plus, Edit2, X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

function SubMenuPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  
  // Form State
  const [submenuName, setSubmenuName] = useState('');
  const [menuId, setMenuId] = useState('');
  const [path, setPath] = useState('');
  const [sortBy, setSortBy] = useState(0);

  const [subMenus, setSubMenus] = useState([]);
  const [mainMenus, setMainMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch main menus for the dropdown
    const { data: mainData, error: mainError } = await supabase.from('mainmenu').select('id, menu_name').order('sort_order', { ascending: true });
    if (mainError) console.error('Error fetching main menus:', mainError);
    else setMainMenus(mainData || []);

    // Fetch sub menus
    const { data: subData, error: subError } = await supabase.from('submenu').select(`
      *,
      mainmenu (
        menu_name
      )
    `).order('sort_by', { ascending: true });
    
    if (subError) console.error('Error fetching sub menus:', subError);
    else setSubMenus(subData || []);

    setLoading(false);
  };

  const openAddModal = () => {
    setEditingMenu(null);
    setSubmenuName('');
    setMenuId(mainMenus.length > 0 ? mainMenus[0].id : '');
    setPath('');
    setSortBy(0);
    setIsModalOpen(true);
  };

  const openEditModal = (menu) => {
    setEditingMenu(menu);
    setSubmenuName(menu.submenu_name || '');
    setMenuId(menu.menu_id || (mainMenus.length > 0 ? mainMenus[0].id : ''));
    setPath(menu.path || '');
    setSortBy(menu.sort_by || 0);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      submenu_name: submenuName,
      menu_id: menuId,
      path: path,
      sort_by: parseInt(sortBy) || 0
    };

    if (editingMenu) {
      const { error } = await supabase.from('submenu').update(payload).eq('id', editingMenu.id);
      if (error) console.error('Error updating sub menu:', error);
    } else {
      const { error } = await supabase.from('submenu').insert([payload]);
      if (error) console.error('Error inserting sub menu:', error);
    }
    
    closeModal();
    fetchData();
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this sub menu?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('submenu').delete().eq('id', id);
    if (error) {
      console.error('Error deleting sub menu:', error);
    } else {
      fetchData();
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="workspace-hero-row" style={{ width: '100%', alignItems: 'center' }}>
        <div>
          <h1 className="workspace-greeting-title">Sub Menu Settings</h1>
          <p className="workspace-greeting-date">Configure your system's sub-menus here.</p>
        </div>
        <button className="btn-modal-submit" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Add New
        </button>
      </div>
      
      <div style={{ marginTop: '2rem', width: '100%' }}>
        <div className="fin-entry-row-card" style={{ padding: '0', display: 'block', overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card-hover)' }}>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Sub Menu Name</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Parent Menu</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Path</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Sort By</th>
                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading sub menus...
                  </td>
                </tr>
              ) : subMenus.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No sub menus found.
                  </td>
                </tr>
              ) : (
                subMenus.map(menu => (
                  <tr key={menu.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem' }}>{menu.submenu_name}</td>
                    <td style={{ padding: '1rem' }}>{menu.mainmenu?.menu_name || menu.menu_id}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{menu.path}</td>
                    <td style={{ padding: '1rem' }}>{menu.sort_by}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => openEditModal(menu)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal-primary)', marginRight: '1rem' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(menu.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coral-primary)' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingMenu ? 'Edit Sub Menu' : 'Add New Sub Menu'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-field">
                <label className="modal-label">Sub Menu Name</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Overview"
                  value={submenuName}
                  onChange={(e) => setSubmenuName(e.target.value)}
                  required
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Parent Menu</label>
                <select
                  className="modal-select"
                  value={menuId}
                  onChange={(e) => setMenuId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a parent menu</option>
                  {mainMenus.map((mm) => (
                    <option key={mm.id} value={mm.id}>{mm.menu_name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-field">
                <label className="modal-label">Path</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. /dashboard/overview"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Sort By</label>
                <input
                  type="number"
                  className="modal-input"
                  placeholder="e.g. 1"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  {editingMenu ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubMenuPage;

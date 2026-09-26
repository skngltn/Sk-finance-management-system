import React, { useState, useEffect } from 'react';
import { Plus, Edit2, X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

function MainMenuPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);

  // Form State
  const [menuName, setMenuName] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('mainmenu').select('*').order('sort_order', { ascending: true });
    if (error) {
      console.error('Error fetching menus:', error);
    } else {
      setMenus(data || []);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingMenu(null);
    setMenuName('');
    setPath('');
    setIcon('');
    setSortOrder(0);
    setIsModalOpen(true);
  };

  const openEditModal = (menu) => {
    setEditingMenu(menu);
    setMenuName(menu.menu_name || '');
    setPath(menu.path || '');
    setIcon(menu.icon || '');
    setSortOrder(menu.sort_order || 0);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      menu_name: menuName,
      path: path,
      icon: icon,
      sort_order: parseInt(sortOrder) || 0
    };

    if (editingMenu) {
      const { error } = await supabase.from('mainmenu').update(payload).eq('id', editingMenu.id);
      if (error) console.error('Error updating menu:', error);
    } else {
      payload.id = Date.now().toString(); // Generate text ID
      const { error } = await supabase.from('mainmenu').insert([payload]);
      if (error) console.error('Error inserting menu:', error);
    }

    closeModal();
    fetchMenus();
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this menu?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('mainmenu').delete().eq('id', id);
    if (error) {
      console.error('Error deleting menu:', error);
    } else {
      fetchMenus();
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="workspace-hero-row" style={{ width: '100%', alignItems: 'center' }}>
        <div>
          <h1 className="workspace-greeting-title">Main Menu Settings</h1>
          <p className="workspace-greeting-date">Configure your system's main menus here.</p>
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
                <th style={{ padding: '1rem', fontWeight: 600 }}>Menu Name</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Path</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Icon</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Sort Order</th>
                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading menus...
                  </td>
                </tr>
              ) : menus.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No main menus found.
                  </td>
                </tr>
              ) : (
                menus.map(menu => (
                  <tr key={menu.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem' }}>{menu.menu_name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{menu.path}</td>
                    <td style={{ padding: '1rem' }}>{menu.icon}</td>
                    <td style={{ padding: '1rem' }}>{menu.sort_order}</td>
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
              <h3 className="modal-title">{editingMenu ? 'Edit Main Menu' : 'Add New Main Menu'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-field">
                <label className="modal-label">Menu Name</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Dashboard"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  required
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Path</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. /dashboard"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Icon</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Home"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Sort Order</label>
                <input
                  type="number"
                  className="modal-input"
                  placeholder="e.g. 1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
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

export default MainMenuPage;

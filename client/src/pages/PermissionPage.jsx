import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Check, X, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

function PermissionPage() {
  const [users, setUsers] = useState([]);
  const [mainMenus, setMainMenus] = useState([]);
  const [subMenus, setSubMenus] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userPermissions, setUserPermissions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      // 1. Fetch Users from profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .order('full_name', { ascending: true });

      setUsers(profilesData || []);
      if (profilesData && profilesData.length > 0) {
        setSelectedUserId(profilesData[0].id);
        await fetchUserPermissions(profilesData[0].id);
      }

      // 2. Fetch Main Menus
      const { data: mainData } = await supabase
        .from('mainmenu')
        .select('*')
        .order('sort_order', { ascending: true });
      setMainMenus(mainData || []);

      // 3. Fetch Sub Menus
      const { data: subData } = await supabase
        .from('submenu')
        .select('*')
        .order('sort_by', { ascending: true });
      setSubMenus(subData || []);
    } catch (err) {
      console.error('Error loading permissions data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      const { data: perms } = await supabase
        .from('user_permission')
        .select('submenu_id')
        .eq('user_id', userId);

      const permSet = new Set((perms || []).map((p) => String(p.submenu_id)));
      setUserPermissions(permSet);
    } catch (err) {
      console.error('Error fetching permissions for user:', err);
    }
  };

  const handleUserChange = async (e) => {
    const newUserId = e.target.value;
    setSelectedUserId(newUserId);
    setStatusMessage(null);
    await fetchUserPermissions(newUserId);
  };

  const handleToggleSubmenu = (submenuId) => {
    setUserPermissions((prev) => {
      const next = new Set(prev);
      const strId = String(submenuId);
      if (next.has(strId)) {
        next.delete(strId);
      } else {
        next.add(strId);
      }
      return next;
    });
  };

  const handleSelectAll = (menuId) => {
    const subsForMenu = subMenus.filter((s) => String(s.menu_id) === String(menuId));
    setUserPermissions((prev) => {
      const next = new Set(prev);
      subsForMenu.forEach((s) => next.add(String(s.id)));
      return next;
    });
  };

  const handleDeselectAll = (menuId) => {
    const subsForMenu = subMenus.filter((s) => String(s.menu_id) === String(menuId));
    setUserPermissions((prev) => {
      const next = new Set(prev);
      subsForMenu.forEach((s) => next.delete(String(s.id)));
      return next;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    setStatusMessage(null);

    try {
      // 1. Delete current permissions for this user
      await supabase
        .from('user_permission')
        .delete()
        .eq('user_id', selectedUserId);

      // 2. Prepare new permission records
      const newPermRows = [];
      userPermissions.forEach((submenuId) => {
        const sub = subMenus.find((s) => String(s.id) === String(submenuId));
        if (sub) {
          newPermRows.push({
            user_id: selectedUserId,
            menu_id: sub.menu_id,
            submenu_id: sub.id,
          });
        }
      });

      if (newPermRows.length > 0) {
        const { error } = await supabase.from('user_permission').insert(newPermRows);
        if (error) throw error;
      }

      setStatusMessage({ type: 'success', text: 'Permissions successfully updated for the selected user!' });
    } catch (err) {
      console.error('Error saving permissions:', err);
      setStatusMessage({ type: 'error', text: `Failed to save permissions: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="workspace-hero-row" style={{ width: '100%', alignItems: 'center' }}>
        <div>
          <h1 className="workspace-greeting-title">User Permissions Management</h1>
          <p className="workspace-greeting-date">Control sidebar menu & sub-menu visibility for each user.</p>
        </div>
        <button
          className="btn-modal-submit"
          onClick={handleSavePermissions}
          disabled={saving || !selectedUserId}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {saving ? <RefreshCw size={16} className="spinner-icon" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>

      {statusMessage && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: statusMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: statusMessage.type === 'success' ? '#065F46' : '#991B1B',
            border: `1px solid ${statusMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          }}
        >
          {statusMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* User Selection Card */}
      <div className="fin-entry-row-card" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <User size={18} color="var(--teal-primary, #0D9488)" />
            <span>Select User:</span>
          </div>
          <select
            className="modal-select"
            value={selectedUserId}
            onChange={handleUserChange}
            style={{ maxWidth: '350px', padding: '0.5rem 1rem' }}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name || u.email} ({u.role || 'Member'}) - {u.email}
              </option>
            ))}
          </select>
          {selectedUser && (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Role: <strong>{selectedUser.role || 'Member'}</strong> | UID: <code style={{ fontSize: '0.75rem' }}>{selectedUser.id}</code>
            </span>
          )}
        </div>
      </div>

      {/* Menus & Submenus Permissions List */}
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spinner-icon" style={{ margin: '0 auto 10px' }} />
            <p>Loading menu structure & permissions...</p>
          </div>
        ) : mainMenus.length === 0 ? (
          <div className="fin-entry-row-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No main menus found. Create a Main Menu in Main Menu Settings first.
          </div>
        ) : (
          mainMenus.map((main) => {
            const subsForThisMain = subMenus.filter((s) => String(s.menu_id) === String(main.id));
            const allChecked =
              subsForThisMain.length > 0 &&
              subsForThisMain.every((s) => userPermissions.has(String(s.id)));

            return (
              <div key={main.id} className="fin-entry-row-card" style={{ padding: '1.25rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-light, #E5E7EB)',
                    paddingBottom: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} color="var(--purple-primary, #7C3AED)" />
                    <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{main.menu_name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({main.path || '/'})</span>
                  </div>

                  {subsForThisMain.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => (allChecked ? handleDeselectAll(main.id) : handleSelectAll(main.id))}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border-light, #D1D5DB)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                        }}
                      >
                        {allChecked ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  )}
                </div>

                {subsForThisMain.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    No sub-menus configured under this main menu.
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    {subsForThisMain.map((sub) => {
                      const isChecked = userPermissions.has(String(sub.id));
                      return (
                        <label
                          key={sub.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            backgroundColor: isChecked ? 'rgba(13, 148, 136, 0.08)' : 'var(--bg-card-hover, #F9FAFB)',
                            border: `1px solid ${isChecked ? 'var(--teal-primary, #0D9488)' : 'var(--border-light, #E5E7EB)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSubmenu(sub.id)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--teal-primary, #0D9488)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sub.submenu_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.path}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PermissionPage;

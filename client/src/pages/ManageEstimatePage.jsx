import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, Edit2, Trash2, Search, FileText, X } from 'lucide-react';

function ManageEstimatePage({ onEdit }) {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [estimateNoFilter, setEstimateNoFilter] = useState('');
  const [showEstimateDropdown, setShowEstimateDropdown] = useState(false);

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setClientFilter('');
    setEstimateNoFilter('');
    setSearchQuery('');
  };

  const [viewingEstimate, setViewingEstimate] = useState(null);
  const [estimateItems, setEstimateItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const handleViewEstimate = async (est) => {
    setViewingEstimate(est);
    setLoadingItems(true);
    const { data, error } = await supabase
      .from('estimate_items')
      .select('*')
      .eq('estimate_id', est.id);

    if (error) {
      console.error('Error fetching items:', error);
    } else {
      setEstimateItems(data || []);
    }
    setLoadingItems(false);
  };

  const fetchEstimates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching estimates:', error);
    } else {
      setEstimates(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      const { error } = await supabase.from('estimates').delete().eq('id', id);
      if (error) {
        console.error('Error deleting estimate:', error);
        alert('Failed to delete estimate.');
      } else {
        fetchEstimates();
      }
    }
  };

  const filteredEstimates = estimates.filter((est) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = (
      (est.estimate_number || '').toLowerCase().includes(term) ||
      (est.customer_name || '').toLowerCase().includes(term) ||
      (est.organization_name || '').toLowerCase().includes(term) ||
      (est.status || '').toLowerCase().includes(term)
    );

    const clientStr = (est.organization_name || est.customer_name || 'Walk-in').toLowerCase();
    const matchesClient = clientFilter ? clientStr.includes(clientFilter.toLowerCase()) : true;

    const estNoStr = (est.estimate_number || '').toLowerCase();
    const matchesEstNo = estimateNoFilter ? estNoStr.includes(estimateNoFilter.toLowerCase()) : true;

    let matchesFromDate = true;
    let matchesToDate = true;
    if (fromDate && est.estimate_date) {
      matchesFromDate = new Date(est.estimate_date) >= new Date(fromDate);
    }
    if (toDate && est.estimate_date) {
      matchesToDate = new Date(est.estimate_date) <= new Date(toDate);
    }

    return matchesSearch && matchesClient && matchesEstNo && matchesFromDate && matchesToDate;
  });

  const uniqueClients = Array.from(
    new Set(estimates.map(e => e.organization_name || e.customer_name || 'Walk-in'))
  ).filter(Boolean);

  const uniqueEstimateNos = Array.from(
    new Set(estimates.map(e => e.estimate_number))
  ).filter(Boolean);

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'draft') return 'pill-cyan-bg pill-cyan-text';
    if (s === 'sent') return 'pill-purple-bg pill-purple-text';
    if (s === 'accepted') return 'pill-green-bg pill-green-text';
    if (s === 'converted') return 'pill-coral-bg pill-coral-text';
    return 'pill-cyan-bg pill-cyan-text';
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Header */}
      <div className="workspace-hero-row" style={{ width: '100%', alignItems: 'center' }}>
        <div>
          <h1 className="workspace-greeting-title">Manage Estimates</h1>
          <p className="workspace-greeting-date">View and manage all your commercial estimates here.</p>
        </div>
      </div>

      {/* Filter Card */}
      <div className="dashboard-table-fullwidth" style={{ marginBottom: '-8px' }}>
        <div className="recent-transactions-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>From Date:</span>
            <input 
              type="date" 
              className="fin-input" 
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-body)' }} 
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '8px' }}>To Date:</span>
            <input 
              type="date" 
              className="fin-input" 
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-body)' }}
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
            <input 
              type="text"
              className="fin-input"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', width: '100%', borderRadius: '6px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-body)' }}
              placeholder="Filter by Estimate No..."
              value={estimateNoFilter}
              onChange={e => {
                setEstimateNoFilter(e.target.value);
                setShowEstimateDropdown(true);
              }}
              onFocus={() => setShowEstimateDropdown(true)}
              onBlur={() => setTimeout(() => setShowEstimateDropdown(false), 200)}
            />
            {showEstimateDropdown && uniqueEstimateNos.filter(e => e.toLowerCase().includes(estimateNoFilter.toLowerCase())).length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '6px', marginTop: '4px', zIndex: 100, maxHeight: '250px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}>
                {uniqueEstimateNos.filter(e => e.toLowerCase().includes(estimateNoFilter.toLowerCase())).map((estNo, idx, arr) => (
                  <div 
                    key={idx} 
                    style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer', borderBottom: idx !== arr.length - 1 ? '1px solid var(--border-light)' : 'none', color: 'var(--text-primary)' }}
                    onMouseDown={() => {
                      setEstimateNoFilter(estNo);
                      setShowEstimateDropdown(false);
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {estNo}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
            <input 
              type="text"
              className="fin-input"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', width: '100%', borderRadius: '6px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-body)' }}
              placeholder="Filter by specific client..."
              value={clientFilter}
              onChange={e => {
                setClientFilter(e.target.value);
                setShowClientDropdown(true);
              }}
              onFocus={() => setShowClientDropdown(true)}
              onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
            />
            {showClientDropdown && uniqueClients.filter(c => c.toLowerCase().includes(clientFilter.toLowerCase())).length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '6px', marginTop: '4px', zIndex: 100, maxHeight: '250px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}>
                {uniqueClients.filter(c => c.toLowerCase().includes(clientFilter.toLowerCase())).map((client, idx, arr) => (
                  <div 
                    key={idx} 
                    style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer', borderBottom: idx !== arr.length - 1 ? '1px solid var(--border-light)' : 'none', color: 'var(--text-primary)' }}
                    onMouseDown={() => {
                      setClientFilter(client);
                      setShowClientDropdown(false);
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {client}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
            <button 
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 500, borderRadius: '6px', border: 'none', backgroundColor: 'var(--brand-primary, #4F46E5)', color: '#ffffff', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              Filter
            </button>
            <button 
              onClick={handleClearFilters}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 500, borderRadius: '6px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-body)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg-card-hover)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'var(--bg-body)'}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="dashboard-table-fullwidth">
        <div className="recent-transactions-card">
          <div className="recent-transactions-card-header">
            <div className="card-title-heading">
              <h3>All Estimates</h3>
            </div>
            <div className="card-header-toolbar">
              <div className="header-search-container" style={{ margin: 0 }}>
                <Search size={14} className="header-search-icon" />
                <input
                  type="text"
                  className="header-search-field"
                  placeholder="Search estimates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-scroll-wrapper">
            <table className="clean-enterprise-table">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card-hover)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Estimate No.</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Client</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading estimates...
                    </td>
                  </tr>
                ) : filteredEstimates.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No estimates found.
                    </td>
                  </tr>
                ) : (
                  filteredEstimates.map((est) => (
                    <tr key={est.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} color="var(--coral-primary)" />
                          <span style={{ fontWeight: 600 }}>{est.estimate_number}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{est.organization_name || est.customer_name || 'Walk-in'}</div>
                          {est.organization_name && est.customer_name && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{est.customer_name}</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{est.estimate_date}</td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>₹{Number(est.total_amount).toFixed(2)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`status-pill ${getStatusBadgeClass(est.status)}`}>
                          {est.status || 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                          <button onClick={() => handleViewEstimate(est)} title="View" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-primary)', display: 'flex' }}>
                            <Eye size={18} />
                          </button>
                          <button onClick={() => onEdit && onEdit(est.id)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--teal-primary)', display: 'flex' }}>
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(est.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--coral-primary)', display: 'flex' }}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for viewing estimate items */}
      {viewingEstimate && (
        <div className="modal-overlay" onClick={() => setViewingEstimate(null)}>
          <div className="modal-dialog-card" style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Estimate: {viewingEstimate.estimate_number}</h3>
              <button onClick={() => setViewingEstimate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', backgroundColor: 'var(--bg-body)', padding: '1.5rem', borderRadius: '8px' }}>
                <div>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Client</p>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{viewingEstimate.organization_name || viewingEstimate.customer_name || 'Walk-in'}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Date</p>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{viewingEstimate.estimate_date}</strong>
                </div>
              </div>

              {loadingItems ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading items...</div>
              ) : (
                <div className="table-scroll-wrapper" style={{ marginBottom: '2rem' }}>
                  <table className="clean-enterprise-table" style={{ width: '100%' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-card-hover)', borderBottom: '2px solid var(--border-light)' }}>
                        <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left' }}>Description</th>
                        <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estimateItems.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items found</td>
                        </tr>
                      ) : (
                        estimateItems.map(item => (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{item.item_description}</td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>₹{Number(item.unit_price).toFixed(2)}</td>
                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>₹{Number(item.total).toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <div style={{ width: '320px', backgroundColor: 'var(--bg-body)', padding: '1.5rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                    <span style={{ fontWeight: 500 }}>₹{Number(viewingEstimate.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Discount:</span>
                    <span style={{ fontWeight: 500 }}>₹{Number(viewingEstimate.discount_amount || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    <span>Grand Total:</span>
                    <span>₹{Number(viewingEstimate.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {viewingEstimate.notes && (
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-card-hover)', borderRadius: '8px', borderLeft: '4px solid var(--teal-primary)' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}>Remarks & Terms:</strong>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.5' }}>{viewingEstimate.notes}</p>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-light)', marginTop: '1rem' }}>
              <button className="btn-modal-cancel" onClick={() => setViewingEstimate(null)}>Close</button>
              <button className="btn-modal-submit" onClick={() => window.print()}>Print Estimate</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManageEstimatePage;

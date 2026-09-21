import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';

function EnterpriseTable({
  entries,
  onToggleSettle,
  onOpenNewEntryModal,
  onDeleteEntry,
  onUpdateEntry,
  searchQuery = '',
  onSearchChange,
  activeTab = 'all',
  onTabChange,
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Sorting
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Modals
  const [viewingEntry, setViewingEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editCustomer, setEditCustomer] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('Invoice');
  const [editDescription, setEditDescription] = useState('');

  const filterMenuRef = useRef(null);
  const actionMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const effectiveSearch = (localSearch || searchQuery).trim().toLowerCase();

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Tab / Category Filter
      if (activeTab === 'paid' && entry.status !== 'paid' && !entry.settled) return false;
      if (activeTab === 'received' && entry.status !== 'received') return false;
      if (activeTab === 'posted' && entry.status !== 'posted') return false;
      if (activeTab === 'pending' && entry.status !== 'pending' && entry.settled) return false;
      if (activeTab === 'overdue' && entry.status !== 'overdue') return false;
      if (activeTab === 'ledger' && entry.type !== 'Customer Ledger') return false;
      if (activeTab === 'invoice' && entry.type !== 'Invoice') return false;
      if (activeTab === 'credit' && entry.type !== 'Credit Entry') return false;
      if (activeTab === 'estimate' && entry.type !== 'Estimate') return false;

      // 2. Search Filter
      if (!effectiveSearch) return true;
      const refMatch = String(entry.refNo || '').toLowerCase().includes(effectiveSearch);
      const customerMatch = String(entry.customer || '').toLowerCase().includes(effectiveSearch);
      const typeMatch = String(entry.type || '').toLowerCase().includes(effectiveSearch);
      const descMatch = String(entry.description || '').toLowerCase().includes(effectiveSearch);
      const amountMatch = String(entry.amount || '').toLowerCase().includes(effectiveSearch);
      const dateMatch = String(entry.date || '').toLowerCase().includes(effectiveSearch);

      return refMatch || customerMatch || typeMatch || descMatch || amountMatch || dateMatch;
    });
  }, [entries, activeTab, effectiveSearch]);

  // Sort entries
  const sortedEntries = useMemo(() => {
    const list = [...filteredEntries];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'amount') {
        valA = parseFloat(String(a.amount).replace(/[^0-9.-]+/g, '')) || 0;
        valB = parseFloat(String(b.amount).replace(/[^0-9.-]+/g, '')) || 0;
      } else if (sortField === 'date') {
        valA = a.id;
        valB = b.id;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredEntries, sortField, sortOrder]);

  // Pagination
  const totalEntries = sortedEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const currentEntries = sortedEntries.slice(startIndex, endIndex);

  // Column sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="sort-icon-neutral" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={12} className="sort-icon-active" />
    ) : (
      <ArrowDown size={12} className="sort-icon-active" />
    );
  };

  // CSV Export
  const handleExportCSV = () => {
    if (sortedEntries.length === 0) {
      alert('No records available to export.');
      return;
    }
    const headers = ['Date', 'Type', 'Reference No.', 'Customer', 'Description', 'Amount', 'Status'];
    const rows = sortedEntries.map((e) => [
      `"${e.date}"`,
      `"${e.type}"`,
      `"${e.refNo || 'TX-' + e.id}"`,
      `"${e.customer.replace(/"/g, '""')}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${e.amount}"`,
      `"${e.status || (e.settled ? 'Paid' : 'Pending')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Recent_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Receipt Slip Download
  const handleDownloadSlip = (entry) => {
    const slip = `===========================================
SK FINANCE — TRANSACTION SLIP
===========================================
Reference No.  : ${entry.refNo || 'TX-' + entry.id}
Date           : ${entry.date}
Customer       : ${entry.customer}
Category / Type: ${entry.type}
Description    : ${entry.description || 'N/A'}
Amount         : ${entry.amount}
Status         : ${(entry.status || (entry.settled ? 'Paid' : 'Pending')).toUpperCase()}
===========================================
Generated on   : ${new Date().toLocaleString()}
System Verified: Yes
===========================================`;

    const blob = new Blob([slip], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Slip_${entry.refNo || entry.id}_${entry.customer.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Open Edit
  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setEditCustomer(entry.customer);
    setEditAmount(entry.amount);
    setEditType(entry.type);
    setEditDescription(entry.description || '');
    setActiveMenuId(null);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingEntry) return;
    if (onUpdateEntry) {
      onUpdateEntry(editingEntry.id, {
        customer: editCustomer,
        amount: editAmount.startsWith('$') ? editAmount : `$${editAmount}`,
        type: editType,
        description: editDescription,
      });
    }
    setEditingEntry(null);
  };

  // Status dot helper
  const renderStatus = (entry) => {
    const status = (entry.status || (entry.settled ? 'paid' : 'pending')).toLowerCase();

    let dotColor = '#10B981'; // Green default
    let label = 'Paid';

    if (status === 'paid' || status === 'settled') {
      dotColor = '#10B981';
      label = 'Paid';
    } else if (status === 'received') {
      dotColor = '#10B981';
      label = 'Received';
    } else if (status === 'posted') {
      dotColor = '#3B82F6'; // Blue
      label = 'Posted';
    } else if (status === 'pending') {
      dotColor = '#F59E0B'; // Amber
      label = 'Pending';
    } else if (status === 'overdue') {
      dotColor = '#EF4444'; // Red
      label = 'Overdue';
    }

    return (
      <div className="table-status-cell">
        <span className="table-status-dot" style={{ backgroundColor: dotColor }} />
        <span className="table-status-text">{label}</span>
      </div>
    );
  };

  return (
    <div className="recent-transactions-card">
      {/* 1. Header Toolbar */}
      <div className="recent-transactions-card-header">
        <div className="card-title-heading">
          <h3>Recent Transactions</h3>
        </div>

        <div className="card-header-toolbar">
          {/* Search Box */}
          <div className="header-search-container">
            <Search size={14} className="header-search-icon" />
            <input
              type="text"
              className="header-search-field"
              placeholder="Search..."
              value={localSearch || searchQuery}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
            />
            {(localSearch || searchQuery) && (
              <button
                className="header-search-clear-btn"
                onClick={() => {
                  setLocalSearch('');
                  if (onSearchChange) onSearchChange('');
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter Button & Menu */}
          <div className="filter-dropdown-container" ref={filterMenuRef}>
            <button
              className={`toolbar-action-btn ${activeTab !== 'all' ? 'filter-active' : ''}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filter records"
            >
              <Filter size={14} />
              <span>Filter</span>
              {activeTab !== 'all' && <span className="active-dot-badge" />}
            </button>

            {isFilterOpen && (
              <div className="filter-popup-menu">
                <div className="filter-menu-header">Filter by Status / Type</div>
                <button
                  className={`filter-menu-item ${activeTab === 'all' ? 'selected' : ''}`}
                  onClick={() => {
                    if (onTabChange) onTabChange('all');
                    setIsFilterOpen(false);
                    setCurrentPage(1);
                  }}
                >
                  All Transactions
                </button>
                <button
                  className={`filter-menu-item ${activeTab === 'paid' ? 'selected' : ''}`}
                  onClick={() => {
                    if (onTabChange) onTabChange('paid');
                    setIsFilterOpen(false);
                    setCurrentPage(1);
                  }}
                >
                  <span className="table-status-dot" style={{ backgroundColor: '#10B981' }} />
                  Paid / Settled
                </button>
                <button
                  className={`filter-menu-item ${activeTab === 'received' ? 'selected' : ''}`}
                  onClick={() => {
                    if (onTabChange) onTabChange('received');
                    setIsFilterOpen(false);
                    setCurrentPage(1);
                  }}
                >
                  <span className="table-status-dot" style={{ backgroundColor: '#10B981' }} />
                  Received
                </button>
                <button
                  className={`filter-menu-item ${activeTab === 'posted' ? 'selected' : ''}`}
                  onClick={() => {
                    if (onTabChange) onTabChange('posted');
                    setIsFilterOpen(false);
                    setCurrentPage(1);
                  }}
                >
                  <span className="table-status-dot" style={{ backgroundColor: '#3B82F6' }} />
                  Posted
                </button>
                <button
                  className={`filter-menu-item ${activeTab === 'pending' ? 'selected' : ''}`}
                  onClick={() => {
                    if (onTabChange) onTabChange('pending');
                    setIsFilterOpen(false);
                    setCurrentPage(1);
                  }}
                >
                  <span className="table-status-dot" style={{ backgroundColor: '#F59E0B' }} />
                  Pending
                </button>
                <button
                  className={`filter-menu-item ${activeTab === 'overdue' ? 'selected' : ''}`}
                  onClick={() => {
                    if (onTabChange) onTabChange('overdue');
                    setIsFilterOpen(false);
                    setCurrentPage(1);
                  }}
                >
                  <span className="table-status-dot" style={{ backgroundColor: '#EF4444' }} />
                  Overdue
                </button>
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            className="toolbar-action-btn"
            onClick={handleExportCSV}
            title="Export transactions to CSV"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          {/* View All Button */}
          <button
            className="view-all-link-btn"
            onClick={() => {
              if (onTabChange) onTabChange('all');
              setLocalSearch('');
              if (onSearchChange) onSearchChange('');
            }}
          >
            View All
          </button>
        </div>
      </div>

      {/* 2. Transactions Table */}
      <div className="table-scroll-wrapper">
        <table className="clean-enterprise-table">
          <thead>
            <tr>
              <th
                className="col-date sortable-th"
                onClick={() => handleSort('date')}
              >
                <div className="th-content">
                  <span>Date</span>
                  {getSortIcon('date')}
                </div>
              </th>
              <th
                className="col-type sortable-th"
                onClick={() => handleSort('type')}
              >
                <div className="th-content">
                  <span>Type</span>
                  {getSortIcon('type')}
                </div>
              </th>
              <th
                className="col-ref sortable-th"
                onClick={() => handleSort('refNo')}
              >
                <div className="th-content">
                  <span>Reference No.</span>
                  {getSortIcon('refNo')}
                </div>
              </th>
              <th
                className="col-customer sortable-th"
                onClick={() => handleSort('customer')}
              >
                <div className="th-content">
                  <span>Customer</span>
                  {getSortIcon('customer')}
                </div>
              </th>
              <th className="col-desc">Description</th>
              <th
                className="col-amount sortable-th"
                onClick={() => handleSort('amount')}
              >
                <div className="th-content">
                  <span>Amount</span>
                  {getSortIcon('amount')}
                </div>
              </th>
              <th className="col-status">Status</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty-td">
                  <div className="table-empty-box">
                    <p className="empty-heading">No transactions found</p>
                    <p className="empty-sub">Try changing your search or clearing active filters.</p>
                    {(effectiveSearch || activeTab !== 'all') && (
                      <button
                        className="toolbar-action-btn"
                        style={{ marginTop: '8px' }}
                        onClick={() => {
                          setLocalSearch('');
                          if (onSearchChange) onSearchChange('');
                          if (onTabChange) onTabChange('all');
                        }}
                      >
                        <RotateCcw size={13} /> Reset Filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              currentEntries.map((entry) => (
                <tr key={entry.id} className="table-data-row">
                  {/* Date */}
                  <td className="cell-date">{entry.date}</td>

                  {/* Type */}
                  <td className="cell-type">{entry.type}</td>

                  {/* Reference No */}
                  <td className="cell-ref">{entry.refNo || `TX-${entry.id}`}</td>

                  {/* Customer */}
                  <td className="cell-customer">{entry.customer}</td>

                  {/* Description */}
                  <td className="cell-desc">{entry.description || '—'}</td>

                  {/* Amount */}
                  <td className="cell-amount">{entry.amount}</td>

                  {/* Status with dot */}
                  <td className="cell-status">{renderStatus(entry)}</td>

                  {/* Actions (•••) */}
                  <td className="cell-actions">
                    <div className="actions-cell-wrapper" ref={activeMenuId === entry.id ? actionMenuRef : null}>
                      <button
                        className="row-kebab-menu-btn"
                        onClick={() =>
                          setActiveMenuId(activeMenuId === entry.id ? null : entry.id)
                        }
                        title="More options"
                        aria-label="Actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === entry.id && (
                        <div className="row-action-popover-menu">
                          <button
                            className="popover-action-item"
                            onClick={() => {
                              setViewingEntry(entry);
                              setActiveMenuId(null);
                            }}
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </button>

                          <button
                            className="popover-action-item"
                            onClick={() => {
                              onToggleSettle(entry.id);
                              setActiveMenuId(null);
                            }}
                          >
                            <Check size={14} />
                            <span>
                              {entry.settled ? 'Mark as Pending' : 'Mark as Paid / Settled'}
                            </span>
                          </button>

                          <button
                            className="popover-action-item"
                            onClick={() => handleOpenEdit(entry)}
                          >
                            <Edit2 size={14} />
                            <span>Edit Record</span>
                          </button>

                          <button
                            className="popover-action-item"
                            onClick={() => {
                              handleDownloadSlip(entry);
                              setActiveMenuId(null);
                            }}
                          >
                            <Download size={14} />
                            <span>Download Slip</span>
                          </button>

                          {onDeleteEntry && (
                            <button
                              className="popover-action-item danger"
                              onClick={() => {
                                setActiveMenuId(null);
                                if (
                                  window.confirm(
                                    `Are you sure you want to delete "${entry.customer}"?`
                                  )
                                ) {
                                  onDeleteEntry(entry.id);
                                }
                              }}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Pagination Footer */}
      <div className="recent-transactions-footer">
        <div className="footer-count-text">
          {totalEntries > 0 ? (
            <>
              Showing <span className="highlight-num">{startIndex + 1}</span> to{' '}
              <span className="highlight-num">{endIndex}</span> of{' '}
              <span className="highlight-num">{totalEntries}</span> entries
            </>
          ) : (
            'Showing 0 entries'
          )}
        </div>

        <div className="footer-pagination-controls">
          <select
            className="footer-page-size-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
          </select>

          <button
            className="footer-nav-arrow-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage <= 1}
            title="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              className={`footer-page-num-btn ${pageNum === validPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          <button
            className="footer-nav-arrow-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage >= totalPages}
            title="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* 4. View Details Modal */}
      {viewingEntry && (
        <div className="modal-overlay" onClick={() => setViewingEntry(null)}>
          <div
            className="modal-dialog-card"
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#10B981" />
                <h3 className="modal-title">Transaction Details</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setViewingEntry(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div
                style={{
                  background: '#F9FAFB',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, letterSpacing: '0.04em' }}>
                    REFERENCE NUMBER
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                    {viewingEntry.refNo || `TX-${viewingEntry.id}`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, letterSpacing: '0.04em' }}>
                    TOTAL AMOUNT
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                    {viewingEntry.amount}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="modal-label">Customer</label>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {viewingEntry.customer}
                  </div>
                </div>

                <div>
                  <label className="modal-label">Transaction Type</label>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {viewingEntry.type}
                  </div>
                </div>

                <div>
                  <label className="modal-label">Date</label>
                  <div style={{ fontSize: '13.5px', color: '#374151' }}>
                    {viewingEntry.date}
                  </div>
                </div>

                <div>
                  <label className="modal-label">Status</label>
                  <div>{renderStatus(viewingEntry)}</div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="modal-label">Description</label>
                  <div style={{ fontSize: '13.5px', color: '#4B5563' }}>
                    {viewingEntry.description || 'No description provided.'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end',
                  borderTop: '1px solid #E5E7EB',
                  paddingTop: '16px',
                }}
              >
                <button
                  className="toolbar-action-btn"
                  onClick={() => handleDownloadSlip(viewingEntry)}
                >
                  <Download size={14} /> Download Slip
                </button>
                <button
                  className="btn-modal-submit"
                  style={{ width: 'auto', padding: '0 16px', height: '36px' }}
                  onClick={() => {
                    onToggleSettle(viewingEntry.id);
                    setViewingEntry((prev) => ({
                      ...prev,
                      settled: !prev.settled,
                      status: prev.settled ? 'pending' : 'paid',
                    }));
                  }}
                >
                  <Check size={14} />
                  {viewingEntry.settled ? 'Mark Pending' : 'Mark Paid / Settled'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Quick Edit Modal */}
      {editingEntry && (
        <div className="modal-overlay" onClick={() => setEditingEntry(null)}>
          <div
            className="modal-dialog-card"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Edit Record ({editingEntry.refNo || editingEntry.id})</h3>
              <button
                className="modal-close-btn"
                onClick={() => setEditingEntry(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-field">
                <label className="modal-label">Customer Name</label>
                <input
                  type="text"
                  className="modal-input"
                  value={editCustomer}
                  onChange={(e) => setEditCustomer(e.target.value)}
                  required
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Transaction Type</label>
                <select
                  className="modal-select"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                >
                  <option value="Invoice">Invoice</option>
                  <option value="Payment">Payment</option>
                  <option value="Credit Entry">Credit Entry</option>
                  <option value="Estimate">Estimate</option>
                  <option value="Customer Ledger">Customer Ledger</option>
                </select>
              </div>

              <div className="modal-field">
                <label className="modal-label">Description</label>
                <input
                  type="text"
                  className="modal-input"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="e.g. Car Wash Service"
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Amount</label>
                <input
                  type="text"
                  className="modal-input"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setEditingEntry(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnterpriseTable;

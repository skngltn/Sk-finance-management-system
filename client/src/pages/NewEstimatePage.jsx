import { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Trash2,
    Calendar,
    Users,
    UserCheck,
    CheckCircle2,
    ArrowLeft,
    Printer,
    DollarSign,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AddCustomerModal from '../components/AddCustomerModal';

function NewEstimatePage({ onBack, onEstimateSaved }) {
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Modal State for Direct Customer Addition
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [initialModalFlag, setInitialModalFlag] = useState(1);

    // Estimate Core Header Fields
    const [estimateNumber, setEstimateNumber] = useState('');
    const [estimateDate, setEstimateDate] = useState(new Date().toISOString().split('T')[0]);
    const [expiryDate, setExpiryDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 15);
        return d.toISOString().split('T')[0];
    });
    const [estimateStatus, setEstimateStatus] = useState('Draft');
    const [notes, setNotes] = useState('Payment terms: Net 15 days. Valid for 15 days from estimate date.');
    const [discountAmount, setDiscountAmount] = useState(0);

    // Line Items (No Tax)
    const [items, setItems] = useState([
        {
            id: 'item-1',
            description: 'Standard Service / Goods Delivery',
            quantity: 1,
            unitPrice: 1000,
            total: 1000,
        },
    ]);

    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchCustomers();
        generateEstimateNumber();
    }, []);

    const fetchCustomers = async () => {
        setLoadingCustomers(true);
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('customer_number', { ascending: true });

            if (!error && data) {
                setCustomers(data);
            }
        } catch (err) {
            console.warn('Error loading customers:', err);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const generateEstimateNumber = async () => {
        try {
            const { data } = await supabase
                .from('estimates')
                .select('estimate_number')
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0 && data[0].estimate_number) {
                const lastNum = parseInt(data[0].estimate_number.replace(/\D/g, ''), 10) || 100;
                setEstimateNumber(`EST-${String(lastNum + 1).padStart(4, '0')}`);
            } else {
                const randomSeed = Math.floor(1000 + Math.random() * 900);
                setEstimateNumber(`EST-${randomSeed}`);
            }
        } catch {
            setEstimateNumber(`EST-1001`);
        }
    };

    const handleCustomerSelect = (id) => {
        setSelectedCustomerId(id);
        const found = customers.find((c) => String(c.id) === String(id));
        setSelectedCustomer(found || null);
    };

    const handleCustomerAdded = (newCust) => {
        setCustomers((prev) => [newCust, ...prev]);
        setSelectedCustomerId(newCust.id);
        setSelectedCustomer(newCust);
        setSuccessMessage(
            `Directly added and selected ${newCust.customer_type_flag === 1 ? 'Customer' : 'Party'
            }: "${newCust.name}" (#${newCust.customer_number})`
        );
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    // Line item manipulation
    const handleAddItem = () => {
        setItems((prev) => [
            ...prev,
            {
                id: 'item-' + Date.now(),
                description: '',
                quantity: 1,
                unitPrice: 0,
                total: 0,
            },
        ]);
    };

    const handleRemoveItem = (id) => {
        if (items.length <= 1) return;
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleItemChange = (id, field, value) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;

                const updated = { ...item, [field]: value };
                const qty = parseFloat(updated.quantity) || 0;
                const rate = parseFloat(updated.unitPrice) || 0;
                updated.total = qty * rate;

                return updated;
            })
        );
    };

    // Calculations (No Tax)
    const rawSubtotal = items.reduce((acc, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.unitPrice) || 0;
        return acc + qty * rate;
    }, 0);

    const discountVal = parseFloat(discountAmount) || 0;
    const grandTotal = Math.max(0, rawSubtotal - discountVal);

    const handleSaveEstimate = async (statusOverride) => {
        if (!selectedCustomer && !selectedCustomerId) {
            setErrorMessage('Please select or add a customer/party first.');
            return;
        }

        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');

        const targetStatus = statusOverride || estimateStatus;

        const estimatePayload = {
            estimate_number: estimateNumber,
            customer_id: selectedCustomer?.id || null,
            customer_name: selectedCustomer?.name || 'Walk-in Customer',
            organization_name: selectedCustomer?.organization_name || '',
            estimate_date: estimateDate,
            expiry_date: expiryDate,
            subtotal: rawSubtotal,
            discount_amount: discountVal,
            total_amount: grandTotal,
            notes: notes,
            status: targetStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        try {
            // 1. Insert estimate into Supabase
            const { data: estData, error: estError } = await supabase
                .from('estimates')
                .insert([estimatePayload])
                .select()
                .single();

            if (estError) throw estError;

            const createdEstId = estData.id;

            // 2. Insert line items
            const lineItemsPayload = items.map((it) => ({
                estimate_id: createdEstId,
                item_description: it.description || 'Service/Product',
                quantity: parseFloat(it.quantity) || 1,
                unit_price: parseFloat(it.unitPrice) || 0,
                total: it.total,
            }));

            const { error: itemsError } = await supabase.from('estimate_items').insert(lineItemsPayload);
            if (itemsError) throw itemsError;

            setSuccessMessage(`Estimate ${estimateNumber} successfully created and saved!`);

            if (onEstimateSaved) {
                onEstimateSaved({
                    ...estimatePayload,
                    id: createdEstId,
                    customer: selectedCustomer?.organization_name || selectedCustomer?.name,
                    type: 'Estimate',
                    amount: `$${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    date: estimateDate,
                });
            }

            setTimeout(() => {
                if (onBack) onBack();
            }, 1500);
        } catch (err) {
            console.error('Error saving estimate:', err);
            setErrorMessage(err.message || 'Failed to save estimate');
        } finally {
            setSaving(false);
        }
    };

    const openQuickAddModal = (flagType) => {
        setInitialModalFlag(flagType);
        setIsCustomerModalOpen(true);
    };

    return (
        <div className="estimate-studio-wrapper">
            {/* Top Header Bar */}
            <div className="estimate-top-action-bar">
                <div className="estimate-left-title-group">
                    {onBack && (
                        <button className="btn-back-square" onClick={onBack} title="Back to workspace">
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div>
                        <div className="estimate-badge-row">
                            <span className="pill-coral-bg pill-coral-text fin-type-pill">
                                <FileText size={12} style={{ display: 'inline', marginRight: 4 }} />
                                New Estimate Studio
                            </span>
                            <span className="estimate-status-pill">{estimateStatus}</span>
                        </div>
                        <h1 className="estimate-main-title">Create Commercial Estimate</h1>
                    </div>
                </div>

                <div className="estimate-header-actions">
                    <button
                        type="button"
                        className="btn-estimate-secondary"
                        onClick={() => window.print()}
                    >
                        <Printer size={16} />
                        <span>Print Preview</span>
                    </button>
                    <button
                        type="button"
                        className="btn-modal-submit"
                        onClick={() => handleSaveEstimate()}
                        disabled={saving}
                    >
                        <CheckCircle2 size={16} />
                        <span>{saving ? 'Saving...' : 'Save Estimate'}</span>
                    </button>
                </div>
            </div>

            {/* Alert Banners */}
            {successMessage && (
                <div className="alert-success-banner">
                    <CheckCircle2 size={18} />
                    <span>{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="modal-error-banner">
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Main Grid */}
            <div className="estimate-layout-grid">
                <div className="estimate-main-card">
                    {/* Section 1: Identifiers */}
                    <div className="estimate-section-block">
                        <div className="estimate-section-header">
                            <span className="section-number-dot">1</span>
                            <h3>Estimate Identifiers & Dates</h3>
                        </div>

                        <div className="estimate-fields-grid-3">
                            <div className="modal-field">
                                <label className="modal-label">Estimate Number</label>
                                <input
                                    type="text"
                                    className="modal-input"
                                    value={estimateNumber}
                                    onChange={(e) => setEstimateNumber(e.target.value)}
                                    placeholder="e.g. EST-1001"
                                    required
                                />
                            </div>

                            <div className="modal-field">
                                <label className="modal-label">
                                    <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                                    Estimate Date
                                </label>
                                <input
                                    type="date"
                                    className="modal-input"
                                    value={estimateDate}
                                    onChange={(e) => setEstimateDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="modal-field">
                                <label className="modal-label">Expiry / Due Date</label>
                                <input
                                    type="date"
                                    className="modal-input"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Customer / Party Selection & Direct Adding */}
                    <div className="estimate-section-block">
                        <div className="estimate-section-header between-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="section-number-dot">2</span>
                                <h3>Client Account & Party Information</h3>
                            </div>

                            <div className="direct-add-btn-group">
                                <button
                                    type="button"
                                    className="btn-quick-add-customer"
                                    onClick={() => openQuickAddModal(1)}
                                    title="Add regular customer with Flag 1"
                                >
                                    <Users size={14} />
                                    <span>+ Add Customer (Flag 1)</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn-quick-add-party"
                                    onClick={() => openQuickAddModal(0)}
                                    title="Add visiting party with Flag 0"
                                >
                                    <UserCheck size={14} />
                                    <span>+ Add Party (Flag 0)</span>
                                </button>
                            </div>
                        </div>

                        <div className="customer-selection-container">
                            <div className="modal-field">
                                <label className="modal-label">Select Existing Customer or Visiting Party</label>
                                <select
                                    className="modal-select customer-dropdown"
                                    value={selectedCustomerId}
                                    onChange={(e) => handleCustomerSelect(e.target.value)}
                                >
                                    <option value="">-- Choose Customer or Visiting Party --</option>
                                    <optgroup label="👥 Regular Customers (Flag 1)">
                                        {customers
                                            .filter((c) => Number(c.customer_type_flag) === 1)
                                            .map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    #{c.customer_number} - {c.organization_name || c.name} ({c.name})
                                                </option>
                                            ))}
                                    </optgroup>
                                    <optgroup label="🚶 Visiting Parties (Flag 0)">
                                        {customers
                                            .filter((c) => Number(c.customer_type_flag) === 0)
                                            .map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    #{c.customer_number} - {c.organization_name || c.name} (Visiting Party)
                                                </option>
                                            ))}
                                    </optgroup>
                                </select>
                            </div>

                            {selectedCustomer && (
                                <div className="selected-customer-summary-box">
                                    <div className="cust-summary-header">
                                        <div className="cust-identity-group">
                                            <span
                                                className={`customer-flag-badge ${Number(selectedCustomer.customer_type_flag) === 1
                                                    ? 'badge-regular'
                                                    : 'badge-party'
                                                    }`}
                                            >
                                                {Number(selectedCustomer.customer_type_flag) === 1
                                                    ? '👥 Regular Customer (1)'
                                                    : '🚶 Visiting Party (0)'}
                                            </span>
                                            <span className="cust-number-tag">
                                                Customer #{selectedCustomer.customer_number}
                                            </span>
                                            <strong className="cust-org-name">
                                                {selectedCustomer.organization_name || selectedCustomer.name}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="cust-summary-details-grid">
                                        <div>
                                            <span className="summary-label">Contact:</span>
                                            <span className="summary-val">{selectedCustomer.name}</span>
                                        </div>
                                        <div>
                                            <span className="summary-label">Phone:</span>
                                            <span className="summary-val">{selectedCustomer.phone_number || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="summary-label">Address:</span>
                                            <span className="summary-val">{selectedCustomer.address || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Line Items (No Tax) */}
                    <div className="estimate-section-block">
                        <div className="estimate-section-header between-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="section-number-dot">3</span>
                                <h3>Estimate Line Items</h3>
                            </div>
                            <button
                                type="button"
                                className="btn-add-item-row"
                                onClick={handleAddItem}
                            >
                                <Plus size={14} />
                                <span>Add Item</span>
                            </button>
                        </div>

                        <div className="estimate-items-table-wrap">
                            <table className="estimate-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50%' }}>Description / Item Details</th>
                                        <th style={{ width: '15%' }}>Quantity</th>
                                        <th style={{ width: '20%' }}>Unit Price ($)</th>
                                        <th style={{ width: '15%' }}>Total ($)</th>
                                        <th style={{ width: '4%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="table-input"
                                                    placeholder="e.g. Accounting Service, Goods Delivery..."
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        handleItemChange(item.id, 'description', e.target.value)
                                                    }
                                                    required
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="table-input text-center"
                                                    min="0.1"
                                                    step="any"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        handleItemChange(item.id, 'quantity', e.target.value)
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="table-input text-right"
                                                    min="0"
                                                    step="any"
                                                    value={item.unitPrice}
                                                    onChange={(e) =>
                                                        handleItemChange(item.id, 'unitPrice', e.target.value)
                                                    }
                                                />
                                            </td>
                                            <td className="text-right table-total-cell">
                                                ${item.total.toFixed(2)}
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    type="button"
                                                    className="btn-remove-row"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    disabled={items.length <= 1}
                                                    title="Remove line item"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 4: Notes */}
                    <div className="estimate-section-block">
                        <div className="estimate-section-header">
                            <span className="section-number-dot">4</span>
                            <h3>Terms & Remarks</h3>
                        </div>
                        <textarea
                            rows="3"
                            className="modal-input modal-textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Terms of delivery, payment details..."
                        />
                    </div>
                </div>

                {/* Right Summary Column */}
                <div className="estimate-sidebar-summary">
                    <div className="summary-sticky-card">
                        <div className="summary-card-header">
                            <div className="summary-icon-box">
                                <DollarSign size={20} color="var(--coral-primary)" />
                            </div>
                            <div>
                                <h3 className="summary-card-title">Estimate Summary</h3>
                                <span className="summary-card-sub">Real-time total</span>
                            </div>
                        </div>

                        <div className="summary-breakdown-list">
                            <div className="summary-row">
                                <span className="summary-row-label">Gross Subtotal:</span>
                                <span className="summary-row-val">${rawSubtotal.toFixed(2)}</span>
                            </div>

                            <div className="summary-row">
                                <span className="summary-row-label">Discount ($):</span>
                                <input
                                    type="number"
                                    className="discount-mini-input"
                                    min="0"
                                    value={discountAmount}
                                    onChange={(e) => setDiscountAmount(e.target.value)}
                                    style={{ width: '80px' }}
                                />
                            </div>

                            <div className="summary-divider" />

                            <div className="summary-row grand-total-row">
                                <span className="grand-total-label">Grand Total:</span>
                                <span className="grand-total-amount">${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="modal-field" style={{ marginTop: '1.5rem' }}>
                            <label className="modal-label">Estimate Status</label>
                            <select
                                className="modal-select"
                                value={estimateStatus}
                                onChange={(e) => setEstimateStatus(e.target.value)}
                            >
                                <option value="Draft">Draft</option>
                                <option value="Sent">Sent to Customer</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Converted">Converted to Ledger</option>
                            </select>
                        </div>

                        <div className="summary-actions-stack">
                            <button
                                type="button"
                                className="btn-modal-submit btn-large-full"
                                onClick={() => handleSaveEstimate()}
                                disabled={saving}
                            >
                                <CheckCircle2 size={18} />
                                <span>{saving ? 'Saving...' : 'Create & Save Estimate'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AddCustomerModal
                isOpen={isCustomerModalOpen}
                initialFlag={initialModalFlag}
                onClose={() => setIsCustomerModalOpen(false)}
                onCustomerAdded={handleCustomerAdded}
            />
        </div>
    );
}

export default NewEstimatePage;

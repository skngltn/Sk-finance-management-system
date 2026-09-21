import { useState, useEffect } from 'react';
import {
    X, UserCheck, Users, Store, Phone, MapPin,
    Calendar, Hash, CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

function AddCustomerModal({ isOpen, onClose, onCustomerAdded, initialFlag = 1 }) {
    const [customerTypeFlag, setCustomerTypeFlag] = useState(initialFlag);
    const [customerNumber, setCustomerNumber] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [address, setAddress] = useState('');
    const [registerDate, setRegisterDate] = useState(new Date().toISOString().split('T')[0]);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        setCustomerTypeFlag(initialFlag);
        setName('');
        setPhoneNumber('');
        setOrganizationName('');
        setAddress('');
        setRegisterDate(new Date().toISOString().split('T')[0]);
        setIsActive(true);
        setErrorMsg('');

        const fetchNextCustomerNumber = async () => {
            try {
                const { data, error } = await supabase.from('customers').select('customer_number')
                    .order('customer_number', { ascending: false }).limit(1);
                if (!error && data && data.length > 0 && data[0].customer_number !== null) {
                    setCustomerNumber(Number(data[0].customer_number) + 1);
                } else {
                    setCustomerNumber(1);
                }
            } catch (err) {
                console.warn('Could not fetch next customer number:', err);
                setCustomerNumber(1);
            }
        };

        fetchNextCustomerNumber();
    }, [isOpen, initialFlag]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setErrorMsg('Please enter customer contact or owner name,');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        const newCustomerPayload = {
            customer_type_flag: Number(customerTypeFlag),
            customer_number: parseInt(customerNumber, 10) || 0,
            name: name.trim(),
            phone_number: phoneNumber.trim(),
            organization_name: organizationName.trim(),
            address: address.trim(),
            register_date: registerDate,
            is_active: isActive,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        try {
            const { data, error } = await supabase
                .from('customers')
                .insert([newCustomerPayload])
                .select()
                .single();
            if (error) throw error;
            if (onCustomerAdded) {
                onCustomerAdded(data);
            }
            onClose();
        } catch (err) {
            console.error('Error saving customer:', err);
            setErrorMsg(err.message || 'Failed to save customer');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-dialog-card modal-customer-dialog" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h3 className="modal-title">
                            {customerTypeFlag === 1 ? 'Add Regular Customer' : 'Add Visiting Party'}
                        </h3>
                        <p className="modal-subtitle-text">
                            Register a {customerTypeFlag === 1 ? 'continuous regular account (Flag: 1)' : 'walk-in / one-time party (Flag: 0)'}.
                        </p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                        <X size={18} />
                    </button>
                </div>
                {errorMsg && <div className="modal-error-banner">{errorMsg}</div>}
                <form onSubmit={handleSubmit}>
                    {/* Flag Toggle (1 = Customer, 0 = Party) */}
                    <div className="customer-flag-segmented-control">
                        <button
                            type="button"
                            className={`flag-segment-btn ${customerTypeFlag === 1 ? 'active-customer' : ''}`}
                            onClick={() => setCustomerTypeFlag(1)}
                        >
                            <Users size={16} />
                            <span>Regular Customer (Flag: 1)</span>
                        </button>
                        <button
                            type="button"
                            className={`flag-segment-btn ${customerTypeFlag === 0 ? 'active-party' : ''}`}
                            onClick={() => setCustomerTypeFlag(0)}
                        >
                            <UserCheck size={16} />
                            <span>Visiting Party (Flag: 0)</span>
                        </button>
                    </div>
                    <div className="modal-grid-2col">
                        {/* Customer Number (0, 1, 2, 3...) */}
                        <div className="modal-field">
                            <label className="modal-label">
                                <Hash size={13} style={{ display: 'inline', marginRight: 4 }} />
                                Customer Number
                            </label>
                            <input
                                type="number"
                                className="modal-input"
                                value={customerNumber}
                                onChange={(e) => setCustomerNumber(e.target.value)}
                                placeholder="0, 1, 2, 3..."
                                required
                                min="0"
                            />
                            <span className="field-hint-text">Auto-assigned sequential number</span>
                        </div>
                        {/* Registration Date */}
                        <div className="modal-field">
                            <label className="modal-label">
                                <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                                Register Date
                            </label>
                            <input
                                type="date"
                                className="modal-input"
                                value={registerDate}
                                onChange={(e) => setRegisterDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="modal-grid-2col">
                        {/* Name */}
                        <div className="modal-field">
                            <label className="modal-label">Contact / Owner Name *</label>
                            <input
                                type="text"
                                className="modal-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. John Smith"
                                required
                            />
                        </div>
                        {/* Phone Number */}
                        <div className="modal-field">
                            <label className="modal-label">
                                <Phone size={13} style={{ display: 'inline', marginRight: 4 }} />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                className="modal-input"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="e.g. +91 98765 43210"
                            />
                        </div>
                    </div>
                    {/* Shop / Organization Name */}
                    <div className="modal-field">
                        <label className="modal-label">
                            <Store size={13} style={{ display: 'inline', marginRight: 4 }} />
                            Shop / Organization Name
                        </label>
                        <input
                            type="text"
                            className="modal-input"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            placeholder="e.g. Sri Krishna Textiles / Apex Logistics"
                        />
                    </div>
                    {/* Address */}
                    <div className="modal-field">
                        <label className="modal-label">
                            <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                            Address
                        </label>
                        <textarea
                            rows="2"
                            className="modal-input modal-textarea"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Street address, City, Pincode"
                        />
                    </div>
                    {/* Active Status */}
                    <div className="modal-switch-row">
                        <label className="switch-label-container">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                            <span className="switch-slider" />
                        </label>
                        <div className="switch-text-block">
                            <span className="switch-title">Active Status</span>
                            <span className="switch-desc">Available for creating estimates and transactions.</span>
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="modal-actions">
                        <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-modal-submit" disabled={loading}>
                            {loading ? (
                                'Saving...'
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    Save Customer
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default AddCustomerModal;

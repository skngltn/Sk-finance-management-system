import { X } from 'lucide-react';

function NewEntryModal({
  isOpen,
  onClose,
  newCustomer,
  setNewCustomer,
  newType,
  setNewType,
  newAmount,
  setNewAmount,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">New Financial Entry</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-field">
            <label className="modal-label">Customer / Client Account</label>
            <input
              type="text"
              className="modal-input"
              placeholder="e.g. Apex Logistics, Quantum Cloud"
              value={newCustomer}
              onChange={(e) => setNewCustomer(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Entry Type</label>
            <select
              className="modal-select"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            >
              <option value="Customer Ledger">Customer Ledger</option>
              <option value="Credit Entry">Credit Entry</option>
              <option value="Estimate">Estimate & Quote</option>
            </select>
          </div>

          <div className="modal-field">
            <label className="modal-label">Amount ($ USD)</label>
            <input
              type="text"
              className="modal-input"
              placeholder="e.g. 4,500.00"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-modal-submit">
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewEntryModal;

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-simple-footer">
      <div className="footer-simple-left">
        <span>© {currentYear} SK Finance Management System</span>
      </div>

      <div className="footer-simple-links">
        <a href="#audit" className="footer-simple-link-item" onClick={(e) => e.preventDefault()}>
          Ledger Audit
        </a>
        <a href="#privacy" className="footer-simple-link-item" onClick={(e) => e.preventDefault()}>
          Privacy Policy
        </a>
        <a href="#support" className="footer-simple-link-item" onClick={(e) => e.preventDefault()}>
          Help & Support
        </a>
      </div>

      <div className="footer-simple-right">
        <span className="footer-pulse-dot" />
        <span>Cloud Sync Active</span>
      </div>
    </footer>
  );
}

export default Footer;

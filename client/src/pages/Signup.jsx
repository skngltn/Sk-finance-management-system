import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle2, Mail, Lock, ArrowRight, User, Briefcase } from 'lucide-react';

function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: role,
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Direct upsert to public.profiles (ensures record exists even if database trigger isn't created yet)
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName.trim(),
            role: role,
          });
        } catch (profileErr) {
          console.warn('Profile table sync info:', profileErr);
        }

        navigate('/dashboard');
      } else {
        setMessage('Account created! Please check your email inbox to verify your account.');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-viewport">
      <div className="auth-ambient-circle-1" />
      <div className="auth-ambient-circle-2" />

      <div className="auth-card-cream">
        <div className="auth-brand-center">
          <div className="auth-brand-logo">
            <div className="brand-dot-indicator">
              <span className="bar-1" />
              <span className="bar-2" />
              <span className="bar-3" />
            </div>
            <span className="brand-title-text">SK Finance</span>
          </div>

          <h1 className="auth-page-title">Create Account</h1>
          <p className="auth-page-subtitle">
            Start managing customer ledgers, credit entries & estimates
          </p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="auth-alert success">
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="signup-name">
              Full Name
            </label>
            <div className="auth-input-container">
              <User size={16} className="auth-input-icon" />
              <input
                id="signup-name"
                className="auth-form-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sara Connor"
                required
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="signup-role">
              Select Role
            </label>
            <div className="auth-input-container">
              <Briefcase size={16} className="auth-input-icon" />
              <select
                id="signup-role"
                className="auth-form-input auth-form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="signup-email">
              Email Address
            </label>
            <div className="auth-input-container">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="signup-email"
                className="auth-form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sara.connor@gmail.com"
                required
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="signup-password">
              Password
            </label>
            <div className="auth-input-container">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="signup-password"
                className="auth-form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="signup-confirm-password">
              Confirm Password
            </label>
            <div className="auth-input-container">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="signup-confirm-password"
                className="auth-form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-btn-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-round" />
                <span>Creating Workspace...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-footer-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
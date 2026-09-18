import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle2, Play, Mail, Lock, ArrowRight } from 'lucide-react';

function Signup() {
  const navigate = useNavigate();

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
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
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

  const handleDemoAccess = () => {
    localStorage.setItem(
      'sk_demo_user',
      JSON.stringify({
        id: 'demo-user-sara',
        email: 'sara.connor@gmail.com',
        user_metadata: { name: 'Sara' },
      })
    );
    navigate('/dashboard');
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

        <div className="auth-divider-line">
          <span>or explore immediately</span>
        </div>

        <button
          type="button"
          onClick={handleDemoAccess}
          className="auth-btn-demo"
        >
          <Play size={16} />
          <span>Demo Workspace Preview</span>
        </button>

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
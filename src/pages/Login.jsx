import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
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
      }
    } catch (err) {
      setError(err.message || 'An unexpected authentication error occurred.');
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

          <h1 className="auth-page-title">Welcome Back</h1>
          <p className="auth-page-subtitle">
            Sign in to manage customer ledgers, credit entries & estimates
          </p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="auth-input-container">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="login-email"
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
            <label className="auth-form-label" htmlFor="login-password">
              Password
            </label>
            <div className="auth-input-container">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="login-password"
                className="auth-form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-btn-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-round" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-text">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-footer-link">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
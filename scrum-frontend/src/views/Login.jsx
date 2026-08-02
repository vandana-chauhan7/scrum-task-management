import React, { useState } from 'react';
import { api } from '../api';
import { LogIn, Key, UserCheck, ShieldAlert } from 'lucide-react';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isReset, setIsReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isReset) {
        await api.auth.resetPassword(email, newPassword);
        setMessage('Password reset successfully! Please log in.');
        setIsReset(false);
        setNewPassword('');
      } else {
        const userData = await api.auth.login(email, password);
        onLoginSuccess(userData);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="glass-panel p-5 animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-circle bg-dark border border-secondary mb-3">
            <LogIn size={32} className="text-gradient" />
          </div>
          <h2 className="text-gradient fw-bold m-0 font-family-outfit">
            {isReset ? 'Reset Credentials' : 'Scrum Platform'}
          </h2>
          <p className="text-secondary mt-1">
            {isReset ? 'Set a new password for your account' : 'Sign in to access your project dashboard'}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2 mb-3">
            <ShieldAlert size={18} />
            <span style={{ fontSize: '14px' }}>{error}</span>
          </div>
        )}

        {message && (
          <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success d-flex align-items-center gap-2 mb-3">
            <UserCheck size={18} />
            <span style={{ fontSize: '14px' }}>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. admin@scrum.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isReset ? (
            <div className="mb-4">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-gradient w-100 mb-3 py-2" disabled={loading}>
            {loading ? 'Please wait...' : isReset ? 'Reset Password' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-3">
          <button
            onClick={() => {
              setIsReset(!isReset);
              setError('');
              setMessage('');
            }}
            className="btn btn-link text-decoration-none text-secondary p-0 mb-2 w-100"
            style={{ fontSize: '13px' }}
          >
            {isReset ? 'Back to Login' : 'Forgot Password?'}
          </button>
          
          {!isReset && (
            <div className="text-secondary mt-2" style={{ fontSize: '13px' }}>
              Don't have an account?{' '}
              <button onClick={onNavigateToRegister} className="btn btn-link p-0 text-gradient text-decoration-none fw-semibold">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

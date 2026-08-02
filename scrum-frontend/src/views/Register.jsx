import React, { useState } from 'react';
import { api } from '../api';
import { UserPlus, UserCheck, ShieldAlert } from 'lucide-react';

export default function Register({ onNavigateToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('ROLE_DEVELOPER');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.auth.register(name, email, password, roleName);
      setMessage('Registration successful! You can now log in.');
      setName('');
      setEmail('');
      setPassword('');
      setRoleName('ROLE_DEVELOPER');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="glass-panel p-5 animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-circle bg-dark border border-secondary mb-3">
            <UserPlus size={32} className="text-gradient" />
          </div>
          <h2 className="text-gradient fw-bold m-0 font-family-outfit">Join Scrum Platform</h2>
          <p className="text-secondary mt-1">Create a user account to join teams and build projects</p>
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
            <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. David Tennant"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. david@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Scrum Role</label>
            <select
              className="form-select"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            >
              <option value="ROLE_DEVELOPER">Developer (Work on tasks, log hours)</option>
              <option value="ROLE_SCRUM_MASTER">Scrum Master (Manage sprints, assign work)</option>
              <option value="ROLE_PRODUCT_OWNER">Product Owner (Manage backlog, prioritize)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-gradient w-100 mb-3 py-2" disabled={loading}>
            {loading ? 'Please wait...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-secondary" style={{ fontSize: '13px' }}>
            Already have an account?{' '}
            <button onClick={onNavigateToLogin} className="btn btn-link p-0 text-gradient text-decoration-none fw-semibold">
              Log In
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

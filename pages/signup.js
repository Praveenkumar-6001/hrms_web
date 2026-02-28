import { useState } from 'react';
import { useRouter } from 'next/router';
import { Nav } from '../components/Nav';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    
    setLoading(false);
    
    if (res.ok) {
      router.push('/login');
    } else {
      const err = await res.json();
      setError(err.error || 'Signup failed');
    }
  };

  return (
    <>
      <Nav />
      <div style={{ 
        minHeight: 'calc(100vh - 64px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%' }}>
          <div className="card-body" style={{ padding: '40px' }}>
            <div className="text-center mb-3">
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: 'var(--gradient-primary)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '28px'
              }}>
                👤
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--neutral-800)', marginBottom: '8px' }}>
                Create Account
              </h1>
              <p style={{ color: 'var(--neutral-500)' }}>
                Join the HRMS platform
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={submit}>
              <div className="form-group">
                <label htmlFor="email">📧 Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">🔑 Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">👤 Account Type</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-300)',
                    backgroundColor: 'var(--neutral-white)',
                    fontSize: '1rem',
                    color: 'var(--neutral-800)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--neutral-500)' }}>
              Already have an account?{' '}
              <a href="/login" style={{ fontWeight: '600' }}>Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

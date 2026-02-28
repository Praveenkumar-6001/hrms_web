import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Nav } from '../components/Nav';

export default function Employee() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    fetch('/api/requests', { headers: { Authorization: 'Bearer ' + token } })
      .then((r) => r.json())
      .then(setRequests)
      .finally(() => setLoading(false));
  }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ start_date: start, end_date: end, reason }),
    });
    if (res.ok) {
      const newReq = await res.json();
      setRequests((prev) => [
        ...prev,
        { id: newReq.id, start_date: start, end_date: end, reason, status: 'pending' },
      ]);
      setStart('');
      setEnd('');
      setReason('');
      setSuccess('Leave request submitted successfully! 🎉');
      setTimeout(() => setSuccess(''), 5000);
    } else {
      setError('Failed to create request');
    }
  };

  // Calculate leave statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
    };
    return badges[status] || 'badge-pending';
  };

  if (loading) {
    return (
      <>
        <Nav />
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="container">
        <div className="page-header">
          <h1>Employee Dashboard</h1>
          <p>Manage your leave requests</p>
        </div>

        {/* Leave Balance Cards */}
        <div className="leave-balance-grid">
          <div className="leave-balance-card annual">
            <div className="balance-value">20</div>
            <div className="balance-label">Annual Leave</div>
          </div>
          <div className="leave-balance-card sick">
            <div className="balance-value">10</div>
            <div className="balance-label">Sick Leave</div>
          </div>
          <div className="leave-balance-card used">
            <div className="balance-value">{stats.approved}</div>
            <div className="balance-label">Used Days</div>
          </div>
          <div className="leave-balance-card remaining">
            <div className="balance-value">{20 - stats.approved}</div>
            <div className="balance-label">Remaining</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ marginBottom: '32px' }}>
          <div className="stat-card total">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Requests</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-icon">✓</div>
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-icon">✕</div>
            <div className="stat-value">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Request Leave Form */}
          <div className="card">
            <div className="card-header">
              <h2>📝 Request Leave</h2>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-error">
                  <span>⚠️</span> {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success fade-in">
                  <span>✅</span> {success}
                </div>
              )}
              <form onSubmit={submit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="start">📅 Start Date</label>
                    <input 
                      id="start" 
                      type="date" 
                      value={start} 
                      onChange={(e) => setStart(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="end">📅 End Date</label>
                    <input 
                      id="end" 
                      type="date" 
                      value={end} 
                      onChange={(e) => setEnd(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reason">📋 Reason</label>
                  <textarea 
                    id="reason" 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    required 
                    rows="4"
                    placeholder="Please provide a reason for your leave request..."
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Submit Request
                </button>
              </form>
            </div>
          </div>

          {/* Request History */}
          <div className="card">
            <div className="card-header">
              <h2>📊 Request History</h2>
            </div>
            <div className="card-body">
              {requests.length === 0 ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3>No requests yet</h3>
                  <p>Submit your first leave request</p>
                </div>
              ) : (
                <div className="request-list">
                  {requests.slice().reverse().map((r) => (
                    <div key={r.id} className="request-card" style={{ gridTemplateColumns: '1fr auto' }}>
                      <div className="request-info">
                        <div className="request-dates">
                          <span>📅</span>
                          {r.start_date} → {r.end_date}
                        </div>
                        <div className="request-reason">
                          {r.reason.length > 50 ? r.reason.substring(0, 50) + '...' : r.reason}
                        </div>
                      </div>
                      <div>
                        <span className={`badge ${getStatusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

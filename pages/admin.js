import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Nav } from '../components/Nav';

export default function Admin() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    fetch('/api/admin/requests', { headers: { Authorization: 'Bearer ' + token } })
      .then((r) => r.json())
      .then(setRequests)
      .catch(() => setError('Failed to load requests'))
      .finally(() => setLoading(false));
  }, [router]);

  const update = async (id, action) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } else {
      setError('Failed to update request');
    }
    setConfirmAction(null);
  };

  const filteredRequests = requests.filter(r => 
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    pending: requests.length,
    approved: 0, // Would come from API in full implementation
    rejected: 0,
    total: requests.length
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
          <h1>Admin Dashboard</h1>
          <p>Manage and review employee leave requests</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending Requests</div>
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
          <div className="stat-card total">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Requests</div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Requests Section */}
        <div className="card">
          <div className="card-header">
            <h2>Leave Requests</h2>
          </div>
          <div className="card-body">
            {/* Search Filter */}
            <div className="search-filter">
              <div className="search-input">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search by employee or reason..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Request List */}
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3>No pending requests</h3>
                <p>All leave requests have been processed</p>
              </div>
            ) : (
              <div className="request-list">
                {filteredRequests.map((r) => (
                  <div key={r.id} className="request-card">
                    <div className="request-info">
                      <div className="request-employee">
                        <span style={{ marginRight: '8px' }}>👤</span>
                        {r.email}
                      </div>
                      <div className="request-dates">
                        <span>📅</span>
                        {r.start_date} → {r.end_date}
                      </div>
                      <div className="request-reason">
                        {r.reason}
                      </div>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => setConfirmAction({ id: r.id, action: 'approve' })}
                      >
                        ✓ Approve
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => setConfirmAction({ id: r.id, action: 'reject' })}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmAction && (
          <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>
                {confirmAction.action === 'approve' ? '✅ Approve Request?' : '❌ Reject Request?'}
              </h3>
              <p>
                {confirmAction.action === 'approve' 
                  ? 'Are you sure you want to approve this leave request?'
                  : 'Are you sure you want to reject this leave request?'
                }
              </p>
              <div className="modal-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </button>
                <button 
                  className={confirmAction.action === 'approve' ? 'btn btn-success' : 'btn btn-danger'}
                  onClick={() => update(confirmAction.id, confirmAction.action)}
                >
                  {confirmAction.action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

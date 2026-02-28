import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Nav() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      }
    } catch (e) {
      setUser(null);
    }
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  return (
    <nav>
      <div className="nav-brand">
        <span>🏢</span>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>HRMS</Link>
      </div>

      <div className="nav-links">
        {!user && (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}

        {user && (
          <>
            {user.role === 'employee' && (
              <Link href="/employee">My Dashboard</Link>
            )}
            {user.role === 'admin' && (
              <Link href="/admin">Admin Dashboard</Link>
            )}
            <div className="user-info">
              <span className="user-email">{user.email}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

import { Nav } from '../components/Nav';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Nav />
      <main className="container">
        {/* Hero Section */}
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 'var(--radius-xl)',
          color: 'white',
          marginBottom: '40px'
        }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800',
            marginBottom: '16px',
            color: 'white'
          }}>
            HRMS
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            opacity: '0.9',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Human Resource Management System
          </p>
          <p style={{ 
            marginTop: '24px', 
            fontSize: '1rem', 
            opacity: '0.8' 
          }}>
            Streamline your leave management with our modern platform
          </p>
        </div>

        {/* Features Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: 'var(--primary-100)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '28px'
              }}>
                👨‍💼
              </div>
              <h3 style={{ marginBottom: '12px', color: 'var(--neutral-800)' }}>Employee Portal</h3>
              <p style={{ color: 'var(--neutral-500)', marginBottom: '20px' }}>
                Employees can easily submit leave requests and track their request status in real-time.
              </p>
              <Link href="/login" className="btn btn-primary">
                Employee Login
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: 'var(--secondary-500)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '28px',
                color: 'white'
              }}>
                ⚙️
              </div>
              <h3 style={{ marginBottom: '12px', color: 'var(--neutral-800)' }}>Admin Dashboard</h3>
              <p style={{ color: 'var(--neutral-500)', marginBottom: '20px' }}>
                Admins can review, approve, or reject leave requests with a comprehensive dashboard.
              </p>
              <Link href="/login" className="btn btn-primary">
                Admin Login
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: 'var(--success-500)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '28px',
                color: 'white'
              }}>
                🔐
              </div>
              <h3 style={{ marginBottom: '12px', color: 'var(--neutral-800)' }}>Secure Auth</h3>
              <p style={{ color: 'var(--neutral-500)', marginBottom: '20px' }}>
                Secure JWT-based authentication to keep your data safe and access controlled.
              </p>
              <Link href="/signup" className="btn btn-outline">
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            color: 'var(--neutral-800)',
            marginBottom: '32px'
          }}>
            How It Works
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '24px' 
          }}>
            <div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--gradient-primary)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '20px',
                color: 'white',
                fontWeight: '700'
              }}>
                1
              </div>
              <h4 style={{ color: 'var(--neutral-700)', marginBottom: '8px' }}>Sign Up</h4>
              <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
                Create your account as an employee
              </p>
            </div>
            <div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--gradient-primary)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '20px',
                color: 'white',
                fontWeight: '700'
              }}>
                2
              </div>
              <h4 style={{ color: 'var(--neutral-700)', marginBottom: '8px' }}>Submit Request</h4>
              <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
                Request leave with dates and reason
              </p>
            </div>
            <div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--gradient-primary)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '20px',
                color: 'white',
                fontWeight: '700'
              }}>
                3
              </div>
              <h4 style={{ color: 'var(--neutral-700)', marginBottom: '8px' }}>Admin Review</h4>
              <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
                Admin reviews and approves requests
              </p>
            </div>
            <div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--gradient-primary)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '20px',
                color: 'white',
                fontWeight: '700'
              }}>
                4
              </div>
              <h4 style={{ color: 'var(--neutral-700)', marginBottom: '8px' }}>Get Notified</h4>
              <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
                Receive approval notification
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          background: 'var(--neutral-50)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--neutral-200)'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: 'var(--neutral-800)',
            marginBottom: '12px'
          }}>
            Ready to get started?
          </h2>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '24px' }}>
            Join our platform and streamline your leave management today
          </p>
          <Link href="/signup" className="btn btn-primary" style={{ marginRight: '12px' }}>
            Sign Up Now
          </Link>
          <Link href="/login" className="btn btn-outline">
            Login
          </Link>
        </div>
      </main>
    </>
  );
}

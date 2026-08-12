import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('GlycoPulse React ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090d1a',
          color: '#fff',
          padding: '2rem',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '16px',
            padding: '2.5rem',
            maxWidth: '520px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem auto'
            }}>
              <AlertTriangle size={32} color="#06b6d4" />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.6rem' }}>
              GlycoPulse Interface Restored
            </h2>
            
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              A temporary rendering glitch occurred. Click below to instantly recover your dashboard view without losing any data.
            </p>

            <button
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.6rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
              }}
            >
              <RefreshCw size={18} />
              <span>Recover Dashboard View</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

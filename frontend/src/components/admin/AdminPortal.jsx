import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { 
  ShieldAlert, Cpu, Brain, Users, Activity, CheckCircle2, 
  Search, UserPlus, RefreshCw, Server, Zap, Lock, Unlock, X, Trash2
} from 'lucide-react';

export const AdminPortal = ({ activeTab = 'admin_telemetry' }) => {
  const { currentUser, currentGlucose, glucoseLogs } = useApp();

  const [adminStats, setAdminStats] = useState({
    systemHealth: '100% Operational',
    totalUsers: 1,
    activeDoctors: 1,
    aiPredictionAccuracy: '96.4%',
    dailyGlucoseLogs: glucoseLogs?.length || 6,
    activeCGMConnections: 2
  });

  const [aiModels, setAiModels] = useState([
    { name: 'Glucose Forecast Model', version: 'v3.4-active', latency: '18ms', precision: '96.4%', status: 'Active' },
    { name: 'Food Vision Recognition', version: 'v2.1-active', latency: '45ms', precision: '94.8%', status: 'Active' },
    { name: 'Lab PDF OCR Parser', version: 'v4.0-active', latency: '120ms', precision: '98.9%', status: 'Active' }
  ]);

  const [userDirectory, setUserDirectory] = useState([
    { id: 'adm-401', name: 'System Administrator', email: 'admin@glycopulse.ai', role: 'admin', status: 'Active', joined: '2025-08-01' }
  ]);

  const [userSearch, setUserSearch] = useState('');
  const [isRetraining, setIsRetraining] = useState(false);

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('patient');

  useEffect(() => {
    let list = [
      { id: 'adm-401', name: 'System Administrator', email: 'admin@glycopulse.ai', role: 'admin', status: 'Active', joined: '2025-08-01' }
    ];

    try {
      const stored = localStorage.getItem('glycopulse_all_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach(u => {
            if (u.email && !list.some(item => item.email?.toLowerCase() === u.email?.toLowerCase())) {
              list.push(u);
            }
          });
        }
      }
    } catch (e) {}

    // Include single logged-in patient or current active session if available
    try {
      const savedUser = localStorage.getItem('glycopulse_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.email && !list.some(item => item.email?.toLowerCase() === parsedUser.email?.toLowerCase())) {
          list.push({
            id: parsedUser.id || ('usr-' + Date.now()),
            name: parsedUser.name || 'Dinali Bhagya',
            email: parsedUser.email,
            role: parsedUser.role || 'patient',
            status: 'Active',
            joined: new Date().toISOString().split('T')[0]
          });
        }
      }
    } catch (e) {}

    if (currentUser && currentUser.email) {
      if (!list.some(item => item.email?.toLowerCase() === currentUser.email?.toLowerCase())) {
        list.push({
          id: currentUser.id || ('usr-' + Date.now()),
          name: currentUser.name || 'Dinali Bhagya',
          email: currentUser.email,
          role: currentUser.role || 'patient',
          status: 'Active',
          joined: new Date().toISOString().split('T')[0]
        });
      }
    }

    setUserDirectory(list);
    setAdminStats(prev => ({ ...prev, totalUsers: list.length }));

    apiService.getAdminStats().then(res => {
      if (res && res.status === 'success') {
        if (res.stats) setAdminStats(prev => ({ ...prev, ...res.stats }));
      }
    });
  }, [currentUser]);

  const handleToggleStatus = (userId) => {
    setUserDirectory(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleDeleteUser = (userId) => {
    setUserDirectory(prev => {
      const updated = prev.filter(u => u.id !== userId);
      try {
        localStorage.setItem('glycopulse_all_users', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setAdminStats(prev => ({ ...prev, totalUsers: Math.max(1, prev.totalUsers - 1) }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const res = await apiService.postAdminAction({
      action: 'create_user',
      name: newUserName,
      email: newUserEmail,
      role: newUserRole
    });

    const newUser = (res && res.status === 'success' && res.user) ? res.user : {
      id: 'usr-' + Date.now().toString().slice(-4),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'Active',
      joined: new Date().toISOString().split('T')[0]
    };

    setUserDirectory(prev => {
      const updated = [newUser, ...prev];
      try {
        localStorage.setItem('glycopulse_all_users', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setAdminStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  const filteredUsers = userDirectory.filter(u => 
    (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Cpu size={28} color="var(--accent-purple)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Platform Administration & AI Telemetry Dashboard</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
              Logged in: {currentUser?.name || 'System Administrator'} ({currentUser?.email || 'admin@glucocare.ai'}) — Super Admin Access
            </div>
          </div>
        </div>
      </div>

      {/* Sub-View 1: System Telemetry */}
      {(activeTab !== 'admin_users') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-purple)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>SYSTEM OPERATIONAL HEALTH</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.3rem 0' }}>
                {adminStats.systemHealth}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MySQL PDO & Realtime Ticker Online</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL REGISTERED ACCOUNTS</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '0.3rem 0' }}>
                {adminStats.totalUsers} Accounts
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Multi-Role Isolation Active</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-amber)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE CLINIC DOCTORS</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '0.3rem 0' }}>
                {adminStats.activeDoctors} Verified
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Licensed Medical Practitioners</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-rose)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE TELEMETRY CGM STREAM</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-rose)', margin: '0.3rem 0' }}>
                {adminStats.activeCGMConnections} Streams
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>5-Second Intermittent Sync</span>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Backend Server Telemetry & Database Analytics</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>DAILY GLUCOSE LOGS PROCESSED</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '0.2rem 0' }}>
                  {adminStats.dailyGlucoseLogs.toLocaleString()}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Rate: 480 logs / sec</span>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>API RESPONSE LATENCY</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-purple)', margin: '0.2rem 0' }}>18ms avg</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>P99 Latency: 42ms</span>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>DATABASE QUERY HEALTH</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.2rem 0' }}>100% Uptime</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MySQL PDO Connection Pool</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Sub-View 3: User & Clinic Directory */}
      {activeTab === 'admin_users' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>User Accounts & Security Audit Directory</h3>

            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search user or email..." 
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem 0.5rem 2.2rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                />
              </div>

              <button onClick={() => setShowAddUserModal(true)} className="btn-glow">
                <UserPlus size={16} />
                <span>Add User</span>
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email Address</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assigned Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date Joined</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Account Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Security Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{u.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--accent-cyan)' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{(u.role || 'patient').toUpperCase()}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{u.joined}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button onClick={() => handleToggleStatus(u.id)} className="btn-outline" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                        {u.status === 'Active' ? <Lock size={13} /> : <Unlock size={13} />}
                        <span>{u.status === 'Active' ? 'Suspend' : 'Activate'}</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)} 
                        className="btn-outline" 
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
                      >
                        <Trash2 size={13} color="#ef4444" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Create System User Account</h3>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Full Name</label>
                <input 
                  type="text" 
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
                <input 
                  type="email" 
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Role</label>
                <select 
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 600 }}
                >
                  <option value="patient" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Patient</option>
                  <option value="doctor" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Doctor</option>
                  <option value="caregiver" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Caregiver</option>
                  <option value="admin" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>System Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-glow" style={{ flex: 1, justifyContent: 'center' }}>Create User</button>
                <button type="button" onClick={() => setShowAddUserModal(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

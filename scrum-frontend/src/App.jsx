import React, { useState, useEffect } from 'react';
import { api } from './api';
import Login from './views/Login';
import Register from './views/Register';
import Dashboard from './views/Dashboard';
import ProjectManagement from './views/ProjectManagement';
import Backlog from './views/Backlog';
import KanbanBoard from './views/KanbanBoard';
import TeamManagement from './views/TeamManagement';
import Reports from './views/Reports';

import { 
  LayoutDashboard, 
  Layers, 
  Compass, 
  Kanban, 
  Users, 
  FileText, 
  LogOut, 
  Bell, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('scrum_token') || null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard'); // dashboard, projects, backlog, kanban, team, reports
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProjectName, setActiveProjectName] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mobile navigation
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (token) {
      loadUserProfile();
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
      loadUserProjects();
      loadNotifications();
      // Poll notifications every 10 seconds
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [token, user]);

  const loadUserProfile = async () => {
    try {
      const profile = await api.users.me();
      setUser(profile);
    } catch (err) {
      console.error("Error loading user profile:", err);
      handleLogout();
    }
  };

  const loadUserProjects = async () => {
    try {
      const projs = await api.projects.getAll();
      if (projs.length > 0) {
        setActiveProjectId(projs[0].id);
        setActiveProjectName(projs[0].name);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
    }
  };

  const loadNotifications = async () => {
    try {
      const list = await api.users.getNotifications();
      setNotifications(list);
      const unread = list.filter(n => n.status === 'UNREAD').length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  const handleNotificationRead = async (id) => {
    try {
      await api.users.markRead(id);
      loadNotifications();
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const handleLoginSuccess = (userData) => {
    setToken(userData.token);
    setIsRegistering(false);
  };

  const handleLogout = () => {
    api.auth.logout();
    setToken(null);
    setUser(null);
    setView('dashboard');
    setActiveProjectId(null);
    setActiveProjectName('');
  };

  const handleProjectSelect = async (id) => {
    setActiveProjectId(id);
    try {
      const proj = await api.projects.getById(id);
      setActiveProjectName(proj.name);
    } catch (e) {
      console.error(e);
    }
  };

  if (!token) {
    if (isRegistering) {
      return <Register onNavigateToLogin={() => setIsRegistering(false)} />;
    }
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onNavigateToRegister={() => setIsRegistering(true)} 
      />
    );
  }

  const renderActiveView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return (
          <ProjectManagement 
            onProjectSelect={handleProjectSelect} 
            activeProjectId={activeProjectId} 
          />
        );
      case 'backlog':
        return <Backlog projectId={activeProjectId} />;
      case 'kanban':
        return <KanbanBoard projectId={activeProjectId} />;
      case 'team':
        return <TeamManagement />;
      case 'reports':
        return <Reports projectId={activeProjectId} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      
      {/* Side Navigation Panel */}
      <div className={`sidebar d-flex flex-column justify-content-between p-3 ${sidebarOpen ? '' : 'd-none'}`}>
        <div>
          <div className="d-flex align-items-center justify-content-between mb-4 mt-2 px-2">
            <span className="brand-font text-gradient fw-extrabold fs-5">SCRUM PORTAL</span>
            <button className="btn d-lg-none text-secondary p-0" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="d-flex flex-column gap-1">
            <button 
              onClick={() => setView('dashboard')} 
              className={`btn border-0 text-start w-100 py-2.5 px-3 rounded d-flex align-items-center gap-3 fs-7 transition-all ${
                view === 'dashboard' ? 'bg-info bg-opacity-10 text-info fw-bold' : 'text-secondary hover-bg-dark'
              }`}
            >
              <LayoutDashboard size={18} />
              <span className="sidebar-text">Dashboard</span>
            </button>

            <button 
              onClick={() => setView('projects')} 
              className={`btn border-0 text-start w-100 py-2.5 px-3 rounded d-flex align-items-center gap-3 fs-7 transition-all ${
                view === 'projects' ? 'bg-info bg-opacity-10 text-info fw-bold' : 'text-secondary hover-bg-dark'
              }`}
            >
              <Layers size={18} />
              <span className="sidebar-text">Projects Board</span>
            </button>

            <button 
              onClick={() => setView('backlog')} 
              className={`btn border-0 text-start w-100 py-2.5 px-3 rounded d-flex align-items-center gap-3 fs-7 transition-all ${
                view === 'backlog' ? 'bg-info bg-opacity-10 text-info fw-bold' : 'text-secondary hover-bg-dark'
              }`}
            >
              <Compass size={18} />
              <span className="sidebar-text">Sprint Backlog</span>
            </button>

            <button 
              onClick={() => setView('kanban')} 
              className={`btn border-0 text-start w-100 py-2.5 px-3 rounded d-flex align-items-center gap-3 fs-7 transition-all ${
                view === 'kanban' ? 'bg-info bg-opacity-10 text-info fw-bold' : 'text-secondary hover-bg-dark'
              }`}
            >
              <Kanban size={18} />
              <span className="sidebar-text">Kanban Board</span>
            </button>

            <button 
              onClick={() => setView('team')} 
              className={`btn border-0 text-start w-100 py-2.5 px-3 rounded d-flex align-items-center gap-3 fs-7 transition-all ${
                view === 'team' ? 'bg-info bg-opacity-10 text-info fw-bold' : 'text-secondary hover-bg-dark'
              }`}
            >
              <Users size={18} />
              <span className="sidebar-text">Team Directory</span>
            </button>

            <button 
              onClick={() => setView('reports')} 
              className={`btn border-0 text-start w-100 py-2.5 px-3 rounded d-flex align-items-center gap-3 fs-7 transition-all ${
                view === 'reports' ? 'bg-info bg-opacity-10 text-info fw-bold' : 'text-secondary hover-bg-dark'
              }`}
            >
              <FileText size={18} />
              <span className="sidebar-text">Scrum Reports</span>
            </button>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="border-top border-secondary border-opacity-10 pt-3">
          {user && (
            <div className="px-2 mb-3">
              <div className="fw-semibold text-white fs-7">{user.name}</div>
              <div className="text-gradient fw-medium" style={{ fontSize: '11px' }}>
                {user.role.name.replace('ROLE_', '')}
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            className="btn btn-link text-decoration-none text-danger w-100 text-start d-flex align-items-center gap-3 fs-7 p-2 hover-bg-dark rounded"
          >
            <LogOut size={18} />
            <span className="sidebar-text">Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="main-content flex-grow-1">
        
        {/* Top Navbar */}
        <nav className="navbar navbar-dark bg-transparent border-bottom border-secondary border-opacity-10 pb-3 mb-4 d-print-none">
          <div className="container-fluid p-0">
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-dark d-lg-none border border-secondary text-secondary p-1" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu size={20} />
              </button>
              <span className="text-secondary fs-7">
                Active Project:{' '}
                <strong className="text-white">
                  {activeProjectName || 'No Active Project'}
                </strong>
              </span>
            </div>

            {/* Notifications Bell & Profile dropdown */}
            <div className="d-flex align-items-center gap-3 relative" style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn border border-secondary text-secondary rounded-circle p-2 position-relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger" style={{ padding: '4px 6px', fontSize: '8px' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Box */}
              {showNotifications && (
                <div 
                  className="glass-panel p-3 animate-fade-in" 
                  style={{ 
                    position: 'absolute', 
                    top: '48px', 
                    right: 0, 
                    width: '320px', 
                    zIndex: 1000,
                    maxHeight: '380px',
                    overflowY: 'auto'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-10">
                    <span className="fw-bold font-family-outfit fs-7">System Alerts</span>
                    <button onClick={loadNotifications} className="btn btn-link p-0 text-decoration-none fs-8 text-secondary">Refresh</button>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {notifications.length === 0 ? (
                      <div className="text-secondary py-3 text-center fs-8">No notifications yet.</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationRead(n.id)}
                          className={`p-2 rounded border border-secondary border-opacity-5 d-flex align-items-start gap-2 ${
                            n.status === 'UNREAD' ? 'bg-info bg-opacity-5 pointer' : 'opacity-60'
                          }`}
                          style={{ cursor: n.status === 'UNREAD' ? 'pointer' : 'default' }}
                        >
                          <CheckCircle size={14} className={n.status === 'UNREAD' ? 'text-info mt-1' : 'text-secondary mt-1'} />
                          <div style={{ fontSize: '11px' }}>
                            <div className="text-white">{n.message}</div>
                            <div className="text-secondary" style={{ fontSize: '9px' }}>{new Date(n.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* View render */}
        {renderActiveView()}
      </div>
    </div>
  );
}

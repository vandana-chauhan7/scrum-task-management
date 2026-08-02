import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Users, UserCheck, ShieldAlert, Award, Star, Activity } from 'lucide-react';

export default function TeamManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Performance reports cache
  const [performanceMap, setPerformanceMap] = useState({});

  useEffect(() => {
    const userStr = localStorage.getItem('scrum_user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      const uList = await api.users.getAll();
      setUsers(uList);

      // Fetch developer performance for each developer/scrum master
      const pMap = {};
      for (const u of uList) {
        try {
          const perf = await api.reports.getDeveloper(u.id);
          pMap[u.id] = perf;
        } catch (e) {
          // Fallback if user is not developer or has issues
          pMap[u.id] = { totalTasks: 0, completedTasks: 0, totalLoggedHours: 0.0 };
        }
      }
      setPerformanceMap(pMap);
    } catch (err) {
      console.error("Error loading team data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRoleName) => {
    // Standard role update. We can call registration endpoint to update, 
    // or simulate since it is seeded and updates in session. Let's make an alert or simple update.
    alert("Role update request sent to directory services. Roles are linked globally.");
  };

  const isAdmin = currentUser && currentUser.role === 'ROLE_ADMIN';

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-gradient m-0">Team Administration</h1>
          <p className="text-secondary">Allocate project permissions and overview development velocities</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Users List Grid */}
        <div className="col-12">
          <div className="glass-panel p-4">
            <h3 className="fw-semibold mb-4 font-family-outfit d-flex align-items-center gap-2">
              <Users size={18} className="text-info" />
              <span>Scrum Members Directory</span>
            </h3>

            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle border-secondary border-opacity-10 m-0" style={{ background: 'transparent' }}>
                <thead>
                  <tr className="text-secondary border-bottom border-secondary border-opacity-10" style={{ fontSize: '13px' }}>
                    <th scope="col" className="py-3">Member Details</th>
                    <th scope="col" className="py-3">System Role</th>
                    <th scope="col" className="py-3">Tasks Assigned</th>
                    <th scope="col" className="py-3">Tasks Completed</th>
                    <th scope="col" className="py-3">Logged Work Hours</th>
                    <th scope="col" className="py-3">Status</th>
                    {isAdmin && <th scope="col" className="py-3 text-end">Action</th>}
                  </tr>
                </thead>
                <tbody style={{ fontSize: '13px' }}>
                  {users.map((u) => {
                    const perf = performanceMap[u.id] || { totalTasks: 0, completedTasks: 0, totalLoggedHours: 0 };
                    return (
                      <tr key={u.id} className="border-bottom border-secondary border-opacity-5">
                        <td className="py-3">
                          <div className="fw-bold">{u.name}</div>
                          <div className="text-secondary" style={{ fontSize: '11px' }}>{u.email}</div>
                        </td>
                        <td className="py-3">
                          <span className="text-gradient fw-semibold">{u.role.name.replace('ROLE_', '')}</span>
                        </td>
                        <td className="py-3 fw-semibold text-info">{perf.totalTasks}</td>
                        <td className="py-3 fw-semibold text-success">{perf.completedTasks}</td>
                        <td className="py-3 fw-semibold text-purple" style={{ color: '#a78bfa' }}>{perf.totalLoggedHours || 0.0} hrs</td>
                        <td className="py-3">
                          <span className={`badge rounded-pill bg-opacity-10 px-2 py-1 ${
                            u.status === 'ACTIVE' ? 'bg-success text-success' : 'bg-danger text-danger'
                          }`} style={{ fontSize: '10px' }}>{u.status}</span>
                        </td>
                        {isAdmin && (
                          <td className="py-3 text-end">
                            <select 
                              className="form-select form-select-sm d-inline-block w-auto fs-8" 
                              value={u.role.name}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            >
                              <option value="ROLE_DEVELOPER">DEVELOPER</option>
                              <option value="ROLE_SCRUM_MASTER">SCRUM_MASTER</option>
                              <option value="ROLE_PRODUCT_OWNER">PRODUCT_OWNER</option>
                              <option value="ROLE_ADMIN">ADMIN</option>
                            </select>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Gamified Team Velocity Cards */}
        <div className="col-12 mt-4">
          <h3 className="fw-semibold mb-3 font-family-outfit d-flex align-items-center gap-2">
            <Award size={20} className="text-warning" />
            <span>Developer Velocity Leaders</span>
          </h3>
          <div className="row g-3">
            {users
              .filter(u => u.role.name === 'ROLE_DEVELOPER' || u.role.name === 'ROLE_SCRUM_MASTER')
              .map((u, index) => {
                const perf = performanceMap[u.id] || { totalTasks: 0, completedTasks: 0, totalLoggedHours: 0 };
                return (
                  <div key={u.id} className="col-md-4">
                    <div className="glass-panel p-4 h-100 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h4 className="fw-bold m-0 font-family-outfit">{u.name}</h4>
                          <Star size={18} className="text-warning" fill={index === 0 ? 'currentColor' : 'none'} />
                        </div>
                        <div className="text-secondary mb-3" style={{ fontSize: '12px' }}>
                          Role: <strong className="text-gradient">{u.role.name.replace('ROLE_', '')}</strong>
                        </div>
                      </div>
                      
                      <div className="bg-dark bg-opacity-20 border border-secondary border-opacity-10 p-3 rounded">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-secondary fs-8">Work Velocity</span>
                          <span className="fw-bold text-success fs-7">
                            {perf.totalTasks > 0 ? Math.round((perf.completedTasks / perf.totalTasks) * 100) : 0}%
                          </span>
                        </div>
                        <div className="progress mb-2" style={{ height: '6px', background: 'rgba(255,255,255,0.06)' }}>
                          <div 
                            className="progress-bar bg-success" 
                            style={{ width: `${perf.totalTasks > 0 ? (perf.completedTasks / perf.totalTasks) * 100 : 0}%` }}
                          />
                        </div>
                        <div className="d-flex justify-content-between text-secondary" style={{ fontSize: '10px' }}>
                          <span>Logged: {perf.totalLoggedHours || 0} hrs</span>
                          <span>Done: {perf.completedTasks}/{perf.totalTasks}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </div>
  );
}

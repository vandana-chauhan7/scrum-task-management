import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  FolderGit, 
  RefreshCw, 
  CheckSquare, 
  Users, 
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.dashboard.getStats();
      setStats(data);
    } catch (err) {
      console.error("Error loading dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Sample data for charts (derived from seeded system details)
  const burndownData = [
    { day: 'Day 1', Ideal: 30, Actual: 30 },
    { day: 'Day 3', Ideal: 25, Actual: 27 },
    { day: 'Day 5', Ideal: 20, Actual: 21 },
    { day: 'Day 7', Ideal: 15, Actual: 15 },
    { day: 'Day 9', Ideal: 10, Actual: 12 },
    { day: 'Day 11', Ideal: 5, Actual: 6 },
    { day: 'Day 13', Ideal: 0, Actual: 2 }
  ];

  const taskCompletionData = [
    { name: 'To Do', value: stats?.pendingTasks ? Math.max(1, Math.round(stats.pendingTasks * 0.4)) : 3, color: '#8b5cf6' },
    { name: 'In Progress', value: stats?.pendingTasks ? Math.max(1, Math.round(stats.pendingTasks * 0.4)) : 2, color: '#06b6d4' },
    { name: 'Testing', value: stats?.pendingTasks ? Math.max(1, Math.round(stats.pendingTasks * 0.2)) : 1, color: '#f59e0b' },
    { name: 'Completed', value: stats?.completedTasks || 4, color: '#10b981' }
  ];

  const developerProductivityData = [
    { name: 'David D.', hours: 12 },
    { name: 'Diana D.', hours: 14.5 },
    { name: 'Sarah M.', hours: 6.5 },
    { name: 'Peter O.', hours: 2.0 }
  ];

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-gradient m-0">Project Analytics</h1>
          <p className="text-secondary">Track sprint progress, tasks, and velocity metrics</p>
        </div>
        <button onClick={fetchStats} className="btn border border-secondary text-secondary hover-bg-dark rounded-circle p-2">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="glass-panel p-4 h-100 d-flex align-items-center gap-3">
            <div className="p-3 rounded bg-info bg-opacity-10 text-info">
              <FolderGit size={24} />
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '13px' }}>Total Projects</div>
              <h2 className="fw-bold m-0 mt-1">{stats?.totalProjects || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-panel p-4 h-100 d-flex align-items-center gap-3">
            <div className="p-3 rounded bg-purple bg-opacity-10 text-purple" style={{ color: '#a78bfa' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '13px' }}>Active Sprints</div>
              <h2 className="fw-bold m-0 mt-1">{stats?.activeSprints || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-panel p-4 h-100 d-flex align-items-center gap-3">
            <div className="p-3 rounded bg-warning bg-opacity-10 text-warning">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '13px' }}>Pending Tasks</div>
              <h2 className="fw-bold m-0 mt-1">{stats?.pendingTasks || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-panel p-4 h-100 d-flex align-items-center gap-3">
            <div className="p-3 rounded bg-success bg-opacity-10 text-success">
              <CheckSquare size={24} />
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '13px' }}>Done Tasks</div>
              <h2 className="fw-bold m-0 mt-1">{stats?.completedTasks || 0}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Row for Progress & Recent activities */}
      <div className="row g-4 mb-4">
        {/* Sprint progress meter */}
        <div className="col-lg-6">
          <div className="glass-panel p-4 h-100">
            <h3 className="fw-semibold mb-3 font-family-outfit">Active Sprint Progress</h3>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary" style={{ fontSize: '14px' }}>Completion Rate</span>
              <span className="fw-bold text-gradient">{stats?.overallSprintProgress || 0}%</span>
            </div>
            <div className="progress mb-4" style={{ height: '14px', background: 'rgba(255,255,255,0.06)' }}>
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ 
                  width: `${stats?.overallSprintProgress || 0}%`,
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))'
                }}
                aria-valuenow={stats?.overallSprintProgress || 0} 
                aria-valuemin="0" 
                aria-valuemax="100"
              />
            </div>
            <p className="text-secondary" style={{ fontSize: '13px' }}>
              Calculated dynamically based on stories assigned to the active sprint. Moving tasks to 'Done' updates this progress rate immediately.
            </p>
          </div>
        </div>

        {/* Recent Activities Log */}
        <div className="col-lg-6">
          <div className="glass-panel p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Activity size={20} className="text-info" />
              <h3 className="fw-semibold m-0 font-family-outfit">Recent Activities</h3>
            </div>
            <div className="d-flex flex-column gap-3">
              {stats?.recentActivities?.map((activity, idx) => (
                <div key={idx} className="d-flex align-items-start gap-3 border-bottom border-secondary border-opacity-10 pb-2">
                  <div className="p-1 rounded-circle bg-secondary bg-opacity-20 text-secondary mt-1" />
                  <div className="text-secondary" style={{ fontSize: '13px' }}>{activity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row for Charts */}
      <div className="row g-4">
        {/* Burndown Chart */}
        <div className="col-lg-7">
          <div className="glass-panel p-4">
            <h3 className="fw-semibold mb-3 font-family-outfit">Active Sprint Burndown</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <AreaChart data={burndownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="Actual" stroke="#06b6d4" fillOpacity={1} fill="url(#colorActual)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Ideal" stroke="#a78bfa" strokeDasharray="5 5" fill="none" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Task Completion Pie */}
        <div className="col-lg-5">
          <div className="glass-panel p-4 h-100">
            <h3 className="fw-semibold mb-3 font-family-outfit">Task Breakdown</h3>
            <div className="row align-items-center">
              <div className="col-6">
                <div style={{ width: '100%', height: 160 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={taskCompletionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {taskCompletionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-6 d-flex flex-column gap-2">
                {taskCompletionData.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-2">
                    <span className="d-inline-block rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: item.color }} />
                    <span className="text-secondary" style={{ fontSize: '12px' }}>{item.name}: <strong>{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Developer productivity hours */}
            <div className="mt-4 pt-3 border-top border-secondary border-opacity-10">
              <h5 className="font-family-outfit mb-3 text-secondary" style={{ fontSize: '13px' }}>Team Work Hours Logged</h5>
              <div style={{ width: '100%', height: 120 }}>
                <ResponsiveContainer>
                  <BarChart data={developerProductivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                      {developerProductivityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#06b6d4' : '#8b5cf6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

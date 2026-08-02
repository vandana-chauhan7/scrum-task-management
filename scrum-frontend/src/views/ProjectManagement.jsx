import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  FolderPlus, 
  Trash2, 
  Archive, 
  UserPlus, 
  UserMinus, 
  Calendar, 
  Users,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ProjectManagement({ onProjectSelect, activeProjectId }) {
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('PLANNING');
  const [error, setError] = useState('');

  // Selected Project Details
  const [selectedProject, setSelectedProject] = useState(null);
  const [inviteUserId, setInviteUserId] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('scrum_user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const projs = await api.projects.getAll();
      setProjects(projs);

      const users = await api.users.getAll();
      setAllUsers(users);

      if (projs.length > 0) {
        // Pre-select first project if none is active
        const activeProj = projs.find(p => p.id === activeProjectId) || projs[0];
        setSelectedProject(activeProj);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const newProj = await api.projects.create({
        name,
        description,
        startDate,
        endDate,
        status
      });

      setShowForm(false);
      setName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setStatus('PLANNING');
      
      const projs = await api.projects.getAll();
      setProjects(projs);
      setSelectedProject(newProj);
      onProjectSelect(newProj.id);
    } catch (err) {
      setError(err.message || 'Failed to create project');
    }
  };

  const handleArchive = async (id) => {
    try {
      const updated = await api.projects.archive(id);
      loadData();
      if (selectedProject?.id === id) {
        setSelectedProject(updated);
      }
    } catch (err) {
      alert("Failed to archive project: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this project?")) return;
    try {
      await api.projects.delete(id);
      const projs = await api.projects.getAll();
      setProjects(projs);
      if (selectedProject?.id === id) {
        setSelectedProject(projs[0] || null);
        if (projs[0]) onProjectSelect(projs[0].id);
      }
    } catch (err) {
      alert("Failed to delete project: " + err.message);
    }
  };

  const handleAddMember = async () => {
    if (!inviteUserId || !selectedProject) return;
    try {
      const updated = await api.projects.addMember(selectedProject.id, inviteUserId);
      setSelectedProject(updated);
      setInviteUserId('');
      // Update projects list too
      const projs = await api.projects.getAll();
      setProjects(projs);
    } catch (err) {
      alert("Failed to add member: " + err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedProject) return;
    try {
      const updated = await api.projects.removeMember(selectedProject.id, userId);
      setSelectedProject(updated);
      // Update projects list too
      const projs = await api.projects.getAll();
      setProjects(projs);
    } catch (err) {
      alert("Failed to remove member: " + err.message);
    }
  };

  const isManagementAllowed = currentUser && ['ROLE_ADMIN', 'ROLE_SCRUM_MASTER', 'ROLE_PRODUCT_OWNER'].includes(currentUser.role);
  const isAdmin = currentUser && currentUser.role === 'ROLE_ADMIN';

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-gradient m-0">Project Board</h1>
          <p className="text-secondary">Coordinate development portfolios and team allocations</p>
        </div>
        {isManagementAllowed && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-gradient d-flex align-items-center gap-2">
            <FolderPlus size={18} />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-panel p-4 mb-4 animate-fade-in">
          <h3 className="font-family-outfit mb-3 text-gradient">Create New Project</h3>
          {error && <div className="alert alert-danger p-2 fs-7 mb-3">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-secondary fs-7">Project Name</label>
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary fs-7">Status</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="PLANNING">PLANNING</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary fs-7">Start Date</label>
                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary fs-7">End Date</label>
                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label text-secondary fs-7">Project Description</label>
                <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-gradient py-2">Create Project</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-dark border border-secondary text-secondary py-2">Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="row g-4">
        {/* Left Side: Projects List */}
        <div className="col-lg-5">
          <div className="glass-panel p-4">
            <h3 className="fw-semibold mb-3 font-family-outfit d-flex align-items-center gap-2">
              <Layers size={18} className="text-info" />
              <span>All Projects</span>
            </h3>
            {projects.length === 0 ? (
              <div className="text-secondary py-4 text-center">No projects created yet.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {projects.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => {
                      setSelectedProject(p);
                      onProjectSelect(p.id);
                    }}
                    className={`p-3 rounded border pointer transition-all ${
                      selectedProject?.id === p.id 
                        ? 'border-info bg-info bg-opacity-10' 
                        : 'border-secondary border-opacity-10 bg-dark bg-opacity-20 hover-bg-dark'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <h5 className="m-0 fw-bold">{p.name}</h5>
                      <span className={`badge rounded-pill bg-opacity-10 px-2 py-1 ${
                        p.status === 'ACTIVE' ? 'bg-success text-success' :
                        p.status === 'ARCHIVED' ? 'bg-secondary text-secondary' : 'bg-warning text-warning'
                      }`} style={{ fontSize: '10px' }}>{p.status}</span>
                    </div>
                    <p className="text-secondary text-truncate mb-2 mt-1" style={{ fontSize: '12px' }}>{p.description}</p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                        <Calendar size={12} />
                        {p.startDate ? p.startDate : 'N/A'} - {p.endDate ? p.endDate : 'N/A'}
                      </span>
                      <span className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                        <Users size={12} />
                        {p.members?.size || p.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Selected Project Details & Member Settings */}
        <div className="col-lg-7">
          {selectedProject ? (
            <div className="glass-panel p-4 h-100 animate-fade-in">
              <div className="d-flex justify-content-between align-items-start border-bottom border-secondary border-opacity-10 pb-3 mb-3">
                <div>
                  <h2 className="fw-bold m-0">{selectedProject.name}</h2>
                  <span className="text-secondary fs-7">Status: <strong>{selectedProject.status}</strong></span>
                </div>
                <div className="d-flex gap-2">
                  {isManagementAllowed && selectedProject.status !== 'ARCHIVED' && (
                    <button onClick={() => handleArchive(selectedProject.id)} className="btn btn-dark border border-secondary text-secondary p-2 rounded d-flex align-items-center gap-1 fs-7">
                      <Archive size={14} />
                      <span>Archive</span>
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDelete(selectedProject.id)} className="btn btn-danger bg-opacity-20 text-danger border border-danger border-opacity-30 p-2 rounded">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-family-outfit text-secondary fs-7 mb-2">Description</h5>
                <p className="text-secondary" style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                  {selectedProject.description || "No description provided."}
                </p>
              </div>

              {/* Members Management Section */}
              <div className="mt-4 border-top border-secondary border-opacity-10 pt-4">
                <h3 className="fw-semibold mb-3 font-family-outfit d-flex align-items-center gap-2">
                  <Users size={18} className="text-info" />
                  <span>Team Allocation</span>
                </h3>

                {isManagementAllowed && selectedProject.status !== 'ARCHIVED' && (
                  <div className="d-flex gap-2 mb-4">
                    <select 
                      className="form-select fs-7" 
                      value={inviteUserId} 
                      onChange={(e) => setInviteUserId(e.target.value)}
                    >
                      <option value="">Select a user to invite...</option>
                      {allUsers
                        .filter(u => !selectedProject.members?.some(m => m.id === u.id))
                        .map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role.name.replace('ROLE_', '')})</option>
                        ))
                      }
                    </select>
                    <button onClick={handleAddMember} className="btn btn-gradient d-flex align-items-center gap-1 fs-7" disabled={!inviteUserId}>
                      <UserPlus size={16} />
                      <span>Add</span>
                    </button>
                  </div>
                )}

                <div className="d-flex flex-column gap-2">
                  {selectedProject.members && selectedProject.members.length === 0 ? (
                    <div className="text-secondary fs-7 py-2">No team members allocated to this project yet.</div>
                  ) : (
                    selectedProject.members?.map((m) => (
                      <div key={m.id} className="d-flex justify-content-between align-items-center p-2 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-15">
                        <div>
                          <div className="fw-semibold fs-7">{m.name}</div>
                          <div className="text-secondary" style={{ fontSize: '10px' }}>{m.email} | <span className="text-gradient fw-medium">{m.role.name.replace('ROLE_', '')}</span></div>
                        </div>
                        {isManagementAllowed && selectedProject.status !== 'ARCHIVED' && selectedProject.members.length > 1 && (
                          <button onClick={() => handleRemoveMember(m.id)} className="btn btn-link text-danger p-0" title="Remove member">
                            <UserMinus size={16} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-5 h-100 d-flex flex-column justify-content-center align-items-center text-secondary">
              <Layers size={48} className="mb-3 opacity-20" />
              <span>Select a project from the left panel or create a new one to view parameters.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Play, 
  CheckCircle2, 
  PlusCircle, 
  Calendar, 
  CheckSquare, 
  MoveRight,
  Plus,
  Compass
} from 'lucide-react';

export default function Backlog({ projectId }) {
  const [sprints, setSprints] = useState([]);
  const [backlogStories, setBacklogStories] = useState([]);
  const [storiesBySprint, setStoriesBySprint] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Form toggles
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [showSprintForm, setShowSprintForm] = useState(false);

  // Story Form State
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDesc, setStoryDesc] = useState('');
  const [storyPriority, setStoryPriority] = useState('MEDIUM');
  const [storyPoints, setStoryPoints] = useState(0);

  // Sprint Form State
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [sprintStart, setSprintStart] = useState('');
  const [sprintEnd, setSprintEnd] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('scrum_user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    if (projectId) {
      loadPlanningData();
    }
  }, [projectId]);

  const loadPlanningData = async () => {
    setLoading(true);
    try {
      const spr = await api.sprints.getByProject(projectId);
      setSprints(spr);

      const bl = await api.stories.getBacklog(projectId);
      setBacklogStories(bl);

      // Fetch stories for each sprint
      const storiesMap = {};
      for (const s of spr) {
        const sts = await api.stories.getBySprint(s.id);
        storiesMap[s.id] = sts;
      }
      setStoriesBySprint(storiesMap);
    } catch (err) {
      console.error("Error loading backlog data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!storyTitle) return;

    try {
      await api.stories.create(projectId, {
        title: storyTitle,
        description: storyDesc,
        priority: storyPriority,
        storyPoints: parseInt(storyPoints) || 0,
        status: 'BACKLOG'
      });

      setStoryTitle('');
      setStoryDesc('');
      setStoryPriority('MEDIUM');
      setStoryPoints(0);
      setShowStoryForm(false);
      loadPlanningData();
    } catch (err) {
      alert("Failed to create story: " + err.message);
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!sprintName || !sprintStart || !sprintEnd) return;

    try {
      await api.sprints.create({
        projectId,
        name: sprintName,
        goal: sprintGoal,
        startDate: sprintStart,
        endDate: sprintEnd,
        status: 'PLANNED'
      });

      setSprintName('');
      setSprintGoal('');
      setSprintStart('');
      setSprintEnd('');
      setShowSprintForm(false);
      loadPlanningData();
    } catch (err) {
      alert("Failed to create sprint: " + err.message);
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      const sprint = sprints.find(s => s.id === sprintId);
      await api.sprints.update(sprintId, {
        ...sprint,
        status: 'ACTIVE'
      });
      loadPlanningData();
    } catch (err) {
      alert("Failed to start sprint: " + err.message);
    }
  };

  const handleCloseSprint = async (sprintId) => {
    if (!window.confirm("Close this Sprint? All incomplete user stories will be automatically rolled back to the Product Backlog.")) return;
    try {
      await api.sprints.close(sprintId);
      loadPlanningData();
    } catch (err) {
      alert("Failed to close sprint: " + err.message);
    }
  };

  const handleMoveStory = async (storyId, sprintId) => {
    try {
      await api.stories.move(storyId, sprintId);
      loadPlanningData();
    } catch (err) {
      alert("Failed to move story: " + err.message);
    }
  };

  const isSMOrAdmin = currentUser && ['ROLE_ADMIN', 'ROLE_SCRUM_MASTER'].includes(currentUser.role);
  const isPOOrAdmin = currentUser && ['ROLE_ADMIN', 'ROLE_PRODUCT_OWNER', 'ROLE_SCRUM_MASTER'].includes(currentUser.role);

  if (!projectId) {
    return (
      <div className="glass-panel p-5 text-center text-secondary animate-fade-in">
        No project selected. Set up or choose a project first.
      </div>
    );
  }

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
          <h1 className="fw-bold text-gradient m-0">Product Backlog</h1>
          <p className="text-secondary">Organize user stories, prioritize backlog items, and plan active sprints</p>
        </div>
        <div className="d-flex gap-2">
          {isPOOrAdmin && (
            <button onClick={() => setShowStoryForm(!showStoryForm)} className="btn btn-dark border border-secondary text-secondary d-flex align-items-center gap-1">
              <Plus size={16} />
              <span>Create Story</span>
            </button>
          )}
          {isSMOrAdmin && (
            <button onClick={() => setShowSprintForm(!showSprintForm)} className="btn btn-gradient d-flex align-items-center gap-1">
              <PlusCircle size={16} />
              <span>Create Sprint</span>
            </button>
          )}
        </div>
      </div>

      {/* Create User Story Form */}
      {showStoryForm && (
        <div className="glass-panel p-4 mb-4 animate-fade-in">
          <h3 className="font-family-outfit mb-3 text-gradient">Create User Story</h3>
          <form onSubmit={handleCreateStory}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-secondary fs-7">Story Title</label>
                <input type="text" className="form-control" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} required />
              </div>
              <div className="col-md-3">
                <label className="form-label text-secondary fs-7">Priority</label>
                <select className="form-select" value={storyPriority} onChange={(e) => setStoryPriority(e.target.value)}>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label text-secondary fs-7">Story Points</label>
                <input type="number" className="form-control" value={storyPoints} onChange={(e) => setStoryPoints(e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label text-secondary fs-7">Description / Acceptance Criteria</label>
                <textarea className="form-control" rows="2" value={storyDesc} onChange={(e) => setStoryDesc(e.target.value)} />
              </div>
              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-gradient py-2">Save Story</button>
                <button type="button" onClick={() => setShowStoryForm(false)} className="btn btn-dark border border-secondary text-secondary py-2">Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Create Sprint Form */}
      {showSprintForm && (
        <div className="glass-panel p-4 mb-4 animate-fade-in">
          <h3 className="font-family-outfit mb-3 text-gradient">Plan a New Sprint</h3>
          <form onSubmit={handleCreateSprint}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-secondary fs-7">Sprint Name</label>
                <input type="text" className="form-control" placeholder="e.g. Sprint 2: Feature Launch" value={sprintName} onChange={(e) => setSprintName(e.target.value)} required />
              </div>
              <div className="col-md-3">
                <label className="form-label text-secondary fs-7">Start Date</label>
                <input type="date" className="form-control" value={sprintStart} onChange={(e) => setSprintStart(e.target.value)} required />
              </div>
              <div className="col-md-3">
                <label className="form-label text-secondary fs-7">End Date</label>
                <input type="date" className="form-control" value={sprintEnd} onChange={(e) => setSprintEnd(e.target.value)} required />
              </div>
              <div className="col-12">
                <label className="form-label text-secondary fs-7">Sprint Goal</label>
                <textarea className="form-control" rows="2" placeholder="Define the primary target for this sprint..." value={sprintGoal} onChange={(e) => setSprintGoal(e.target.value)} />
              </div>
              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-gradient py-2">Create Sprint</button>
                <button type="button" onClick={() => setShowSprintForm(false)} className="btn btn-dark border border-secondary text-secondary py-2">Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="row g-4">
        {/* Left Side: Sprints Planning */}
        <div className="col-lg-7">
          <h3 className="fw-semibold mb-3 font-family-outfit d-flex align-items-center gap-2">
            <Calendar size={18} className="text-info" />
            <span>Sprints List</span>
          </h3>

          {sprints.length === 0 ? (
            <div className="glass-panel p-4 text-center text-secondary py-5">
              No Sprints planned. Sprints can be scheduled by Scrum Masters.
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {sprints.map((s) => (
                <div key={s.id} className="glass-panel p-4">
                  <div className="d-flex justify-content-between align-items-start border-bottom border-secondary border-opacity-10 pb-2 mb-3">
                    <div>
                      <h4 className="fw-bold m-0">{s.name}</h4>
                      <div className="text-secondary" style={{ fontSize: '11px' }}>
                        {s.startDate} to {s.endDate} | Status: <strong>{s.status}</strong>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      {isSMOrAdmin && s.status === 'PLANNED' && (
                        <button onClick={() => handleStartSprint(s.id)} className="btn btn-gradient p-1 px-3 d-flex align-items-center gap-1 fs-8">
                          <Play size={10} />
                          <span>Start Sprint</span>
                        </button>
                      )}
                      {isSMOrAdmin && s.status === 'ACTIVE' && (
                        <button onClick={() => handleCloseSprint(s.id)} className="btn btn-success p-1 px-3 d-flex align-items-center gap-1 fs-8">
                          <CheckCircle2 size={10} />
                          <span>Complete Sprint</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>Goal: {s.goal || "No goal defined."}</p>

                  {/* Stories inside this sprint */}
                  <div className="mt-3">
                    <h5 className="font-family-outfit mb-2 text-secondary" style={{ fontSize: '11px' }}>Sprint Backlog</h5>
                    <div className="d-flex flex-column gap-2">
                      {(storiesBySprint[s.id] || []).length === 0 ? (
                        <div className="text-secondary fs-8 py-2 text-center border border-dashed border-secondary border-opacity-10 rounded">
                          Sprint is empty. Move user stories here to schedule.
                        </div>
                      ) : (
                        (storiesBySprint[s.id] || []).map((story) => (
                          <div key={story.id} className="d-flex justify-content-between align-items-center p-2 rounded bg-secondary bg-opacity-5 border border-secondary border-opacity-10">
                            <div>
                              <span className="fw-semibold fs-7 me-2">{story.title}</span>
                              <span className="badge bg-secondary text-secondary bg-opacity-10 fs-8">{story.storyPoints} pts</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className={`badge fs-8 ${
                                story.priority === 'HIGH' ? 'bg-danger bg-opacity-10 text-danger' :
                                story.priority === 'MEDIUM' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-success bg-opacity-10 text-success'
                              }`}>{story.priority}</span>
                              {isPOOrAdmin && (
                                <button 
                                  onClick={() => handleMoveStory(story.id, null)} 
                                  className="btn btn-link text-secondary p-0 fs-8" 
                                  title="Return to Product Backlog"
                                >
                                  Backlog
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Backlog */}
        <div className="col-lg-5">
          <h3 className="fw-semibold mb-3 font-family-outfit d-flex align-items-center gap-2">
            <Compass size={18} className="text-info" />
            <span>Product Backlog (Unplanned)</span>
          </h3>

          <div className="glass-panel p-4">
            {backlogStories.length === 0 ? (
              <div className="text-secondary text-center py-4">No unplanned user stories in the backlog.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {backlogStories.map((story) => (
                  <div key={story.id} className="p-3 rounded border border-secondary border-opacity-10 bg-dark bg-opacity-20">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold m-0 fs-7">{story.title}</h5>
                      <span className="badge bg-info bg-opacity-10 text-info fs-8">{story.storyPoints} pts</span>
                    </div>
                    <p className="text-secondary mb-2" style={{ fontSize: '11px' }}>{story.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className={`badge fs-8 ${
                        story.priority === 'HIGH' ? 'bg-danger bg-opacity-10 text-danger' :
                        story.priority === 'MEDIUM' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-success bg-opacity-10 text-success'
                      }`}>{story.priority}</span>
                      
                      {isSMOrAdmin && sprints.filter(s => s.status !== 'CLOSED').length > 0 && (
                        <div className="dropdown">
                          <button className="btn btn-dark border border-secondary text-secondary p-1 px-2 fs-8 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Schedule
                          </button>
                          <ul className="dropdown-menu dropdown-menu-dark">
                            {sprints
                              .filter(s => s.status !== 'CLOSED')
                              .map(s => (
                                <li key={s.id}>
                                  <button onClick={() => handleMoveStory(story.id, s.id)} className="dropdown-item fs-8" type="button">
                                    Move to {s.name}
                                  </button>
                                </li>
                              ))
                            }
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

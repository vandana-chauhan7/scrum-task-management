import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Plus, 
  User, 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  Clock, 
  ArrowLeft, 
  ArrowRight,
  UserCheck,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function KanbanBoard({ projectId }) {
  const [activeSprint, setActiveSprint] = useState(null);
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Details State
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [logHoursVal, setLogHoursVal] = useState(0);

  // Task creation Form State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');

  // Edit Task State
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadBoardData();
    }
  }, [projectId]);

  const loadBoardData = async () => {
    setLoading(true);
    try {
      const sprints = await api.sprints.getByProject(projectId);
      const active = sprints.find(s => s.status === 'ACTIVE');
      setActiveSprint(active);

      if (active) {
        const sts = await api.stories.getBySprint(active.id);
        setStories(sts);

        // Fetch tasks under all stories of this sprint
        const allTasks = [];
        for (const story of sts) {
          const tList = await api.tasks.getByStory(story.id);
          allTasks.push(...tList);
        }
        setTasks(allTasks);
      } else {
        setStories([]);
        setTasks([]);
      }

      const devs = await api.users.getDevelopers();
      setDevelopers(devs);
    } catch (err) {
      console.error("Error loading Kanban board:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !selectedStoryId) return;

    try {
      await api.tasks.create(selectedStoryId, {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        deadline: taskDeadline || null,
        status: 'TO_DO',
        assignedTo: taskAssigneeId ? { id: parseInt(taskAssigneeId) } : null,
        loggedHours: 0.0
      });

      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('MEDIUM');
      setTaskDeadline('');
      setTaskAssigneeId('');
      setShowTaskForm(false);
      loadBoardData();
    } catch (err) {
      alert("Failed to create task: " + err.message);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.tasks.updateStatus(taskId, newStatus);
      loadBoardData();
      if (selectedTask?.id === taskId) {
        // Refresh details modal
        const refreshed = await api.tasks.getById(taskId);
        setSelectedTask(refreshed);
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleTaskClick = async (task) => {
    setSelectedTask(task);
    setIsEditing(false);
    setLogHoursVal(0);
    try {
      const cList = await api.comments.getByTask(task.id);
      setComments(cList);

      const aList = await api.attachments.getByTask(task.id);
      setAttachments(aList);
    } catch (err) {
      console.error("Error loading task details:", err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    try {
      await api.comments.create(selectedTask.id, newComment);
      setNewComment('');
      // Reload comments
      const cList = await api.comments.getByTask(selectedTask.id);
      setComments(cList);
    } catch (err) {
      alert("Failed to post comment: " + err.message);
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedTask) return;

    try {
      await api.attachments.upload(selectedTask.id, uploadFile);
      setUploadFile(null);
      // Reset input element
      document.getElementById('file-upload-input').value = '';
      // Reload attachments
      const aList = await api.attachments.getByTask(selectedTask.id);
      setAttachments(aList);
    } catch (err) {
      alert("Failed to upload file: " + err.message);
    }
  };

  const handleLogHours = async () => {
    if (!selectedTask || logHoursVal <= 0) return;
    try {
      await api.tasks.logHours(selectedTask.id, parseFloat(logHoursVal));
      setLogHoursVal(0);
      const refreshed = await api.tasks.getById(selectedTask.id);
      setSelectedTask(refreshed);
      loadBoardData();
    } catch (err) {
      alert("Failed to log hours: " + err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.tasks.delete(id);
      setSelectedTask(null);
      loadBoardData();
    } catch (err) {
      alert("Failed to delete task: " + err.message);
    }
  };

  // Helper status move utilities
  const moveRight = (task) => {
    const sequence = ['TO_DO', 'IN_PROGRESS', 'TESTING', 'DONE'];
    const idx = sequence.indexOf(task.status);
    if (idx < 3) handleUpdateStatus(task.id, sequence[idx + 1]);
  };

  const moveLeft = (task) => {
    const sequence = ['TO_DO', 'IN_PROGRESS', 'TESTING', 'DONE'];
    const idx = sequence.indexOf(task.status);
    if (idx > 0) handleUpdateStatus(task.id, sequence[idx - 1]);
  };

  const renderColumn = (colName, statusKey) => {
    const filteredTasks = tasks.filter(t => t.status === statusKey);
    return (
      <div className="col-md-3">
        <div className="kanban-column d-flex flex-column h-100 p-2">
          <div className="d-flex justify-content-between align-items-center mb-3 px-2">
            <h4 className="fw-semibold m-0 text-gradient font-family-outfit fs-6">{colName}</h4>
            <span className="badge rounded-pill bg-dark border border-secondary text-secondary">{filteredTasks.length}</span>
          </div>

          <div className="flex-grow-1 overflow-y-auto" style={{ minHeight: '400px' }}>
            {filteredTasks.map(t => (
              <div 
                key={t.id} 
                className="kanban-card p-3 animate-fade-in"
              >
                <div 
                  onClick={() => handleTaskClick(t)} 
                  style={{ cursor: 'pointer' }}
                >
                  <h5 className="fw-semibold fs-7 mb-1">{t.title}</h5>
                  <p className="text-secondary mb-3 text-truncate" style={{ fontSize: '11px' }}>
                    {t.description || "No description."}
                  </p>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2 border-top border-secondary border-opacity-10 pt-2">
                  <div className="d-flex align-items-center gap-1 text-secondary" style={{ fontSize: '10px' }}>
                    <User size={10} />
                    <span>{t.assignedTo ? t.assignedTo.name : 'Unassigned'}</span>
                  </div>
                  <span className={`badge ${
                    t.priority === 'HIGH' ? 'bg-danger bg-opacity-10 text-danger' :
                    t.priority === 'MEDIUM' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-success bg-opacity-10 text-success'
                  }`} style={{ fontSize: '9px' }}>{t.priority}</span>
                </div>

                {/* Shift buttons */}
                <div className="d-flex justify-content-between mt-2 pt-2 border-top border-secondary border-opacity-5">
                  <button 
                    disabled={statusKey === 'TO_DO'} 
                    onClick={() => moveLeft(t)} 
                    className="btn btn-link text-secondary p-0"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button 
                    disabled={statusKey === 'DONE'} 
                    onClick={() => moveRight(t)} 
                    className="btn btn-link text-secondary p-0"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-secondary text-center py-4 fs-8 border border-dashed border-secondary border-opacity-5 rounded">Empty</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!projectId) {
    return (
      <div className="glass-panel p-5 text-center text-secondary">
        Select a project from the project board to initialize Kanban board.
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

  if (!activeSprint) {
    return (
      <div className="glass-panel p-5 text-center text-secondary">
        There is no active Sprint for this project. Start a planned Sprint in the Product Backlog view.
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-gradient m-0">Kanban Board</h1>
          <p className="text-secondary">Sprint Target: <strong>{activeSprint.name}</strong></p>
        </div>
        <div>
          {stories.length > 0 && (
            <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn btn-gradient d-flex align-items-center gap-2">
              <Plus size={18} />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {showTaskForm && (
        <div className="glass-panel p-4 mb-4 animate-fade-in">
          <h3 className="font-family-outfit mb-3 text-gradient">Create Task</h3>
          <form onSubmit={handleCreateTask}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label text-secondary fs-7">Select User Story</label>
                <select 
                  className="form-select fs-7" 
                  value={selectedStoryId} 
                  onChange={(e) => setSelectedStoryId(e.target.value)} 
                  required
                >
                  <option value="">Choose User Story...</option>
                  {stories.map(s => (
                    <option key={s.id} value={s.id}>{s.title} ({s.storyPoints} pts)</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label text-secondary fs-7">Task Title</label>
                <input type="text" className="form-control" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
              </div>
              <div className="col-md-2">
                <label className="form-label text-secondary fs-7">Assignee</label>
                <select className="form-select fs-7" value={taskAssigneeId} onChange={(e) => setTaskAssigneeId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {developers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label text-secondary fs-7">Priority</label>
                <select className="form-select fs-7" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label text-secondary fs-7">Deadline</label>
                <input type="date" className="form-control" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} />
              </div>
              <div className="col-md-8">
                <label className="form-label text-secondary fs-7">Description</label>
                <input type="text" className="form-control" placeholder="Describe the task instructions..." value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
              </div>
              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-gradient py-2">Save Task</button>
                <button type="button" onClick={() => setShowTaskForm(false)} className="btn btn-dark border border-secondary text-secondary py-2">Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Grid columns */}
      <div className="row g-3">
        {renderColumn("To Do", "TO_DO")}
        {renderColumn("In Progress", "IN_PROGRESS")}
        {renderColumn("Testing & Review", "TESTING")}
        {renderColumn("Completed (Done)", "DONE")}
      </div>

      {/* Task Details Glass Modal */}
      {selectedTask && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content glass-panel border border-secondary border-opacity-15 p-4 text-white">
              
              {/* Header */}
              <div className="modal-header border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-start pb-3">
                <div>
                  <h3 className="modal-title fw-bold text-gradient m-0">{selectedTask.title}</h3>
                  <span className="text-secondary" style={{ fontSize: '11px' }}>
                    Story: {selectedTask.userStory ? selectedTask.userStory.title : ''}
                  </span>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setSelectedTask(null)}
                />
              </div>

              {/* Body */}
              <div className="modal-body py-4">
                <div className="row g-4">
                  {/* Left panel: Info */}
                  <div className="col-md-6 border-end border-secondary border-opacity-10 pr-3">
                    <div className="mb-3">
                      <label className="text-secondary fs-8">Description</label>
                      <p className="text-secondary mt-1 fs-7">{selectedTask.description || "No description provided."}</p>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="text-secondary fs-8">Assignee</label>
                        <div className="fw-semibold mt-1 fs-7 d-flex align-items-center gap-1">
                          <UserCheck size={14} className="text-info" />
                          <span>{selectedTask.assignedTo ? selectedTask.assignedTo.name : 'Unassigned'}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <label className="text-secondary fs-8">Deadline</label>
                        <div className="fw-semibold mt-1 fs-7 d-flex align-items-center gap-1">
                          <Calendar size={14} className="text-info" />
                          <span>{selectedTask.deadline || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="text-secondary fs-8">Priority</label>
                        <div className="fw-semibold mt-1 fs-7">
                          <span className={`badge ${
                            selectedTask.priority === 'HIGH' ? 'bg-danger bg-opacity-10 text-danger' :
                            selectedTask.priority === 'MEDIUM' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-success bg-opacity-10 text-success'
                          }`}>{selectedTask.priority}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <label className="text-secondary fs-8">Logged Hours</label>
                        <div className="fw-semibold mt-1 fs-7 d-flex align-items-center gap-1">
                          <Clock size={14} className="text-info" />
                          <span>{selectedTask.loggedHours || 0.0} hrs</span>
                        </div>
                      </div>
                    </div>

                    {/* Log hours form */}
                    <div className="mt-4 pt-3 border-top border-secondary border-opacity-10">
                      <label className="text-secondary fs-8 mb-2 d-block">Log Development Work Hours</label>
                      <div className="d-flex gap-2">
                        <input 
                          type="number" 
                          step="0.5" 
                          className="form-control w-50 fs-7" 
                          value={logHoursVal} 
                          onChange={(e) => setLogHoursVal(e.target.value)} 
                        />
                        <button onClick={handleLogHours} className="btn btn-gradient py-1 fs-7" disabled={logHoursVal <= 0}>Log</button>
                      </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="mt-4 pt-3 border-top border-secondary border-opacity-10">
                      <label className="text-secondary fs-8 mb-2 d-block">Attachments</label>
                      
                      <div className="d-flex flex-column gap-2 mb-3">
                        {attachments.map(att => (
                          <a 
                            key={att.id} 
                            href={api.attachments.getDownloadUrl(att.filePath)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="d-flex align-items-center gap-2 p-2 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-10 text-decoration-none text-white fs-8 hover-bg-dark"
                          >
                            <FileText size={14} className="text-info" />
                            <span className="text-truncate flex-grow-1">{att.fileName}</span>
                            <span className="text-secondary">Download</span>
                          </a>
                        ))}
                      </div>

                      <form onSubmit={handleUploadFile} className="d-flex gap-2">
                        <input 
                          type="file" 
                          id="file-upload-input"
                          className="form-control fs-8" 
                          onChange={(e) => setUploadFile(e.target.files[0])} 
                        />
                        <button type="submit" className="btn btn-dark border border-secondary text-secondary py-1 fs-8" disabled={!uploadFile}>Upload</button>
                      </form>
                    </div>
                  </div>

                  {/* Right panel: Comment discussion */}
                  <div className="col-md-6 pl-3">
                    <h5 className="font-family-outfit mb-3 text-secondary d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                      <MessageSquare size={16} />
                      <span>Task Discussion</span>
                    </h5>

                    {/* Comments list */}
                    <div className="overflow-y-auto mb-3" style={{ maxHeight: '240px' }}>
                      {comments.length === 0 ? (
                        <div className="text-secondary fs-8 py-3 text-center">No discussion yet. Ask questions or note details.</div>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {comments.map(c => (
                            <div key={c.id} className="p-2 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-5">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-semibold text-gradient" style={{ fontSize: '11px' }}>{c.user.name}</span>
                                <span className="text-secondary" style={{ fontSize: '9px' }}>
                                  {new Date(c.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="m-0 text-secondary" style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>{c.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Post comment form */}
                    <form onSubmit={handlePostComment}>
                      <div className="mb-2">
                        <textarea 
                          rows="2" 
                          className="form-control fs-7" 
                          placeholder="Write a comment... mention team members" 
                          value={newComment} 
                          onChange={(e) => setNewComment(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-gradient py-1 fs-7" disabled={!newComment.trim()}>Post Comment</button>
                    </form>

                    <div className="mt-4 pt-3 border-top border-secondary border-opacity-10 text-end">
                      <button onClick={() => handleDeleteTask(selectedTask.id)} className="btn btn-outline-danger btn-sm fs-8">Delete Task</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

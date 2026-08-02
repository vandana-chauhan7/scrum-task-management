import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { FileText, Printer, Download, BarChart2, Calendar, User, Layout } from 'lucide-react';

export default function Reports({ projectId }) {
  const [reportType, setReportType] = useState('sprint'); // sprint, project, developer, task-completion
  const [sprints, setSprints] = useState([]);
  const [developers, setDevelopers] = useState([]);
  
  // Selection keys
  const [selectedSprintId, setSelectedSprintId] = useState('');
  const [selectedDevId, setSelectedDevId] = useState('');

  // Report results
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadReportSelectors();
    }
  }, [projectId]);

  useEffect(() => {
    // Automatically load reports when parameters change
    if (reportType === 'project' && projectId) {
      loadProjectReport();
    } else if (reportType === 'task-completion' && projectId) {
      loadTaskCompletionReport();
    } else {
      setReportData(null);
    }
  }, [reportType, projectId]);

  const loadReportSelectors = async () => {
    try {
      const spr = await api.sprints.getByProject(projectId);
      setSprints(spr);
      if (spr.length > 0) {
        const active = spr.find(s => s.status === 'ACTIVE') || spr[0];
        setSelectedSprintId(active.id);
      }

      const devs = await api.users.getAll();
      setDevelopers(devs);
      if (devs.length > 0) {
        setSelectedDevId(devs[0].id);
      }
    } catch (err) {
      console.error("Error loading selectors:", err);
    }
  };

  const loadSprintReport = async () => {
    if (!selectedSprintId) return;
    setLoading(true);
    try {
      const data = await api.reports.getSprint(selectedSprintId);
      setReportData(data);
    } catch (err) {
      alert("Error generating report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectReport = async () => {
    setLoading(true);
    try {
      const data = await api.reports.getProject(projectId);
      setReportData(data);
    } catch (err) {
      alert("Error generating report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDeveloperReport = async () => {
    if (!selectedDevId) return;
    setLoading(true);
    try {
      const data = await api.reports.getDeveloper(selectedDevId);
      setReportData(data);
    } catch (err) {
      alert("Error generating report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskCompletionReport = async () => {
    setLoading(true);
    try {
      const data = await api.reports.getTaskCompletion(projectId);
      setReportData(data);
    } catch (err) {
      alert("Error generating report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
        <div>
          <h1 className="fw-bold text-gradient m-0">Scrum Reporting</h1>
          <p className="text-secondary">Generate and download comprehensive Agile progress documents</p>
        </div>
        {reportData && (
          <button onClick={handlePrint} className="btn btn-gradient d-flex align-items-center gap-2">
            <Printer size={18} />
            <span>Download as PDF</span>
          </button>
        )}
      </div>

      {/* Selector Panels - Hidden when printing */}
      <div className="glass-panel p-4 mb-4 d-print-none">
        <h3 className="font-family-outfit mb-3 text-secondary fs-6">Configure Report Parameters</h3>
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label text-secondary fs-7">Report Type</label>
            <select 
              className="form-select fs-7" 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="sprint">Sprint Performance Report</option>
              <option value="project">Project Health Report</option>
              <option value="developer">Developer Productivity Report</option>
              <option value="task-completion">Task Completion Summary</option>
            </select>
          </div>

          {reportType === 'sprint' && (
            <div className="col-md-5 d-flex gap-2">
              <div className="flex-grow-1">
                <label className="form-label text-secondary fs-7">Target Sprint</label>
                <select 
                  className="form-select fs-7" 
                  value={selectedSprintId} 
                  onChange={(e) => setSelectedSprintId(e.target.value)}
                >
                  <option value="">Choose Sprint...</option>
                  {sprints.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                  ))}
                </select>
              </div>
              <button onClick={loadSprintReport} className="btn btn-dark border border-secondary text-secondary fs-7" style={{ height: '38px' }} disabled={!selectedSprintId}>
                Generate
              </button>
            </div>
          )}

          {reportType === 'developer' && (
            <div className="col-md-5 d-flex gap-2">
              <div className="flex-grow-1">
                <label className="form-label text-secondary fs-7">Target Team Member</label>
                <select 
                  className="form-select fs-7" 
                  value={selectedDevId} 
                  onChange={(e) => setSelectedDevId(e.target.value)}
                >
                  <option value="">Choose Member...</option>
                  {developers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.role.name.replace('ROLE_', '')})</option>
                  ))}
                </select>
              </div>
              <button onClick={loadDeveloperReport} className="btn btn-dark border border-secondary text-secondary fs-7" style={{ height: '38px' }} disabled={!selectedDevId}>
                Generate
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status" />
        </div>
      )}

      {/* Printable Report Output Area */}
      {reportData && !loading && (
        <div className="glass-panel p-5 bg-dark bg-opacity-30 border border-secondary border-opacity-15 animate-fade-in" id="printable-report">
          
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start border-bottom border-secondary border-opacity-20 pb-4 mb-4">
            <div>
              <span className="text-gradient fw-bold font-family-outfit fs-5">SCRUM TASK MANAGER</span>
              <h2 className="fw-bold text-white mt-1 mb-0">
                {reportType === 'sprint' && 'Sprint Execution Report'}
                {reportType === 'project' && 'Project Comprehensive Health Report'}
                {reportType === 'developer' && 'Developer Work & Productivity Log'}
                {reportType === 'task-completion' && 'Task Completion & Priorities Breakdown'}
              </h2>
              <span className="text-secondary fs-7">Generated on: {new Date().toLocaleString()}</span>
            </div>
            <div className="text-end">
              <FileText size={36} className="text-secondary opacity-30" />
            </div>
          </div>

          {/* SPRINT REPORT LAYOUT */}
          {reportType === 'sprint' && (
            <div>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="text-secondary fs-8">Sprint Name</div>
                  <div className="fw-bold fs-6">{reportData.sprintName}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-secondary fs-8">Sprint Goal</div>
                  <div className="text-secondary fs-7 font-style-italic">{reportData.sprintGoal || 'N/A'}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Start Date</div>
                  <div className="fw-semibold fs-7">{reportData.startDate}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">End Date</div>
                  <div className="fw-semibold fs-7">{reportData.endDate}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Stories Completed</div>
                  <div className="fw-bold text-success fs-6">{reportData.completedStories} / {reportData.totalStories}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Points Achieved</div>
                  <div className="fw-bold text-gradient fs-6">{reportData.completedStoryPoints} / {reportData.totalStoryPoints} pts</div>
                </div>
              </div>

              <h4 className="font-family-outfit mb-3 border-bottom border-secondary border-opacity-10 pb-2">User Stories Included</h4>
              <div className="table-responsive mb-4">
                <table className="table table-dark align-middle border-secondary border-opacity-10">
                  <thead>
                    <tr className="text-secondary fs-8">
                      <th>Story Title</th>
                      <th>Story Points</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="fs-7">
                    {reportData.stories?.map((st, i) => (
                      <tr key={i}>
                        <td className="fw-semibold">{st.title}</td>
                        <td>{st.storyPoints} pts</td>
                        <td>
                          <span className={`badge ${st.status === 'DONE' ? 'bg-success text-success bg-opacity-10' : 'bg-warning text-warning bg-opacity-10'}`}>
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h4 className="font-family-outfit mb-3 border-bottom border-secondary border-opacity-10 pb-2">Subtasks Details</h4>
              <div className="table-responsive">
                <table className="table table-dark align-middle border-secondary border-opacity-10">
                  <thead>
                    <tr className="text-secondary fs-8">
                      <th>Task Title</th>
                      <th>Assignee</th>
                      <th>Hours Logged</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="fs-7">
                    {reportData.tasks?.map((t, i) => (
                      <tr key={i}>
                        <td>{t.title}</td>
                        <td>{t.assignee}</td>
                        <td>{t.loggedHours} hrs</td>
                        <td>{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROJECT REPORT LAYOUT */}
          {reportType === 'project' && (
            <div>
              <div className="row g-3 mb-4">
                <div className="col-md-8">
                  <div className="text-secondary fs-8">Project Name</div>
                  <div className="fw-bold fs-5">{reportData.projectName}</div>
                  <p className="text-secondary fs-7 mt-1">{reportData.description}</p>
                </div>
                <div className="col-md-4">
                  <div className="text-secondary fs-8">Status</div>
                  <span className="badge bg-success bg-opacity-10 text-success fs-7 mt-1">{reportData.status}</span>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Timeline</div>
                  <div className="fw-semibold fs-7">{reportData.startDate} to {reportData.endDate}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Total Sprints Plan</div>
                  <div className="fw-bold fs-6">{reportData.totalSprints} ({reportData.activeSprints} Active, {reportData.closedSprints} Closed)</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Backlog Stories</div>
                  <div className="fw-bold fs-6 text-warning">{reportData.backlogStories} unplanned</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Completion Rate</div>
                  <div className="fw-bold text-success fs-6">
                    {reportData.totalStories > 0 ? Math.round((reportData.completedStories / reportData.totalStories) * 100) : 0}% 
                    ({reportData.completedStories} / {reportData.totalStories} Stories done)
                  </div>
                </div>
              </div>

              <h4 className="font-family-outfit mb-3 border-bottom border-secondary border-opacity-10 pb-2">Allocated Team Members</h4>
              <div className="d-flex flex-column gap-2">
                {reportData.members?.map((m, i) => (
                  <div key={i} className="d-flex justify-content-between p-2 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-10 fs-7">
                    <span><strong>{m.name}</strong> ({m.email})</span>
                    <span className="text-gradient fw-semibold">{m.role.replace('ROLE_', '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DEVELOPER REPORT LAYOUT */}
          {reportType === 'developer' && (
            <div>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="text-secondary fs-8">Developer Name</div>
                  <div className="fw-bold fs-6">{reportData.developerName}</div>
                  <div className="text-secondary fs-7">{reportData.email}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-secondary fs-8">Scrum Assignment</div>
                  <div className="fw-bold fs-7 text-gradient mt-1">{reportData.role.replace('ROLE_', '')}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-secondary fs-8">Total Work Logged</div>
                  <div className="fw-bold fs-6 text-purple" style={{ color: '#a78bfa' }}>{reportData.totalLoggedHours || 0.0} hours</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Total Tasks</div>
                  <div className="fw-bold fs-6">{reportData.totalTasks}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Tasks Completed</div>
                  <div className="fw-bold text-success fs-6">{reportData.completedTasks}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-secondary fs-8">Tasks Status Ratio</div>
                  <div className="text-secondary fs-8 mt-1">
                    To Do: <strong>{reportData.statusBreakdown?.TO_DO || 0}</strong> | 
                    In Progress: <strong>{reportData.statusBreakdown?.IN_PROGRESS || 0}</strong> | 
                    Testing: <strong>{reportData.statusBreakdown?.TESTING || 0}</strong> | 
                    Done: <strong>{reportData.statusBreakdown?.DONE || 0}</strong>
                  </div>
                </div>
              </div>

              <h4 className="font-family-outfit mb-3 border-bottom border-secondary border-opacity-10 pb-2">Assigned Tasks Log</h4>
              <div className="table-responsive">
                <table className="table table-dark align-middle border-secondary border-opacity-10">
                  <thead>
                    <tr className="text-secondary fs-8">
                      <th>Task Title</th>
                      <th>User Story</th>
                      <th>Logged Hours</th>
                      <th>Deadline</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="fs-7">
                    {reportData.tasks?.map((t, i) => (
                      <tr key={i}>
                        <td className="fw-semibold">{t.title}</td>
                        <td className="text-secondary fs-8">{t.storyTitle}</td>
                        <td>{t.loggedHours} hrs</td>
                        <td>{t.deadline || 'N/A'}</td>
                        <td>{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TASK COMPLETION REPORT LAYOUT */}
          {reportType === 'task-completion' && (
            <div>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Total Project Tasks</div>
                  <div className="fw-bold fs-6">{reportData.totalTasks}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Completed Tasks (Done)</div>
                  <div className="fw-bold text-success fs-6">{reportData.completedTasks}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Work-in-Progress</div>
                  <div className="fw-bold text-info fs-6">{reportData.inProgressTasks}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-secondary fs-8">Overdue Tasks</div>
                  <div className="fw-bold text-danger fs-6">{reportData.overdueTasks}</div>
                </div>
              </div>

              <h4 className="font-family-outfit mb-3 border-bottom border-secondary border-opacity-10 pb-2">All Sprint Subtasks</h4>
              <div className="table-responsive">
                <table className="table table-dark align-middle border-secondary border-opacity-10">
                  <thead>
                    <tr className="text-secondary fs-8">
                      <th>Task Title</th>
                      <th>Assignee</th>
                      <th>Priority</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Overdue Status</th>
                    </tr>
                  </thead>
                  <tbody className="fs-7">
                    {reportData.tasks?.map((t, i) => (
                      <tr key={i}>
                        <td className="fw-semibold">{t.title}</td>
                        <td>{t.assignee}</td>
                        <td>{t.priority}</td>
                        <td>{t.deadline || 'N/A'}</td>
                        <td>{t.status}</td>
                        <td>
                          {t.isOverdue ? (
                            <span className="badge bg-danger text-danger bg-opacity-10">OVERDUE</span>
                          ) : (
                            <span className="badge bg-success text-success bg-opacity-10">ON TIME / DONE</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Fallback empty state */}
      {!reportData && !loading && (
        <div className="glass-panel p-5 text-center text-secondary">
          <BarChart2 size={48} className="mb-3 opacity-20" />
          <p className="m-0">Configure parameters above and click "Generate" to inspect metrics.</p>
        </div>
      )}
    </div>
  );
}

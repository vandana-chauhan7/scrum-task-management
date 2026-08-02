const API_BASE_URL = 'http://localhost:8080/api';

const getHeaders = (isMultipart = false) => {
  const headers = {};
  const token = localStorage.getItem('scrum_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
      });
      const data = await handleResponse(res);
      if (data.token) {
        localStorage.setItem('scrum_token', data.token);
        localStorage.setItem('scrum_user', JSON.stringify(data));
      }
      return data;
    },
    register: async (name, email, password, roleName) => {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, password, roleName })
      });
      return handleResponse(res);
    },
    resetPassword: async (email, newPassword) => {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, newPassword })
      });
      return handleResponse(res);
    },
    getRoles: async () => {
      const res = await fetch(`${API_BASE_URL}/auth/roles`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    logout: () => {
      localStorage.removeItem('scrum_token');
      localStorage.removeItem('scrum_user');
    }
  },

  // Dashboard Statistics
  dashboard: {
    getStats: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Project Management
  projects: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    create: async (project) => {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(project)
      });
      return handleResponse(res);
    },
    update: async (id, project) => {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(project)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    archive: async (id) => {
      const res = await fetch(`${API_BASE_URL}/projects/${id}/archive`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    addMember: async (projectId, userId) => {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${userId}`, {
        method: 'POST',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    removeMember: async (projectId, userId) => {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Sprint Management
  sprints: {
    getByProject: async (projectId) => {
      const res = await fetch(`${API_BASE_URL}/sprints/project/${projectId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/sprints/${id}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    create: async (sprint) => {
      const res = await fetch(`${API_BASE_URL}/sprints`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(sprint)
      });
      return handleResponse(res);
    },
    update: async (id, sprint) => {
      const res = await fetch(`${API_BASE_URL}/sprints/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(sprint)
      });
      return handleResponse(res);
    },
    close: async (id) => {
      const res = await fetch(`${API_BASE_URL}/sprints/${id}/close`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Product Backlog and Stories
  stories: {
    getByProject: async (projectId) => {
      const res = await fetch(`${API_BASE_URL}/stories/project/${projectId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getBacklog: async (projectId) => {
      const res = await fetch(`${API_BASE_URL}/stories/project/${projectId}/backlog`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getBySprint: async (sprintId) => {
      const res = await fetch(`${API_BASE_URL}/stories/sprint/${sprintId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    create: async (projectId, story) => {
      const res = await fetch(`${API_BASE_URL}/stories/project/${projectId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(story)
      });
      return handleResponse(res);
    },
    update: async (id, story) => {
      const res = await fetch(`${API_BASE_URL}/stories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(story)
      });
      return handleResponse(res);
    },
    move: async (storyId, sprintId) => {
      const res = await fetch(`${API_BASE_URL}/stories/${storyId}/move`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ sprintId })
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/stories/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Task Management
  tasks: {
    getByStory: async (storyId) => {
      const res = await fetch(`${API_BASE_URL}/tasks/story/${storyId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getByUser: async (userId) => {
      const res = await fetch(`${API_BASE_URL}/tasks/user/${userId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    create: async (storyId, task) => {
      const res = await fetch(`${API_BASE_URL}/tasks/story/${storyId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(task)
      });
      return handleResponse(res);
    },
    update: async (id, task) => {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(task)
      });
      return handleResponse(res);
    },
    updateStatus: async (id, status) => {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    },
    logHours: async (id, hours) => {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}/log-hours`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ hours })
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Task Discussions & Comments
  comments: {
    getByTask: async (taskId) => {
      const res = await fetch(`${API_BASE_URL}/comments/task/${taskId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    create: async (taskId, message) => {
      const res = await fetch(`${API_BASE_URL}/comments/task/${taskId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message })
      });
      return handleResponse(res);
    }
  },

  // Task Attachments
  attachments: {
    getByTask: async (taskId) => {
      const res = await fetch(`${API_BASE_URL}/attachments/task/${taskId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    upload: async (taskId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/attachments/upload/task/${taskId}`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData
      });
      return handleResponse(res);
    },
    getDownloadUrl: (filePath) => {
      return `${API_BASE_URL}/attachments/download/${filePath}`;
    }
  },

  // Reports
  reports: {
    getSprint: async (sprintId) => {
      const res = await fetch(`${API_BASE_URL}/reports/sprint/${sprintId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getProject: async (projectId) => {
      const res = await fetch(`${API_BASE_URL}/reports/project/${projectId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getDeveloper: async (developerId) => {
      const res = await fetch(`${API_BASE_URL}/reports/developer/${developerId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getTaskCompletion: async (projectId) => {
      const res = await fetch(`${API_BASE_URL}/reports/task-completion/${projectId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Users & Notifications
  users: {
    me: async () => {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getDevelopers: async () => {
      const res = await fetch(`${API_BASE_URL}/users/developers`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getNotifications: async () => {
      const res = await fetch(`${API_BASE_URL}/users/notifications`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getUnreadNotifications: async () => {
      const res = await fetch(`${API_BASE_URL}/users/notifications/unread`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    markRead: async (id) => {
      const res = await fetch(`${API_BASE_URL}/users/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  }
};

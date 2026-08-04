// =========================================================
// Shared API Client
// Talks to the existing FastAPI backend (app/main.py, prefix /api/v1).
// Used across pages that need real backend data (currently: login,
// register, and the Workspace module). Does not alter any existing
// page's markup, styling, or unrelated JavaScript.
// =========================================================
(function (global) {
  const API_BASE_URL =
    (global.__API_BASE_URL__) ||
    "http://localhost:8000/api/v1";

  const TOKEN_KEY = "epm_access_token";
  const USER_KEY = "epm_current_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  function isAuthenticated() {
    return Boolean(getToken());
  }

  function logout() {
    setToken(null);
    setCurrentUser(null);
  }

  /**
   * Core request helper. Resolves with parsed JSON on success.
   * Rejects with an Error whose `.message` is a human-readable string
   * and whose `.status` is the HTTP status code (when available).
   */
  async function request(path, { method = "GET", body, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };

    if (auth) {
      const token = getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      const err = new Error(
        "Couldn't reach the server. Is the backend running?"
      );
      err.status = 0;
      throw err;
    }

    let data = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = null;
      }
    }

    if (!response.ok) {
      const detail =
        (data && (data.detail || data.message)) ||
        `Request failed (${response.status})`;
      const message = Array.isArray(detail)
        ? detail.map((d) => d.msg || JSON.stringify(d)).join(", ")
        : detail;
      const err = new Error(message);
      err.status = response.status;
      throw err;
    }

    return data;
  }

  const api = {
    API_BASE_URL,
    getToken,
    setToken,
    getCurrentUser,
    setCurrentUser,
    isAuthenticated,
    logout,
    request,

    auth: {
      login(email, password) {
        return request("/auth/login", {
          method: "POST",
          auth: false,
          body: { email, password },
        });
      },
      register(full_name, email, password) {
        return request("/auth/register", {
          method: "POST",
          auth: false,
          body: { full_name, email, password },
        });
      },
      profile() {
        return request("/auth/profile", { method: "GET" });
      },
    },

    workspaces: {
      list() {
        return request("/workspaces", { method: "GET" });
      },
      get(id) {
        return request(`/workspaces/${id}`, { method: "GET" });
      },
      create(payload) {
        return request("/workspaces", { method: "POST", body: payload });
      },
      update(id, payload) {
        return request(`/workspaces/${id}`, { method: "PUT", body: payload });
      },
      remove(id) {
        return request(`/workspaces/${id}`, { method: "DELETE" });
      },
      archive(id) {
        return request(`/workspaces/${id}/archive`, { method: "PATCH" });
      },
      unarchive(id) {
        return request(`/workspaces/${id}/unarchive`, { method: "PATCH" });
      },
      favorite(id) {
        return request(`/workspaces/${id}/favorite`, { method: "POST" });
      },
      unfavorite(id) {
        return request(`/workspaces/${id}/favorite`, { method: "DELETE" });
      },
      invite(id, email, role) {
        return request(`/workspaces/${id}/invite`, {
          method: "POST",
          body: { email, role },
        });
      },
      removeMember(id, userId) {
        return request(`/workspaces/${id}/members/${userId}`, {
          method: "DELETE",
        });
      },
      changeMemberRole(id, userId, role) {
        return request(`/workspaces/${id}/members/${userId}`, {
          method: "PATCH",
          body: { role },
        });
      },
      postAnnouncement(id, title, body) {
        return request(`/workspaces/${id}/announcements`, {
          method: "POST",
          body: { title, body },
        });
      },
      stats(id) {
        return request(`/workspaces/${id}/stats`, { method: "GET" });
      },
      calendar(id, params = {}) {
        const qs = new URLSearchParams(params).toString();
        return request(`/workspaces/${id}/calendar${qs ? `?${qs}` : ""}`, { method: "GET" });
      },
      createProject(id, payload) {
        return request(`/workspaces/${id}/projects`, {
          method: "POST",
          body: payload,
        });
      },
      favoriteProject(id, projectId) {
        return request(`/workspaces/${id}/projects/${projectId}/favorite`, { method: "POST" });
      },
      unfavoriteProject(id, projectId) {
        return request(`/workspaces/${id}/projects/${projectId}/favorite`, { method: "DELETE" });
      },
      archiveProject(id, projectId) {
        return request(`/workspaces/${id}/projects/${projectId}/archive`, { method: "PATCH" });
      },
      unarchiveProject(id, projectId) {
        return request(`/workspaces/${id}/projects/${projectId}/unarchive`, { method: "PATCH" });
      },
    },

    // Project Dashboard: full project detail + stats + activity.
    // (Create/Favorite/Archive stay on `workspaces.*` above — unchanged —
    // this only adds the detail resource used by project_overview.)
    project: {
      get(workspaceId, projectId) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}`, { method: "GET" });
      },
      update(workspaceId, projectId, payload) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}`, { method: "PUT", body: payload });
      },
      remove(workspaceId, projectId) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}`, { method: "DELETE" });
      },
      stats(workspaceId, projectId) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/stats`, { method: "GET" });
      },
      activity(workspaceId, projectId) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/activity`, { method: "GET" });
      },
    },

    tasks: {
      list(workspaceId, projectId, params = {}) {
        const qs = new URLSearchParams(params).toString();
        const suffix = qs ? `?${qs}` : "";
        return request(`/workspaces/${workspaceId}/projects/${projectId}/tasks${suffix}`, { method: "GET" });
      },
      create(workspaceId, projectId, payload) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, { method: "POST", body: payload });
      },
      update(workspaceId, projectId, taskId, payload) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, { method: "PUT", body: payload });
      },
      remove(workspaceId, projectId, taskId) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
      },
      comments(workspaceId, projectId, taskId) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`, { method: "GET" });
      },
      addComment(workspaceId, projectId, taskId, body) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`, {
          method: "POST",
          body: { body },
        });
      },
    },

    calendarEvents: {
      list(workspaceId, projectId, params = {}) {
        const qs = new URLSearchParams(params).toString();
        return request(`/workspaces/${workspaceId}/projects/${projectId}/calendar${qs ? `?${qs}` : ""}`, { method: "GET" });
      },
      create(workspaceId, projectId, payload) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/calendar`, { method: "POST", body: payload });
      },
      remove(workspaceId, projectId, eventId) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/calendar/${eventId}`, { method: "DELETE" });
      },
      update(workspaceId, projectId, eventId, payload) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/calendar/${eventId}`, { method: "PUT", body: payload });
      },
    },

    wiki: {
      list(workspaceId, projectId, q) {
        const suffix = q ? `?q=${encodeURIComponent(q)}` : "";
        return request(`/workspaces/${workspaceId}/projects/${projectId}/wiki${suffix}`, { method: "GET" });
      },
      create(workspaceId, projectId, payload) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/wiki`, { method: "POST", body: payload });
      },
      update(workspaceId, projectId, pageId, payload) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/wiki/${pageId}`, { method: "PUT", body: payload });
      },
      history(workspaceId, projectId, pageId) {
        return request(`/workspaces/${workspaceId}/projects/${projectId}/wiki/${pageId}/history`, { method: "GET" });
      },
    },

    googleCalendar: {
      status() {
        return request("/integrations/google-calendar/status", { method: "GET" });
      },
      connect() {
        return request("/integrations/google-calendar/connect", { method: "GET" });
      },
      updateSettings(preferences) {
        return request("/integrations/google-calendar/settings", { method: "PUT", body: preferences });
      },
      disconnect() {
        return request("/integrations/google-calendar/disconnect", { method: "DELETE" });
      },
    },

    notifications: {
      list(unreadOnly = false, archived = false) {
        const query = new URLSearchParams();
        if (unreadOnly) query.set("unread_only", "true");
        if (archived) query.set("archived", "true");
        return request(`/notifications${query.size ? `?${query}` : ""}`, { method: "GET" });
      },
      unreadCount() {
        return request("/notifications/unread-count", { method: "GET" });
      },
      markRead(id, isRead = true) {
        return request(`/notifications/${id}`, { method: "PATCH", body: { is_read: isRead } });
      },
      markAllRead() {
        return request("/notifications/mark-all-read", { method: "POST" });
      },
      archive(id, archived = true) {
        return request(`/notifications/${id}/archive`, { method: "PATCH", body: { is_archived: archived } });
      },
      remove(id) {
        return request(`/notifications/${id}`, { method: "DELETE" });
      },
    },
  };

  global.EPM_API = api;
})(window);

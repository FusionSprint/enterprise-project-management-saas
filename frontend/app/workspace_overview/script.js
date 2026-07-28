// =========================================================
// SHELL WIRING (menu/sidebar, notifications, messages, logout, toast,
// hover-tilt, command palette shortcut) — reused verbatim from the
// Workspace Dashboard's script.js so this page behaves identically.
// =========================================================
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const searchBtn = document.getElementById("searchBtn");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

searchBtn.addEventListener("click", () => {
  showToast("Search / Command palette opened");
});

document.addEventListener("keydown", (event) => {
  const isMacSearch = event.metaKey && event.key.toLowerCase() === "k";
  const isWindowsSearch = event.ctrlKey && event.key.toLowerCase() === "k";

  if (isMacSearch || isWindowsSearch) {
    event.preventDefault();
    showToast("Command palette opened");
  }

  if (event.key === "Escape") {
    sidebar.classList.remove("show");
  }
});

document.querySelectorAll(".hover-card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 5;
    const rotateX = ((y / rect.height) - 0.5) * -5;

    card.style.transform = `translateY(-7px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0) rotateX(0) rotateY(0)";
  });
});
// =========================================================
// UNIFIED NOTIFICATION & MESSAGES DROPDOWN SYSTEM
// =========================================================
(function() {
    const notifTrigger = document.getElementById('notif-trigger');
    const notifMenu = document.getElementById('notif-menu');
    const bellDot = document.getElementById('bell-dot');
    const notifUnreadCount = document.getElementById('header-unread-count');
    const viewAllNotifs = document.getElementById('view-all-notifs');

    const msgTrigger = document.getElementById('msg-trigger');
    const msgMenu = document.getElementById('msg-menu');
    const msgDot = document.getElementById('msg-dot');
    const msgUnreadCount = document.getElementById('msg-unread-count');
    const msgSearch = document.getElementById('msg-search');
    const msgItems = document.querySelectorAll('.msg-item');
    const markAllRead = document.getElementById('mark-all-read');
    const markMsgsRead = document.getElementById('mark-msgs-read');

    function updateNotifBadge() {
        if (!notifMenu) return;
        const count = notifMenu.querySelectorAll('.dot-indicator').length;
        if (notifUnreadCount) notifUnreadCount.textContent = count;
        if (bellDot) bellDot.style.display = count > 0 ? 'block' : 'none';
    }

    function updateMsgBadge() {
        if (!msgMenu) return;
        const count = msgMenu.querySelectorAll('.dot-indicator').length;
        if (msgUnreadCount) msgUnreadCount.textContent = count;
        if (msgDot) msgDot.style.display = count > 0 ? 'block' : 'none';
    }

    if (notifTrigger && notifMenu) {
        notifTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            notifMenu.classList.toggle('dropdown-open');
            if (msgMenu) msgMenu.classList.remove('dropdown-open');
        });
    }

    if (msgTrigger && msgMenu) {
        msgTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            msgMenu.classList.toggle('dropdown-open');
            if (notifMenu) notifMenu.classList.remove('dropdown-open');
        });
    }

    document.addEventListener('click', (e) => {
        if (notifMenu && !notifMenu.contains(e.target) && e.target !== notifTrigger) {
            notifMenu.classList.remove('dropdown-open');
        }
        if (msgMenu && !msgMenu.contains(e.target) && e.target !== msgTrigger) {
            msgMenu.classList.remove('dropdown-open');
        }
    });

    document.querySelectorAll('#notif-menu .notif-row').forEach(row => {
        row.addEventListener('click', () => {
            const dot = row.querySelector('.dot-indicator');
            if (dot) dot.remove();
            updateNotifBadge();
        });
    });

    if (msgItems && msgItems.length > 0) {
        msgItems.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.add('is-read');
                item.classList.remove('unread');
                const dot = item.querySelector('.dot-indicator');
                if (dot) dot.remove();
                updateMsgBadge();
            });
        });
    }

    if (markAllRead && notifMenu) {
        markAllRead.addEventListener('click', (e) => {
            e.stopPropagation();
            notifMenu.querySelectorAll('.dot-indicator').forEach(dot => dot.remove());
            updateNotifBadge();
            if (typeof triggerToast === 'function') triggerToast("All notifications marked as read");
            else if (typeof showToast === 'function') showToast("All notifications marked as read");
        });
    }

    if (markMsgsRead && msgMenu) {
        markMsgsRead.addEventListener('click', (e) => {
            e.stopPropagation();
            msgItems.forEach(item => {
                item.classList.add('is-read');
                item.classList.remove('unread');
                const dot = item.querySelector('.dot-indicator');
                if (dot) dot.remove();
            });
            updateMsgBadge();
            if (typeof triggerToast === 'function') triggerToast("All messages marked as read");
            else if (typeof showToast === 'function') showToast("All messages marked as read");
        });
    }

    if (viewAllNotifs) {
        viewAllNotifs.addEventListener('click', () => {
            window.location.href = "../notification_center/index.html";
        });
    }

    if (msgSearch && msgItems && msgItems.length > 0) {
        msgSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            msgItems.forEach(item => {
                const nameAttr = item.getAttribute('data-name');
                const name = nameAttr ? nameAttr.toLowerCase() : '';
                item.style.display = name.includes(term) ? '' : 'none';
            });
        });
    }

    const typingTargets = document.querySelectorAll('.typing-target');
    function simulateTyping() {
        if (typingTargets.length === 0) return;
        const target = typingTargets[Math.floor(Math.random() * typingTargets.length)];
        const originalText = target.innerText;
        setTimeout(() => {
            target.innerHTML = `<span class="text-secondary typing-indicator"><span></span><span></span><span></span> typing...</span>`;
            setTimeout(() => { target.innerText = originalText; }, 4000);
        }, Math.random() * 5000 + 5000);
    }
    if (typingTargets.length > 0) {
        setInterval(simulateTyping, 12000);
    }

    updateNotifBadge();
    updateMsgBadge();
})();

// === Shared Logout Lifecycle controller ===
const logoutBtn = document.getElementById('logout-sidebar-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (typeof triggerToast === 'function') {
            triggerToast("Logging out of Acme Corp...", "error");
        } else if (typeof showToast === 'function') {
            showToast("Logging out of Acme Corp...");
        }

        setTimeout(() => {
            localStorage.removeItem('activeMeetingView');
            localStorage.removeItem('activeMeetingView_saved');
            localStorage.removeItem('activeDevView');
            if (window.EPM_API) window.EPM_API.logout();
            window.location.href = "../enterprise_landing_page/index.html";
        }, 1000);
    });
}

// =========================================================
// WORKSPACE OVERVIEW MODULE
// Manages exactly ONE workspace (selected via ?id=<workspace_id> in the
// URL, set by the Workspace Dashboard / Favorites page when navigating
// here). Renders workspace info, Projects, Members, Activity and
// Announcements, and hosts the ONLY "Create Project" action in the app.
// =========================================================
(function () {
  const API = window.EPM_API;
  if (!API) return;

  if (!API.isAuthenticated()) {
    window.location.href = "../login/index.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const workspaceId = params.get("id");

  if (!workspaceId) {
    showToast("No workspace selected");
    setTimeout(() => {
      window.location.href = "../workspace_dashboard/index.html";
    }, 1200);
    return;
  }

  let workspace = null;
  const ICON_BY_COLOR_CLASS = { purple: "purple", orange: "orange", cyan: "cyan", success: "cyan", danger: "orange" };
  const PRIORITY_CLASS = { Low: "priority-low", Medium: "priority-medium", High: "priority-high", Critical: "priority-critical" };

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function initials(name) {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || name.slice(0, 2).toUpperCase();
  }

  function timeAgo(iso) {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const diffMs = Date.now() - then;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
  }

  function fmtDate(iso) {
    if (!iso) return "No due date";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  // ---- Load ----
  async function loadWorkspace() {
    try {
      workspace = await API.workspaces.get(workspaceId);
      render();
      try {
        const stats = await API.workspaces.stats(workspaceId);
        document.getElementById("wsOvStatMembers").textContent = stats.member_count;
        document.getElementById("wsOvStatProjects").textContent = stats.project_count;
        document.getElementById("wsOvStatAnnouncements").textContent = stats.announcement_count;
      } catch (statsErr) {
        console.error("Couldn't load workspace statistics —", statsErr);
      }
    } catch (err) {
      showToast(err.message || "Couldn't load this workspace");
      document.getElementById("wsOvName").textContent = "Workspace unavailable";
      document.getElementById("wsOvMeta").textContent = err.message || "";
    }
  }

  // ---- Render: header/info ----
  function render() {
    const ws = workspace;
    document.getElementById("wsOvName").textContent = ws.workspace_name;
    document.getElementById("wsOvCrumb").textContent = ws.workspace_name;
    document.title = `${ws.workspace_name} | Workspace Overview`;

    const iconEl = document.getElementById("wsOvIcon");
    iconEl.className = `workspace-icon ${ICON_BY_COLOR_CLASS[ws.color] || "purple"}`;
    iconEl.querySelector(".material-symbols-outlined").textContent = ws.icon || "rocket_launch";

    document.getElementById("wsOvMeta").textContent =
      `${ws.workspace_type || "Private"} • Created ${fmtDate(ws.created_at)} • ${ws.member_count} member${ws.member_count === 1 ? "" : "s"}`;

    document.getElementById("wsOvArchivedBadge").style.display = ws.is_archived ? "inline-block" : "none";

    const favBtn = document.getElementById("wsOvFavoriteBtn");
    favBtn.classList.toggle("active", !!ws.is_favorite);
    document.getElementById("wsOvFavoriteLabel").textContent = ws.is_favorite ? "Favorited" : "Favorite";

    document.getElementById("wsOvArchiveLabel").textContent = ws.is_archived ? "Unarchive" : "Archive";

    document.getElementById("wsOvStatMembers").textContent = ws.member_count;
    document.getElementById("wsOvStatProjects").textContent = (ws.projects || []).filter(p => !p.is_archived).length;
    document.getElementById("wsOvStatAnnouncements").textContent = (ws.announcements || []).length;
    const owner = (ws.members || []).find(m => m.role === "Owner");
    document.getElementById("wsOvStatOwner").textContent = owner ? (owner.full_name || owner.email) : "—";

    document.getElementById("wsOvDesc").textContent = ws.description || "No description provided.";
    document.getElementById("wsOvTags").innerHTML = (ws.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join("");

    renderProjects();
    renderMembers();
    renderActivity();
    renderAnnouncements();
  }

  // ---- Projects ----
  function renderProjects() {
    const grid = document.getElementById("wsOvProjectsGrid");
    const projects = (workspace.projects || []).filter(p => !p.is_archived);
    document.getElementById("wsOvProjectCountBadge").textContent = `${projects.length} total`;

    if (projects.length === 0) {
      grid.innerHTML = `
        <div class="ws-state-block" style="grid-column: 1 / -1;">
          <span class="material-symbols-outlined">folder_open</span>
          <h4>No projects yet</h4>
          <p>Create the first project for this workspace.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = projects.map(p => {
      const memberAvatars = (p.members || []).slice(0, 3).map(m =>
        `<div class="ws-member-avatar" style="width:24px;height:24px;font-size:10px;" title="${escapeHtml(m.full_name || m.email)}">${initials(m.full_name || m.email)}</div>`
      ).join("");

      return `
        <div class="ws-project-card" data-project-id="${p.id}">
          <div class="ws-project-card-top">
            <div class="workspace-icon ${ICON_BY_COLOR_CLASS[p.color] || "purple"}">
              <span class="material-symbols-outlined">${escapeHtml(p.icon || "tactic")}</span>
            </div>
            <span class="ws-project-priority ${PRIORITY_CLASS[p.priority] || "priority-medium"}">${escapeHtml(p.priority)}</span>
          </div>
          <h4>${escapeHtml(p.name)}</h4>
          <p class="ws-project-desc">${escapeHtml(p.description || "No description yet.")}</p>
          <div class="ws-project-progress-bar"><div style="width:${p.progress || 0}%"></div></div>
          <div class="ws-project-meta-row">
            <span>${escapeHtml(p.status)} • ${p.progress || 0}%</span>
            <span>${fmtDate(p.due_date)}</span>
          </div>
          <div class="ws-project-meta-row">
            <div style="display:flex;">${memberAvatars || '<span style="font-size:11px;">No members</span>'}</div>
            <span>Updated ${timeAgo(p.updated_at)}</span>
          </div>
          <div class="ws-project-actions-row">
            <div class="ws-project-icon-actions">
              <button type="button" class="proj-favorite-btn ${p.is_favorite ? "is-favorite" : ""}" data-id="${p.id}" title="Favorite">
                <span class="material-symbols-outlined" style="font-size:16px;">star</span>
              </button>
              <button type="button" class="proj-archive-btn" data-id="${p.id}" title="Archive">
                <span class="material-symbols-outlined" style="font-size:16px;">archive</span>
              </button>
              <button type="button" class="proj-delete-btn" data-id="${p.id}" title="Delete project">
                <span class="material-symbols-outlined" style="font-size:16px;">delete</span>
              </button>
            </div>
            <button type="button" class="ws-project-open-btn" data-id="${p.id}">
              Open Project <span class="material-symbols-outlined" style="font-size:15px;">arrow_forward</span>
            </button>
          </div>
        </div>
      `;
    }).join("");

    grid.querySelectorAll(".proj-favorite-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const project = (workspace.projects || []).find(p => p.id === id);
        try {
          workspace = project.is_favorite
            ? await API.workspaces.unfavoriteProject(workspaceId, id)
            : await API.workspaces.favoriteProject(workspaceId, id);
          renderProjects();
        } catch (err) {
          showToast(err.message || "Couldn't update project favorite");
        }
      });
    });

    grid.querySelectorAll(".proj-archive-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        try {
          workspace = await API.workspaces.archiveProject(workspaceId, id);
          renderProjects();
          document.getElementById("wsOvStatProjects").textContent = (workspace.projects || []).filter(p => !p.is_archived).length;
          showToast("Project archived");
        } catch (err) {
          showToast(err.message || "Couldn't archive project");
        }
      });
    });

    grid.querySelectorAll(".proj-delete-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const project = (workspace.projects || []).find(p => p.id === id);
        if (!project || !window.confirm(`Permanently delete “${project.name}” and all of its tasks, events, and wiki pages?`)) return;
        try {
          await API.project.remove(workspaceId, id);
          workspace.projects = (workspace.projects || []).filter(p => p.id !== id);
          renderProjects();
          document.getElementById("wsOvStatProjects").textContent = (workspace.projects || []).filter(p => !p.is_archived).length;
          showToast("Project deleted");
        } catch (err) {
          showToast(err.message || "Couldn't delete project");
        }
      });
    });

    grid.querySelectorAll(".ws-project-open-btn, .ws-project-card").forEach(el => {
      el.addEventListener("click", (e) => {
        const id = el.getAttribute("data-project-id") || el.getAttribute("data-id");
        if (!id) return;
        openProject(id);
      });
    });
  }

  function openProject(projectId) {
    const project = (workspace.projects || []).find(p => p.id === projectId);
    if (!project) return;
    // The Project Dashboard already exists and only manages an already
    // selected Project — we hand off via query params, no new backend call.
    const p = new URLSearchParams({
      workspace_id: workspace.id,
      workspace_name: workspace.workspace_name,
      project_id: project.id,
      project_name: project.name,
    });
    window.location.href = `../project_overview/index.html?${p.toString()}`;
  }

  // ---- Members ----
  function renderMembers() {
    const list = document.getElementById("wsOvMemberList");
    list.innerHTML = "";
    (workspace.members || []).forEach(m => {
      const li = document.createElement("li");
      li.className = "ws-member-row";
      const isOwner = m.role === "Owner";
      li.innerHTML = `
        <div class="ws-member-avatar">${initials(m.full_name || m.email)}</div>
        <div class="ws-member-info">
          <b>${escapeHtml(m.full_name || m.email)}</b>
          <small>${escapeHtml(m.email || "")}</small>
        </div>
      `;
      const roleWrap = document.createElement("div");
      roleWrap.style.display = "flex";
      roleWrap.style.alignItems = "center";
      roleWrap.style.gap = "6px";

      if (isOwner) {
        const badge = document.createElement("span");
        badge.className = "ws-archived-badge";
        badge.textContent = "Owner";
        roleWrap.appendChild(badge);
      } else {
        const select = document.createElement("select");
        select.className = "ws-member-role-select";
        ["Admin", "Project Manager", "Team Member", "Viewer"].forEach(role => {
          const opt = document.createElement("option");
          opt.value = role;
          opt.textContent = role;
          opt.selected = role === m.role;
          select.appendChild(opt);
        });
        select.addEventListener("change", () => changeMemberRole(m.user_id, select.value));
        roleWrap.appendChild(select);

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "ws-member-remove";
        removeBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">close</span>';
        removeBtn.addEventListener("click", () => removeMember(m.user_id));
        roleWrap.appendChild(removeBtn);
      }
      li.appendChild(roleWrap);
      list.appendChild(li);
    });
  }

  async function changeMemberRole(userId, role) {
    try {
      workspace = await API.workspaces.changeMemberRole(workspaceId, userId, role);
      render();
      showToast(`Role updated to ${role}`);
    } catch (err) {
      showToast(err.message || "Couldn't update role");
      render();
    }
  }

  async function removeMember(userId) {
    if (!window.confirm("Remove this member from the workspace?")) return;
    try {
      workspace = await API.workspaces.removeMember(workspaceId, userId);
      render();
      showToast("Member removed");
    } catch (err) {
      showToast(err.message || "Couldn't remove member");
    }
  }

  document.getElementById("wsOvInviteForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("wsOvInviteEmail").value.trim();
    const role = document.getElementById("wsOvInviteRole").value;
    if (!email) return;
    try {
      await API.workspaces.invite(workspaceId, email, role);
      workspace = await API.workspaces.get(workspaceId);
      render();
      document.getElementById("wsOvInviteEmail").value = "";
      showToast(`Invited ${email}`);
    } catch (err) {
      showToast(err.message || "Couldn't invite member");
    }
  });

  // ---- Activity ----
  function renderActivity() {
    const list = document.getElementById("wsOvActivityList");
    const entries = workspace.recent_activity || [];
    list.innerHTML = entries.length === 0
      ? `<li class="ws-empty-inline">No activity yet.</li>`
      : entries.map(entry => `
          <li class="ws-activity-row">
            <span class="ws-activity-dot"></span>
            <div><p>${escapeHtml(entry.message)}</p><time>${timeAgo(entry.created_at)}</time></div>
          </li>
        `).join("");
  }

  // ---- Announcements ----
  function renderAnnouncements() {
    const list = document.getElementById("wsOvAnnouncementList");
    const items = workspace.announcements || [];
    list.innerHTML = items.length === 0
      ? `<li class="ws-empty-inline">No announcements yet.</li>`
      : items.map(a => `
          <li class="ws-announcement-card">
            <h5>${escapeHtml(a.title)}</h5>
            <p>${escapeHtml(a.body)}</p>
            <small>${escapeHtml(a.author_name || "Team")} • ${timeAgo(a.created_at)}</small>
          </li>
        `).join("");
  }

  document.getElementById("wsOvAnnouncementForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("wsOvAnnouncementTitle").value.trim();
    const body = document.getElementById("wsOvAnnouncementBody").value.trim();
    if (!title || !body) return;
    try {
      workspace = await API.workspaces.postAnnouncement(workspaceId, title, body);
      render();
      e.target.reset();
      showToast("Announcement posted");
    } catch (err) {
      showToast(err.message || "Couldn't post announcement");
    }
  });

  // ---- Tabs (Members / Activity / Announcements) ----
  document.getElementById("wsOvTabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".ws-tab");
    if (!btn) return;
    document.querySelectorAll("#wsOvTabs .ws-tab").forEach(b => b.classList.toggle("active", b === btn));
    document.querySelectorAll('[id^="wsOvTab-"]').forEach(p => p.classList.toggle("active", p.id === `wsOvTab-${btn.dataset.tab}`));
  });

  // ---- Favorite / Archive / Delete (workspace-level) ----
  document.getElementById("wsOvFavoriteBtn").addEventListener("click", async () => {
    try {
      workspace = workspace.is_favorite
        ? await API.workspaces.unfavorite(workspaceId)
        : await API.workspaces.favorite(workspaceId);
      render();
      showToast(workspace.is_favorite ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      showToast(err.message || "Couldn't update favorite");
    }
  });

  document.getElementById("wsOvArchiveBtn").addEventListener("click", async () => {
    try {
      workspace = workspace.is_archived
        ? await API.workspaces.unarchive(workspaceId)
        : await API.workspaces.archive(workspaceId);
      render();
      showToast(workspace.is_archived ? "Workspace archived" : "Workspace restored");
    } catch (err) {
      showToast(err.message || "Couldn't update workspace");
    }
  });

  document.getElementById("wsOvInviteBtn").addEventListener("click", () => {
    document.querySelectorAll("#wsOvTabs .ws-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === "members"));
    document.querySelectorAll('[id^="wsOvTab-"]').forEach(p => p.classList.toggle("active", p.id === "wsOvTab-members"));
    document.getElementById("wsOvInviteEmail").focus();
  });

  // =========================================================
  // Workspace Settings modal (Edit)
  // =========================================================
  const wsEditOverlay = document.getElementById("wsEditModalOverlay");
  const wsEditForm = document.getElementById("wsEditForm");
  const wsEditError = document.getElementById("wsEditFormError");

  function openEditModal() {
    document.getElementById("wsEditNameInput").value = workspace.workspace_name;
    document.getElementById("wsEditDescInput").value = workspace.description || "";
    document.getElementById("wsEditTagsInput").value = (workspace.tags || []).join(", ");
    document.getElementById("wsEditIconPicker").querySelectorAll(".ws-icon-opt").forEach(b => b.classList.toggle("active", b.dataset.icon === workspace.icon));
    document.getElementById("wsEditColorPicker").querySelectorAll(".ws-color-opt").forEach(b => b.classList.toggle("active", b.dataset.color === workspace.color));
    document.getElementById("wsEditTypeSegmented").querySelectorAll(".ws-segment").forEach(b => b.classList.toggle("active", b.dataset.type === workspace.workspace_type));
    wsEditError.style.display = "none";
    wsEditOverlay.classList.add("open");
  }
  function closeEditModal() { wsEditOverlay.classList.remove("open"); }

  document.getElementById("wsOvSettingsBtn").addEventListener("click", openEditModal);
  document.getElementById("wsEditModalCloseBtn").addEventListener("click", closeEditModal);
  document.getElementById("wsEditCancelBtn").addEventListener("click", closeEditModal);
  wsEditOverlay.addEventListener("click", (e) => { if (e.target === wsEditOverlay) closeEditModal(); });

  ["wsEditIconPicker", "wsEditColorPicker"].forEach(id => {
    document.getElementById(id).addEventListener("click", (e) => {
      const opt = e.target.closest("button");
      if (!opt) return;
      document.getElementById(id).querySelectorAll("button").forEach(b => b.classList.remove("active"));
      opt.classList.add("active");
    });
  });
  document.getElementById("wsEditTypeSegmented").addEventListener("click", (e) => {
    const btn = e.target.closest(".ws-segment");
    if (!btn) return;
    document.getElementById("wsEditTypeSegmented").querySelectorAll(".ws-segment").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });

  wsEditForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("wsEditNameInput").value.trim();
    if (name.length < 3) {
      wsEditError.textContent = "Workspace name must be at least 3 characters.";
      wsEditError.style.display = "block";
      return;
    }
    const icon = document.getElementById("wsEditIconPicker").querySelector(".active")?.dataset.icon || "rocket_launch";
    const color = document.getElementById("wsEditColorPicker").querySelector(".active")?.dataset.color || "purple";
    const workspace_type = document.getElementById("wsEditTypeSegmented").querySelector(".active")?.dataset.type || "Private";
    const tags = document.getElementById("wsEditTagsInput").value.split(",").map(t => t.trim()).filter(Boolean);

    const submitBtn = document.getElementById("wsEditSubmitBtn");
    const label = document.getElementById("wsEditSubmitLabel");
    const spinner = document.getElementById("wsEditSubmitSpinner");
    submitBtn.disabled = true;
    spinner.style.display = "inline-block";
    const original = label.textContent;
    label.textContent = "Saving…";

    try {
      workspace = await API.workspaces.update(workspaceId, {
        workspace_name: name,
        description: document.getElementById("wsEditDescInput").value.trim() || null,
        icon, color, workspace_type, tags,
      });
      render();
      showToast("Workspace updated");
      closeEditModal();
    } catch (err) {
      wsEditError.textContent = err.message || "Something went wrong.";
      wsEditError.style.display = "block";
    } finally {
      submitBtn.disabled = false;
      spinner.style.display = "none";
      label.textContent = original;
    }
  });

  document.getElementById("wsEditDeleteBtn").addEventListener("click", async () => {
    if (!window.confirm(`Delete "${workspace.workspace_name}"? This cannot be undone.`)) return;
    try {
      await API.workspaces.remove(workspaceId);
      showToast("Workspace deleted");
      setTimeout(() => { window.location.href = "../workspace_dashboard/index.html"; }, 600);
    } catch (err) {
      showToast(err.message || "Couldn't delete workspace");
    }
  });

  // =========================================================
  // Create Project modal — the ONLY place Create Project happens.
  // =========================================================
  const projOverlay = document.getElementById("projModalOverlay");
  const projForm = document.getElementById("projForm");
  const projError = document.getElementById("projFormError");
  const projMembersChecklist = document.getElementById("projMembersChecklist");

  function openProjectModal() {
    projForm.reset();
    projError.style.display = "none";
    document.getElementById("projIconPicker").querySelectorAll(".ws-icon-opt").forEach((b, i) => b.classList.toggle("active", i === 0));
    document.getElementById("projColorPicker").querySelectorAll(".ws-color-opt").forEach((b, i) => b.classList.toggle("active", i === 0));
    document.getElementById("projPrioritySegmented").querySelectorAll(".ws-segment").forEach(b => b.classList.toggle("active", b.dataset.priority === "Medium"));

    // Members checklist is scoped to THIS workspace's members only.
    projMembersChecklist.innerHTML = (workspace.members || []).map(m => `
      <label class="ws-member-check-row">
        <input type="checkbox" value="${m.user_id}" ${m.role === "Owner" ? "checked disabled" : ""} />
        <span>${escapeHtml(m.full_name || m.email)}</span>
      </label>
    `).join("");

    projOverlay.classList.add("open");
    setTimeout(() => document.getElementById("projNameInput").focus(), 50);
  }
  function closeProjectModal() { projOverlay.classList.remove("open"); }

  document.getElementById("wsOvCreateProjectBtn").addEventListener("click", openProjectModal);
  document.getElementById("projModalCloseBtn").addEventListener("click", closeProjectModal);
  document.getElementById("projCancelBtn").addEventListener("click", closeProjectModal);
  projOverlay.addEventListener("click", (e) => { if (e.target === projOverlay) closeProjectModal(); });

  ["projIconPicker", "projColorPicker"].forEach(id => {
    document.getElementById(id).addEventListener("click", (e) => {
      const opt = e.target.closest("button");
      if (!opt) return;
      document.getElementById(id).querySelectorAll("button").forEach(b => b.classList.remove("active"));
      opt.classList.add("active");
    });
  });
  document.getElementById("projPrioritySegmented").addEventListener("click", (e) => {
    const btn = e.target.closest(".ws-segment");
    if (!btn) return;
    document.getElementById("projPrioritySegmented").querySelectorAll(".ws-segment").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });

  projForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("projNameInput").value.trim();
    if (name.length < 2) {
      projError.textContent = "Project name is required.";
      projError.style.display = "block";
      return;
    }

    const icon = document.getElementById("projIconPicker").querySelector(".active")?.dataset.icon || "tactic";
    const color = document.getElementById("projColorPicker").querySelector(".active")?.dataset.color || "purple";
    const priority = document.getElementById("projPrioritySegmented").querySelector(".active")?.dataset.priority || "Medium";
    const tags = document.getElementById("projTagsInput").value.split(",").map(t => t.trim()).filter(Boolean);
    const dueDateVal = document.getElementById("projDueDate").value;
    const member_ids = Array.from(projMembersChecklist.querySelectorAll("input:checked")).map(i => i.value);

    const submitBtn = document.getElementById("projSubmitBtn");
    const label = document.getElementById("projSubmitLabel");
    const spinner = document.getElementById("projSubmitSpinner");
    submitBtn.disabled = true;
    spinner.style.display = "inline-block";
    const original = label.textContent;
    label.textContent = "Creating…";

    try {
      workspace = await API.workspaces.createProject(workspaceId, {
        name,
        description: document.getElementById("projDescInput").value.trim() || null,
        priority,
        color,
        icon,
        due_date: dueDateVal ? new Date(dueDateVal).toISOString() : null,
        member_ids,
        tags,
      });
      render();
      showToast(`"${name}" created`);
      closeProjectModal();
    } catch (err) {
      projError.textContent = err.message || "Something went wrong. Please try again.";
      projError.style.display = "block";
    } finally {
      submitBtn.disabled = false;
      spinner.style.display = "none";
      label.textContent = original;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeEditModal();
      closeProjectModal();
    }
  });

  loadWorkspace();
})();

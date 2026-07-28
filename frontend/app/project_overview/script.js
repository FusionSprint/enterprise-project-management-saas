const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const searchBtn = document.getElementById("searchBtn");
const newTaskBtn = document.getElementById("newTaskBtn");
const updateDocsBtn = document.getElementById("updateDocsBtn");
const toast = document.getElementById("toast");

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1600);
}

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });
}

if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    showToast("Search opened");
  });
}

// Update Docs button behavior is now wired near the bottom of this file
// (wireWikiEditing), where it toggles real inline editing and saves to
// the backend instead of only showing a toast.

if (newTaskBtn) {
  newTaskBtn.addEventListener("click", () => {
    if (window.__activeProject && window.EPM_API && window.openTaskModal) {
      window.openTaskModal("create");
    } else if (window.__activeProject && window.EPM_API) {
      createBackendTask();
    } else {
      createTaskCard();
    }
  });
}

/* MAIN TOP TABS */
/* MAIN TOP TABS WITH REFRESH MEMORY */
const topTabs = document.querySelectorAll(".top-tab");
const appPages = document.querySelectorAll(".app-page");

function openMainPage(targetId, shouldSave = true) {
  const targetPage = document.getElementById(targetId);
  const activeTab = document.querySelector(`.top-tab[data-page="${targetId}"]`);

  if (!targetPage || !activeTab) return;

  topTabs.forEach((item) => item.classList.remove("active"));
  activeTab.classList.add("active");

  appPages.forEach((page) => page.classList.remove("active"));
  targetPage.classList.add("active");

  if (shouldSave) {
    localStorage.setItem("activeProjectPage", targetId);
  }

  const pageContent = document.getElementById("pageContent");

  if (pageContent) {
    pageContent.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

topTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetId = tab.dataset.page;
    openMainPage(targetId, true);
    showToast(tab.textContent.trim() + " opened");
  });
});

const urlParams = new URLSearchParams(window.location.search);
const initialPage = urlParams.get("tab");

if (initialPage && document.getElementById(initialPage)) {
  openMainPage(initialPage, false);
} else {
  const savedProjectPage = localStorage.getItem("activeProjectPage");

  if (savedProjectPage && document.getElementById(savedProjectPage)) {
    openMainPage(savedProjectPage, false);
  }
}
/* TASK SUB TABS */
/* TASK SUB TABS WITH REFRESH MEMORY */
const taskTabs = document.querySelectorAll(".task-tab");
const taskPanels = document.querySelectorAll(".task-panel");

function openTaskPanel(targetId, shouldSave = true) {
  const targetPanel = document.getElementById(targetId);
  const activeTab = document.querySelector(`.task-tab[data-task="${targetId}"]`);

  if (!targetPanel || !activeTab) return;

  taskTabs.forEach((item) => item.classList.remove("active"));
  activeTab.classList.add("active");

  taskPanels.forEach((panel) => panel.classList.remove("active"));
  targetPanel.classList.add("active");

  if (shouldSave) {
    localStorage.setItem("activeTaskPanel", targetId);
  }
}

taskTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetId = tab.dataset.task;
    openTaskPanel(targetId, true);
    showToast(tab.textContent.trim() + " view opened");
  });
});

const initialTaskPanel = urlParams.get("taskTab");

if (initialTaskPanel && document.getElementById(initialTaskPanel)) {
  openTaskPanel(initialTaskPanel, false);
} else {
  const savedTaskPanel = localStorage.getItem("activeTaskPanel");

  if (savedTaskPanel && document.getElementById(savedTaskPanel)) {
    openTaskPanel(savedTaskPanel, false);
  }
}
/* DRAG AND DROP */
let draggedCard = null;

function enableDragAndDrop() {
  const cards = document.querySelectorAll(".task-card");
  const lists = document.querySelectorAll(".task-list");

  cards.forEach((card) => {
    card.setAttribute("draggable", "true");

    card.ondragstart = () => {
      draggedCard = card;
      card.classList.add("dragging");
    };

    card.ondragend = () => {
      card.classList.remove("dragging");
      draggedCard = null;
      updateTaskCounts();
      showToast("Task moved");
    };
  });

  lists.forEach((list) => {
    list.ondragover = (event) => {
      event.preventDefault();

      const column = list.closest(".kanban-column");
      if (column) column.classList.add("drag-over");

      if (draggedCard) {
        list.appendChild(draggedCard);
      }
    };

    list.ondragleave = () => {
      const column = list.closest(".kanban-column");
      if (column) column.classList.remove("drag-over");
    };

    list.ondrop = (event) => {
      event.preventDefault();

      const column = list.closest(".kanban-column");
      if (column) column.classList.remove("drag-over");

      updateTaskCounts();

      if (draggedCard && draggedCard.dataset.taskId && window.__activeProject && window.EPM_API) {
        const newStatus = list.dataset.status || column?.querySelector("h3")?.textContent?.trim();
        if (newStatus) {
          const { workspaceId, projectId } = window.__activeProject;
          EPM_API.tasks
            .update(workspaceId, projectId, draggedCard.dataset.taskId, { status: newStatus })
            .catch((err) => showToast(err.message || "Couldn't save the task move"));
        }
      }
    };
  });
}

function updateTaskCounts() {
  document.querySelectorAll(".kanban-column").forEach((column) => {
    const countBadge = column.querySelector(".task-count");
    const count = column.querySelectorAll(".task-card").length;

    if (countBadge) {
      countBadge.textContent = count;
    }
  });
}

/* ADD TASK */
let taskCounter = 6;

function createTaskCard() {
  const firstList = document.querySelector(".task-list");

  if (!firstList) return;

  const task = document.createElement("div");
  task.className = "task-card";
  task.draggable = true;

  task.innerHTML = `
    <div class="task-meta">
      <span class="tag purple-tag">New</span>
      <i class="blue-dot"></i>
    </div>
    <h4>New project task ${taskCounter++}</h4>
    <div class="task-footer">
      <span>Today</span>
      <b>ME</b>
    </div>
  `;

  firstList.prepend(task);
  enableDragAndDrop();
  updateTaskCounts();
  showToast("New task added");
}

/* ADD COLUMN */
const addColumnBtn = document.getElementById("addColumnBtn");
let columnCounter = 1;

if (addColumnBtn) {
  addColumnBtn.addEventListener("click", () => {
    const kanbanBoard = document.getElementById("kanbanBoard");

    if (!kanbanBoard) return;

    const columnName = prompt("Enter column name:", `Custom ${columnCounter}`);

    if (!columnName || !columnName.trim()) return;

    const trimmedName = columnName.trim();
    const column = document.createElement("article");
    column.className = "kanban-column";

    const div = document.createElement("div");
    div.textContent = trimmedName;
    const safeName = div.innerHTML; // reuse the browser's own HTML-escaping

    column.innerHTML = `
      <div class="column-header">
        <h3>${safeName}</h3>
        <span class="task-count">0</span>
      </div>
      <div class="task-list" data-status="${safeName}"></div>
    `;

    kanbanBoard.insertBefore(column, addColumnBtn);

    columnCounter++;
    enableDragAndDrop();
    updateTaskCounts();
    if (window.augmentColumnHeader) {
      window.augmentColumnHeader(column.querySelector(".column-header"), trimmedName);
    }
    showToast("New column added");
  });
}

/* LIVE CALENDAR */
const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthYear = document.getElementById("calendarMonthYear");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const todayBtn = document.getElementById("todayBtn");

let currentCalendarDate = new Date();

let calendarEvents = {}; // populated from the backend only — see loadCalendarEvents()

function formatDateKey(year, month, day) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function renderCalendar(date) {
  if (!calendarGrid || !calendarMonthYear) return;

  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  calendarMonthYear.textContent = date.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  calendarGrid.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day empty";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-day";

    if (isCurrentMonth && today.getDate() === day) {
      dayCell.classList.add("today");
    }

    const dateKey = formatDateKey(year, month, day);
    const events = calendarEvents[dateKey] || [];

    dayCell.innerHTML = `
      <div class="day-number">${day}</div>
      ${events.map((event) => `<button type="button" class="calendar-event" data-event-id="${event.id || ""}" data-event-source="${event.source || "event"}" title="${event.source === "task_deadline" ? "Task deadline" : "Click to manage event"}">${event.title}</button>`).join("")}
    `;

    dayCell.querySelectorAll(".calendar-event").forEach((eventEl) => {
      eventEl.addEventListener("click", (event) => {
        event.stopPropagation();
        if (eventEl.dataset.eventSource === "task_deadline") {
          showToast("Task deadlines are managed from the task.");
          return;
        }
        if (typeof window.manageCalendarEvent === "function") {
          window.manageCalendarEvent(eventEl.dataset.eventId);
        }
      });
    });

    calendarGrid.appendChild(dayCell);
  }
}

if (prevMonthBtn) {
  prevMonthBtn.addEventListener("click", () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar(currentCalendarDate);
  });
}

if (nextMonthBtn) {
  nextMonthBtn.addEventListener("click", () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar(currentCalendarDate);
  });
}

if (todayBtn) {
  todayBtn.addEventListener("click", () => {
    currentCalendarDate = new Date();
    renderCalendar(currentCalendarDate);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    sidebar.classList.remove("show");
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    showToast("Command palette triggered");
  }
});

enableDragAndDrop();
updateTaskCounts();
renderCalendar(currentCalendarDate);
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

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (notifMenu) notifMenu.classList.remove('dropdown-open');
            if (msgMenu) msgMenu.classList.remove('dropdown-open');
        }
    });

    updateNotifBadge();
    updateMsgBadge();
})();


// === 15. Shared Logout Lifecycle controller ===
const logoutBtn = document.getElementById('logout-sidebar-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Trigger a professional status message if a toast handler exists
        if (typeof triggerToast === 'function') {
            triggerToast("Logging out of Acme Corp...", "error");
        } else if (typeof showToast === 'function') {
            showToast("Logging out of Acme Corp...");
        }

        setTimeout(() => {
            // Optional: Clear active temporary session variables
            localStorage.removeItem('activeMeetingView');
            localStorage.removeItem('activeMeetingView_saved');
            localStorage.removeItem('activeDevView');

            // Redirect smoothly to the landing/login portal
            window.location.href = "../enterprise_landing_page/index.html";
        }, 1000);
    });
}

// =========================================================
// BACKEND INTEGRATION — Project Dashboard
// Loads the specific Project selected on Workspace Overview
// (passed via ?workspace_id=&project_id=&project_name=) and wires
// Overview / Tasks / Calendar / Wiki to the real FastAPI backend.
// Nothing above this point was changed in behavior — this section
// only fills the existing markup with real data and adds real
// persistence to actions that were previously local-only (New Task,
// dragging a task between columns, and Update Docs).
// =========================================================
(function () {
  const params = new URLSearchParams(window.location.search);
  const workspaceId = params.get("workspace_id");
  const projectId = params.get("project_id");
  const projectNameFromUrl = params.get("project_name");

  const activeProjectNameEl = document.getElementById("activeProjectName");

  if (!workspaceId || !projectId) {
    // Page opened directly (design preview) rather than via "Open Project"
    // from Workspace Overview — leave all existing static/demo content as-is,
    // and keep Update Docs harmless (matches its original static behavior).
    if (updateDocsBtn) {
      updateDocsBtn.addEventListener("click", () => showToast("Wiki documentation updated"));
    }
    return;
  }

  if (!window.EPM_API) {
    console.error("EPM_API is not loaded — check the <script> include order.");
    return;
  }

  if (!EPM_API.isAuthenticated()) {
    window.location.href = "../login/index.html";
    return;
  }

  if (activeProjectNameEl && projectNameFromUrl) {
    activeProjectNameEl.textContent = `— ${projectNameFromUrl}`;
  }

  // Exposed so the drag-and-drop handler and the New Task button (both
  // defined earlier in this file) know a real backend project is loaded.
  window.__activeProject = { workspaceId, projectId };

  let currentTasks = [];
  let currentUserId = null; // resolved once by wireMyTasksFilter(), shared with wireTaskFilters()
  let currentWikiPage = null; // { id, body, version } once loaded/created
  let currentProject = null;
  let currentCalendarEventList = [];
  let taskQuery = {};

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function initialsFor(name) {
    if (!name) return "—";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function formatShortDate(value) {
    if (!value) return "No due date";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "No due date";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  const PRIORITY_TAG_CLASS = {
    High: "orange-tag",
    Medium: "purple-tag",
    Low: "blue-tag",
  };
  const PRIORITY_DOT_CLASS = {
    High: "orange-dot",
    Medium: "blue-dot",
    Low: "",
  };
  const STATUS_BADGE_CLASS = {
    Backlog: "backlog",
    "To Do": "todo",
    "In Progress": "progress",
    Review: "review",
  };

  // ---- Overview: real project detail + activity ----
  function renderTaskAvatars(members) {
    const bar = document.getElementById("taskAvatarsBar");
    if (!bar) return;

    if (!members.length) {
      bar.innerHTML = `<span title="No members on this project yet">—</span>`;
      return;
    }

    const visible = members.slice(0, 4);
    const overflow = members.length - visible.length;

    bar.innerHTML =
      visible
        .map(
          (m) =>
            `<span title="${escapeHtml(m.full_name || m.email || "Member")}">${escapeHtml(
              initialsFor(m.full_name || m.email)
            )}</span>`
        )
        .join("") + (overflow > 0 ? `<span>+${overflow}</span>` : "");
  }

  async function loadOverview() {
    try {
      const project = await EPM_API.project.get(workspaceId, projectId);
      currentProject = project;

      if (activeProjectNameEl) activeProjectNameEl.textContent = `— ${project.name}`;

      const progressValueEl = document.getElementById("overviewProgressValue");
      const progressBarEl = document.getElementById("overviewProgressBar");
      const progressDeltaEl = document.getElementById("overviewProgressDelta");
      if (progressValueEl) progressValueEl.textContent = `${project.progress || 0}%`;
      if (progressBarEl) progressBarEl.style.width = `${project.progress || 0}%`;
      if (progressDeltaEl) progressDeltaEl.textContent = project.status || "";

      renderTaskAvatars(project.members || []);
    } catch (err) {
      console.error("loadOverview failed:", err);
      showToast(err.message || "Couldn't load this project");
    }

    try {
      const stats = await EPM_API.project.stats(workspaceId, projectId);
      const riskValue = document.getElementById("overviewRiskValue");
      const riskDescription = document.getElementById("overviewRiskDescription");
      const taskCount = document.getElementById("overviewTaskCount");
      const taskDescription = document.getElementById("overviewTaskDescription");
      if (riskValue) riskValue.textContent = stats.overdue_task_count ? "At Risk" : "On Track";
      if (riskDescription) riskDescription.textContent = `${stats.overdue_task_count || 0} overdue task${stats.overdue_task_count === 1 ? "" : "s"}`;
      if (taskCount) taskCount.textContent = stats.task_count || 0;
      if (taskDescription) taskDescription.textContent = `${stats.upcoming_event_count || 0} upcoming event${stats.upcoming_event_count === 1 ? "" : "s"}`;
    } catch (err) {
      console.error("Couldn't load project statistics —", err);
    }

    try {
      const activity = await EPM_API.project.activity(workspaceId, projectId);
      const list = document.getElementById("recentActivityList");
      if (!list) return;

      if (!activity.length) {
        list.innerHTML = `<p class="muted">No activity yet on this project.</p>`;
        return;
      }

      list.innerHTML = activity
        .slice(0, 6)
        .map((entry) => {
          const when = new Date(entry.created_at);
          const whenLabel = Number.isNaN(when.getTime()) ? "" : when.toLocaleString();
          return `
            <div class="activity-item">
              <span class="activity-icon purple-bg">
                <span class="material-symbols-outlined">bolt</span>
              </span>
              <div>
                <p>${escapeHtml(entry.message)}</p>
                <small>${escapeHtml(whenLabel)}</small>
              </div>
            </div>
          `;
        })
        .join("");
    } catch (err) {
      console.error("Couldn't load recent activity —", err);
      showToast(err.message || "Couldn't load recent activity");
    }
  }

  // ---- Tasks: Board + List, backed by real tasks ----
  function renderTaskCard(task) {
    const priorityClass = PRIORITY_TAG_CLASS[task.priority] || "purple-tag";
    const dotClass = PRIORITY_DOT_CLASS[task.priority] || "";
    const assigneeInitials = initialsFor(task.assignee && task.assignee.full_name);

    const card = document.createElement("div");
    card.className = "task-card";
    card.draggable = true;
    card.dataset.taskId = task.id;
    card.innerHTML = `
      <div class="task-meta">
        <span class="tag ${priorityClass}">${escapeHtml(task.priority)}</span>
        <i class="${dotClass}"></i>
      </div>
      <h4>${escapeHtml(task.title)}</h4>
      <div class="task-footer">
        <span>${escapeHtml(formatShortDate(task.due_date))}</span>
        <b>${escapeHtml(assigneeInitials)}</b>
      </div>
    `;
    card.addEventListener("click", () => openTaskDetails(task));
    return card;
  }

  function renderTaskBoard() {
    const columnLists = Array.from(document.querySelectorAll(".task-list[data-status]"));
    const fallbackList = document.getElementById("backlogTaskList") || columnLists[0];

    columnLists.forEach((el) => {
      el.innerHTML = "";
    });

    currentTasks.forEach((task) => {
      const container =
        columnLists.find((el) => el.dataset.status === task.status) || fallbackList;
      if (container) container.appendChild(renderTaskCard(task));
    });

    columnLists.forEach((container) => {
      if (!container.children.length) {
        container.innerHTML = `<p class="muted" style="padding: 4px 2px;">No tasks yet</p>`;
      }
    });

    enableDragAndDrop();
    updateTaskCounts();
  }

  function renderTaskListView() {
    const tbody = document.getElementById("taskListTableBody");
    if (!tbody) return;

    if (!currentTasks.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="muted">No tasks yet</td></tr>`;
      return;
    }

    tbody.innerHTML = currentTasks
      .map((task) => {
        const badgeClass = STATUS_BADGE_CLASS[task.status] || "backlog";
        const owner = (task.assignee && task.assignee.full_name) || "Unassigned";
        return `
          <tr data-task-id="${escapeHtml(task.id)}" style="cursor:pointer">
            <td>${escapeHtml(task.title)}</td>
            <td><span class="status ${badgeClass}">${escapeHtml(task.status)}</span></td>
            <td>${escapeHtml(owner)}</td>
            <td>${escapeHtml(task.priority)}</td>
            <td>${escapeHtml(formatShortDate(task.due_date))}</td>
          </tr>
        `;
      })
      .join("");
    tbody.querySelectorAll("tr[data-task-id]").forEach((row) => {
      row.addEventListener("click", () => {
        const task = currentTasks.find((item) => item.id === row.dataset.taskId);
        if (task) openTaskDetails(task);
      });
    });
  }

  function renderTaskScheduleViews() {
    const datedTasks = currentTasks.filter((task) => task.due_date).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    const calendar = document.getElementById("taskMiniCalendar");
    const timeline = document.getElementById("taskTimelineList");
    if (calendar) {
      calendar.innerHTML = datedTasks.length
        ? datedTasks.slice(0, 7).map((task) => {
            const date = new Date(task.due_date);
            return `<div data-task-id="${escapeHtml(task.id)}" style="cursor:pointer"><small>${escapeHtml(date.toLocaleDateString(undefined, { weekday: "short" }))}</small><b>${escapeHtml(date.getDate())}</b><span>${escapeHtml(task.title)}</span></div>`;
          }).join("")
        : "<p class=\"muted\">No dated tasks yet</p>";
      calendar.querySelectorAll("[data-task-id]").forEach((item) => item.addEventListener("click", () => {
        const task = currentTasks.find((entry) => entry.id === item.dataset.taskId);
        if (task) openTaskDetails(task);
      }));
    }
    if (timeline) {
      timeline.innerHTML = datedTasks.length
        ? datedTasks.map((task) => `<div data-task-id="${escapeHtml(task.id)}" style="cursor:pointer"><span class="timeline-dot purple-fill"></span><h4>${escapeHtml(task.title)}</h4><p>Due ${escapeHtml(formatShortDate(task.due_date))} · ${escapeHtml(task.status)}</p></div>`).join("")
        : "<p class=\"muted\">No dated tasks yet</p>";
      timeline.querySelectorAll("[data-task-id]").forEach((item) => item.addEventListener("click", () => {
        const task = currentTasks.find((entry) => entry.id === item.dataset.taskId);
        if (task) openTaskDetails(task);
      }));
    }
  }

  async function loadTasks() {
    try {
      currentTasks = await EPM_API.tasks.list(workspaceId, projectId, taskQuery);
      renderTaskBoard();
      renderTaskListView();
      renderTaskScheduleViews();
    } catch (err) {
      console.error("Couldn't load tasks —", err);
      showToast(err.message || "Couldn't load tasks");
    }
  }

  async function openTaskDetails(task) {
    // Real modal (edit mode) replaces the old window.prompt() flow.
    // Defined by wireTaskModal() further down in this same IIFE.
    if (window.openTaskModal) {
      window.openTaskModal("edit", task);
    }
  }

  // ---- Task Modal: create + edit + comments (replaces window.prompt UI) ----
  function wireTaskModal() {
    const overlay = document.getElementById("taskModalOverlay");
    if (!overlay) return;

    const titleEl = document.getElementById("taskModalTitle");
    const titleInput = document.getElementById("taskModalTitleInput");
    const descInput = document.getElementById("taskModalDescInput");
    const assigneeSelect = document.getElementById("taskModalAssigneeSelect");
    const prioritySelect = document.getElementById("taskModalPrioritySelect");
    const dueInput = document.getElementById("taskModalDueInput");
    const labelsInput = document.getElementById("taskModalLabelsInput");
    const statusField = document.getElementById("taskModalStatusField");
    const statusSelect = document.getElementById("taskModalStatusSelect");
    const errorEl = document.getElementById("taskModalError");
    const commentsSection = document.getElementById("taskModalCommentsSection");
    const commentsList = document.getElementById("taskModalCommentsList");
    const commentInput = document.getElementById("taskModalCommentInput");
    const commentBtn = document.getElementById("taskModalCommentBtn");
    const deleteBtn = document.getElementById("taskModalDeleteBtn");
    const cancelBtn = document.getElementById("taskModalCancelBtn");
    const closeBtn = document.getElementById("taskModalCloseBtn");
    const saveBtn = document.getElementById("taskModalSaveBtn");

    let modalMode = "create"; // "create" | "edit"
    let editingTask = null;

    function showError(message) {
      if (!errorEl) return;
      if (!message) {
        errorEl.style.display = "none";
        errorEl.textContent = "";
      } else {
        errorEl.style.display = "block";
        errorEl.textContent = message;
      }
    }

    function populateAssigneeOptions(selectedUserId) {
      const members = currentProject?.members || [];
      assigneeSelect.innerHTML =
        `<option value="">Unassigned</option>` +
        members
          .map(
            (member) =>
              `<option value="${escapeHtml(member.user_id)}">${escapeHtml(
                member.full_name || member.email || "Member"
              )}</option>`
          )
          .join("");
      assigneeSelect.value = selectedUserId || "";
    }

    function availableStatuses() {
      // Reflects whatever Kanban columns actually exist right now,
      // including any custom columns added via "Add Column".
      const fromBoard = Array.from(document.querySelectorAll(".task-list[data-status]"))
        .map((el) => el.dataset.status)
        .filter(Boolean);
      const known = ["Backlog", "To Do", "In Progress", "Review"];
      const combined = [...new Set([...known, ...fromBoard])];
      return combined;
    }

    function populateStatusOptions(selectedStatus) {
      const statuses = availableStatuses();
      statusSelect.innerHTML = statuses
        .map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`)
        .join("");
      statusSelect.value = statuses.includes(selectedStatus) ? selectedStatus : statuses[0];
    }

    function renderComments(comments) {
      if (!comments || !comments.length) {
        commentsList.innerHTML = `<p class="muted">No comments yet.</p>`;
        return;
      }
      commentsList.innerHTML = comments
        .map((comment) => {
          const when = new Date(comment.created_at);
          const whenLabel = Number.isNaN(when.getTime()) ? "" : when.toLocaleString();
          return `
            <div class="task-comment-item">
              <div class="task-comment-meta">
                <span class="task-comment-author">${escapeHtml(comment.author_name || "Member")}</span>
                <span class="task-comment-time">${escapeHtml(whenLabel)}</span>
              </div>
              <div class="task-comment-body">${escapeHtml(comment.body)}</div>
            </div>
          `;
        })
        .join("");
      commentsList.scrollTop = commentsList.scrollHeight;
    }

    async function refreshComments() {
      if (!editingTask) return;
      try {
        const comments = await EPM_API.tasks.comments(workspaceId, projectId, editingTask.id);
        renderComments(comments);
      } catch (err) {
        renderComments(editingTask.comments || []);
      }
    }

    function open(mode, task, presetStatus) {
      modalMode = mode;
      editingTask = mode === "edit" ? task : null;
      showError("");
      commentInput.value = "";
      statusField.style.display = "flex";

      if (mode === "create") {
        titleEl.textContent = "New Task";
        saveBtn.textContent = "Create Task";
        deleteBtn.style.display = "none";
        commentsSection.style.display = "none";

        titleInput.value = "";
        descInput.value = "";
        prioritySelect.value = "Medium";
        dueInput.value = "";
        labelsInput.value = "";
        populateAssigneeOptions("");
        populateStatusOptions(presetStatus || "Backlog");
      } else {
        titleEl.textContent = "Task Details";
        saveBtn.textContent = "Save Changes";
        deleteBtn.style.display = "inline-flex";
        commentsSection.style.display = "flex";

        titleInput.value = task.title || "";
        descInput.value = task.description || "";
        prioritySelect.value = task.priority || "Medium";
        if (task.due_date) {
          const d = new Date(task.due_date);
          if (!Number.isNaN(d.getTime())) {
            dueInput.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
              d.getDate()
            ).padStart(2, "0")}`;
          } else {
            dueInput.value = "";
          }
        } else {
          dueInput.value = "";
        }
        labelsInput.value = (task.labels || []).join(", ");
        populateAssigneeOptions(task.assignee ? task.assignee.user_id : "");
        populateStatusOptions(task.status);
        commentsList.innerHTML = `<p class="muted">Loading comments…</p>`;
        refreshComments();
      }

      overlay.classList.add("open");
      titleInput.focus();
    }

    function close() {
      overlay.classList.remove("open");
      editingTask = null;
    }

    function buildDueDateIso() {
      if (!dueInput.value) return null;
      return `${dueInput.value}T00:00:00`;
    }

    async function handleSave() {
      const title = titleInput.value.trim();
      if (!title) {
        showError("Title is required.");
        titleInput.focus();
        return;
      }
      showError("");
      saveBtn.disabled = true;

      const payload = {
        title,
        description: descInput.value.trim() || null,
        priority: prioritySelect.value,
        due_date: buildDueDateIso(),
        labels: labelsInput.value
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        assignee_id: assigneeSelect.value || null,
      };

      try {
        if (modalMode === "create") {
          payload.status = statusSelect.value || "Backlog";
          await EPM_API.tasks.create(workspaceId, projectId, payload);
          showToast(payload.assignee_id ? "Task created and assigned" : "New task added");
        } else {
          payload.status = statusSelect.value;
          await EPM_API.tasks.update(workspaceId, projectId, editingTask.id, payload);
          showToast("Task updated");
        }
        close();
        await loadTasks();
        await loadCalendarEvents();
      } catch (err) {
        console.error("Couldn't save task —", err);
        showError(err.message || "Couldn't save the task");
      } finally {
        saveBtn.disabled = false;
      }
    }

    async function handleDelete() {
      if (!editingTask) return;
      if (!window.confirm(`Delete "${editingTask.title}"? This cannot be undone.`)) return;
      try {
        await EPM_API.tasks.remove(workspaceId, projectId, editingTask.id);
        showToast("Task deleted");
        close();
        await loadTasks();
        await loadCalendarEvents();
      } catch (err) {
        showToast(err.message || "Couldn't delete the task");
      }
    }

    async function handleAddComment() {
      if (!editingTask) return;
      const body = commentInput.value.trim();
      if (!body) return;
      commentBtn.disabled = true;
      try {
        await EPM_API.tasks.addComment(workspaceId, projectId, editingTask.id, body);
        commentInput.value = "";
        await refreshComments();
        showToast("Comment added");
      } catch (err) {
        showToast(err.message || "Couldn't post the comment");
      } finally {
        commentBtn.disabled = false;
      }
    }

    saveBtn.addEventListener("click", handleSave);
    deleteBtn.addEventListener("click", handleDelete);
    commentBtn.addEventListener("click", handleAddComment);
    commentInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddComment();
    });
    cancelBtn.addEventListener("click", close);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) close();
    });

    window.openTaskModal = open;
  }

  // ---- Per-column quick add: a "+" on each Kanban column header that
  // opens the Task Modal pre-set to that column's status. Exposed on
  // window so the "Add Column" handler (defined earlier, outside this
  // IIFE) can wire newly-created columns the same way. ----
  function augmentColumnHeader(headerEl, columnStatus) {
    if (!headerEl || headerEl.querySelector(".column-quick-add")) return;

    const countEl = headerEl.querySelector(".task-count");
    const right = document.createElement("div");
    right.className = "column-header-right";

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "column-quick-add";
    addBtn.setAttribute("aria-label", `Add task to ${columnStatus}`);
    addBtn.innerHTML = `<span class="material-symbols-outlined">add</span>`;
    addBtn.addEventListener("click", () => {
      if (window.openTaskModal) window.openTaskModal("create", null, columnStatus);
    });

    if (countEl) {
      countEl.replaceWith(right);
      right.appendChild(countEl);
      right.appendChild(addBtn);
    } else {
      right.appendChild(addBtn);
      headerEl.appendChild(right);
    }
  }
  window.augmentColumnHeader = augmentColumnHeader;

  function wireColumnQuickAdd() {
    document.querySelectorAll(".kanban-column").forEach((column) => {
      const header = column.querySelector(".column-header");
      const list = column.querySelector(".task-list");
      const status = (list && list.dataset.status) || header?.querySelector("h3")?.textContent?.trim();
      if (header && status) augmentColumnHeader(header, status);
    });
  }

  // ---- "Assigned to me" quick filter — the assignee's task menu within
  // the project, so they can find and finish what's assigned to them. ----
  async function wireMyTasksFilter() {
    const toolbar = document.querySelector(".tasks-toolbar");
    if (!toolbar || document.getElementById("myTasksFilterBtn")) return;

    let me = EPM_API.getCurrentUser();
    if (!me || !me.id) {
      // Sessions that logged in before profile caching was added won't
      // have a cached user yet — fetch it once and cache it now.
      try {
        const profileResult = await EPM_API.auth.profile();
        me = profileResult.user;
        EPM_API.setCurrentUser(me);
      } catch (err) {
        console.error("Couldn't resolve current user for the 'Assigned to Me' filter —", err);
        return;
      }
    }
    if (!me || !me.id) return;
    currentUserId = me.id;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "myTasksFilterBtn";
    btn.className = "new-task-btn my-tasks-toggle-btn";
    btn.textContent = "Assigned to Me";
    btn.addEventListener("click", async () => {
      const isActive = btn.classList.toggle("active");
      if (isActive) {
        taskQuery = { ...taskQuery, assignee_id: currentUserId };
        showToast("Showing tasks assigned to you");
      } else {
        const { assignee_id, ...rest } = taskQuery;
        taskQuery = rest;
        showToast("Showing all tasks");
      }
      await loadTasks();
    });
    toolbar.querySelector(".task-toolbar-right")?.prepend(btn);
  }

  function wireTaskFilters() {
    const toolbar = document.querySelector(".tasks-toolbar");
    if (!toolbar || document.getElementById("taskFilterBtn")) return;
    const filterBtn = document.createElement("button");
    filterBtn.type = "button";
    filterBtn.id = "taskFilterBtn";
    filterBtn.className = "new-task-btn";
    filterBtn.textContent = "Filter & Sort";
    filterBtn.addEventListener("click", async () => {
      const search = window.prompt("Search title/description (leave blank for all):", taskQuery.search || "");
      if (search === null) return;
      const priority = window.prompt("Priority: Low, Medium, High (leave blank for all):", taskQuery.priority || "");
      if (priority === null) return;
      const status = window.prompt("Status: Backlog, To Do, In Progress, Review (leave blank for all):", taskQuery.status || "");
      if (status === null) return;
      const members = currentProject?.members || [];
      const assigneeName = window.prompt(`Assignee (leave blank to keep the current "Assigned to Me" setting, if any):\n${members.map((member) => member.full_name || member.email).join("\n")}`, "");
      if (assigneeName === null) return;
      const assignee = members.find((member) => (member.full_name || member.email) === assigneeName.trim());
      if (assigneeName.trim() && !assignee) {
        showToast("Choose a project member from the list.");
        return;
      }
      const sortBy = window.prompt("Sort by: created_at, updated_at, due_date, priority, title:", taskQuery.sort_by || "created_at");
      if (sortBy === null) return;

      const myTasksBtn = document.getElementById("myTasksFilterBtn");
      let assigneeIdToUse = null;
      if (assignee) {
        // An explicit assignee was chosen — that wins. Keep the "Assigned
        // to Me" toggle's visual state truthful to what's actually applied.
        assigneeIdToUse = assignee.user_id;
        if (myTasksBtn) myTasksBtn.classList.toggle("active", assignee.user_id === currentUserId);
      } else if (myTasksBtn && myTasksBtn.classList.contains("active") && currentUserId) {
        // No explicit assignee chosen — preserve "Assigned to Me" instead
        // of silently dropping it.
        assigneeIdToUse = currentUserId;
      }

      taskQuery = {
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(["Low", "Medium", "High"].includes(priority.trim()) ? { priority: priority.trim() } : {}),
        ...(status.trim() ? { status: status.trim() } : {}),
        ...(assigneeIdToUse ? { assignee_id: assigneeIdToUse } : {}),
        ...(sortBy.trim() ? { sort_by: sortBy.trim() } : {}),
      };
      await loadTasks();
      showToast("Task filters applied");
    });
    toolbar.querySelector(".task-toolbar-right")?.prepend(filterBtn);
  }

  function wireProjectSettings() {
    const settingsBtn = document.getElementById("projectSettingsBtn");
    if (!settingsBtn) return;
    settingsBtn.addEventListener("click", async () => {
      if (!currentProject) return;
      const name = window.prompt("Project name:", currentProject.name);
      if (!name || !name.trim()) return;
      const description = window.prompt("Project description:", currentProject.description || "");
      const status = window.prompt("Project status:", currentProject.status || "Planning");
      try {
        currentProject = await EPM_API.project.update(workspaceId, projectId, {
          name: name.trim(), description: description || null, status: status || currentProject.status,
        });
        if (activeProjectNameEl) activeProjectNameEl.textContent = `â€” ${currentProject.name}`;
        showToast("Project settings saved");
      } catch (err) {
        showToast(err.message || "Couldn't save project settings");
      }
    });
  }

  window.createBackendTask = async function createBackendTask() {
    const title = window.prompt("Task title:");
    if (!title || !title.trim()) return;

    const dueInput = window.prompt(
      "Deadline for this task (optional) — format: YYYY-MM-DD or YYYY-MM-DD HH:MM\nLeave blank for no deadline:"
    );

    let dueDateIso = null;
    if (dueInput && dueInput.trim()) {
      const match = dueInput.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/);
      if (!match) {
        showToast("Couldn't understand that date — task created without a deadline");
      } else {
        const [, yyyy, mm, dd, hh = "00", min = "00"] = match;
        // Sent as the exact wall-clock date/time the user typed — no UTC
        // conversion — so it always lands on that same calendar day.
        dueDateIso = `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
      }
    }

    try {
      await EPM_API.tasks.create(workspaceId, projectId, {
        title: title.trim(),
        status: "Backlog",
        priority: "Medium",
        due_date: dueDateIso,
      });
      showToast(dueDateIso ? "New task added to the calendar" : "New task added");
      await loadTasks();
      await loadCalendarEvents();
    } catch (err) {
      console.error("Couldn't create the task —", err);
      showToast(err.message || "Couldn't create the task");
    }
  };

  // ---- Calendar: real events + task deadlines, merged ----
  async function loadCalendarEvents() {
    try {
      const events = await EPM_API.calendarEvents.list(workspaceId, projectId);
      currentCalendarEventList = events;
      const map = {};
      events.forEach((event) => {
        const d = new Date(event.start_time);
        if (Number.isNaN(d.getTime())) return;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
        map[key] = map[key] || [];
        map[key].push(event);
      });
      calendarEvents = map;
      if (typeof renderCalendar === "function" && typeof currentCalendarDate !== "undefined") {
        renderCalendar(currentCalendarDate);
      }
    } catch (err) {
      console.error("Couldn't load the project calendar —", err);
      showToast(err.message || "Couldn't load the project calendar");
    }
  }

  window.manageCalendarEvent = async function manageCalendarEvent(eventId) {
    const event = currentCalendarEventList.find((item) => item.id === eventId);
    if (!event) return;
    const action = window.prompt(`Event: ${event.title}\n\nEnter edit, delete, or cancel`, "");
    if (!action) return;
    try {
      if (action.trim().toLowerCase() === "delete") {
        if (!window.confirm(`Delete “${event.title}”?`)) return;
        await EPM_API.calendarEvents.remove(workspaceId, projectId, eventId);
        showToast("Calendar event deleted");
      } else if (action.trim().toLowerCase() === "edit") {
        const title = window.prompt("Event title:", event.title);
        if (!title || !title.trim()) return;
        const start = window.prompt("Start (YYYY-MM-DD HH:MM):", String(event.start_time).slice(0, 16).replace("T", " "));
        if (!start || !start.trim()) return;
        await EPM_API.calendarEvents.update(workspaceId, projectId, eventId, {
          title: title.trim(), start_time: start.trim().replace(" ", "T"),
        });
        showToast("Calendar event updated");
      } else {
        showToast("Choose edit or delete.");
        return;
      }
      await loadCalendarEvents();
    } catch (err) {
      console.error("Couldn't manage calendar event —", err);
      showToast(err.message || "Couldn't update the event");
    }
  };

  function wireCalendarActions() {
    const addEventBtn = document.getElementById("addCalendarEventBtn");
    if (!addEventBtn) return;
    addEventBtn.addEventListener("click", async () => {
      const title = window.prompt("Event title:");
      if (!title || !title.trim()) return;
      const start = window.prompt("Start (YYYY-MM-DD HH:MM):");
      if (!start || !start.trim()) return;
      const eventType = window.prompt("Type: Event, Meeting, Milestone, Deadline:", "Event");
      const validTypes = ["Event", "Meeting", "Milestone", "Deadline"];
      try {
        await EPM_API.calendarEvents.create(workspaceId, projectId, {
          title: title.trim(), start_time: start.trim().replace(" ", "T"),
          event_type: validTypes.includes(eventType) ? eventType : "Event",
        });
        showToast("Calendar event added");
        await loadCalendarEvents();
      } catch (err) {
        console.error("Couldn't create calendar event —", err);
        showToast(err.message || "Couldn't create the event");
      }
    });
  }

  // ---- Wiki: one persisted page per project, editable in place ----
  async function loadWiki() {
    try {
      const pages = await EPM_API.wiki.list(workspaceId, projectId);
      if (pages.length) {
        currentWikiPage = pages[0];
        const contentEl = document.querySelector(".wiki-content");
        if (contentEl) contentEl.innerHTML = currentWikiPage.body;
      }
      // If no page exists yet, the static template content already in the
      // markup is kept as the starting draft — it becomes real, versioned
      // content the first time "Update Docs" is used to save it.
    } catch (err) {
      console.error("Couldn't load the wiki —", err);
      showToast(err.message || "Couldn't load the wiki");
    }
  }

  function wireWikiNavigation() {
    const newPageBtn = document.getElementById("newWikiPageBtn");
    const pagesBtn = document.getElementById("wikiPagesBtn");
    const searchBtn = document.getElementById("wikiSearchBtn");
    const historyBtn = document.getElementById("wikiHistoryBtn");
    if (newPageBtn) newPageBtn.addEventListener("click", async () => {
      const title = window.prompt("New wiki page title:");
      if (!title || !title.trim()) return;
      try {
        currentWikiPage = await EPM_API.wiki.create(workspaceId, projectId, { title: title.trim(), body: "" });
        const contentEl = document.querySelector(".wiki-content");
        if (contentEl) contentEl.innerHTML = "";
        showToast("New wiki page created");
      } catch (err) {
        showToast(err.message || "Couldn't create wiki page");
      }
    });
    if (pagesBtn) pagesBtn.addEventListener("click", async () => {
      try {
        const pages = await EPM_API.wiki.list(workspaceId, projectId);
        if (!pages.length) {
          showToast("No wiki pages yet.");
          return;
        }
        const selectedTitle = window.prompt(`Open a page:\n${pages.map((page) => page.title).join("\n")}`, currentWikiPage?.title || "");
        const page = pages.find((item) => item.title === selectedTitle);
        if (!page) return;
        currentWikiPage = page;
        const contentEl = document.querySelector(".wiki-content");
        if (contentEl) contentEl.innerHTML = page.body;
        showToast(`Opened ${page.title}`);
      } catch (err) {
        showToast(err.message || "Couldn't load wiki pages");
      }
    });
    if (searchBtn) searchBtn.addEventListener("click", async () => {
      const query = window.prompt("Search wiki pages:");
      if (query === null) return;
      try {
        const pages = await EPM_API.wiki.list(workspaceId, projectId, query.trim());
        if (!pages.length) {
          showToast("No matching wiki pages.");
          return;
        }
        const page = pages[0];
        currentWikiPage = page;
        const contentEl = document.querySelector(".wiki-content");
        if (contentEl) contentEl.innerHTML = page.body;
        showToast(`Opened ${page.title}`);
      } catch (err) {
        showToast(err.message || "Couldn't search wiki pages");
      }
    });
    if (historyBtn) historyBtn.addEventListener("click", async () => {
      if (!currentWikiPage) {
        showToast("Save this page before viewing its history.");
        return;
      }
      try {
        const history = await EPM_API.wiki.history(workspaceId, projectId, currentWikiPage.id);
        window.alert(history.length
          ? history.map((entry) => `v${entry.version} · ${entry.edited_by_name || "Member"} · ${new Date(entry.edited_at).toLocaleString()}`).join("\n")
          : "No previous versions.");
      } catch (err) {
        showToast(err.message || "Couldn't load wiki history");
      }
    });
  }

  function wireWikiEditing() {
    if (!updateDocsBtn) return;

    updateDocsBtn.addEventListener("click", async () => {
      const contentEl = document.querySelector(".wiki-content");
      if (!contentEl) return;

      const isEditing = contentEl.getAttribute("contenteditable") === "true";

      if (!isEditing) {
        contentEl.setAttribute("contenteditable", "true");
        contentEl.focus();
        updateDocsBtn.textContent = "Save Docs";
        showToast("Editing enabled — click Save Docs when done");
        return;
      }

      contentEl.setAttribute("contenteditable", "false");
      updateDocsBtn.textContent = "Update Docs";

      try {
        if (currentWikiPage) {
          currentWikiPage = await EPM_API.wiki.update(workspaceId, projectId, currentWikiPage.id, {
            body: contentEl.innerHTML,
          });
        } else {
          currentWikiPage = await EPM_API.wiki.create(workspaceId, projectId, {
            title: "Project Documentation",
            body: contentEl.innerHTML,
          });
        }
        showToast("Wiki documentation updated");
      } catch (err) {
        console.error("Couldn't save the wiki —", err);
      showToast(err.message || "Couldn't save the wiki");
      }
    });
  }

  loadOverview();
  loadTasks();
  loadCalendarEvents();
  loadWiki();
  wireTaskModal();
  wireColumnQuickAdd();
  wireTaskFilters();
  wireMyTasksFilter();
  wireProjectSettings();
  wireCalendarActions();
  wireWikiNavigation();
  wireWikiEditing();
})();

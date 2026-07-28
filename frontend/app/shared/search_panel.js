(function () {
  const pageConfigs = {
    "project_overview/index.html": [
      { name: "Overview", type: "Main Tab", action: "tab", target: "../project_overview/index.html", param: "tab", value: "overviewPage" },
      { name: "Tasks", type: "Main Tab", action: "tab", target: "../project_overview/index.html", param: "tab", value: "tasksPage" },
      { name: "Tasks / Board", type: "Subtab", action: "tab", target: "../project_overview/index.html", param: "taskTab", value: "taskBoard" },
      { name: "Tasks / List", type: "Subtab", action: "tab", target: "../project_overview/index.html", param: "taskTab", value: "taskList" },
      { name: "Tasks / Calendar", type: "Subtab", action: "tab", target: "../project_overview/index.html", param: "taskTab", value: "taskCalendar" },
      { name: "Tasks / Timeline", type: "Subtab", action: "tab", target: "../project_overview/index.html", param: "taskTab", value: "taskTimeline" },
      { name: "Calendar", type: "Main Tab", action: "tab", target: "../project_overview/index.html", param: "tab", value: "calendarPage" },
      { name: "Wiki", type: "Main Tab", action: "tab", target: "../project_overview/index.html", param: "tab", value: "wikiPage" },
      { name: "Team", type: "Navigation", action: "navigate", target: "../team_management/index.html" },
      { name: "Meetings", type: "Navigation", action: "navigate", target: "../meeting_scheduler/index.html" }
    ],
    "meeting_scheduler/index.html": [
      { name: "Overview", type: "Meeting Tab", action: "tab", target: "../meeting_scheduler/index.html", param: "tab", value: "overviewView" },
      { name: "Schedule", type: "Meeting Tab", action: "tab", target: "../meeting_scheduler/index.html", param: "tab", value: "scheduleView" },
      { name: "Recordings", type: "Meeting Tab", action: "tab", target: "../meeting_scheduler/index.html", param: "tab", value: "recordingsView" },
      { name: "Agenda", type: "Section", action: "section", target: "agendaSection" },
      { name: "Meeting Actions", type: "Section", action: "section", target: "scheduleModal" },
      { name: "Team", type: "Navigation", action: "navigate", target: "../team_management/index.html" },
      { name: "Projects", type: "Navigation", action: "navigate", target: "../project_overview/index.html" }
    ],
    "team_management/index.html": [
      { name: "Overview", type: "Team Tab", action: "tab", target: "../team_management/index.html", param: "tab", value: "overviewView" },
      { name: "Directory", type: "Team Tab", action: "tab", target: "../team_management/index.html", param: "tab", value: "directoryView" },
      { name: "Roles", type: "Team Tab", action: "tab", target: "../team_management/index.html", param: "tab", value: "rolesView" },
      { name: "Performance", type: "Team Tab", action: "tab", target: "../team_management/index.html", param: "tab", value: "performanceView" },
      { name: "Member Search", type: "Section", action: "focus", target: "#memberSearch" },
      { name: "Projects", type: "Navigation", action: "navigate", target: "../project_overview/index.html" },
      { name: "Meetings", type: "Navigation", action: "navigate", target: "../meeting_scheduler/index.html" }
    ],
    "executive_analytics/index.html": [
      { name: "Overview", type: "Analytics Tab", action: "tab", target: "../executive_analytics/index.html", param: "tab", value: "overview" },
      { name: "Reports", type: "Analytics Tab", action: "tab", target: "../executive_analytics/index.html", param: "tab", value: "reports" },
      { name: "Workload", type: "Analytics Tab", action: "tab", target: "../executive_analytics/index.html", param: "tab", value: "workload" },
      { name: "Health", type: "Analytics Tab", action: "tab", target: "../executive_analytics/index.html", param: "tab", value: "health" },
      { name: "Notifications", type: "Navigation", action: "navigate", target: "../notification_center/index.html" },
      { name: "Inbox", type: "Navigation", action: "navigate", target: "../inbox/index.html" }
    ],
    "workspace_dashboard/index.html": [
      { name: "Projects", type: "Navigation", action: "navigate", target: "../project_overview/index.html" },
      { name: "Team", type: "Navigation", action: "navigate", target: "../team_management/index.html" },
      { name: "Meetings", type: "Navigation", action: "navigate", target: "../meeting_scheduler/index.html" },
      { name: "Inbox", type: "Navigation", action: "navigate", target: "../inbox/index.html" },
      { name: "Analytics", type: "Navigation", action: "navigate", target: "../executive_analytics/index.html" },
      { name: "Settings", type: "Navigation", action: "navigate", target: "../settings/index.html" }
    ],
    "inbox/index.html": [
      { name: "Unread", type: "Inbox Filter", action: "filter", target: "unread" },
      { name: "Done", type: "Inbox Filter", action: "filter", target: "done" },
      { name: "Snoozed", type: "Inbox Filter", action: "filter", target: "snoozed" },
      { name: "Messages", type: "Navigation", action: "navigate", target: "../messages/index.html" },
      { name: "Favorites", type: "Navigation", action: "navigate", target: "../favorites/index.html" }
    ],
    "favorites/index.html": [
      { name: "All", type: "Favorites Filter", action: "filter", target: "all" },
      { name: "Chats", type: "Favorites Filter", action: "filter", target: "chat" },
      { name: "Tasks", type: "Favorites Filter", action: "filter", target: "task" },
      { name: "Files", type: "Favorites Filter", action: "filter", target: "file" },
      { name: "Inbox", type: "Navigation", action: "navigate", target: "../inbox/index.html" },
      { name: "Messages", type: "Navigation", action: "navigate", target: "../messages/index.html" }
    ],
    "messages/index.html": [
      { name: "Direct Chats", type: "Messages", action: "filter", target: "direct" },
      { name: "Channels", type: "Messages", action: "filter", target: "channels" },
      { name: "Pinned", type: "Messages", action: "filter", target: "pinned" },
      { name: "Inbox", type: "Navigation", action: "navigate", target: "../inbox/index.html" },
      { name: "Favorites", type: "Navigation", action: "navigate", target: "../favorites/index.html" }
    ],
    "notification_center/index.html": [
      { name: "Inbox", type: "Notifications", action: "tab", target: "../notification_center/index.html", param: "view", value: "inbox" },
      { name: "Archive", type: "Notifications", action: "tab", target: "../notification_center/index.html", param: "view", value: "archive" },
      { name: "Analytics", type: "Navigation", action: "navigate", target: "../executive_analytics/index.html" },
      { name: "Messages", type: "Navigation", action: "navigate", target: "../messages/index.html" }
    ],
    "profile_settings/index.html": [
      { name: "Overview", type: "Profile Tab", action: "tab", target: "../profile_settings/index.html", param: "tab", value: "overview" },
      { name: "Tasks", type: "Profile Tab", action: "tab", target: "../profile_settings/index.html", param: "tab", value: "tasks" },
      { name: "History", type: "Profile Tab", action: "tab", target: "../profile_settings/index.html", param: "tab", value: "history" },
      { name: "Share Profile", type: "Action", action: "focus", target: "#share-profile-btn" },
      { name: "Settings", type: "Navigation", action: "navigate", target: "../settings/index.html" }
    ],
    "settings/index.html": [
      { name: "Account", type: "Settings Tab", action: "tab", target: "../settings/index.html", param: "tab", value: "account" },
      { name: "Security", type: "Settings Tab", action: "tab", target: "../settings/index.html", param: "tab", value: "security" },
      { name: "Billing", type: "Settings Tab", action: "tab", target: "../settings/index.html", param: "tab", value: "billing" },
      { name: "Workspace", type: "Settings Tab", action: "tab", target: "../settings/index.html", param: "tab", value: "workspace" },
      { name: "Profile", type: "Navigation", action: "navigate", target: "../profile_settings/index.html" }
    ]
  };

  function getPageKey() {
    return window.location.pathname.replace(/\\/g, '/').split('/').slice(-2).join('/');
  }

  function getConfig() {
    return pageConfigs[getPageKey()] || [
      { name: "Projects", type: "Navigation", action: "navigate", target: "../project_overview/index.html" },
      { name: "Team", type: "Navigation", action: "navigate", target: "../team_management/index.html" }
    ];
  }

  function ensurePanel() {
    if (document.getElementById('shared-search-panel')) {
      return document.getElementById('shared-search-panel');
    }

    const panel = document.createElement('div');
    panel.id = 'shared-search-panel';
    panel.className = 'search-panel hidden';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Search workspace');
    panel.innerHTML = `
      <div class="search-panel-top">
        <input type="text" id="shared-search-panel-input" placeholder="Search pages, sections or filters..." autocomplete="off" />
        <button class="search-panel-close" id="shared-search-panel-close" type="button" aria-label="Close search">×</button>
      </div>
      <div class="search-panel-results" id="shared-search-panel-results"></div>
    `;

    document.body.appendChild(panel);
    return panel;
  }

  function openPanel() {
    const panel = ensurePanel();
    const input = document.getElementById('shared-search-panel-input');
    const results = document.getElementById('shared-search-panel-results');
    panel.classList.remove('hidden');
    if (input) {
      input.value = '';
      input.focus();
    }
    if (results) {
      renderResults('');
    }
  }

  function closePanel() {
    const panel = document.getElementById('shared-search-panel');
    if (panel) {
      panel.classList.add('hidden');
    }
  }

  function renderResults(query) {
    const results = document.getElementById('shared-search-panel-results');
    if (!results) return;

    const normalized = (query || '').toLowerCase().trim();
    const items = getConfig().filter((item) => {
      return !normalized || item.name.toLowerCase().includes(normalized) || item.type.toLowerCase().includes(normalized);
    });

    if (!items.length) {
      results.innerHTML = '<div class="search-empty">No matches found</div>';
      return;
    }

    results.innerHTML = items.map((item) => `
      <button class="search-result-item" type="button" data-action="${item.action}" data-target="${item.target || ''}" data-param="${item.param || ''}" data-value="${item.value || ''}">
        <div class="item-main">
          <strong>${item.name}</strong>
          <span>${item.type}</span>
        </div>
      </button>
    `).join('');
  }

  function activateItem(item) {
    const action = item.getAttribute('data-action');
    const target = item.getAttribute('data-target') || '';
    const param = item.getAttribute('data-param') || '';
    const value = item.getAttribute('data-value') || '';

    if (action === 'navigate') {
      if (target) {
        window.location.href = target;
      }
      return;
    }

    if (action === 'tab') {
      if (target) {
        const url = new URL(target, window.location.href);
        if (param && value) {
          url.searchParams.set(param, value);
        }
        window.location.href = url.toString();
      }
      return;
    }

    if (action === 'section') {
      const section = document.getElementById(target);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      closePanel();
      return;
    }

    if (action === 'focus') {
      const focusTarget = document.querySelector(target);
      if (focusTarget) {
        focusTarget.focus();
      }
      closePanel();
      return;
    }

    if (action === 'filter') {
      const filterValue = target;
      if (typeof window.applyInboxFilter === 'function') {
        window.applyInboxFilter(filterValue);
      } else if (typeof window.applyFavoritesFilter === 'function') {
        window.applyFavoritesFilter(filterValue);
      } else if (typeof window.applyMessagesFilter === 'function') {
        window.applyMessagesFilter(filterValue);
      } else {
        const event = new CustomEvent('search-filter', { detail: { value: filterValue } });
        window.dispatchEvent(event);
      }
      closePanel();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchBtn');
    if (searchButton) {
      searchButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (document.getElementById('shared-search-panel')?.classList.contains('hidden')) {
          openPanel();
        } else {
          closePanel();
        }
      });
    }

    const panel = ensurePanel();
    const input = document.getElementById('shared-search-panel-input');
    const results = document.getElementById('shared-search-panel-results');

    if (input) {
      input.addEventListener('input', (event) => renderResults(event.target.value));
    }

    if (results) {
      results.addEventListener('click', (event) => {
        const button = event.target.closest('.search-result-item');
        if (button) {
          activateItem(button);
        }
      });
    }

    if (panel) {
      panel.addEventListener('click', (event) => {
        if (event.target === panel) {
          closePanel();
        }
      });
    }

    const closeButton = document.getElementById('shared-search-panel-close');
    if (closeButton) {
      closeButton.addEventListener('click', closePanel);
    }

    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openPanel();
      }
      if (event.key === 'Escape') {
        closePanel();
      }
    });
  });
})();

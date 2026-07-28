// === Global Helper Utilities ===
function triggerToast(message, type = "success") {
    const toastContainer = document.getElementById('toast-container');
    const toastElement = document.getElementById('toast');

    // Support both standalone toast and container models across pages
    if (toastElement) {
        toastElement.textContent = message;
        toastElement.classList.add('show');
        setTimeout(() => toastElement.classList.remove('show'), 1700);
        return;
    }

    if (toastContainer) {
        const toastItem = document.createElement("div");
        toastItem.className = `toast-item bg-surface-container-high border border-outline-variant text-on-surface text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 toast-${type}`;
        toastItem.style.opacity = '0';
        toastItem.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        toastItem.style.transform = 'translateY(6px)';
        toastItem.innerHTML = `<span class="material-symbols-outlined text-sm ${type === 'success' ? 'text-primary' : 'text-error'}">info</span><span>${message}</span>`;
        toastContainer.appendChild(toastItem);

        requestAnimationFrame(() => {
            toastItem.style.opacity = '1';
            toastItem.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            toastItem.style.opacity = '0';
            toastItem.style.transform = 'translateY(6px)';
            setTimeout(() => toastItem.remove(), 250);
        }, 3000);
    } else {
        console.log(message);
    }
}

function showToast(message) {
    triggerToast(message);
}

function openModal(title, bodyHTML, confirmLabel, confirmCallback) {
    const overlay = document.getElementById("settings-interactive-modal");
    const titleEl = document.getElementById("modal-title");
    const bodyEl = document.getElementById("modal-body-content");

    if (!overlay || !titleEl || !bodyEl) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHTML;

    const confirmBtn = document.getElementById("modal-action-confirm");
    const cancelBtn = document.getElementById("modal-action-cancel");

    if (confirmBtn) {
        confirmBtn.textContent = confirmLabel || "OK";
        confirmBtn.classList.remove("hidden");

        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.addEventListener("click", () => {
            if (confirmCallback) {
                confirmCallback(newConfirmBtn);
            } else {
                closeModal();
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.classList.remove("hidden");
    }

    overlay.classList.remove("hidden");
    overlay.classList.add("open");
    document.body.classList.add("modal-open");
}

function closeModal() {
    const overlay = document.getElementById("settings-interactive-modal");
    if (overlay) {
        overlay.classList.add("hidden");
        overlay.classList.remove("open");
    }
    document.body.classList.remove("modal-open");
}

function closeSearchPanel() {
    const panel = document.getElementById("search-panel");
    if (panel) {
        panel.classList.add("hidden");
    }
}

// Global Navigation Directory configuration
const navDirectory = [
  { name: "Dashboard", type: "Navigation Tab", url: "../workspace_dashboard/index.html", icon: "dashboard" },
  { name: "Projects", type: "Navigation Tab", url: "../project_overview/index.html", icon: "tactic" },
  { name: "Team", type: "Navigation Tab", url: "../team_management/index.html", icon: "group" },
  { name: "Meetings", type: "Navigation Tab", url: "../meeting_scheduler/index.html", icon: "video_call" },
  { name: "Dev Hub", type: "Navigation Tab", url: "../developer_hub/index.html", icon: "terminal" },
  { name: "Analytics", type: "Navigation Tab", url: "../executive_analytics/index.html", icon: "analytics" },
  { name: "Inbox", type: "Navigation Tab", url: "../inbox/index.html", icon: "inbox" },
  { name: "Favorites", type: "Navigation Tab", url: "#", icon: "star" },
  { name: "Settings", type: "Navigation Tab", url: "../settings/index.html", icon: "settings" },
  { name: "Profile", type: "Navigation Tab", url: "../profile_settings/index.html", icon: "account_circle" },
  { name: "Overview", type: "Developer Hub Subtab", actionType: "page-tab", targetPage: "../developer_hub/index.html", tabValue: "overviewView", tabParamName: "tab", icon: "view_module" },
  { name: "Connect to GitHub", type: "Developer Hub Subtab", actionType: "page-tab", targetPage: "../developer_hub/index.html", tabValue: "githubView", tabParamName: "tab", icon: "link" },
  { name: "Overview", type: "Project Overview Subtab", actionType: "page-tab", targetPage: "../project_overview/index.html", tabValue: "overviewPage", tabParamName: "tab", icon: "view_module" },
  { name: "Tasks", type: "Project Overview Subtab", actionType: "page-tab", targetPage: "../project_overview/index.html", tabValue: "tasksPage", tabParamName: "tab", icon: "task_alt" },
  { name: "Calendar", type: "Project Overview Subtab", actionType: "page-tab", targetPage: "../project_overview/index.html", tabValue: "calendarPage", tabParamName: "tab", icon: "calendar_month" },
  { name: "Wiki", type: "Project Overview Subtab", actionType: "page-tab", targetPage: "../project_overview/index.html", tabValue: "wikiPage", tabParamName: "tab", icon: "description" },
  { name: "Board", type: "Project Tasks Subtab", actionType: "page-tab", targetPage: "../project_overview/index.html", tabValue: "taskBoard", tabParamName: "taskTab", icon: "dashboard" },
  { name: "List", type: "Project Tasks Subtab", actionType: "page-tab", targetPage: "../project_overview/index.html", tabValue: "taskList", tabParamName: "taskTab", icon: "view_list" },
  { name: "Calendar", type: "Project Tasks Subtab", actionType: "page-tab", targetPage: "../project_overview/index.html", tabValue: "taskCalendar", tabParamName: "taskTab", icon: "calendar_month" },
  { name: "Timeline", type: "Project Tasks Subtab", actionType: "page-tab", targetPage: "../project_overview/index.html", tabValue: "taskTimeline", tabParamName: "taskTab", icon: "timeline" },
  { name: "Overview", type: "Meeting Subtab", actionType: "page-tab", targetPage: "../meeting_scheduler/index.html", tabValue: "overviewView", tabParamName: "tab", icon: "view_module" },
  { name: "Schedule", type: "Meeting Subtab", actionType: "page-tab", targetPage: "../meeting_scheduler/index.html", tabValue: "scheduleView", tabParamName: "tab", icon: "event_note" },
  { name: "Recordings", type: "Meeting Subtab", actionType: "page-tab", targetPage: "../meeting_scheduler/index.html", tabValue: "recordingsView", tabParamName: "tab", icon: "video_library" },
  { name: "Overview", type: "Team Subtab", actionType: "page-tab", targetPage: "../team_management/index.html", tabValue: "overviewView", tabParamName: "tab", icon: "view_module" },
  { name: "Directory", type: "Team Subtab", actionType: "page-tab", targetPage: "../team_management/index.html", tabValue: "directoryView", tabParamName: "tab", icon: "group" },
  { name: "Roles", type: "Team Subtab", actionType: "page-tab", targetPage: "../team_management/index.html", tabValue: "rolesView", tabParamName: "tab", icon: "badge" },
  { name: "Performance", type: "Team Subtab", actionType: "page-tab", targetPage: "../team_management/index.html", tabValue: "performanceView", tabParamName: "tab", icon: "insights" },
  { name: "Overview", type: "Analytics Subtab", actionType: "page-tab", targetPage: "../executive_analytics/index.html", tabValue: "overview", tabParamName: "tab", icon: "analytics" },
  { name: "Reports", type: "Analytics Subtab", actionType: "page-tab", targetPage: "../executive_analytics/index.html", tabValue: "reports", tabParamName: "tab", icon: "assessment" },
  { name: "Workload", type: "Analytics Subtab", actionType: "page-tab", targetPage: "../executive_analytics/index.html", tabValue: "workload", tabParamName: "tab", icon: "bar_chart" },
  { name: "Health", type: "Analytics Subtab", actionType: "page-tab", targetPage: "../executive_analytics/index.html", tabValue: "health", tabParamName: "tab", icon: "health_and_safety" },
  { name: "Account Details", type: "Settings Section", actionId: "subnav-account", icon: "manage_accounts" },
  { name: "Security Status & Keys", type: "Settings Section", actionId: "subnav-security", icon: "security" },
  { name: "Billing Plan & Upgrades", type: "Settings Section", actionId: "subnav-billing", icon: "credit_card" },
  { name: "Workspace Configuration", type: "Settings Section", actionId: "subnav-workspace", icon: "settings_suggest" }
];

function openSearchModal() {
    const panel = document.getElementById('search-panel');
    const searchInput = document.getElementById('search-panel-input');
    const resultsContainer = document.getElementById('search-panel-results');

    if (!panel || !searchInput || !resultsContainer) return;

    panel.classList.remove('hidden');

    const renderResults = (query = '') => {
        resultsContainer.innerHTML = '';

        const filtered = (navDirectory || []).filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.type.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center py-6 text-on-surface-variant">
                    <span class="material-symbols-outlined text-2xl mb-1 opacity-50">search_off</span>
                    <p class="text-xs">No matching navigation paths found</p>
                </div>
            `;
            return;
        }

        filtered.forEach(item => {
            const row = document.createElement('div');
            row.className = 'search-result-item';
            row.innerHTML = `
                <div class="item-main">
                    <span class="material-symbols-outlined text-primary">${item.icon}</span>
                    <div class="item-meta">
                        <strong>${item.name}</strong>
                        <span>${item.type}</span>
                    </div>
                </div>
                <span class="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
            `;

            row.addEventListener('click', () => {
                closeSearchPanel();
                if (item.url) {
                    if (item.url === '#') {
                        triggerToast("You are already on the Favorites page");
                    } else {
                        triggerToast(`Redirecting to ${item.name}...`);
                        setTimeout(() => {
                            window.location.href = item.url;
                        }, 500);
                    }
                } else if (item.actionType === 'page-tab' && item.targetPage && item.tabValue) {
                    const targetUrl = new URL(item.targetPage, window.location.href);
                    targetUrl.searchParams.set(item.tabParamName || 'tab', item.tabValue);
                    window.location.href = targetUrl.toString();
                    triggerToast(`${item.name} opened`);
                } else if (item.actionId) {
                    const targetButton = document.getElementById(item.actionId);
                    if (targetButton) {
                        targetButton.click();
                    }
                }
            });

            resultsContainer.appendChild(row);
        });
    };

    renderResults('');
    setTimeout(() => searchInput.focus(), 60);
    searchInput.oninput = (e) => renderResults(e.target.value);
}

// === Unified Main DOM Controller ===
document.addEventListener("DOMContentLoaded", () => {
    // Top-level DOM queries
    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menuBtn");
    const searchBtn = document.getElementById("searchBtn");
    const modalOverlay = document.getElementById("settings-interactive-modal");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const modalCancelBtn = document.getElementById("modal-action-cancel");
    const searchPanel = document.getElementById("search-panel");
    const searchPanelClose = document.getElementById("search-panel-close");

    const devTabs = document.querySelectorAll(".dev-tab");
    const devViews = document.querySelectorAll(".dev-view");

    // Notifications & Messaging Panel variables
    const notifTrigger = document.getElementById('notif-trigger');
    const notifMenu = document.getElementById('notif-menu');
    const markAllRead = document.getElementById('mark-all-read');
    const badge = document.getElementById('header-unread-count');
    const bellDot = document.getElementById('bell-dot');

    const msgTrigger = document.getElementById('msg-trigger');
    const msgMenu = document.getElementById('msg-menu');
    const markMsgsRead = document.getElementById('mark-msgs-read');
    const msgUnreadCount = document.getElementById('msg-unread-count');
    const msgDot = document.getElementById('msg-dot');
    const msgSearch = document.getElementById('msg-search');
    const msgItems = document.querySelectorAll('.msg-item');

    // Favorites page variables
    const searchInput = document.getElementById('notif-search-input');
    const openAddBookmarkBtn = document.getElementById('open-add-bookmark-btn');
    const favoritesGridBox = document.getElementById('favorites-grid-box');
    const emptyState = document.getElementById('empty-state');
    const searchEmptyState = document.getElementById('search-empty-state');
    const dragArea = document.getElementById('favorites-drag-area');

    const subnavAll = document.getElementById('fav-subnav-all');
    const subnavChats = document.getElementById('fav-subnav-chats');
    const subnavTasks = document.getElementById('fav-subnav-tasks');
    const subnavFiles = document.getElementById('fav-subnav-files');

    const statChatsCount = document.getElementById('stat-chats-count');
    const statTasksCount = document.getElementById('stat-tasks-count');
    const statFilesCount = document.getElementById('stat-files-count');
    const statTotalCount = document.getElementById('stat-total-count');

    // GitHub connect variables
    const topConnectGithubBtn = document.getElementById("topConnectGithubBtn");
    const connectGithubBtn = document.getElementById("connectGithubBtn");
    const githubUrlInput = document.getElementById("githubUrlInput");
    const githubTokenInput = document.getElementById("githubTokenInput");
    const githubStatusText = document.getElementById("githubStatusText");
    const connectedPreview = document.getElementById("connectedPreview");
    const refreshCommitsBtn = document.getElementById("refreshCommitsBtn");
    const terminalBox = document.getElementById("terminalBox");

    const STORAGE_KEY_FAVS = "sa_favorites_db";
    let activeFilterType = "all";

    let favoritesList = [
        { id: "fav_1", title: "Enterprise SaaS Team", category: "chat", metadata: "Channel • releases sync", icon: "forum", actionLabel: "OPEN CHAT", colorClass: "text-primary" },
        { id: "fav_2", title: "Sai Bhavani", category: "chat", metadata: "Direct • Lead Backend Developer", icon: "chat_bubble", actionLabel: "OPEN HUDDLE", colorClass: "text-secondary" },
        { id: "fav_3", title: "Apollo-Core Kanban Board", category: "task", metadata: "Board • sprint tracking", icon: "dashboard", actionLabel: "OPEN BOARD", colorClass: "text-secondary" },
        { id: "fav_4", title: "Resolve staging cluster deployment bottlenecks", category: "task", metadata: "Issue • CRITICAL", icon: "warning", actionLabel: "OPEN TICKET", colorClass: "text-error" },
        { id: "fav_5", title: "Sharding_Dashboard_v2.fig", category: "file", metadata: "Figma design mockup • 14.2 MB", icon: "image", actionLabel: "DOWNLOAD", colorClass: "text-success" },
        { id: "fav_6", title: "State_Architecture.pdf", category: "file", metadata: "Architecture Specification • 4.2 MB", icon: "description", actionLabel: "DOWNLOAD", colorClass: "text-success" },
        { id: "fav_7", title: "Sprint Planning Q4 Huddle", category: "task", metadata: "Invite • July 7, 2026", icon: "calendar_today", actionLabel: "OPEN INVITE", colorClass: "text-primary" }
    ];

    // ==========================================
    // NOTIFICATION & MESSAGES DROPDOWN ENGINE
    // ==========================================
    function updateNotificationCount() {
        if (!notifMenu) return;
        const count = notifMenu.querySelectorAll('.dot-indicator').length;
        if (badge) badge.textContent = count;
        if (bellDot) bellDot.style.display = count > 0 ? 'block' : 'none';
    }

    function updateMessageCount() {
        if (!msgMenu) return;
        const count = msgMenu.querySelectorAll('.dot-indicator').length;
        if (msgUnreadCount) msgUnreadCount.textContent = count;
        if (msgDot) msgDot.style.display = count > 0 ? 'block' : 'none';
    }

    // Toggle Notifications (Closes messages)
    if (notifTrigger && notifMenu) {
        notifTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            notifMenu.classList.toggle('dropdown-open');
            if (msgMenu) msgMenu.classList.remove('dropdown-open');
        });
    }

    // Toggle Messages (Closes notifications)
    if (msgTrigger && msgMenu) {
        msgTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            msgMenu.classList.toggle('dropdown-open');
            if (notifMenu) notifMenu.classList.remove('dropdown-open');
        });
    }

    // Unified Click-Outside handler (Prevents Scope ReferenceErrors)
    document.addEventListener('click', (e) => {
        if (notifMenu && !notifMenu.contains(e.target) && e.target !== notifTrigger) {
            notifMenu.classList.remove('dropdown-open');
        }
        if (msgMenu && !msgMenu.contains(e.target) && e.target !== msgTrigger) {
            msgMenu.classList.remove('dropdown-open');
        }

        // Search Panel auto close clicks
        const clickedInsidePanel = searchPanel && searchPanel.contains(e.target);
        const clickedSearchBtn = e.target === searchBtn || (searchBtn && searchBtn.contains(e.target));
        if (searchPanel && !searchPanel.classList.contains("hidden") && !clickedInsidePanel && !clickedSearchBtn) {
            closeSearchPanel();
        }
    });

    // Mark individual notification item as read
    document.querySelectorAll('#notif-menu .notif-row').forEach(row => {
        row.addEventListener('click', () => {
            const dot = row.querySelector('.dot-indicator');
            if (dot) dot.remove();
            updateNotificationCount();
        });
    });

    // Mark individual messages as read
    if (msgItems) {
        msgItems.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.add('is-read');
                item.classList.remove('unread');
                const dot = item.querySelector('.dot-indicator');
                if (dot) dot.remove();
                updateMessageCount();
            });
        });
    }

    // Mark All Notifications as Read
    if (markAllRead && notifMenu) {
        markAllRead.addEventListener('click', (e) => {
            e.stopPropagation();
            notifMenu.querySelectorAll('.dot-indicator').forEach(dot => dot.remove());
            updateNotificationCount();
            triggerToast("All notifications marked as read");
        });
    }

    // Mark All Messages as Read
    if (markMsgsRead && msgMenu) {
        markMsgsRead.addEventListener('click', (e) => {
            e.stopPropagation();
            msgItems.forEach(item => {
                item.classList.add('is-read');
                item.classList.remove('unread');
                const dot = item.querySelector('.dot-indicator');
                if (dot) dot.remove();
            });
            updateMessageCount();
            triggerToast("All messages marked as read");
        });
    }

    // Message dropdown local search filter
    if (msgSearch) {
        msgSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            msgItems.forEach(item => {
                const nameAttr = item.getAttribute('data-name');
                const name = nameAttr ? nameAttr.toLowerCase() : '';
                if (name.includes(term)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Simulate Message Typing Indicators
    const typingTargets = document.querySelectorAll('.typing-target');
    function simulateTyping() {
        if (typingTargets.length === 0) return;
        const target = typingTargets[Math.floor(Math.random() * typingTargets.length)];
        const originalText = target.innerText;
        
        setTimeout(() => {
            target.innerHTML = `<span class="text-secondary typing-indicator"><span></span><span></span><span></span> typing...</span>`;
            setTimeout(() => {
                target.innerText = originalText;
            }, 4000);
        }, Math.random() * 5000 + 5000);
    }

    if (typingTargets.length > 0) {
        setInterval(simulateTyping, 12000);
    }

    // Initial Badge Calculations
    updateNotificationCount();
    updateMessageCount();

    // ==========================================
    // FAVORITES SYSTEM MODULES
    // ==========================================
    function loadDB() {
        const stored = localStorage.getItem(STORAGE_KEY_FAVS);
        if (stored) {
            try {
                favoritesList = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse favorites storage.", e);
            }
        }
    }

    function saveDB() {
        localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(favoritesList));
    }

    function renderFavoritesGrid() {
        if (!favoritesGridBox) return;
        favoritesGridBox.innerHTML = "";

        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        let visibleCount = 0;

        favoritesList.forEach(fav => {
            if (activeFilterType !== "all" && fav.category !== activeFilterType) return;

            const matchesSearch = !query || 
                fav.title.toLowerCase().includes(query) || 
                fav.metadata.toLowerCase().includes(query);

            if (!matchesSearch) return;
            visibleCount++;

            const cardHTML = `
                <div class="group relative flex gap-md p-md bg-surface-container border border-outline-variant rounded-xl hover-card-fav transition-all cursor-pointer" data-fav-id="${fav.id}">
                    <div class="w-10 h-10 rounded-lg bg-surface-container-highest flex-shrink-0 flex items-center justify-center">
                        <span class="material-symbols-outlined ${fav.colorClass || 'text-primary'}">${fav.icon}</span>
                    </div>
                    <div class="flex-1 min-width-0">
                        <div class="flex items-center justify-between mb-1">
                            <span class="font-semibold text-on-surface text-sm truncate pr-6">${fav.title}</span>
                            <button class="btn-star absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-all duration-150" data-fav-id="${fav.id}">
                                <span class="material-symbols-outlined text-sm star-filled">star</span>
                            </button>
                        </div>
                        <p class="text-on-surface-variant text-xs leading-relaxed mb-3 truncate">${fav.metadata}</p>
                        <button class="px-3 py-1 bg-surface-container-highest hover:bg-surface-container-high text-on-surface border border-outline-variant rounded-lg text-[10px] font-bold btn-fav-action" data-fav-id="${fav.id}">
                            ${fav.actionLabel}
                        </button>
                    </div>
                </div>
            `;
            favoritesGridBox.insertAdjacentHTML("beforeend", cardHTML);
        });

        const totalCount = favoritesList.length;
        if (emptyState) emptyState.classList.toggle('hidden', totalCount > 0);
        if (searchEmptyState) searchEmptyState.classList.toggle('hidden', totalCount === 0 || visibleCount > 0 || query === "");

        updateStatCounters();

        document.querySelectorAll(".btn-star").forEach(star => {
            star.addEventListener("click", (e) => {
                e.stopPropagation();
                const favId = star.getAttribute("data-fav-id");
                unstarItem(favId);
            });
        });

        document.querySelectorAll(".btn-fav-action").forEach(actionBtn => {
            actionBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const favId = actionBtn.getAttribute("data-fav-id");
                triggerFavoriteAction(favId, actionBtn);
            });
        });
    }

    function updateStatCounters() {
        const chats = favoritesList.filter(f => f.category === "chat").length;
        const tasks = favoritesList.filter(f => f.category === "task").length;
        const files = favoritesList.filter(f => f.category === "file").length;
        const total = favoritesList.length;

        if (statChatsCount) statChatsCount.textContent = String(chats).padStart(2, '0');
        if (statTasksCount) statTasksCount.textContent = String(tasks).padStart(2, '0');
        if (statFilesCount) statFilesCount.textContent = String(files).padStart(2, '0');
        if (statTotalCount) statTotalCount.textContent = String(total).padStart(2, '0');
    }

    function unstarItem(id) {
        const card = favoritesGridBox.querySelector(`[data-fav-id="${id}"]`);
        if (card) {
            card.classList.add("card-exit");
            setTimeout(() => {
                favoritesList = favoritesList.filter(f => f.id !== id);
                saveDB();
                renderFavoritesGrid();
                triggerToast("Bookmark removed from favorites", "error");
            }, 250);
        }
    }

    function triggerFavoriteAction(id, actionBtn) {
        const fav = favoritesList.find(f => f.id === id);
        if (!fav) return;

        if (fav.category === "file") {
            const original = actionBtn.innerHTML;
            actionBtn.innerHTML = `<span class="btn-spinner"></span> DOWNLOADING...`;
            actionBtn.disabled = true;
            setTimeout(() => {
                actionBtn.innerHTML = original;
                actionBtn.disabled = false;
                triggerToast(`Asset download complete: ${fav.title}`);
            }, 1500);
        } else if (fav.title.includes("Kanban Board")) {
            const boardHTML = `
                <p class="text-on-surface-variant mb-4 leading-relaxed">Interactive board overview for the <strong>Apollo-Core Engine</strong> release cycle.</p>
                <div class="grid grid-cols-3 gap-2 text-[11px]">
                    <div class="bg-surface-container-high p-2 rounded border border-outline-variant space-y-2">
                        <p class="font-bold text-[10px] text-primary uppercase">To Do</p>
                        <div class="bg-surface-container-low p-2 rounded cursor-pointer hover:border-primary border border-transparent transition-colors" onclick="this.remove()">• Migrate API Keys</div>
                        <div class="bg-surface-container-low p-2 rounded cursor-pointer hover:border-primary border border-transparent transition-colors" onclick="this.remove()">• Optimize Bundle</div>
                    </div>
                    <div class="bg-surface-container-high p-2 rounded border border-outline-variant space-y-2">
                        <p class="font-bold text-[10px] text-secondary uppercase">Active</p>
                        <div class="bg-surface-container-low p-2 rounded cursor-pointer hover:border-primary border border-transparent transition-colors" onclick="this.remove()">• Shard routing tables</div>
                        <div class="bg-surface-container-low p-2 rounded cursor-pointer hover:border-primary border border-transparent transition-colors" onclick="this.remove()">• Run stress tests</div>
                    </div>
                    <div class="bg-surface-container-high p-2 rounded border border-outline-variant space-y-2">
                        <p class="font-bold text-[10px] text-success uppercase">Done</p>
                        <div class="bg-surface-container-low p-2 rounded opacity-60">• Patch login vulnerability</div>
                    </div>
                </div>
                <p class="text-[10px] text-on-surface-variant italic mt-3">Click on any card to dismiss or complete it dynamically.</p>
            `;
            openModal("Apollo-Core Kanban Board", boardHTML, "CLOSE", () => {
                closeModal();
            });
        } else if (fav.category === "chat") {
            const huddleHTML = `
                <p class="text-on-surface-variant mb-4 leading-relaxed">Direct messaging synchronization with <strong>${fav.title}</strong>.</p>
                <div class="p-3 bg-surface-container rounded-lg border border-outline-variant flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">chat_bubble</span>
                        <div>
                            <p class="font-semibold text-on-surface">Initiate Huddle Chat</p>
                            <p class="text-[10px] text-on-surface-variant">Last activity: 2m ago</p>
                        </div>
                    </div>
                    <button class="px-3 py-1 bg-primary text-on-primary text-xs font-bold rounded-lg" onclick="window.location.href='../messages/index.html'">OPEN</button>
                </div>
            `;
            openModal("Communication Huddle", huddleHTML, "CLOSE", () => closeModal());
        } else {
            const detailHTML = `
                <div class="space-y-2 leading-relaxed">
                    <p class="font-semibold text-on-surface">${fav.title}</p>
                    <p class="text-on-surface-variant text-[11px]">${fav.metadata}</p>
                    <p class="pt-2 text-xs">Standard asset node successfully bookmarked. Access the active module to execute related engineering procedures.</p>
                </div>
            `;
            openModal("Favorites Resource Profile", detailHTML, "CLOSE", () => closeModal());
        }
    }

    function setSubnavFilter(type, activeBtn) {
        activeFilterType = type;
        [subnavAll, subnavChats, subnavTasks, subnavFiles].forEach(btn => {
            if (btn) {
                btn.className = "flex items-center h-16 text-on-surface-variant hover:text-primary transition-all duration-200 cursor-pointer outline-none focus:outline-none";
            }
        });
        if (activeBtn) {
            activeBtn.className = "flex items-center h-16 text-primary border-b-2 border-primary font-semibold cursor-pointer outline-none focus:outline-none";
        }
        renderFavoritesGrid();
    }

    if (subnavAll) subnavAll.addEventListener('click', () => setSubnavFilter("all", subnavAll));
    if (subnavChats) subnavChats.addEventListener('click', () => setSubnavFilter("chat", subnavChats));
    if (subnavTasks) subnavTasks.addEventListener('click', () => setSubnavFilter("task", subnavTasks));
    if (subnavFiles) subnavFiles.addEventListener('click', () => setSubnavFilter("file", subnavFiles));

    if (searchInput) {
        searchInput.addEventListener('input', renderFavoritesGrid);
    }

    // Modal creation button handler
    if (openAddBookmarkBtn) {
        openAddBookmarkBtn.addEventListener('click', () => {
            const addHTML = `
                <div class="space-y-3">
                    <label class="block">
                        <span class="text-[10px] font-bold text-muted-2 uppercase tracking-widest block mb-1">Resource Name</span>
                        <input type="text" id="add-fav-title" placeholder="e.g. Docker release manifests" class="w-full bg-surface-container-lowest border-outline-variant border rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface focus:border-primary">
                    </label>
                    <label class="block">
                        <span class="text-[10px] font-bold text-muted-2 uppercase tracking-widest block mb-1">Resource Category</span>
                        <select id="add-fav-category" class="w-full bg-surface-container-lowest border-outline-variant border rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface focus:border-primary">
                            <option value="chat">Chats & Members</option>
                            <option value="task">Tasks & Boards</option>
                            <option value="file">Files & Links</option>
                        </select>
                    </label>
                    <label class="block">
                        <span class="text-[10px] font-bold text-muted-2 uppercase tracking-widest block mb-1">Description / Metadata</span>
                        <input type="text" id="add-fav-meta" placeholder="e.g. Staging configurations YAML" class="w-full bg-surface-container-lowest border-outline-variant border rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface focus:border-primary">
                    </label>
                </div>
            `;
            openModal("Add Favorite Bookmark", addHTML, "ADD BOOKMARK", (confirmBtn) => {
                const title = document.getElementById("add-fav-title").value.trim();
                const category = document.getElementById("add-fav-category").value;
                const meta = document.getElementById("add-fav-meta").value.trim();

                if (!title || !meta) {
                    triggerToast("Please populate all text fields", "error");
                    return;
                }

                confirmBtn.innerHTML = `<span class="btn-spinner"></span> Pinning asset...`;
                confirmBtn.disabled = true;

                setTimeout(() => {
                    const iconMap = { chat: "chat_bubble", task: "task_alt", file: "description" };
                    const colorMap = { chat: "text-secondary", task: "text-primary", file: "text-success" };

                    favoritesList.push({
                        id: "fav_" + Date.now(),
                        title: title,
                        category: category,
                        metadata: meta,
                        icon: iconMap[category] || "star",
                        colorClass: colorMap[category],
                        actionLabel: "VIEW DETAILS"
                    });

                    saveDB();
                    renderFavoritesGrid();
                    closeModal();
                    triggerToast("Bookmark successfully pinned to favorites!", "success");
                }, 1000);
            });
        });
    }

    // Drag-and-drop registration
    if (dragArea) {
        window.addEventListener("dragenter", (e) => {
            e.preventDefault();
            dragArea.classList.add("border-primary");
        });
        dragArea.addEventListener("dragover", (e) => e.preventDefault());
        dragArea.addEventListener("dragleave", () => dragArea.classList.remove("border-primary"));
        dragArea.addEventListener("drop", (e) => {
            e.preventDefault();
            dragArea.classList.remove("border-primary");
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                favoritesList.push({
                    id: "fav_" + Date.now(),
                    title: file.name,
                    category: "file",
                    metadata: `Shared document asset • ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                    icon: "description",
                    colorClass: "text-success",
                    actionLabel: "DOWNLOAD"
                });
                saveDB();
                renderFavoritesGrid();
                triggerToast(`File bookmarked successfully: ${file.name}`);
            }
        });
    }

    // Initialize Favorites Center
    if (favoritesGridBox) {
        loadDB();
        renderFavoritesGrid();
    }

    // ==========================================
    // DEVELOPER HUB VIEW ENGINE
    // ==========================================
    function openDevView(viewId, save = true) {
        const targetView = document.getElementById(viewId);
        const activeTab = document.querySelector(`.dev-tab[data-dev-view="${viewId}"]`);

        if (!targetView || !activeTab) return;

        devTabs.forEach((tab) => tab.classList.remove("active"));
        activeTab.classList.add("active");

        devViews.forEach((view) => view.classList.remove("active"));
        targetView.classList.add("active");

        if (save) {
            localStorage.setItem("activeDevView", viewId);
        }

        showToast(activeTab.textContent.trim() + " opened");
    }

    devTabs.forEach((tab) => {
        tab.addEventListener("click", (event) => {
            event.preventDefault();
            openDevView(tab.dataset.devView, true);
        });
    });

    if (topConnectGithubBtn) {
        topConnectGithubBtn.addEventListener("click", () => {
            openDevView("githubView", true);
        });
    }

    // Handle initial routing for developer views
    if (devTabs.length > 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const initialDevView = urlParams.get("tab");

        if (initialDevView && document.getElementById(initialDevView)) {
            openDevView(initialDevView, false);
        } else {
            const savedView = localStorage.getItem("activeDevView");
            if (savedView && document.getElementById(savedView)) {
                openDevView(savedView, false);
            }
        }
    }

    // GitHub connect modules
    function cleanGithubUrl(url) {
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
            cleanUrl = "https://" + cleanUrl;
        }
        return cleanUrl.replace(/\/+$/, "");
    }

    function isValidGithubUrl(url) {
        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.hostname !== "github.com") return false;
            const parts = parsedUrl.pathname.split("/").filter(Boolean);
            return parts.length >= 2;
        } catch (error) {
            return false;
        }
    }

    function setGithubConnected(url) {
        localStorage.setItem("connectedGithubRepo", url);
        if (githubStatusText) githubStatusText.textContent = "Connected to " + url;
        if (connectedPreview) {
            const pill = connectedPreview.querySelector(".status-pill");
            if (pill) {
                pill.textContent = "Connected";
                pill.classList.remove("disconnected");
                pill.classList.add("connected");
            }
        }
    }

    const savedGithubRepo = localStorage.getItem("connectedGithubRepo");
    if (savedGithubRepo) {
        setGithubConnected(savedGithubRepo);
        if (githubUrlInput) githubUrlInput.value = savedGithubRepo;
    }

    if (connectGithubBtn) {
        connectGithubBtn.addEventListener("click", () => {
            const rawGithubUrl = githubUrlInput ? githubUrlInput.value.trim() : "";
            const githubToken = githubTokenInput ? githubTokenInput.value.trim() : "";

            if (!rawGithubUrl) {
                showToast("Please enter GitHub repository URL");
                if (githubUrlInput) githubUrlInput.focus();
                return;
            }

            const githubUrl = cleanGithubUrl(rawGithubUrl);
            if (!isValidGithubUrl(githubUrl)) {
                showToast("Enter valid GitHub repository URL");
                if (githubUrlInput) githubUrlInput.focus();
                return;
            }

            if (!githubToken) {
                showToast("Please enter GitHub PAT");
                if (githubTokenInput) githubTokenInput.focus();
                return;
            }

            setGithubConnected(githubUrl);
            if (githubUrlInput) githubUrlInput.value = githubUrl;

            showToast("Opening GitHub repository");
            setTimeout(() => {
                window.open(githubUrl, "_blank", "noopener,noreferrer");
            }, 500);
        });
    }

    if (refreshCommitsBtn) {
        refreshCommitsBtn.addEventListener("click", () => {
            showToast("Commits refreshed");
        });
    }

    // Mock terminal logger loop
    const logs = [
        "14:04:12.11 >> Verifying build artifacts...",
        "14:04:15.55 >> Cloudflare Workers update initiated...",
        "14:04:18.02 >> Edge cache purged successfully.",
        "14:04:20.91 >> Monitoring for regression errors..."
    ];
    let logIndex = 0;

    function addLog() {
        if (!terminalBox || logIndex >= logs.length) return;
        const log = document.createElement("p");
        log.innerHTML = `<span>${new Date().toLocaleTimeString()}</span> ${logs[logIndex]}`;
        terminalBox.appendChild(log);
        terminalBox.scrollTop = terminalBox.scrollHeight;
        logIndex += 1;
        setTimeout(addLog, 3500);
    }
    if (terminalBox) {
        setTimeout(addLog, 3500);
    }

    // Sidebar scale animations on interaction
    document.querySelectorAll(".dev-card, .branch-card").forEach((card) => {
        card.addEventListener("mousedown", () => {
            card.style.transform = "translateY(-4px) scale(0.99)";
        });
        card.addEventListener("mouseup", () => card.style.transform = "");
        card.addEventListener("mouseleave", () => card.style.transform = "");
    });

    // Mobile viewport click layout corrections
    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("show");
        });
    }

    // Close on Modal/Dialog action triggers
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener("click", closeModal);

    // Global keyboard escape routes
    window.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            showToast("Command palette triggered");
        }
        if (event.key === "Escape" && sidebar) {
            sidebar.classList.remove("show");
        }
        if (event.key === "Escape") {
            closeModal();
            if (notifMenu) notifMenu.classList.remove('dropdown-open');
            if (msgMenu) msgMenu.classList.remove('dropdown-open');
        }
    });
});

// Shared Logout lifecycle execution
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
            window.location.href = "../enterprise_landing_page/index.html";
        }, 1000);
    });
}
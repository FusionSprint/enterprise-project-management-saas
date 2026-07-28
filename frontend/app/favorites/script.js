document.addEventListener('DOMContentLoaded', () => {
    // --- Consolidate Sidebar, Topbar, Search, Toast Elements ---
    const sidebar = document.getElementById('sidebar');
    const searchBtn = document.getElementById('searchBtn');
    const toastContainer = document.getElementById('toast-container');
    const searchInput = document.getElementById('notif-search-input');
    const openAddBookmarkBtn = document.getElementById('open-add-bookmark-btn');

    // Sub-navigation filter buttons
    const subnavAll = document.getElementById('fav-subnav-all');
    const subnavChats = document.getElementById('fav-subnav-chats');
    const subnavTasks = document.getElementById('fav-subnav-tasks');
    const subnavFiles = document.getElementById('fav-subnav-files');

    // Stats variables
    const statChatsCount = document.getElementById('stat-chats-count');
    const statTasksCount = document.getElementById('stat-tasks-count');
    const statFilesCount = document.getElementById('stat-files-count');
    const statTotalCount = document.getElementById('stat-total-count');

    // Container grids
    const favoritesGridBox = document.getElementById('favorites-grid-box');
    const emptyState = document.getElementById('empty-state');
    const searchEmptyState = document.getElementById('search-empty-state');
    const dragArea = document.getElementById('favorites-drag-area');

    // Modals
    const actionModal = document.getElementById('settings-interactive-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBodyContent = document.getElementById('modal-body-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalActionCancel = document.getElementById('modal-action-cancel');
    const modalActionConfirm = document.getElementById('modal-action-confirm');

    // Header Bell & message dots
    const bellDot = document.getElementById('bell-dot');
    const headerUnreadDot = document.getElementById('header-unread-dot');

    const STORAGE_KEY_FAVS = "sa_favorites_db";
    let activeFilterType = "all"; // 'all' | 'chat' | 'task' | 'file'

    // Real-world high-fidelity Mock Database
    let favoritesList = [
        { id: "fav_1", title: "Enterprise SaaS Team", category: "chat", metadata: "Channel • releases sync", icon: "forum", actionLabel: "OPEN CHAT", colorClass: "text-primary" },
        { id: "fav_2", title: "Sai Bhavani", category: "chat", metadata: "Direct • Lead Backend Developer", icon: "chat_bubble", actionLabel: "OPEN HUDDLE", colorClass: "text-secondary" },
        { id: "fav_3", title: "Apollo-Core Kanban Board", category: "task", metadata: "Board • sprint tracking", icon: "dashboard", actionLabel: "OPEN BOARD", colorClass: "text-secondary" },
        { id: "fav_4", title: "Resolve staging cluster deployment bottlenecks", category: "task", metadata: "Issue • CRITICAL", icon: "warning", actionLabel: "OPEN TICKET", colorClass: "text-error" },
        { id: "fav_5", title: "Sharding_Dashboard_v2.fig", category: "file", metadata: "Figma design mockup • 14.2 MB", icon: "image", actionLabel: "DOWNLOAD", colorClass: "text-success" },
        { id: "fav_6", title: "State_Architecture.pdf", category: "file", metadata: "Architecture Specification • 4.2 MB", icon: "description", actionLabel: "DOWNLOAD", colorClass: "text-success" },
        { id: "fav_7", title: "Sprint Planning Q4 Huddle", category: "task", metadata: "Invite • July 7, 2026", icon: "calendar_today", actionLabel: "OPEN INVITE", colorClass: "text-primary" }
    ];

    // Read stored favorites data
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

    // === Global UI Helpers ===
    function triggerToast(message, type = "success") {
        if (!toastContainer) return;
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
    }

    function openModal(title, bodyHTML, confirmLabel, confirmCallback) {
        if (!actionModal) return;
        if (modalTitle) modalTitle.textContent = title;
        if (modalBodyContent) modalBodyContent.innerHTML = bodyHTML;
        if (modalActionConfirm) {
            modalActionConfirm.textContent = confirmLabel || "CONFIRM";
            const newConfirmBtn = modalActionConfirm.cloneNode(true);
            modalActionConfirm.parentNode.replaceChild(newConfirmBtn, modalActionConfirm);
            
            newConfirmBtn.addEventListener('click', () => {
                if (confirmCallback) {
                    confirmCallback(newConfirmBtn);
                } else {
                    closeModal();
                }
            });
        }
        actionModal.classList.remove('hidden');
    }

    function closeModal() {
        if (actionModal) actionModal.classList.add('hidden');
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalActionCancel) modalActionCancel.addEventListener('click', closeModal);

    // --- Sidebar Responsiveness Toggler ---
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("show");
        });
    }
    document.addEventListener("click", () => {
        if (sidebar) sidebar.classList.remove("show");
    });

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            triggerToast("Command palette activated (Ctrl+K)");
            if (searchInput) searchInput.focus();
        });
    }

    // === Render Bookmarks Layout ===
    function renderFavoritesGrid() {
        if (!favoritesGridBox) return;
        favoritesGridBox.innerHTML = "";

        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        let visibleCount = 0;

        favoritesList.forEach(fav => {
            // Apply Sub-tab filtering
            if (activeFilterType !== "all" && fav.category !== activeFilterType) return;

            // Apply search filtering
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

        // Toggle Empty states
        const totalCount = favoritesList.length;
        if (emptyState) emptyState.classList.toggle('hidden', totalCount > 0);
        if (searchEmptyState) searchEmptyState.classList.toggle('hidden', totalCount === 0 || visibleCount > 0 || query === "");

        // Recalculate side badge counts
        updateStatCounters();

        // Attach listeners to newly created cards
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

        // Append real favorited Workspaces (backend-derived, not part of the
        // local bookmark store) after every render/re-render so search and
        // filtering keep working exactly as before for existing bookmarks.
        appendWorkspaceFavorites(query);
    }

    // === Workspace favorites (connects this page to the real Workspace API) ===
    // Kept intentionally separate from `favoritesList`/`saveDB()` so nothing
    // here touches the existing local bookmark storage or its counters.
    let workspaceFavoritesCache = [];
    let projectFavoritesCache = [];

    async function loadWorkspaceFavorites() {
        if (!window.EPM_API || !window.EPM_API.isAuthenticated()) return;
        try {
            const all = await window.EPM_API.workspaces.list();
            workspaceFavoritesCache = all.filter(w => w.is_favorite && !w.is_archived);
            projectFavoritesCache = all.flatMap(ws => (ws.projects || [])
                .filter(project => project.is_favorite && !project.is_archived)
                .map(project => ({ ...project, workspace_id: ws.id, workspace_name: ws.workspace_name })));
            renderFavoritesGrid();
        } catch (err) {
            // Silently skip; the rest of the Favorites page must keep working.
        }
    }

    function appendWorkspaceFavorites(query) {
        if (!favoritesGridBox || activeFilterType !== "all") return;
        if (!workspaceFavoritesCache.length) return;

        const q = (query || "").toLowerCase();

        workspaceFavoritesCache.forEach(ws => {
            const matchesSearch = !q ||
                ws.workspace_name.toLowerCase().includes(q) ||
                (ws.description || "").toLowerCase().includes(q);
            if (!matchesSearch) return;

            const favId = `ws_${ws.id}`;
            const cardHTML = `
                <div class="group relative flex gap-md p-md bg-surface-container border border-outline-variant rounded-xl hover-card-fav transition-all cursor-pointer" data-fav-id="${favId}" data-ws-id="${ws.id}">
                    <div class="w-10 h-10 rounded-lg bg-surface-container-highest flex-shrink-0 flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary">${ws.icon || "rocket_launch"}</span>
                    </div>
                    <div class="flex-1 min-width-0">
                        <div class="flex items-center justify-between mb-1">
                            <span class="font-semibold text-on-surface text-sm truncate pr-6">${ws.workspace_name}</span>
                            <button class="btn-ws-star absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-all duration-150" data-ws-id="${ws.id}">
                                <span class="material-symbols-outlined text-sm star-filled">star</span>
                            </button>
                        </div>
                        <p class="text-on-surface-variant text-xs leading-relaxed mb-3 truncate">Workspace • ${ws.member_count} member${ws.member_count === 1 ? "" : "s"}</p>
                        <button class="px-3 py-1 bg-surface-container-highest hover:bg-surface-container-high text-on-surface border border-outline-variant rounded-lg text-[10px] font-bold btn-ws-open" data-ws-id="${ws.id}">
                            OPEN WORKSPACE
                        </button>
                    </div>
                </div>
            `;
            favoritesGridBox.insertAdjacentHTML("beforeend", cardHTML);
        });

        favoritesGridBox.querySelectorAll(".btn-ws-open").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                window.location.href = `../workspace_overview/index.html?id=${btn.getAttribute("data-ws-id")}`;
            });
        });

        favoritesGridBox.querySelectorAll(".btn-ws-star").forEach(star => {
            star.addEventListener("click", async (e) => {
                e.stopPropagation();
                const wsId = star.getAttribute("data-ws-id");
                const card = favoritesGridBox.querySelector(`[data-ws-id="${wsId}"]`);
                try {
                    await window.EPM_API.workspaces.unfavorite(wsId);
                    workspaceFavoritesCache = workspaceFavoritesCache.filter(w => w.id !== wsId);
                    if (card) {
                        card.classList.add("card-exit");
                        setTimeout(() => card.remove(), 250);
                    }
                    triggerToast("Workspace removed from favorites", "error");
                } catch (err) {
                    triggerToast(err.message || "Couldn't update favorite", "error");
                }
            });
        });

        // Also route the "open" click on the whole card row.
        favoritesGridBox.querySelectorAll("[data-ws-id]").forEach(card => {
            card.addEventListener("click", () => {
                window.location.href = `../workspace_overview/index.html?id=${card.getAttribute("data-ws-id")}`;
            });
        });

        projectFavoritesCache.forEach(project => {
            const matchesSearch = !q || project.name.toLowerCase().includes(q) || (project.description || "").toLowerCase().includes(q);
            if (!matchesSearch) return;
            const card = document.createElement("div");
            card.className = "group relative flex gap-md p-md bg-surface-container border border-outline-variant rounded-xl hover-card-fav transition-all cursor-pointer";
            card.innerHTML = `<div class="w-10 h-10 rounded-lg bg-surface-container-highest flex-shrink-0 flex items-center justify-center"><span class="material-symbols-outlined text-primary">${project.icon || "tactic"}</span></div><div class="flex-1 min-width-0"><div class="flex items-center justify-between mb-1"><span class="font-semibold text-on-surface text-sm truncate pr-6">${project.name}</span><button class="btn-project-star absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-all duration-150"><span class="material-symbols-outlined text-sm star-filled">star</span></button></div><p class="text-on-surface-variant text-xs leading-relaxed mb-3 truncate">Project · ${project.workspace_name}</p><button class="px-3 py-1 bg-surface-container-highest hover:bg-surface-container-high text-on-surface border border-outline-variant rounded-lg text-[10px] font-bold">OPEN PROJECT</button></div>`;
            card.addEventListener("click", () => window.location.href = `../project_overview/index.html?workspace_id=${encodeURIComponent(project.workspace_id)}&project_id=${encodeURIComponent(project.id)}&project_name=${encodeURIComponent(project.name)}`);
            card.querySelector(".btn-project-star").addEventListener("click", async (event) => {
                event.stopPropagation();
                try {
                    await window.EPM_API.workspaces.unfavoriteProject(project.workspace_id, project.id);
                    projectFavoritesCache = projectFavoritesCache.filter(item => item.id !== project.id || item.workspace_id !== project.workspace_id);
                    renderFavoritesGrid();
                    triggerToast("Project removed from favorites", "error");
                } catch (err) {
                    triggerToast(err.message || "Couldn't update favorite", "error");
                }
            });
            favoritesGridBox.appendChild(card);
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

    // === Interactive Bookmark Action Handlers ===
    function triggerFavoriteAction(id, actionBtn) {
        const fav = favoritesList.find(f => f.id === id);
        if (!fav) return;

        if (fav.category === "file") {
            // Trigger download loading simulation
            const original = actionBtn.innerHTML;
            actionBtn.innerHTML = `<span class="btn-spinner"></span> DOWNLOADING...`;
            actionBtn.disabled = true;
            setTimeout(() => {
                actionBtn.innerHTML = original;
                actionBtn.disabled = false;
                triggerToast(`Asset download complete: ${fav.title}`);
            }, 1500);
        } else if (fav.title.includes("Kanban Board")) {
            // Open Kanban board modal
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
            // Open Huddle sync huddle huddle
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
            // Default generic modal details
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

    // === Subnav Filtering Handlers ===
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

    // Search bar filtering
    if (searchInput) {
        searchInput.addEventListener('input', renderFavoritesGrid);
    }

    window.applyFavoritesFilter = function (filterType) {
        if (filterType === 'all') {
            setSubnavFilter('all', subnavAll);
        } else if (filterType === 'chat') {
            setSubnavFilter('chat', subnavChats);
        } else if (filterType === 'task') {
            setSubnavFilter('task', subnavTasks);
        } else if (filterType === 'file') {
            setSubnavFilter('file', subnavFiles);
        }
    };

    // === Open "Add Bookmark" Interactive Dialog ===
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
                        self: false,
                        reactions: [],
                        actionLabel: "VIEW DETAILS"
                    });

                    saveDB();
                    renderAll();
                    closeModal();
                    triggerToast("Bookmark successfully pinned to favorites!", "success");
                }, 1000);
            });
        });
    }

    // === Drag and Drop bookmarks logic ===
    if (dragArea) {
        window.addEventListener("dragenter", (e) => {
            e.preventDefault();
            dragArea.classList.add("border-primary");
        });

        dragArea.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        dragArea.addEventListener("dragleave", (e) => {
            dragArea.classList.remove("border-primary");
        });

        dragArea.addEventListener("drop", (e) => {
            e.preventDefault();
            dragArea.classList.remove("border-primary");
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                // Pin shared file mock up
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

    // === dropdown menu triggers integration ===
    const notifTrigger = document.getElementById('notif-trigger');
    const notifMenu = document.getElementById('notif-menu');
    const markAllRead = document.getElementById('mark-all-read');
    const msgTrigger = document.getElementById('msg-trigger');
    const msgMenu = document.getElementById('msg-menu');
    const markMsgsRead = document.getElementById('mark-msgs-read');
    const msgUnreadCount = document.getElementById('msg-unread-count');
    const msgDot = document.getElementById('msg-dot');
    const msgSearch = document.getElementById('msg-search');
    const msgItems = document.querySelectorAll('.msg-item');

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

    if (markAllRead) {
        markAllRead.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.dot-indicator').forEach(dot => dot.remove());
            const bellDot = document.getElementById('bell-dot');
            if (bellDot) bellDot.style.display = 'none';
            const notifUnreadCount = document.getElementById('header-unread-count');
            if (notifUnreadCount) notifUnreadCount.textContent = '0';
            triggerToast("All notifications marked as read");
        });
    }

    if (markMsgsRead) {
        markMsgsRead.addEventListener('click', (e) => {
            e.stopPropagation();
            if (msgDot) msgDot.style.display = 'none';
            if (msgUnreadCount) msgUnreadCount.textContent = '0';
            document.querySelectorAll('.msg-item').forEach(item => {
                item.classList.add('is-read');
                item.classList.remove('unread');
                const dot = item.querySelector('.dot-indicator');
                if (dot) dot.remove();
            });
            triggerToast("All messages marked as read");
        });
    }

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

    // Global keydown listeners
    window.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            triggerToast("Command palette triggered");
        }

        if (event.key === "Escape") {
            closeModal();
            if (notifMenu) notifMenu.classList.remove('dropdown-open');
            if (msgMenu) msgMenu.classList.remove('dropdown-open');
        }
    });

    // Initialize Favorites Center Engine
    loadDB();
    renderFavoritesGrid();
    loadWorkspaceFavorites();
});


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

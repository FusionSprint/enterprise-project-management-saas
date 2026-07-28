document.addEventListener('DOMContentLoaded', () => {
    // === 1. TOP-LEVEL DOM DECLARATIONS (Prevents TDZ Reference Errors) ===
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const searchBtn = document.getElementById('searchBtn');
    const toastContainer = document.getElementById('toast-container');
    const searchInput = document.getElementById('inbox-search');

    // Sub-navigation filter buttons
    const filterUnread = document.getElementById('inbox-filter-all');
    const filterDone = document.getElementById('inbox-filter-done');
    const filterSnoozed = document.getElementById('inbox-filter-snoozed');

    // Mobile sidebar toggle (matches Workspace Dashboard behaviour)
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 820 && sidebar.classList.contains('show') && !sidebar.contains(e.target) && e.target !== menuBtn) {
                sidebar.classList.remove('show');
            }
        });
    }

    // Viewports
    const inboxListViewport = document.getElementById('inbox-list-viewport');
    const inboxItemDetailsBox = document.getElementById('inbox-item-details-box');

    // Header Bell & messages dropdown elements
    const notifTrigger = document.getElementById('notif-trigger');
    const notifMenu = document.getElementById('notif-menu');
    const markAllRead = document.getElementById('mark-all-read');
    const bellDot = document.getElementById('bell-dot');
    const notifUnreadCount = document.getElementById('header-unread-count');

    const msgTrigger = document.getElementById('msg-trigger');
    const msgMenu = document.getElementById('msg-menu');
    const markMsgsRead = document.getElementById('mark-msgs-read');
    const msgDot = document.getElementById('msg-dot');
    const msgUnreadCount = document.getElementById('msg-unread-count');
    const msgSearch = document.getElementById('msg-search');
    const msgItems = document.querySelectorAll('.msg-item');

    // Modals
    const actionModal = document.getElementById('settings-interactive-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBodyContent = document.getElementById('modal-body-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalActionCancel = document.getElementById('modal-action-cancel');
    const modalActionConfirm = document.getElementById('modal-action-confirm');

    const STORAGE_KEY_INBOX = "sa_epm_inbox_v2_db";
    let activeFilterTab = "unread"; // 'unread' | 'done' | 'snoozed'
    let activeItemId = "item_1"; // Default active item

    // Complete Enterprise EPM Inbox database
    const defaultInboxItems = [
        // --- UNREAD QUEUE ---
        {
            id: "item_1",
            category: "tasks",
            priority: "CRITICAL",
            sender: "Sai Bhavani",
            time: "10 mins ago",
            status: "unread",
            title: "Shard database routing configurations on Cloud Hub",
            description: "Sai assigned you to coordinate database sharding routes across regional edge clusters. Ensure local caches are synchronized before building scripts.",
            comments: [
                { sender: "Sai Bhavani", time: "10m ago", text: "Please review the routing files on repository." }
            ]
        },
        {
            id: "item_2",
            category: "mentions",
            priority: "HIGH",
            sender: "Bhavani",
            time: "2 hours ago",
            status: "unread",
            title: "Bhavani mentioned you in Project Alpha",
            description: "Mentioned in PR #142: '@Alex Rivera, could you verify if these custom transitions match our style specifications on the main dashboard layout?'",
            comments: []
        },
        {
            id: "item_3",
            category: "system",
            priority: "NORMAL",
            sender: "Release Bot",
            time: "5 hours ago",
            status: "unread",
            title: "Deployment Success: Staging Cluster NA",
            description: "Version v4.2.2 stage rollout succeeded on NA-Cluster-02. Edge-cache purges executed normally across CDN edge nodes.",
            comments: []
        },
        // --- DONE QUEUE ---
        {
            id: "item_done_1",
            category: "tasks",
            priority: "NORMAL",
            sender: "Sarah Jenkins",
            time: "Yesterday",
            status: "done",
            title: "Review stress-testing metrics with PM team",
            description: "Audit logs have been uploaded to Dev Hub and verified by compliance auditors. The process took 45 minutes to validate.",
            comments: [
                { sender: "Sarah Jenkins", time: "Yesterday", text: "Staging deployment looks successful!" }
            ]
        },
        // --- SNOOZED QUEUE ---
        {
            id: "item_snoozed_1",
            category: "tasks",
            priority: "LOW",
            sender: "Marcus Aurelius",
            time: "2 days ago",
            status: "snoozed",
            title: "Draft release notes for mobile V2 rollout",
            description: "Let's align on mobile V2 custom transitions and coordinate notes with QA teams before standard branch merge.",
            comments: []
        }
    ];

    let inboxItems = [];

    function loadDB() {
        const stored = localStorage.getItem(STORAGE_KEY_INBOX);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    inboxItems = parsed;
                } else {
                    inboxItems = [...defaultInboxItems];
                }
            } catch (e) {
                inboxItems = [...defaultInboxItems];
            }
        } else {
            inboxItems = [...defaultInboxItems];
        }
    }

    function saveDB() {
        localStorage.setItem(STORAGE_KEY_INBOX, JSON.stringify(inboxItems));
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

    // Sidebar search triggers
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            triggerToast("Global search activated (Ctrl+K)");
        });
    }

    // === Render Master Inbox List ===
    function renderInboxList() {
        if (!inboxListViewport) return;
        inboxListViewport.innerHTML = "";

        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        let matchedCount = 0;

        inboxItems.forEach(item => {
            if (item.status !== activeFilterTab) return;

            const matchesSearch = !query || 
                item.title.toLowerCase().includes(query) || 
                item.sender.toLowerCase().includes(query);

            if (!matchesSearch) return;
            matchedCount++;

            const isActive = item.id === activeItemId;
            const priorityColor = item.priority === "CRITICAL" ? "text-error" : (item.priority === "HIGH" ? "text-orange" : "text-primary");

            const itemHTML = `
                <div class="inbox-item-card border border-outline-variant/30 flex gap-sm items-start ${isActive ? 'active' : ''}" data-item-id="${item.id}">
                    <div class="w-8 h-8 rounded-lg bg-surface-container-highest flex-shrink-0 flex items-center justify-center">
                        <span class="material-symbols-outlined text-sm ${priorityColor}">${item.category === 'tasks' ? 'assignment_ind' : (item.category === 'system' ? 'warning' : 'alternate_email')}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-0.5">
                            <span class="text-[10px] text-on-surface-variant font-bold">${item.sender || 'System'}</span>
                            <span class="text-[9px] text-on-surface-variant">${item.time}</span>
                        </div>
                        <h4 class="font-semibold text-xs text-on-surface truncate">${item.title}</h4>
                    </div>
                </div>
            `;
            inboxListViewport.insertAdjacentHTML("beforeend", itemHTML);
        });

        // Click listeners on list cards
        document.querySelectorAll(".inbox-item-card").forEach(card => {
            card.addEventListener("click", () => {
                const nextId = card.getAttribute("data-item-id");
                if (nextId === activeItemId) return;

                if (inboxItemDetailsBox) inboxItemDetailsBox.classList.add('detail-fading');
                setTimeout(() => {
                    activeItemId = nextId;
                    renderAll();
                    if (inboxItemDetailsBox) inboxItemDetailsBox.classList.remove('detail-fading');
                }, 120);
            });
        });

        // Sync header unread counts
        const unreadCount = inboxItems.filter(i => i.status === "unread").length;
        if (filterUnread) {
            filterUnread.innerHTML = `Unread <span class="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">${unreadCount}</span>`;
        }
        if (bellDot) {
            bellDot.style.display = unreadCount > 0 ? '' : 'none';
        }
        if (notifUnreadCount) {
            notifUnreadCount.textContent = unreadCount;
        }
    }

    // === Render Detail Inbox View ===
    function renderInboxDetail() {
        if (!inboxItemDetailsBox) return;
        const item = inboxItems.find(i => i.id === activeItemId && i.status === activeFilterTab);

        if (!item) {
            // Render placeholder empty state if nothing chosen or list empty
            inboxItemDetailsBox.innerHTML = `
                <div class="flex-1 flex flex-col items-center justify-center p-8 text-center text-on-surface-variant">
                    <span class="material-symbols-outlined text-3xl mb-2">done_all</span>
                    <p class="font-semibold text-on-surface">Zero Inbox Achieved</p>
                    <p class="text-xs">No active items found in this queue.</p>
                </div>
            `;
            return;
        }

        const priorityBadgeColor = item.priority === "CRITICAL" ? "bg-error/10 text-error" : "bg-primary-container/20 text-primary";

        let commentsHTML = "";
        if (item.comments && item.comments.length > 0) {
            item.comments.forEach(c => {
                commentsHTML += `
                    <div class="bg-surface-container p-2.5 rounded-lg border border-outline-variant space-y-1">
                        <div class="flex justify-between items-center text-[10px] text-on-surface-variant">
                            <span class="font-bold">${c.sender}</span>
                            <span>${c.time}</span>
                        </div>
                        <p class="text-[11px] leading-relaxed">${c.text}</p>
                    </div>
                `;
            });
        } else {
            commentsHTML = `<p class="text-[11px] text-on-surface-variant italic p-4 text-center">No replies or activities recorded on this node.</p>`;
        }

        const detailHTML = `
            <div class="px-6 h-14 border-b border-outline-variant flex items-center justify-between shrink-0 bg-surface-container-high/30">
                <div class="flex gap-2">
                    <button class="px-3 py-1 bg-primary text-on-primary font-bold text-[10px] rounded-lg flex items-center gap-1" id="detail-btn-done">
                        <span class="material-symbols-outlined text-xs">check</span>
                        <span>MARK DONE</span>
                    </button>
                    <button class="px-3 py-1 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant font-bold text-[10px] rounded-lg text-on-surface flex items-center gap-1" id="detail-btn-snooze">
                        <span class="material-symbols-outlined text-xs">schedule</span>
                        <span>SNOOZE</span>
                    </button>
                </div>
                ${item.category === 'tasks' ? `
                    <button class="px-3 py-1 bg-surface-container-high border border-outline-variant hover:border-primary font-bold text-[10px] rounded-lg text-primary" id="detail-btn-open-task">
                        OPEN TASK BOARD
                    </button>
                ` : ''}
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                    <div class="space-y-0.5">
                        <span class="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">${item.sender} • ${item.time}</span>
                        <h3 class="text-sm font-semibold text-on-surface">${item.title}</h3>
                    </div>
                    <span class="px-2.5 py-0.5 rounded text-[9px] font-bold ${priorityBadgeColor}">${item.priority}</span>
                </div>

                <div class="space-y-2">
                    <p class="text-[10px] font-bold text-muted-2 uppercase tracking-widest block">Description Context</p>
                    <p class="text-xs text-on-surface-variant leading-relaxed bg-surface-container-high/20 p-3 rounded-lg border border-outline-variant/50">${item.description}</p>
                </div>

                <!-- Collaborative inline timeline responses -->
                <div class="space-y-3 pt-3 border-t border-outline-variant/30">
                    <span class="text-[10px] font-bold text-muted-2 uppercase tracking-widest block">Activity & Comments</span>
                    <div class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar" id="detail-comments-viewport">
                        ${commentsHTML}
                    </div>
                </div>
            </div>

            <!-- Inline Reply Composer -->
            <div class="p-4 border-t border-outline-variant bg-surface-container-low shrink-0">
                <div class="flex gap-2">
                    <input type="text" id="detail-reply-input" placeholder="Type a response directly..." class="flex-1 bg-surface-container-lowest border-outline-variant border rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface focus:border-primary">
                    <button class="p-2 rounded-lg bg-primary text-on-primary flex items-center justify-center cursor-pointer" id="detail-reply-send">
                        <span class="material-symbols-outlined text-xs">send</span>
                    </button>
                </div>
            </div>
        `;

        inboxItemDetailsBox.innerHTML = detailHTML;

        // Attach listeners to details panel
        const doneBtn = document.getElementById("detail-btn-done");
        if (doneBtn) {
            doneBtn.addEventListener("click", () => {
                item.status = "done";
                triggerToast("Action item marked Done and cleared!");
                saveDB();
                reselectNextActiveId();
                renderAll();
            });
        }

        const snoozeBtn = document.getElementById("detail-btn-snooze");
        if (snoozeBtn) {
            snoozeBtn.addEventListener("click", () => {
                item.status = "snoozed";
                triggerToast("Alert snoozed until tomorrow");
                saveDB();
                reselectNextActiveId();
                renderAll();
            });
        }

        const openTaskBtn = document.getElementById("detail-btn-open-task");
        if (openTaskBtn) {
            openTaskBtn.addEventListener("click", () => {
                // Trigger standard board modal
                const boardHTML = `
                    <p class="text-on-surface-variant mb-4 leading-relaxed">Interactive board overview for the <strong>Apollo-Core Engine</strong> release cycle.</p>
                    <div class="grid grid-cols-3 gap-2 text-[11px]">
                        <div class="bg-surface-container-high p-2 rounded border border-outline-variant space-y-2">
                            <p class="font-bold text-[10px] text-primary uppercase">To Do</p>
                            <div class="bg-surface-container-low p-2 rounded cursor-pointer hover:border-primary border border-transparent transition-colors" onclick="this.remove()">• Migrate API Keys</div>
                        </div>
                        <div class="bg-surface-container-high p-2 rounded border border-outline-variant space-y-2">
                            <p class="font-bold text-[10px] text-secondary uppercase">Active</p>
                            <div class="bg-surface-container-low p-2 rounded cursor-pointer hover:border-primary border border-transparent transition-colors" onclick="this.remove()">• Shard routing tables</div>
                        </div>
                        <div class="bg-surface-container-high p-2 rounded border border-outline-variant space-y-2">
                            <p class="font-bold text-[10px] text-success uppercase">Done</p>
                            <div class="bg-surface-container-low p-2 rounded opacity-60">• Patch login vulnerability</div>
                        </div>
                    </div>
                `;
                openModal("Apollo-Core Kanban Board", boardHTML, "CLOSE", () => closeModal());
            });
        }

        // Inline reply sending
        const replyInput = document.getElementById("detail-reply-input");
        const replySend = document.getElementById("detail-reply-send");

        if (replySend && replyInput) {
            const sendReply = () => {
                const text = replyInput.value.trim();
                if (!text) return;
                
                if (!item.comments) item.comments = [];
                item.comments.push({
                    sender: "Me",
                    time: "Just now",
                    text: text
                });

                replyInput.value = "";
                saveDB();
                renderInboxDetail();
                triggerToast("Response posted successfully!");
            };

            replySend.addEventListener("click", sendReply);
            replyInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") sendReply();
            });
        }
    }

    // Helper: auto select the next unread/available card
    function reselectNextActiveId() {
        const remaining = inboxItems.filter(i => i.status === activeFilterTab);
        if (remaining.length > 0) {
            // Pick first remaining if previous is not in current view list
            if (!remaining.some(i => i.id === activeItemId)) {
                activeItemId = remaining[0].id;
            }
        } else {
            activeItemId = null;
        }
    }

    function renderAll() {
        renderInboxList();
        renderInboxDetail();
    }

    window.applyInboxFilter = function (filterType) {
        if (filterType === 'unread') {
            activeFilterTab = 'unread';
        } else if (filterType === 'done') {
            activeFilterTab = 'done';
        } else if (filterType === 'snoozed') {
            activeFilterTab = 'snoozed';
        }
        renderAll();
    };

    // === Subnav Filter Triggers ===
    if (filterUnread) {
        filterUnread.addEventListener('click', (e) => {
            e.preventDefault();
            activeFilterTab = "unread";
            updateFilterTabs(filterUnread);
            reselectNextActiveId();
            renderAll();
        });
    }
    if (filterDone) {
        filterDone.addEventListener('click', (e) => {
            e.preventDefault();
            activeFilterTab = "done";
            updateFilterTabs(filterDone);
            reselectNextActiveId();
            renderAll();
        });
    }
    if (filterSnoozed) {
        filterSnoozed.addEventListener('click', (e) => {
            e.preventDefault();
            activeFilterTab = "snoozed";
            updateFilterTabs(filterSnoozed);
            reselectNextActiveId();
            renderAll();
        });
    }

    function updateFilterTabs(activeTab) {
        [filterUnread, filterDone, filterSnoozed].forEach(tab => {
            if (tab) tab.classList.remove('active');
        });
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    // Search bar keystroke handler
    if (searchInput) {
        searchInput.addEventListener("input", renderInboxList);
    }

    // === Shared Logout Lifecycle controller ===
    const logoutBtn = document.getElementById('logout-sidebar-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            triggerToast("Logging out of Acme Corp...", "error");

            setTimeout(() => {
                localStorage.removeItem('activeMeetingView');
                localStorage.removeItem('activeDevView');
                window.location.href = "../login.html";
            }, 1000);
        });
    }

    // === Consolidated Dropdown Menu Triggers (Resolves Double-Binding Conflicts) ===
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
            if (bellDot) bellDot.style.display = 'none';
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

    // Close dropdowns via escape key
    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal();
            if (notifMenu) notifMenu.classList.remove('dropdown-open');
            if (msgMenu) msgMenu.classList.remove('dropdown-open');
        }
    });

    // Initialize EPM Inbox Engine
    loadDB();
    reselectNextActiveId();
    renderAll();
});
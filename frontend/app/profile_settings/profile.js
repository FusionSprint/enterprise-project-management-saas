document.addEventListener('DOMContentLoaded', () => {
    // Consolidated DOM Variables
    const sidebar = document.getElementById('sidebar');
    const searchBtn = document.getElementById('searchBtn');
    const toastContainer = document.getElementById('toast-container');

    // Subnav Anchor Headers
    const subnavOverview = document.getElementById('subnav-overview');
    const subnavTasks = document.getElementById('subnav-tasks');
    const subnavHistory = document.getElementById('subnav-history');

    const sectionProfileHeader = document.getElementById('section-profile-header');
    const sectionTasksCard = document.getElementById('section-tasks-card');
    const sectionHistoryCard = document.getElementById('section-history-card');

    // Interactive Profile Status Components
    const setStatusTriggerBtn = document.getElementById('set-status-trigger-btn');
    const currentStatusLbl = document.getElementById('current-status-lbl');
    const profileStatusIndicator = document.getElementById('profile-status-indicator');
    const badgeFocusMode = document.getElementById('badge-focus-mode');

    // Share & Board triggers
    const shareProfileBtn = document.getElementById('share-profile-btn');
    const openBoardBtn = document.getElementById('open-board-btn');
    const leaveRequestBtn = document.getElementById('leave-request-btn');

    // Timezone components
    const clockLocal = document.getElementById('clock-local');
    const clockRemoteBerlin = document.getElementById('clock-remote-berlin');

    // Modal elements
    const actionModal = document.getElementById('settings-interactive-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBodyContent = document.getElementById('modal-body-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalActionCancel = document.getElementById('modal-action-cancel');
    const modalActionConfirm = document.getElementById('modal-action-confirm');

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

    // Mobile sidebar toggle (matches Workspace Dashboard behaviour)
    const menuBtn = document.getElementById('menuBtn');
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

    // Subnav Anchoring scroll behaviors
    function scrollToSection(sectionEl, activeTabBtn) {
        if (!sectionEl) return;
        [subnavOverview, subnavTasks, subnavHistory].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
        }
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        sectionEl.classList.add('accent-glow-flash');
        setTimeout(() => sectionEl.classList.remove('accent-glow-flash'), 1500);
    }

    if (subnavOverview) subnavOverview.addEventListener('click', () => scrollToSection(sectionProfileHeader, subnavOverview));
    if (subnavTasks) subnavTasks.addEventListener('click', () => scrollToSection(sectionTasksCard, subnavTasks));
    if (subnavHistory) subnavHistory.addEventListener('click', () => scrollToSection(sectionHistoryCard, subnavHistory));

    const urlParams = new URLSearchParams(window.location.search);
    const initialProfileTab = urlParams.get('tab');

    if (initialProfileTab === 'overview' && subnavOverview && sectionProfileHeader) {
        scrollToSection(sectionProfileHeader, subnavOverview);
    } else if (initialProfileTab === 'tasks' && subnavTasks && sectionTasksCard) {
        scrollToSection(sectionTasksCard, subnavTasks);
    } else if (initialProfileTab === 'history' && subnavHistory && sectionHistoryCard) {
        scrollToSection(sectionHistoryCard, subnavHistory);
    }

    if (shareProfileBtn) {
        shareProfileBtn.addEventListener('click', () => {
            navigator.clipboard.writeText("https://acme.corp/arivera-dev").then(() => {
                triggerToast("Public profile URL copied to clipboard!");
            });
        });
    }

    // Status Setting Modal Handler
    if (setStatusTriggerBtn) {
        setStatusTriggerBtn.addEventListener('click', () => {
            const statusHTML = `
                <p class="text-on-surface-variant mb-4 leading-relaxed">Choose an active status prefix to display your availability profile to peer team members.</p>
                <div class="space-y-2">
                    <button class="w-full text-left p-2.5 bg-surface-container border border-outline-variant hover:border-primary rounded-lg flex items-center gap-2" onclick="window.updateStatus('🟢 Active', 'Focus Mode Active', 'bg-success')">
                        <span class="w-2.5 h-2.5 rounded-full bg-success"></span>
                        <span>Active - Focus Mode</span>
                    </button>
                    <button class="w-full text-left p-2.5 bg-surface-container border border-outline-variant hover:border-primary rounded-lg flex items-center gap-2" onclick="window.updateStatus('🟡 Away', 'In a Meeting', 'bg-warning')">
                        <span class="w-2.5 h-2.5 rounded-full bg-warning"></span>
                        <span>Away - In a Meeting</span>
                    </button>
                    <button class="w-full text-left p-2.5 bg-surface-container border border-outline-variant hover:border-primary rounded-lg flex items-center gap-2" onclick="window.updateStatus('🔴 Do Not Disturb', 'DND Mode Active', 'bg-error')">
                        <span class="w-2.5 h-2.5 rounded-full bg-error"></span>
                        <span>DND - Do Not Disturb</span>
                    </button>
                </div>
            `;
            openModal("Modify Status", statusHTML, "OK", () => closeModal());
        });

        window.updateStatus = (lblText, badgeText, statusColorClass) => {
            if (currentStatusLbl) currentStatusLbl.textContent = lblText;
            if (badgeFocusMode) badgeFocusMode.textContent = badgeText;
            if (profileStatusIndicator) {
                profileStatusIndicator.className = `absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-4 border-surface-container ${statusColorClass}`;
            }
            triggerToast(`Work availability updated: ${lblText}`);
            closeModal();
        };
    }

    // Skill Endorsements Logic
    const skillBadges = document.querySelectorAll('.skill-endorse-badge');
    skillBadges.forEach(badge => {
        badge.addEventListener('click', () => {
            let count = parseInt(badge.getAttribute('data-count'), 10);
            const skillName = badge.getAttribute('data-skill');
            const countBadge = badge.querySelector('span:last-child');
            
            if (badge.classList.contains('bg-primary-container/20')) {
                // Decrement if already endorsed
                count--;
                badge.classList.remove('bg-primary-container/20', 'border-primary/40');
                badge.classList.add('bg-surface-container-low');
                triggerToast(`Removed endorsement for ${skillName}`);
            } else {
                // Increment endorsement
                count++;
                badge.classList.add('bg-primary-container/20', 'border-primary/40');
                badge.classList.remove('bg-surface-container-low');
                triggerToast(`Endorsed Alex Rivera for ${skillName}!`);
            }

            badge.setAttribute('data-count', count);
            if (countBadge) countBadge.textContent = count;
        });
    });

    // Interactive Organzational Chart Card Click Actions
    document.querySelectorAll('.org-node-row').forEach(row => {
        row.addEventListener('click', () => {
            const name = row.getAttribute('data-name');
            const role = row.getAttribute('data-role');
            const bioHTML = `
                <div class="text-center space-y-2">
                    <div class="w-16 h-16 rounded-full bg-outline-variant mx-auto flex items-center justify-center text-on-surface font-bold text-lg bg-gradient-to-tr from-secondary-container to-primary-container">
                        ${name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <h4 class="font-bold text-sm text-on-surface">${name}</h4>
                    <p class="text-[10px] text-primary uppercase font-bold tracking-wider">${role}</p>
                    <p class="text-xs text-on-surface-variant leading-relaxed px-4 pt-2">Direct contact node inside Acme Corp. Send a message to coordinate active sprints.</p>
                </div>
            `;
            openModal("Acme Org Member", bioHTML, "SEND MESSAGE", () => {
                triggerToast(`Direct message thread initiated with ${name}`);
                closeModal();
            });
        });
    });

    // Leave Request / OOO leave application
    if (leaveRequestBtn) {
        leaveRequestBtn.addEventListener('click', () => {
            const leaveHTML = `
                <div class="space-y-3">
                    <label class="block">
                        <span class="text-[10px] font-bold text-muted-2 uppercase tracking-widest block mb-1">Leave Category</span>
                        <select class="w-full bg-surface-container-lowest border-outline-variant border rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface focus:border-primary">
                            <option>Vacation Leave</option>
                            <option>Medical Leave</option>
                            <option>Focus sabbatical</option>
                        </select>
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                        <label class="block">
                            <span class="text-[10px] font-bold text-muted-2 uppercase tracking-widest block mb-1">Start Date</span>
                            <input type="date" class="w-full bg-surface-container-lowest border-outline-variant border rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface">
                        </label>
                        <label class="block">
                            <span class="text-[10px] font-bold text-muted-2 uppercase tracking-widest block mb-1">End Date</span>
                            <input type="date" class="w-full bg-surface-container-lowest border-outline-variant border rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface">
                        </label>
                    </div>
                </div>
            `;
            openModal("Apply for OOO Leave", leaveHTML, "SUBMIT REQUEST", (confirmBtn) => {
                confirmBtn.innerHTML = `<span class="btn-spinner"></span> Filing application...`;
                confirmBtn.disabled = true;
                setTimeout(() => {
                    triggerToast("Leave application submitted to Sarah Jenkins.");
                    closeModal();
                }, 1200);
            });
        });
    }

    // Open Interactive Kanban Board
    if (openBoardBtn) {
        openBoardBtn.addEventListener('click', () => {
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
        });
    }

    // Active Task Checkbox Updates
    const taskCheckboxes = document.querySelectorAll('.task-item-row input[type="checkbox"]');
    const tasksFinishedBadge = document.getElementById('tasks-finished-badge');

    function updateCompletedTaskBadgeCount() {
        if (!tasksFinishedBadge) return;
        const total = taskCheckboxes.length;
        const completed = Array.from(taskCheckboxes).filter(chk => chk.checked).length;
        tasksFinishedBadge.textContent = `${String(completed).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
    }

    taskCheckboxes.forEach((chk) => {
        chk.addEventListener('change', () => {
            const titleEl = chk.parentNode.querySelector('.task-title');
            if (chk.checked) {
                if (titleEl) {
                    titleEl.classList.add('line-through', 'opacity-60');
                }
                triggerToast("Task completed successfully!");
            } else {
                if (titleEl) {
                    titleEl.classList.remove('line-through', 'opacity-60');
                }
                triggerToast("Task marked as active.");
            }
            updateCompletedTaskBadgeCount();
        });
    });

    // Timezone Clock Updates
    function updateRemoteClocks() {
        if (!clockLocal || !clockRemoteBerlin) return;
        const now = new Date();
        
        // EST Calculation (Alex)
        const estOptions = { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit', second: '2-digit' };
        clockLocal.textContent = now.toLocaleTimeString([], estOptions);

        // CET Calculation (Sai)
        const cetOptions = { timeZone: "Europe/Berlin", hour: '2-digit', minute: '2-digit', second: '2-digit' };
        clockRemoteBerlin.textContent = now.toLocaleTimeString([], cetOptions);
    }

    setInterval(updateRemoteClocks, 1000);
    updateRemoteClocks();
    updateCompletedTaskBadgeCount();

    // ==========================================
    // NOTIFICATION & MESSAGES DROPDOWN ENGINE
    // ==========================================
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

    // 1. Toggle Dropdowns safely without double-trigger conflicts
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

    // 2. Click outside triggers to close panels
    document.addEventListener('click', (e) => {
        if (notifMenu && !notifMenu.contains(e.target) && e.target !== notifTrigger) {
            notifMenu.classList.remove('dropdown-open');
        }
        if (msgMenu && !msgMenu.contains(e.target) && e.target !== msgTrigger) {
            msgMenu.classList.remove('dropdown-open');
        }
    });

    // 3. Dropdowns live counters logic (scoped individually to avoid overlapping count results)
    function updateNotificationBadgeCount() {
        if (!notifMenu) return;
        // Scope queries strictly to notifMenu to avoid counting message elements
        const count = notifMenu.querySelectorAll('.dot-indicator').length;
        if (notifUnreadCount) notifUnreadCount.textContent = count;
        if (bellDot) bellDot.style.display = count > 0 ? 'block' : 'none';
    }

    function updateMessageBadgeCount() {
        if (!msgMenu) return;
        // Scope queries strictly to msgMenu to avoid counting notification elements
        const count = msgMenu.querySelectorAll('.dot-indicator').length;
        if (msgUnreadCount) msgUnreadCount.textContent = count;
        if (msgDot) msgDot.style.display = count > 0 ? 'block' : 'none';
    }

    // 4. Mark notification items as read individually on row click
    document.querySelectorAll('#notif-menu .notif-row').forEach(row => {
        row.addEventListener('click', () => {
            const dot = row.querySelector('.dot-indicator');
            if (dot) dot.remove();
            updateNotificationBadgeCount();
        });
    });

    // Mark message items as read individually on click
    msgItems.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.add('is-read');
            item.classList.remove('unread');
            const dot = item.querySelector('.dot-indicator');
            if (dot) dot.remove();
            updateMessageBadgeCount();
        });
    });

    // 5. Bulk read actions
    if (markAllRead && notifMenu) {
        markAllRead.addEventListener('click', (e) => {
            e.stopPropagation();
            notifMenu.querySelectorAll('.dot-indicator').forEach(dot => dot.remove());
            updateNotificationBadgeCount();
            triggerToast("All notifications marked as read");
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
            updateMessageBadgeCount();
            triggerToast("All messages marked as read");
        });
    }

    // Conversation Search Filter
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

    // Initial Badge Sync
    updateNotificationBadgeCount();
    updateMessageBadgeCount();
});

// === Shared Logout Lifecycle controller ===
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
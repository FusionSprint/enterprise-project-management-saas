document.addEventListener('DOMContentLoaded', () => {
    // === Consolidate all DOM variables at the top to prevent Scoping / TDZ bugs ===
    const markAllBtn = document.getElementById('mark-all-read-btn');
    const notificationList = document.getElementById('notification-list');
    const emptyState = document.getElementById('empty-state');
    const notifications = document.querySelectorAll('#notification-list > .group');
    const searchInput = document.getElementById('notif-search-input');

    // Mobile sidebar toggle (matches Workspace Dashboard behaviour)
    const menuBtn = document.getElementById('menuBtn');
    const sidebarEl = document.getElementById('sidebar');
    if (menuBtn && sidebarEl) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebarEl.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 820 && sidebarEl.classList.contains('show') && !sidebarEl.contains(e.target) && e.target !== menuBtn) {
                sidebarEl.classList.remove('show');
            }
        });
    }

    // Sidebar search button (matches Workspace Dashboard behaviour)
    const sidebarSearchBtn = document.getElementById('searchBtn');
    if (sidebarSearchBtn) {
        sidebarSearchBtn.addEventListener('click', () => showSuccessToast('Command palette opened', 'search'));
    }
    document.addEventListener('keydown', (event) => {
        const isMacSearch = event.metaKey && event.key.toLowerCase() === 'k';
        const isWindowsSearch = event.ctrlKey && event.key.toLowerCase() === 'k';
        if (isMacSearch || isWindowsSearch) {
            event.preventDefault();
            showSuccessToast('Command palette opened', 'search');
        }
    });

    // Phase 1 Additions DOM Elements
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshBtnLabel = document.getElementById('refresh-btn-label');
    const tabInbox = document.getElementById('tab-inbox');
    const tabArchive = document.getElementById('tab-archive');
    const filterBar = document.getElementById('filter-bar');
    const archiveList = document.getElementById('archive-list');
    const archiveEmptyState = document.getElementById('archive-empty-state');
    const savePrefsBtn = document.getElementById('save-preferences-btn');
    const settingsToggleBtn = document.getElementById('settings-toggle');
    const settingsModal = document.getElementById('settings-modal');
    const settingsCancelBtn = document.getElementById('settings-cancel-btn');
    const settingsSaveBtn = document.getElementById('settings-save-btn');
    const muteBtn = document.getElementById('mute-btn');
    const muteBtnLabel = document.getElementById('mute-btn-label');
    const toastContainer = document.getElementById('toast-container');
    const unreadCountEl = document.getElementById('unread-count');
    const criticalCountEl = document.getElementById('critical-count');
    const searchEmptyState = document.getElementById('search-empty-state');
    const archiveSearchEmptyState = document.getElementById('archive-search-empty-state');

    const STORAGE_KEYS = {
        state: 'notif_state',        // per-notification read/archived state
        prefs: 'notif_prefs',        // preferences panel toggle states
        settings: 'notif_settings',  // settings modal toggle states
        mute: 'notif_mute_until'     // timestamp (ms) until mute expires
    };

    let currentView = 'inbox';   // 'inbox' | 'archive'
    let currentFilter = 'all';   // all | unread | tasks | mentions | system
    let muteTimeoutHandle = null;

    // Mark all as read functionality
    if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
            notifications.forEach(notif => {
                // Remove unread dots
                const dot = notif.querySelector('.bg-primary.rounded-full');
                if (dot) dot.remove();
                
                // Remove highlighting/border focus
                notif.classList.remove('border-primary', 'border-error', 'border-secondary', 'border-tertiary');
                notif.style.opacity = '0.7';
            });
            
            // Hide the header badge safely instead of removing it from the DOM
            const badge = document.getElementById('header-unread-dot');
            if (badge) badge.style.display = 'none';

            // Persist read state (Phase 1 addition)
            notifications.forEach(notif => {
                const id = notif.getAttribute('data-notif-id');
                if (id) setReadState(id, true);
            });
            updateStatCounts();
            if (typeof showSuccessToast === 'function') {
                showSuccessToast('All notifications marked as read', 'done_all');
            }
        });
    }

    // Individual click to dismiss/read logic
    notifications.forEach(notif => {
        notif.addEventListener('click', function(e) {
            // Ignore clicks that originated on an action button (handled separately)
            if (e.target.closest('[data-action="archive"], [data-action="open-task"], [data-action="dismiss"]')) return;

            const dot = this.querySelector('.bg-primary.rounded-full');
            const wasUnread = !!dot;
            if (dot) dot.remove();
            this.style.opacity = '0.7';

            const id = this.getAttribute('data-notif-id');
            if (id) setReadState(id, true);
            updateStatCounts();
            if (wasUnread && typeof showSuccessToast === 'function') {
                showSuccessToast('Marked as read', 'mark_email_read');
            }
            if (typeof openNotifDetailsModal === 'function') openNotifDetailsModal(this);
        });

        // Keyboard activation parity (cards are focusable via tabindex="0" role="button")
        notif.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target.closest('[data-action="archive"], [data-action="open-task"], [data-action="dismiss"]')) return;
                e.preventDefault();
                this.click();
            }
        });
    });

    // Simple search filtering simulation
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyVisibility();
        });
    }

    // Shortcut for Search
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            if (searchInput) searchInput.focus();
        }
    });

    // Track the most recently hovered/focused notification card
    let activeNotifCard = null;
    document.addEventListener('mouseover', (e) => {
        const card = e.target.closest('[data-notif-id]');
        if (card) activeNotifCard = card;
    });
    document.addEventListener('focusin', (e) => {
        const card = e.target.closest('[data-notif-id]');
        if (card) activeNotifCard = card;
    });

    // Esc: close whatever is topmost (details modal > settings modal > newest toast)
    // Delete: archive the active notification card (inbox view only)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const detailsModal = document.getElementById('notif-details-modal');
            if (detailsModal && !detailsModal.classList.contains('hidden')) {
                e.preventDefault();
                if (typeof closeNotifDetailsModal === 'function') closeNotifDetailsModal();
                return;
            }
            if (settingsModal && !settingsModal.classList.contains('hidden')) {
                e.preventDefault();
                closeSettingsModal();
                return;
            }
            if (toastContainer) {
                const toasts = toastContainer.querySelectorAll('.toast-item');
                if (toasts.length) {
                    e.preventDefault();
                    dismissToast(toasts[toasts.length - 1]);
                }
            }
            return;
        }

        if (e.key === 'Delete') {
            if (currentView !== 'inbox') return;
            if (!activeNotifCard || !notificationList.contains(activeNotifCard)) return;
            const tag = document.activeElement && document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return; // don't hijack text editing
            e.preventDefault();
            moveToArchive(activeNotifCard);
        }
    });

    // Simulate "standalone" navigation logic
    document.querySelectorAll('aside nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            console.log(`Navigating to ${link.innerText}`);
        });
    });

    // ---------- LocalStorage helpers ----------
    function readJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function writeJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            /* storage unavailable — fail silently, UI still works in-memory */
        }
    }

    function getState() {
        return readJSON(STORAGE_KEYS.state, {});
    }

    function saveState(state) {
        writeJSON(STORAGE_KEYS.state, state);
    }

    function setReadState(id, read) {
        const state = getState();
        state[id] = state[id] || {};
        state[id].read = read;
        saveState(state);
    }

    function setArchivedState(id, archived) {
        const state = getState();
        state[id] = state[id] || {};
        state[id].archived = archived;
        saveState(state);
    }

    // ---------- Toasts ----------
    const MAX_VISIBLE_TOASTS = 4;
    const TOAST_ICON_COLOR = {
        default: 'text-primary',
        success: 'text-primary',
        warning: 'text-tertiary',
        error: 'text-error'
    };

    function showToast(message, icon, variant) {
        variant = variant || 'default';
        if (!toastContainer) return null;

        const toast = document.createElement('div');
        toast.className = `toast-item bg-surface-container-high border border-outline-variant text-on-surface text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2${variant !== 'default' ? ` toast-${variant}` : ''}`;
        toast.setAttribute('role', 'status');
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        toast.style.transform = 'translateY(6px)';
        const iconColor = TOAST_ICON_COLOR[variant] || TOAST_ICON_COLOR.default;
        toast.innerHTML = `${icon ? `<span class="material-symbols-outlined text-sm ${iconColor}">${icon}</span>` : ''}<span>${message}</span>`;
        toastContainer.appendChild(toast);

        // Cap the visible stack so toasts don't pile up indefinitely
        const existingToasts = toastContainer.querySelectorAll('.toast-item');
        if (existingToasts.length > MAX_VISIBLE_TOASTS) {
            dismissToast(existingToasts[0]);
        }

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });
        const dismissTimer = setTimeout(() => dismissToast(toast), 3500);
        toast._dismissTimer = dismissTimer;
        return toast;
    }

    function dismissToast(toast) {
        if (!toast || toast._dismissing) return;
        toast._dismissing = true;
        if (toast._dismissTimer) clearTimeout(toast._dismissTimer);
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(6px)';
        setTimeout(() => toast.remove(), 250);
    }

    function showSuccessToast(message, icon) {
        return showToast(message, icon || 'check_circle', 'success');
    }

    function showWarningToast(message, icon) {
        return showToast(message, icon || 'warning', 'warning');
    }

    function showErrorToast(message, icon) {
        return showToast(message, icon || 'error', 'error');
    }

    // ---------- Button loading / success state helpers ----------
    function setButtonLoading(btn, loadingLabel, labelEl) {
        if (!btn || btn.dataset.loading === '1') return;
        btn.dataset.loading = '1';
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        btn.classList.add('opacity-70', 'cursor-not-allowed');

        const target = labelEl || btn;
        btn.dataset.prevLabel = target.innerHTML;
        target.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span> <span>${loadingLabel}</span>`;
    }

    function clearButtonLoading(btn, restoredLabel, labelEl) {
        if (!btn) return;
        btn.dataset.loading = '0';
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        btn.classList.remove('opacity-70', 'cursor-not-allowed');

        const target = labelEl || btn;
        target.innerHTML = restoredLabel !== undefined ? restoredLabel : (btn.dataset.prevLabel || target.innerHTML);
    }

    function flashButtonSuccess(btn) {
        if (!btn) return;
        btn.classList.add('btn-success-flash');
        setTimeout(() => btn.classList.remove('btn-success-flash'), 550);
    }

    // ---------- Ripple effect on click ----------
    document.addEventListener('mousedown', (e) => {
        const el = e.target.closest('.ripple-surface');
        if (!el || el.disabled) return;
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const dot = document.createElement('span');
        dot.className = 'ripple-dot';
        dot.style.width = dot.style.height = `${size}px`;
        dot.style.left = `${e.clientX - rect.left - size / 2}px`;
        dot.style.top = `${e.clientY - rect.top - size / 2}px`;
        el.appendChild(dot);
        setTimeout(() => dot.remove(), 550);
    });

    // ---------- Apply persisted state ----------
    function applyPersistedState() {
        const state = getState();
        document.querySelectorAll('[data-notif-id]').forEach(notif => {
            const id = notif.getAttribute('data-notif-id');
            const entry = state[id];
            if (!entry) return;

            if (entry.read) {
                const dot = notif.querySelector('.bg-primary.rounded-full');
                if (dot) dot.remove();
                notif.style.opacity = '0.7';
            }

            if (entry.archived) {
                moveToArchive(notif, { silent: true });
            }
        });
    }

    // ---------- Archive system ----------
    function buildArchiveActions() {
        const wrap = document.createElement('div');
        wrap.className = 'flex gap-sm mt-3';

        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'px-4 py-1.5 rounded-lg bg-primary text-on-primary text-[10px] font-bold';
        restoreBtn.textContent = 'RESTORE';
        restoreBtn.setAttribute('data-action', 'restore');

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'px-4 py-1.5 rounded-lg bg-surface-container-highest text-on-surface text-[10px] font-bold';
        deleteBtn.textContent = 'DELETE PERMANENTLY';
        deleteBtn.setAttribute('data-action', 'delete');

        wrap.appendChild(restoreBtn);
        wrap.appendChild(deleteBtn);
        return wrap;
    }

    function moveToArchive(notif, opts) {
        opts = opts || {};
        const id = notif.getAttribute('data-notif-id');

        const existingActions = notif.querySelector('.archive-actions-row');
        if (!existingActions) {
            const actionsRow = buildArchiveActions();
            actionsRow.classList.add('archive-actions-row');
            notif.querySelector('.flex-1').appendChild(actionsRow);
        }
        const archiveIcon = notif.querySelector('[data-action="archive"]');
        if (archiveIcon) archiveIcon.style.display = 'none';

        if (notificationList && notificationList.contains(notif)) {
            notificationList.removeChild(notif);
        }
        if (archiveList) archiveList.appendChild(notif);

        if (!opts.silent) {
            setArchivedState(id, true);
            showSuccessToast('Notification archived', 'archive');
        }

        refreshEmptyStates();
        applyVisibility();
        updateStatCounts();
    }

    function restoreFromArchive(notif) {
        const id = notif.getAttribute('data-notif-id');

        const actionsRow = notif.querySelector('.archive-actions-row');
        if (actionsRow) actionsRow.remove();
        const archiveIcon = notif.querySelector('[data-action="archive"]');
        if (archiveIcon) archiveIcon.style.display = '';

        if (archiveList) archiveList.removeChild(notif);
        if (notificationList) {
            notificationList.insertBefore(notif, emptyState);
        }
        notif.classList.add('card-enter');
        setTimeout(() => notif.classList.remove('card-enter'), 300);

        setArchivedState(id, false);
        showSuccessToast('Notification restored', 'unarchive');

        refreshEmptyStates();
        applyVisibility();
        updateStatCounts();
    }

    function deletePermanently(notif) {
        const id = notif.getAttribute('data-notif-id');
        notif.remove();

        const state = getState();
        delete state[id];
        saveState(state);

        showWarningToast('Notification deleted permanently', 'delete');
        refreshEmptyStates();
        applyVisibility();
        updateStatCounts();
    }

    if (notificationList) {
        notificationList.addEventListener('click', (e) => {
            const archiveBtn = e.target.closest('[data-action="archive"]');
            if (archiveBtn) {
                e.stopPropagation();
                if (archiveBtn.dataset.loading === '1') return;
                const notif = archiveBtn.closest('[data-notif-id]');
                if (!notif) return;
                setButtonLoading(archiveBtn, '', archiveBtn);
                setTimeout(() => {
                    clearButtonLoading(archiveBtn, undefined, archiveBtn);
                    moveToArchive(notif);
                }, 350);
            }
        });
    }

    if (archiveList) {
        archiveList.addEventListener('click', (e) => {
            const restoreBtn = e.target.closest('[data-action="restore"]');
            const deleteBtn = e.target.closest('[data-action="delete"]');
            const openTaskBtn = e.target.closest('[data-action="open-task"]');
            const dismissBtn = e.target.closest('[data-action="dismiss"]');
            if (restoreBtn) {
                e.stopPropagation();
                if (restoreBtn.dataset.loading === '1') return;
                const notif = restoreBtn.closest('[data-notif-id]');
                if (!notif) return;
                const original = restoreBtn.innerHTML;
                setButtonLoading(restoreBtn, 'Restoring...', restoreBtn);
                setTimeout(() => {
                    clearButtonLoading(restoreBtn, original, restoreBtn);
                    restoreFromArchive(notif);
                }, 350);
            } else if (deleteBtn) {
                e.stopPropagation();
                const notif = deleteBtn.closest('[data-notif-id]');
                if (notif) deletePermanently(notif);
            } else if (openTaskBtn) {
                e.stopPropagation();
                showSuccessToast('Opening task...', 'open_in_new');
            } else if (dismissBtn) {
                e.stopPropagation();
                showWarningToast('This notification is already archived', 'archive');
            }
        });
    }

    function refreshEmptyStates() {
        if (archiveList && archiveEmptyState) {
            const archivedCount = archiveList.querySelectorAll('[data-notif-id]').length;
            archiveEmptyState.classList.toggle('hidden', archivedCount > 0);
        }
    }

    if (notificationList) {
        notificationList.addEventListener('click', (e) => {
            const openTaskBtn = e.target.closest('[data-action="open-task"]');
            const dismissBtn = e.target.closest('[data-action="dismiss"]');
            if (openTaskBtn) {
                e.stopPropagation();
                showSuccessToast('Opening task...', 'open_in_new');
            } else if (dismissBtn) {
                e.stopPropagation();
                const notif = dismissBtn.closest('[data-notif-id]');
                if (notif) moveToArchive(notif);
            }
        });
    }

    // ---------- Notification Details Modal ----------
    const notifDetailsModal = document.getElementById('notif-details-modal');
    const notifDetailsClose = document.getElementById('notif-details-close');
    const notifDetailsDismissBtn = document.getElementById('notif-details-dismiss-btn');
    const notifDetailsActionBtn = document.getElementById('notif-details-action-btn');
    const notifDetailsIconWrap = document.getElementById('notif-details-icon-wrap');
    const notifDetailsIcon = document.getElementById('notif-details-icon');
    const notifDetailsTitleText = document.getElementById('notif-details-title-text');
    const notifDetailsTimestamp = document.getElementById('notif-details-timestamp');
    const notifDetailsDescription = document.getElementById('notif-details-description');
    const notifDetailsProject = document.getElementById('notif-details-project');
    const notifDetailsPriority = document.getElementById('notif-details-priority');
    const notifDetailsAssignee = document.getElementById('notif-details-assignee');
    let lastFocusedBeforeModal = null;

    function openNotifDetailsModal(notif) {
        if (!notifDetailsModal || !notif) return;

        const iconEl = notif.querySelector('.material-symbols-outlined');
        const iconWrapEl = notif.querySelector('.w-10.h-10');
        const titleEl = notif.querySelector('.font-semibold.text-on-surface.text-sm');
        const descEl = notif.querySelector('.text-body-md.leading-relaxed');
        const timeEl = notif.querySelector('.notif-timestamp');
        const priorityBadge = notif.querySelector('.text-error, .text-on-secondary-container');

        if (notifDetailsIcon) notifDetailsIcon.textContent = iconEl ? iconEl.textContent.trim() : 'notifications';
        if (notifDetailsIconWrap && iconWrapEl && iconEl) {
            notifDetailsIconWrap.className = iconWrapEl.className.replace('flex-shrink-0', '').trim() + ' flex-shrink-0';
        } else if (notifDetailsIconWrap) {
            notifDetailsIconWrap.className = 'w-10 h-10 rounded-lg bg-primary-container flex-shrink-0 flex items-center justify-center text-on-primary-container';
        }
        if (notifDetailsTitleText) notifDetailsTitleText.textContent = titleEl ? titleEl.textContent.trim() : '';
        if (notifDetailsTimestamp) notifDetailsTimestamp.textContent = timeEl ? timeEl.textContent.trim() : '';
        if (notifDetailsDescription) notifDetailsDescription.textContent = descEl ? descEl.textContent.trim() : '';
        if (notifDetailsProject) notifDetailsProject.textContent = notif.getAttribute('data-project') || '—';
        if (notifDetailsAssignee) notifDetailsAssignee.textContent = notif.getAttribute('data-assignee') || '—';
        if (notifDetailsPriority) notifDetailsPriority.textContent = priorityBadge ? priorityBadge.textContent.trim() : 'Normal';
        if (notifDetailsActionBtn) notifDetailsActionBtn.textContent = notif.getAttribute('data-action-label') || 'VIEW DETAILS';

        lastFocusedBeforeModal = document.activeElement;
        notifDetailsModal.classList.remove('hidden');
        notifDetailsModal.classList.remove('modal-backdrop-enter');
        if (notifDetailsModal.firstElementChild) {
            notifDetailsModal.firstElementChild.classList.remove('modal-panel-enter');
        }
        void notifDetailsModal.offsetWidth; // reflow so the animation can replay
        notifDetailsModal.classList.add('modal-backdrop-enter');
        if (notifDetailsModal.firstElementChild) {
            notifDetailsModal.firstElementChild.classList.add('modal-panel-enter');
        }
        if (notifDetailsClose) notifDetailsClose.focus();
    }

    function closeNotifDetailsModal() {
        if (!notifDetailsModal) return;
        notifDetailsModal.classList.add('hidden');
        notifDetailsModal.classList.remove('modal-backdrop-enter');
        if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
            lastFocusedBeforeModal.focus();
        }
    }

    if (notifDetailsClose) notifDetailsClose.addEventListener('click', closeNotifDetailsModal);
    if (notifDetailsDismissBtn) notifDetailsDismissBtn.addEventListener('click', closeNotifDetailsModal);
    if (notifDetailsModal) {
        notifDetailsModal.addEventListener('click', (e) => {
            if (e.target === notifDetailsModal) closeNotifDetailsModal();
        });
    }
    if (notifDetailsActionBtn) {
        notifDetailsActionBtn.addEventListener('click', () => {
            showSuccessToast('Opening task...', 'open_in_new');
            closeNotifDetailsModal();
        });
    }

    // ---------- Tab switching (Inbox vs Archive) ----------
    function setActiveTab(view) {
        currentView = view;

        const outgoing = view === 'archive' ? notificationList : archiveList;
        const incoming = view === 'archive' ? archiveList : notificationList;

        if (outgoing) outgoing.classList.add('view-fading');

        setTimeout(() => {
            if (view === 'archive') {
                if (notificationList) notificationList.classList.add('hidden');
                if (archiveList) archiveList.classList.remove('hidden');
                if (filterBar) filterBar.style.display = 'none';
            } else {
                if (notificationList) notificationList.classList.remove('hidden');
                if (archiveList) archiveList.classList.add('hidden');
                if (filterBar) filterBar.style.display = '';
            }

            if (outgoing) outgoing.classList.remove('view-fading');
            if (incoming) {
                incoming.classList.add('view-fading');
                // Force reflow so the removal below actually transitions in
                void incoming.offsetWidth;
                incoming.classList.remove('view-fading');
            }

            applyVisibility();
        }, 120);

        if (tabArchive) tabArchive.classList.toggle('active', view === 'archive');
        if (tabInbox) tabInbox.classList.toggle('active', view === 'inbox');
    }

    if (tabInbox) {
        tabInbox.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveTab('inbox');
        });
    }
    if (tabArchive) {
        tabArchive.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveTab('archive');
        });
    }

    // ---------- Category / read filters ----------
    const filterButtons = document.querySelectorAll('#filter-bar button[data-filter]');

    function setActiveFilter(filter) {
        currentFilter = filter;
        filterButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-filter') === filter;
            if (isActive) {
                btn.className = 'px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold whitespace-nowrap';
            } else {
                btn.className = 'px-4 py-1.5 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-on-surface text-xs font-bold whitespace-nowrap';
            }
        });
        applyVisibility();
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => setActiveFilter(btn.getAttribute('data-filter')));
    });

    function getSearchableText(notif) {
        const title = notif.querySelector('.font-semibold.text-on-surface.text-sm');
        const desc = notif.querySelector('.text-body-md.leading-relaxed');
        const project = notif.getAttribute('data-project') || '';
        const assignee = notif.getAttribute('data-assignee') || '';
        return [
            title ? title.textContent : '',
            desc ? desc.textContent : '',
            project,
            assignee
        ].join(' ').toLowerCase();
    }

    function clearHighlights(root) {
        root.querySelectorAll('mark.search-highlight').forEach(mark => {
            const parent = mark.parentNode;
            if (!parent) return;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }

    function highlightTerm(root, term) {
        clearHighlights(root);
        if (!term) return;
        const lowerTerm = term.toLowerCase();
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                return node.nodeValue && node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        const textNodes = [];
        let n;
        while ((n = walker.nextNode())) textNodes.push(n);

        textNodes.forEach(node => {
            const text = node.nodeValue;
            const lower = text.toLowerCase();
            let idx = lower.indexOf(lowerTerm);
            if (idx === -1) return;
            const frag = document.createDocumentFragment();
            let lastIndex = 0;
            while (idx !== -1) {
                frag.appendChild(document.createTextNode(text.slice(lastIndex, idx)));
                const mark = document.createElement('mark');
                mark.className = 'search-highlight';
                mark.textContent = text.slice(idx, idx + term.length);
                frag.appendChild(mark);
                lastIndex = idx + term.length;
                idx = lower.indexOf(lowerTerm, lastIndex);
            }
            frag.appendChild(document.createTextNode(text.slice(lastIndex)));
            node.parentNode.replaceChild(frag, node);
        });
    }

    function applyCardHighlight(notif, term) {
        const title = notif.querySelector('.font-semibold.text-on-surface.text-sm');
        const desc = notif.querySelector('.text-body-md.leading-relaxed');
        if (title) highlightTerm(title, term);
        if (desc) highlightTerm(desc, term);
    }

    function applyVisibility() {
        if (!searchInput) return;
        const rawTerm = searchInput.value;
        const term = rawTerm.trim().toLowerCase();
        const activeContainer = currentView === 'archive' ? archiveList : notificationList;
        if (!activeContainer) return;

        const cards = activeContainer.querySelectorAll('[data-notif-id]');
        let visibleCount = 0;

        cards.forEach(notif => {
            const matchesSearch = term === '' || getSearchableText(notif).includes(term);

            let matchesFilter = true;
            if (currentView === 'inbox') {
                if (currentFilter === 'unread') {
                    matchesFilter = !!notif.querySelector('.bg-primary.rounded-full');
                } else if (currentFilter !== 'all') {
                    matchesFilter = notif.getAttribute('data-category') === currentFilter;
                }
            }

            const visible = matchesSearch && matchesFilter;
            notif.style.display = visible ? 'flex' : 'none';
            if (visible) visibleCount++;

            applyCardHighlight(notif, matchesSearch && term ? term : '');
        });

        const totalCards = cards.length;

        if (currentView === 'inbox') {
            const noDataAtAll = totalCards === 0;
            const noSearchMatches = totalCards > 0 && visibleCount === 0 && term !== '';
            if (emptyState) emptyState.classList.toggle('hidden', !noDataAtAll);
            if (searchEmptyState) searchEmptyState.classList.toggle('hidden', !noSearchMatches);
        } else {
            const noDataAtAll = totalCards === 0;
            const noSearchMatches = totalCards > 0 && visibleCount === 0 && term !== '';
            if (noSearchMatches) {
                if (archiveEmptyState) archiveEmptyState.classList.add('hidden');
                if (archiveSearchEmptyState) archiveSearchEmptyState.classList.remove('hidden');
            } else {
                if (archiveEmptyState) archiveEmptyState.classList.toggle('hidden', !noDataAtAll);
                if (archiveSearchEmptyState) archiveSearchEmptyState.classList.add('hidden');
            }
        }
    }

    // ---------- Stats (unread / critical counts) ----------
    function updateStatCounts() {
        if (!notificationList) return;
        const unread = notificationList.querySelectorAll('[data-notif-id] .bg-primary.rounded-full').length;
        const critical = notificationList.querySelectorAll('[data-notif-id] .text-error').length;
        if (unreadCountEl) unreadCountEl.textContent = String(unread).padStart(2, '0');
        if (criticalCountEl) criticalCountEl.textContent = String(critical).padStart(2, '0');
        syncUnreadBadges(unread);
    }

    function syncUnreadBadges(unread) {
        const filterBadge = document.getElementById('filter-unread-badge');
        if (filterBadge) {
            filterBadge.textContent = String(unread);
            filterBadge.style.display = unread > 0 ? '' : 'none';
        }
        const headerDot = document.getElementById('header-unread-dot');
        if (headerDot) {
            headerDot.style.display = (unread > 0 && !isMuted()) ? '' : 'none';
        }
    }

    // ---------- 1. Refresh button ----------
    let isRefreshing = false;
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (isRefreshing) return;
            isRefreshing = true;
            setButtonLoading(refreshBtn, 'Refreshing...', refreshBtnLabel);

            setTimeout(() => {
                document.querySelectorAll('.notif-timestamp').forEach(ts => {
                    const base = ts.getAttribute('data-base-time');
                    if (base && base.includes('hours ago')) {
                        ts.textContent = 'Just now';
                    }
                });

                if (notificationList) {
                    notificationList.querySelectorAll('[data-notif-id]').forEach(card => {
                        card.classList.add('card-enter');
                        setTimeout(() => card.classList.remove('card-enter'), 300);
                    });
                }

                applyVisibility();
                updateStatCounts();

                clearButtonLoading(refreshBtn, 'Refresh', refreshBtnLabel);
                flashButtonSuccess(refreshBtn);
                isRefreshing = false;

                showSuccessToast('Notifications refreshed', 'check_circle');
            }, 1000);
        });
    }

    // ---------- 4. Save Changes (preferences) ----------
    const prefCheckboxes = document.querySelectorAll('section input[type="checkbox"][data-pref]');

    function loadPreferences() {
        const prefs = readJSON(STORAGE_KEYS.prefs, null);
        if (!prefs) return;
        prefCheckboxes.forEach(cb => {
            const key = cb.getAttribute('data-pref');
            if (key in prefs) cb.checked = prefs[key];
        });
    }

    if (savePrefsBtn) {
        savePrefsBtn.addEventListener('click', () => {
            if (savePrefsBtn.dataset.loading === '1') return;
            const originalLabel = savePrefsBtn.innerHTML;
            setButtonLoading(savePrefsBtn, 'Saving Preferences...', savePrefsBtn);

            setTimeout(() => {
                const prefs = {};
                prefCheckboxes.forEach(cb => {
                    prefs[cb.getAttribute('data-pref')] = cb.checked;
                });
                writeJSON(STORAGE_KEYS.prefs, prefs);

                clearButtonLoading(savePrefsBtn, originalLabel, savePrefsBtn);
                flashButtonSuccess(savePrefsBtn);
                showSuccessToast('Preferences saved successfully', 'check_circle');
            }, 450);
        });
    }

    // ---------- 5. Settings modal ----------
    const settingCheckboxes = document.querySelectorAll('#settings-modal input[type="checkbox"][data-setting]');

    function loadSettings() {
        const settings = readJSON(STORAGE_KEYS.settings, null);
        if (!settings) return;
        settingCheckboxes.forEach(cb => {
            const key = cb.getAttribute('data-setting');
            if (key in settings) cb.checked = settings[key];
        });
    }

    function openSettingsModal() {
        if (!settingsModal) return;
        settingsModal.classList.remove('hidden');
        settingsModal.classList.remove('modal-backdrop-enter');
        if (settingsModal.firstElementChild) {
            settingsModal.firstElementChild.classList.remove('modal-panel-enter');
        }
        void settingsModal.offsetWidth; // reflow so the animation can replay
        settingsModal.classList.add('modal-backdrop-enter');
        if (settingsModal.firstElementChild) {
            settingsModal.firstElementChild.classList.add('modal-panel-enter');
        }
    }
    function closeSettingsModal() {
        if (settingsModal) settingsModal.classList.add('hidden');
    }

    if (settingsToggleBtn) settingsToggleBtn.addEventListener('click', openSettingsModal);
    if (settingsCancelBtn) settingsCancelBtn.addEventListener('click', closeSettingsModal);
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) closeSettingsModal();
        });
    }
    if (settingsSaveBtn) {
        settingsSaveBtn.addEventListener('click', () => {
            if (settingsSaveBtn.dataset.loading === '1') return;
            const originalLabel = settingsSaveBtn.innerHTML;
            setButtonLoading(settingsSaveBtn, 'Saving...', settingsSaveBtn);

            setTimeout(() => {
                const settings = {};
                settingCheckboxes.forEach(cb => {
                    settings[cb.getAttribute('data-setting')] = cb.checked;
                });
                writeJSON(STORAGE_KEYS.settings, settings);

                clearButtonLoading(settingsSaveBtn, originalLabel, settingsSaveBtn);
                showSuccessToast('Settings updated', 'check_circle');
                closeSettingsModal();
            }, 350);
        });
    }

    // ---------- 6. Mute All for 1 Hour ----------
    const ONE_HOUR_MS = 60 * 60 * 1000;

    function formatRemaining(ms) {
        const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        if (h > 0) return `MUTED - ${h}h ${m}m LEFT`;
        return `MUTED - ${m}m LEFT`;
    }

    function isMuted() {
        const until = readJSON(STORAGE_KEYS.mute, 0);
        return until && Date.now() < until;
    }

    function applyMuteVisuals() {
        if (!muteBtn || !muteBtnLabel) return;
        const until = readJSON(STORAGE_KEYS.mute, 0);
        if (until && Date.now() < until) {
            muteBtnLabel.textContent = formatRemaining(until - Date.now());
            muteBtn.classList.add('opacity-70');
            scheduleMuteTick(until);
        } else {
            muteBtnLabel.textContent = 'MUTE ALL FOR 1H';
            muteBtn.classList.remove('opacity-70');
            if (muteTimeoutHandle) clearTimeout(muteTimeoutHandle);
        }
        updateStatCounts();
        syncHeaderBadgeWithMute();
    }

    function scheduleMuteTick(until) {
        if (muteTimeoutHandle) clearTimeout(muteTimeoutHandle);
        muteTimeoutHandle = setTimeout(() => {
            if (Date.now() >= until) {
                writeJSON(STORAGE_KEYS.mute, 0);
                showSuccessToast('Mute period ended — notifications restored', 'notifications_active');
            }
            applyMuteVisuals();
        }, 30 * 1000);
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (muteBtn.dataset.loading === '1') return;
            if (isMuted()) {
                showWarningToast('Notifications are already muted', 'notifications_off');
                return;
            }
            const originalLabel = muteBtnLabel ? muteBtnLabel.textContent : 'MUTE ALL FOR 1H';
            setButtonLoading(muteBtn, 'Muting...', muteBtnLabel);

            setTimeout(() => {
                const until = Date.now() + ONE_HOUR_MS;
                writeJSON(STORAGE_KEYS.mute, until);
                clearButtonLoading(muteBtn, originalLabel, muteBtnLabel);
                showSuccessToast('Notifications muted for 1 hour', 'notifications_off');
                applyMuteVisuals();
            }, 350);
        });
    }

    function syncHeaderBadgeWithMute() {
        const headerBadge = document.getElementById('header-unread-dot');
        if (!headerBadge) return;
        if (isMuted()) {
            headerBadge.style.display = 'none';
        } else {
            const unread = notificationList ? notificationList.querySelectorAll('[data-notif-id] .bg-primary.rounded-full').length : 0;
            headerBadge.style.display = unread > 0 ? '' : 'none';
        }
    }

    // ---------- Init ----------
    applyPersistedState();
    loadPreferences();
    loadSettings();
    setActiveTab('inbox');
    setActiveFilter('all');
    applyMuteVisuals();
    updateStatCounts();
    refreshEmptyStates();
});

/* ----------------------------------------------------------------------
       Messages System Functionality
       ---------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const MessagingSystem = (() => {
        const trigger = document.getElementById('msg-trigger');
        const menu = document.getElementById('msg-menu');
        const searchInput = document.getElementById('msg-search');
        const msgItems = document.querySelectorAll('.msg-item');
        const markAllRead = document.getElementById('mark-msgs-read');
        const msgUnreadCount = document.getElementById('msg-unread-count');
        const msgDot = document.getElementById('msg-dot');

        if (!trigger || !menu) return;

        // 1. Toggle Messages Dropdown Menu
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('dropdown-open');

            // Close the main settings or details modal if open
            const settingsModal = document.getElementById('settings-modal');
            const detailsModal = document.getElementById('notif-details-modal');
            if (settingsModal) settingsModal.classList.add('hidden');
            if (detailsModal) detailsModal.classList.add('hidden');
        });

        // 2. Close when clicking outside of the dropdown
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && e.target !== trigger) {
                menu.classList.remove('dropdown-open');
            }
        });

        // 3. Search Filtering (only if search input exists)
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                msgItems.forEach(item => {
                    const nameAttr = item.getAttribute('data-name');
                    const name = nameAttr ? nameAttr.toLowerCase() : '';
                    
                    if (name.includes(term)) {
                        item.style.display = ''; // Restores default display state
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }

        // 4. Mark All Read
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                msgItems.forEach(item => {
                    item.classList.add('is-read');
                    item.classList.remove('unread');
                    
                    const dot = item.querySelector('.dot-indicator');
                    if (dot) dot.remove();
                });
                if (msgUnreadCount) msgUnreadCount.style.display = 'none';
                if (msgDot) msgDot.style.display = 'none';
            });
        }

        // 5. Simulate Typing Indicator
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

        return { simulateTyping };
    })();
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

// Real notification data replaces the static cards whenever an authenticated
// session is available; existing page styling and local interaction handlers
// remain untouched for unauthenticated design previews.
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.EPM_API || !EPM_API.isAuthenticated()) return;
    const list = document.getElementById("notification-list");
    const unread = document.getElementById("unread-count");
    const critical = document.getElementById("critical-count");
    const markAll = document.getElementById("mark-all-read-btn");
    const archiveList = document.getElementById("archive-list");
    const tabInbox = document.getElementById("tab-inbox");
    const tabArchive = document.getElementById("tab-archive");
    if (!list) return;
    async function load() {
        try {
            const [notifications, archived] = await Promise.all([EPM_API.notifications.list(), EPM_API.notifications.list(false, true)]);
            const render = (items, isArchive) => items.length ? items.map((item) => `<article class="group p-4 rounded-xl border border-outline-variant cursor-pointer" data-real-notification-id="${item.id}" style="${item.is_read ? "opacity:.7" : ""}"><div class="flex gap-3"><span class="material-symbols-outlined text-primary">notifications</span><div class="flex-1"><div class="flex justify-between gap-3"><b>${escapeNotification(item.title)}</b><small>${new Date(item.created_at).toLocaleString()}</small></div><p>${escapeNotification(item.body)}</p><button type="button" data-real-action="${isArchive ? "restore" : "archive"}" class="text-xs text-primary">${isArchive ? "Restore" : "Archive"}</button>${isArchive ? '<button type="button" data-real-action="delete" class="text-xs text-error">Delete</button>' : ""}</div></div></article>`).join("") : '<p class="text-on-surface-variant">No notifications yet.</p>';
            list.innerHTML = render(notifications, false);
            if (archiveList) archiveList.innerHTML = render(archived, true);
            const count = notifications.filter((item) => !item.is_read).length;
            if (unread) unread.textContent = count;
            if (critical) critical.textContent = "0";
            document.querySelectorAll("[data-real-notification-id]").forEach((card) => card.addEventListener("click", async (event) => {
                const action = event.target.closest("[data-real-action]")?.dataset.realAction;
                if (action === "archive") await EPM_API.notifications.archive(card.dataset.realNotificationId);
                else if (action === "restore") await EPM_API.notifications.archive(card.dataset.realNotificationId, false);
                else if (action === "delete") await EPM_API.notifications.remove(card.dataset.realNotificationId);
                else await EPM_API.notifications.markRead(card.dataset.realNotificationId);
                await load();
            }));
        } catch (err) { console.error("Couldn't load notifications", err); }
    }
    function escapeNotification(value) { const el = document.createElement("div"); el.textContent = value || ""; return el.innerHTML; }
    if (markAll) markAll.addEventListener("click", async () => { await EPM_API.notifications.markAllRead(); await load(); });
    if (tabInbox && tabArchive) {
        tabInbox.addEventListener("click", () => { list.classList.remove("hidden"); archiveList?.classList.add("hidden"); });
        tabArchive.addEventListener("click", () => { list.classList.add("hidden"); archiveList?.classList.remove("hidden"); });
    }
    await load();
});

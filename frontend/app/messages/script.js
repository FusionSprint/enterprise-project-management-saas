document.addEventListener('DOMContentLoaded', () => {
    // --- Consolidate Sidebar, Utilities, Topbar, Search ---
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const searchBtn = document.getElementById('searchBtn');
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshBtnLabel = document.getElementById('refresh-btn-label');
    const toastContainer = document.getElementById('toast-container');
    const headerUnreadDot = document.getElementById('header-unread-dot');

    // === Dropdown Elements ===
    const msgTrigger = document.getElementById('msg-trigger');
    const msgMenu = document.getElementById('msg-menu');
    const msgSearchInput = document.getElementById('msg-search');
    const markMsgsRead = document.getElementById('mark-msgs-read');
    const msgUnreadCount = document.getElementById('msg-unread-count');
    const msgDot = document.getElementById('msg-dot');
    const viewAllMessages = document.getElementById('view-all-messages');

    // === Messages Center Workspace Elements ===
    const convoSearch = document.getElementById('convo-search');
    const pinnedChatsBox = document.getElementById('pinned-chats-box');
    const groupChatsBox = document.getElementById('group-chats-box');
    const directChatsBox = document.getElementById('direct-chats-box');

    // Header filter tabs
    const filterAllBtn = document.getElementById('filter-all-btn');
    const filterDirectBtn = document.getElementById('filter-direct-btn');
    const filterChannelsBtn = document.getElementById('filter-channels-btn');

    // Center Chat Stream
    const chatStreamViewport = document.getElementById('chat-stream-viewport');
    const activeChatTitle = document.getElementById('active-chat-title');
    const activeChatStatus = document.getElementById('active-chat-status');
    const activeHeaderAvatar = document.getElementById('active-header-avatar');
    const typingIndicatorBar = document.getElementById('typing-indicator-bar');
    
    // Search Inside Active Chat
    const chatSearchInput = document.getElementById('chat-search-input');
    const chatSearchClose = document.getElementById('chat-search-close');

    // Composer Input Tray
    const composerTextbox = document.getElementById('composer-textbox');
    const composerSendBtn = document.getElementById('composer-send-btn');
    const composerBtnEmoji = document.getElementById('composer-btn-emoji');
    const emojiPicker = document.getElementById('emoji-picker');
    const fileInput = document.getElementById('composer-file-input');
    const imageInput = document.getElementById('composer-image-input');
    const attachBtn = document.getElementById('composer-btn-attach');
    const imageBtn = document.getElementById('composer-btn-image');
    const voiceBtn = document.getElementById('composer-btn-voice');
    const attachmentTray = document.getElementById('composer-attachment-tray');
    const trayFileName = document.getElementById('tray-file-name');
    const trayFileSize = document.getElementById('tray-file-size');
    const trayRemoveFile = document.getElementById('tray-remove-file');
    const dragDropOverlay = document.getElementById('drag-drop-overlay');

    // Right Sidebar details
    const convoDetailsPanel = document.getElementById('conversation-details-panel');
    const rightPanelName = document.getElementById('right-panel-name');
    const rightPanelDesc = document.getElementById('right-panel-desc');
    const rightPanelAvatar = document.getElementById('right-panel-avatar');
    const rightPanelPinnedBox = document.getElementById('right-panel-pinned-messages');
    const pinnedCountBadge = document.getElementById('pinned-messages-count');
    const rightPanelSharedFiles = document.getElementById('right-panel-shared-files');
    const rightPanelSharedLinks = document.getElementById('right-panel-shared-links');
    const rightPanelSharedInvites = document.getElementById('right-panel-shared-invites');
    const rightBtnMute = document.getElementById('right-btn-mute');
    const rightBtnPin = document.getElementById('right-btn-pin');
    const muteLabel = document.getElementById('mute-label');
    const muteDurationTray = document.getElementById('mute-duration-tray');

    // Thread Panels
    const threadSubPanel = document.getElementById('thread-sub-panel');
    const threadPanelClose = document.getElementById('thread-panel-close');
    const threadRootMessage = document.getElementById('thread-root-message');
    const threadRepliesViewport = document.getElementById('thread-replies-viewport');
    const threadComposerInput = document.getElementById('thread-composer-input');
    const threadComposerSend = document.getElementById('thread-composer-send');

    // AI Copilot Panel
    const aiAssistantPanel = document.getElementById('ai-assistant-panel');
    const aiAssistantToggle = document.getElementById('ai-assistant-toggle');
    const aiPanelClose = document.getElementById('ai-panel-close');
    const aiBtnSummarize = document.getElementById('ai-btn-summarize');
    const aiBtnReply = document.getElementById('ai-btn-reply');
    const aiOutputText = document.getElementById('ai-output-text');
    const aiInput = document.getElementById('ai-input');
    const aiSubmit = document.getElementById('ai-submit');
    const aiSuggestedUseWrap = document.getElementById('ai-suggested-use-wrap');
    const aiUseReplyBtn = document.getElementById('ai-use-reply-btn');

    // Toggler switches
    const rightPanelToggle = document.getElementById('right-panel-toggle');

    // === Database State Machine ===
    const STORAGE_KEY_CONVOS = "sa_messages_v2_db";
    let currentActiveId = "group_1"; // Default to Enterprise SaaS Team
    let currentThreadMsgId = null; 
    let selectedUploadFile = null;
    let activeCategoryFilter = "all"; // 'all' | 'direct' | 'channels'

    // Deep set of Enterprise-level Sample Data to feed all tabs
    const defaultConversations = [
        {
            id: "group_1",
            type: "group",
            name: "Enterprise SaaS Team",
            description: "Direct workspace channel for Q4 platform infrastructure upgrades and release coordination.",
            avatarText: "ET",
            avatarBg: "bg-primary-strong",
            pinned: true,
            muted: false,
            favorite: true,
            draft: "",
            membersCount: 8,
            unreadCount: 0,
            messages: [
                { id: "g1_m1", sender: "Alex Rivera", text: "I've uploaded the Figma designs for the Sharding Monitor dashboard.", time: "10:45 AM", self: false, reactions: [{emoji: "👍", count: 2, me: true}] },
                { id: "g1_m2", sender: "Sai Bhavani", text: "That looks great, Alex. Can you review the Login API database sharding script?", time: "10:46 AM", self: false, reactions: [] },
                { id: "g1_m3", sender: "Alex Rivera", text: "Yes, we must run the stress tests before staging deployment.", time: "10:48 AM", self: false, reactions: [] }
            ],
            pinnedMessageIds: ["g1_m1"],
            sharedFiles: [
                { id: "f1_1", name: "Sharding_Dashboard_v2.fig", size: "14.2 MB", type: "figma", sender: "Alex Rivera", time: "10:45 AM" }
            ],
            sharedLinks: [
                { title: "Figma Design Mockups", url: "https://figma.com/file/acme-saas", sender: "Alex Rivera", time: "10:45 AM" }
            ],
            sharedInvites: [
                { id: "i1_1", title: "Architecture Sync Meeting", date: "July 7, 2026", time: "11:00 AM", organizer: "Alex Rivera", status: "pending" }
            ]
        },
        {
            id: "direct_1",
            type: "direct",
            name: "Sai Bhavani",
            description: "Lead Backend Developer working on database sharding and middleware infrastructure.",
            avatarImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSJl441Mhxjix1FWsEaKwCpCvqaBUDs69WGQERAGR_FZIqdbmLR-claoFayeYu3KCMglo2zS4bYq8RMvvMoXleEQFQoTT8QrPhSKRVJf4gpjiMUx5xFAMvkb0LqyMHXUFTO5M-8uVgKJ0zVIRWapcKhDH6XN9sZYTasQ82XEUJ3ysQFwTmIKenyDMDa9Vt-Er_b8VjftbuvupmrR3pTIKFRJfQ6aH6RUtoeUXqeE3gnvc6TPU6k4E8_g",
            status: "online",
            pinned: true,
            muted: false,
            favorite: true,
            draft: "",
            unreadCount: 1,
            messages: [
                { id: "d1_m1", sender: "Sai Bhavani", text: "Are you free to jump on a quick huddle to review the database routing configurations?", time: "Yesterday", self: false },
                { id: "d1_m2", sender: "Alex Rivera", text: "Sure, let me join in 5.", time: "Yesterday", self: true, receipt: "Read" },
                { id: "d1_m3", sender: "Sai Bhavani", text: "Can you review the Login API sharding route? I've committed the changes.", time: "2m ago", self: false }
            ],
            pinnedMessageIds: ["d1_m3"],
            sharedFiles: [
                { id: "df_1", name: "Sharding_Index_Routes.sql", size: "18 KB", sender: "Sai Bhavani", time: "Yesterday" }
            ],
            sharedLinks: [
                { title: "API Route Commits", url: "https://github.com/acme/infra/commit/d1b2", sender: "Sai Bhavani", time: "Yesterday" }
            ],
            sharedInvites: []
        },
        {
            id: "group_2",
            type: "group",
            name: "Frontend Team",
            description: "Frontend engineering room for components, state management, and design systems integration.",
            avatarText: "FT",
            avatarBg: "bg-surface-container-highest",
            pinned: false,
            muted: false,
            favorite: false,
            draft: "",
            membersCount: 12,
            unreadCount: 0,
            messages: [
                { id: "g2_m1", sender: "Bhavani", text: "I've integrated the standard sidebar controls on the notification segment.", time: "3h ago", self: false, reactions: [{emoji: "🎉", count: 3, me: false}] },
                { id: "g2_m2", sender: "Sai Bhavani", text: "Nice! Let's ensure the transition metrics match the design system exactly.", time: "2h ago", self: false }
            ],
            pinnedMessageIds: [],
            sharedFiles: [
                { id: "f2_1", name: "State_Architecture.pdf", size: "4.2 MB", sender: "Bhavani", time: "3h ago" }
            ],
            sharedLinks: [],
            sharedInvites: []
        },
        {
            id: "group_3",
            type: "group",
            name: "DevOps & Release",
            description: "Cloud deployment pipelines, Docker environments, Kubernetes manifests, and edge cluster monitoring.",
            avatarText: "DR",
            avatarBg: "bg-surface-dim",
            pinned: false,
            muted: true,
            favorite: false,
            draft: "",
            membersCount: 4,
            unreadCount: 0,
            messages: [
                { id: "g3_m1", sender: "Release Bot", text: "Staging deployment build v4.2.2 successful on NA edge cluster cluster-01.", time: "5h ago", self: false }
            ],
            pinnedMessageIds: [],
            sharedFiles: [
                { id: "f3_1", name: "Kubernetes_Release_v4.yaml", size: "12 KB", sender: "Release Bot", time: "5h ago" }
            ],
            sharedLinks: [],
            sharedInvites: []
        },
        {
            id: "direct_2",
            type: "direct",
            name: "Sarah Jenkins",
            description: "Product Manager overseeing Acme Corp platform and workspace modules.",
            avatarImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8tx6E1eZII4mQ9oixuAcPrqlU_IndeM8ML1THwFYgMEDohmWFO8D6GfOixOqaqEbXn9Hd7Co7_zYi9fhrzUateLRGVBFnaKWnK2u_7EAFyM8CR-0Vy_jNYvcFVyEIyUnO1-aOc9nJmMA-wcC_2D8QPx9ubnYBEBBzUSCH3vqYslJpyTQ8FPkqHA_7nhysJj13S4770INLap9AIDH9fj54R32dwpzc83Dw2mYTFs9zvXaTPUuJujHGWg",
            status: "away",
            pinned: false,
            muted: false,
            favorite: true,
            draft: "",
            unreadCount: 0,
            messages: [
                { id: "d2_m1", sender: "Sarah Jenkins", text: "Can we schedule a product sync for tomorrow afternoon to lock down the sprint scope?", time: "1h ago", self: false }
            ],
            pinnedMessageIds: [],
            sharedFiles: [],
            sharedLinks: [],
            sharedInvites: [
                { id: "i2_1", title: "Product Scope Sync", date: "July 7, 2026", time: "2:00 PM", organizer: "Sarah Jenkins", status: "pending" }
            ]
        }
    ];

    let conversations = [];

    function loadDB() {
        const stored = localStorage.getItem(STORAGE_KEY_CONVOS);
        if (stored) {
            try {
                conversations = JSON.parse(stored);
            } catch (e) {
                conversations = [...defaultConversations];
            }
        } else {
            conversations = [...defaultConversations];
        }
    }

    function saveDB() {
        localStorage.setItem(STORAGE_KEY_CONVOS, JSON.stringify(conversations));
    }

    // === Helper: Show Toast notifications ===
    function triggerToast(message, type = "success") {
        const toastItem = document.createElement("div");
        toastItem.className = `toast-item bg-surface-container-high border border-outline-variant text-on-surface text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 toast-${type}`;
        toastItem.style.opacity = '0';
        toastItem.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        toastItem.style.transform = 'translateY(6px)';
        toastItem.innerHTML = `<span class="material-symbols-outlined text-sm ${type === 'success' ? 'text-primary' : 'text-error'}">info</span><span>${message}</span>`;
        if (toastContainer) toastContainer.appendChild(toastItem);

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

    // Ripple element renderer
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

    // === Toggle sidebar responsive drawer ===
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('show');
        });
    }
    document.addEventListener('click', () => {
        if (sidebar) sidebar.classList.remove('show');
    });

    // === Workspace Dropdowns Toggle ===
    if (msgTrigger && msgMenu) {
        msgTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            msgMenu.classList.toggle('dropdown-open');
        });
    }

    document.addEventListener('click', (e) => {
        if (msgMenu && !msgMenu.contains(e.target) && e.target !== msgTrigger) {
            msgMenu.classList.remove('dropdown-open');
        }
    });

    if (markMsgsRead) {
        markMsgsRead.addEventListener('click', (e) => {
            e.stopPropagation();
            if (msgUnreadCount) msgUnreadCount.style.display = 'none';
            if (msgDot) msgDot.style.display = 'none';
            triggerToast('All dropdown messages marked read', 'success');
        });
    }

    if (viewAllMessages) {
        viewAllMessages.addEventListener('click', () => {
            triggerToast('Opening Full Messages Center');
        });
    }

    // === Messaging UI rendering engine ===
    function getActiveChat() {
        return conversations.find(c => c.id === currentActiveId) || conversations[0];
    }

    function renderConversationList() {
        if (!pinnedChatsBox || !groupChatsBox || !directChatsBox) return;

        pinnedChatsBox.innerHTML = "";
        groupChatsBox.innerHTML = "";
        directChatsBox.innerHTML = "";

        const query = convoSearch ? convoSearch.value.trim().toLowerCase() : "";

        // Hide/Show layout sections depending on view filter
        const pinnedSection = document.getElementById('convo-pinned-section');
        const groupSection = document.getElementById('convo-group-section');
        const directSection = document.getElementById('convo-direct-section');

        if (pinnedSection) pinnedSection.style.display = "";
        if (groupSection) groupSection.style.display = activeCategoryFilter === "direct" ? "none" : "";
        if (directSection) directSection.style.display = activeCategoryFilter === "channels" ? "none" : "";

        conversations.forEach(convo => {
            // Apply category tab filtering
            if (activeCategoryFilter === "direct" && convo.type !== "direct") return;
            if (activeCategoryFilter === "channels" && convo.type !== "group") return;

            const matchesSearch = !query || 
                convo.name.toLowerCase().includes(query) || 
                convo.messages.some(m => m.text.toLowerCase().includes(query));

            if (!matchesSearch) return;

            const isCurrent = convo.id === currentActiveId;
            const lastMsg = convo.messages[convo.messages.length - 1];
            const textPreview = convo.draft ? `<i>Draft: ${convo.draft}</i>` : (lastMsg ? lastMsg.text : "No messages yet");
            const timePreview = lastMsg ? lastMsg.time : "";

            let avatarHTML = "";
            if (convo.type === "direct") {
                avatarHTML = `
                    <div class="convo-avatar">
                        <img src="${convo.avatarImg || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8tx6E1eZII4mQ9oixuAcPrqlU_IndeM8ML1THwFYgMEDohmWFO8D6GfOixOqaqEbXn9Hd7Co7_zYi9fhrzUateLRGVBFnaKWnK2u_7EAFyM8CR-0Vy_jNYvcFVyEIyUnO1-aOc9nJmMA-wcC_2D8QPx9ubnYBEBBzUSCH3vqYslJpyTQ8FPkqHA_7nhysJj13S4770INLap9AIDH9fj54R32dwpzc83Dw2mYTFs9zvXaTPUuJujHGWg'}" class="w-full h-full rounded-full object-cover">
                        <span class="online-dot ${convo.status || 'offline'}"></span>
                    </div>
                `;
            } else {
                avatarHTML = `
                    <div class="convo-avatar group-avatar ${convo.avatarBg || 'bg-surface-container-highest'}">
                        ${convo.avatarText || 'CH'}
                    </div>
                `;
            }

            const unreadBadgeHTML = convo.unreadCount > 0 && !convo.muted ? 
                `<span class="badge-unread">${convo.unreadCount}</span>` : "";

            const muteIconHTML = convo.muted ? 
                `<span class="material-symbols-outlined text-xs text-on-surface-variant">notifications_off</span>` : "";

            const convoHTML = `
                <div class="convo-item ${isCurrent ? 'active' : ''}" data-convo-id="${convo.id}">
                    ${avatarHTML}
                    <div class="convo-body">
                        <p class="convo-name">${convo.name}</p>
                        <p class="convo-meta">
                            <span class="convo-msg">${textPreview}</span>
                        </p>
                    </div>
                    <div class="convo-right">
                        <span class="text-[10px] text-on-surface-variant">${timePreview}</span>
                        <div class="flex items-center gap-1">
                            ${muteIconHTML}
                            ${unreadBadgeHTML}
                        </div>
                    </div>
                </div>
            `;

            if (convo.pinned) {
                pinnedChatsBox.insertAdjacentHTML("beforeend", convoHTML);
            } else if (convo.type === "group") {
                groupChatsBox.insertAdjacentHTML("beforeend", convoHTML);
            } else {
                directChatsBox.insertAdjacentHTML("beforeend", convoHTML);
            }
        });

        // Attach dynamic switches
        document.querySelectorAll(".convo-item").forEach(item => {
            item.addEventListener("click", () => {
                const draft = composerTextbox ? composerTextbox.value.trim() : "";
                const prevConvo = conversations.find(c => c.id === currentActiveId);
                if (prevConvo) {
                    prevConvo.draft = draft;
                }

                const nextId = item.getAttribute("data-convo-id");
                if (nextId === currentActiveId) return;

                const centerPanel = document.querySelector(".messages-center-panel");
                if (centerPanel) centerPanel.classList.add("thread-switching");

                setTimeout(() => {
                    currentActiveId = nextId;
                    const nextConvo = conversations.find(c => c.id === currentActiveId);
                    if (nextConvo) {
                        nextConvo.unreadCount = 0;
                        if (composerTextbox) {
                            composerTextbox.value = nextConvo.draft || "";
                        }
                    }
                    saveDB();
                    renderAll();
                    if (centerPanel) centerPanel.classList.remove("thread-switching");
                }, 130);
            });
        });

        // Sync header unread count
        const totalUnreads = conversations.reduce((acc, c) => acc + (c.muted ? 0 : c.unreadCount), 0);
        if (headerUnreadDot) {
            headerUnreadDot.style.display = totalUnreads > 0 ? "" : "none";
        }
    }

    function renderActiveChat() {
        const convo = getActiveChat();
        if (!convo) return;

        // Render Active Header
        if (activeChatTitle) activeChatTitle.textContent = convo.name;
        if (activeChatStatus) {
            if (convo.type === "group") {
                activeChatStatus.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-success"></span><span>${convo.membersCount} Members</span>`;
            } else {
                activeChatStatus.innerHTML = `<span class="w-1.5 h-1.5 rounded-full ${convo.status === 'online' ? 'bg-success' : 'bg-outline-variant'}"></span><span>${convo.status || 'Offline'}</span>`;
            }
        }

        if (activeHeaderAvatar) {
            if (convo.type === "direct") {
                activeHeaderAvatar.innerHTML = `<img src="${convo.avatarImg || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8tx6E1eZII4mQ9oixuAcPrqlU_IndeM8ML1THwFYgMEDohmWFO8D6GfOixOqaqEbXn9Hd7Co7_zYi9fhrzUateLRGVBFnaKWnK2u_7EAFyM8CR-0Vy_jNYvcFVyEIyUnO1-aOc9nJmMA-wcC_2D8QPx9ubnYBEBBzUSCH3vqYslJpyTQ8FPkqHA_7nhysJj13S4770INLap9AIDH9fj54R32dwpzc83Dw2mYTFs9zvXaTPUuJujHGWg'}" class="w-8 h-8 rounded-full object-cover"><span class="online-dot ${convo.status || 'offline'}"></span>`;
            } else {
                activeHeaderAvatar.innerHTML = `<div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${convo.avatarBg || 'bg-surface-container-highest'}">${convo.avatarText || 'CH'}</div>`;
            }
        }

        // Render Stream Viewport
        if (!chatStreamViewport) return;
        chatStreamViewport.innerHTML = "";

        const query = chatSearchInput ? chatSearchInput.value.trim().toLowerCase() : "";

        convo.messages.forEach(msg => {
            const matchesSearch = !query || msg.text.toLowerCase().includes(query);
            if (!matchesSearch) return;

            const isSelf = msg.self;
            const textRendered = query ? msg.text.replace(new RegExp(query, 'gi'), match => `<mark class="search-highlight">${match}</mark>`) : msg.text;

            let reactionsHTML = "";
            if (msg.reactions && msg.reactions.length > 0) {
                reactionsHTML = `<div class="reactions-row">`;
                msg.reactions.forEach(react => {
                    reactionsHTML += `
                        <div class="reaction-badge ${react.me ? 'reacted' : ''}" data-msg-id="${msg.id}" data-emoji="${react.emoji}">
                            <span>${react.emoji}</span>
                            <span>${react.count}</span>
                        </div>
                    `;
                });
                reactionsHTML += `</div>`;
            }

            const receiptHTML = (isSelf && msg.receipt) ? `
                <span class="text-[9px] text-primary flex items-center gap-1 font-semibold ml-2">
                    <span class="material-symbols-outlined text-[10px]">done_all</span>
                    <span>${msg.receipt}</span>
                </span>
            ` : "";

            const threadCountHTML = msg.threadReplies && msg.threadReplies.length > 0 ? `
                <button class="mt-2 text-[10px] text-primary font-bold flex items-center gap-1 btn-view-thread" data-msg-id="${msg.id}">
                    <span class="material-symbols-outlined text-xs">forum</span>
                    <span>${msg.threadReplies.length} replies</span>
                </button>
            ` : "";

            const bubbleWrapHTML = `
                <div class="message-bubble-wrapper ${isSelf ? 'self' : ''}" data-message-id="${msg.id}">
                    <div class="flex flex-col ${isSelf ? 'items-end' : 'items-start'} max-w-full">
                        <div class="message-bubble rounded-xl p-3 text-xs leading-relaxed max-w-md ${isSelf ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container border border-outline-variant text-on-surface'}">
                            ${textRendered}
                            ${threadCountHTML}
                        </div>
                        ${reactionsHTML}
                        <div class="message-meta">
                            <span>${msg.sender}</span>
                            <span>•</span>
                            <span>${msg.time}</span>
                            ${receiptHTML}
                        </div>
                    </div>

                    <!-- Chat Hover Actions -->
                    <div class="chat-bubble-actions bg-surface-container-high border border-outline-variant rounded-lg p-0.5 shadow-md flex items-center gap-0.5">
                        <button class="btn-react p-1 hover:bg-surface-container-highest rounded text-on-surface" data-msg-id="${msg.id}" data-emoji="👍">👍</button>
                        <button class="btn-react p-1 hover:bg-surface-container-highest rounded text-on-surface" data-msg-id="${msg.id}" data-emoji="❤️">❤️</button>
                        <button class="btn-thread p-1 hover:bg-surface-container-highest rounded text-on-surface" data-msg-id="${msg.id}" title="Reply in thread">
                            <span class="material-symbols-outlined text-xs">forum</span>
                        </button>
                        <button class="btn-pin-msg p-1 hover:bg-surface-container-highest rounded text-on-surface" data-msg-id="${msg.id}" title="Pin message">
                            <span class="material-symbols-outlined text-xs">keep</span>
                        </button>
                        ${isSelf ? `
                            <button class="btn-delete-msg p-1 hover:bg-surface-container-highest rounded text-error" data-msg-id="${msg.id}">
                                <span class="material-symbols-outlined text-xs">delete</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;

            chatStreamViewport.insertAdjacentHTML("beforeend", bubbleWrapHTML);
        });

        chatStreamViewport.scrollTop = chatStreamViewport.scrollHeight;

        // Attach Message Level Listeners
        document.querySelectorAll(".btn-react").forEach(btn => {
            btn.addEventListener("click", () => {
                const msgId = btn.getAttribute("data-msg-id");
                const emoji = btn.getAttribute("data-emoji");
                applyReaction(msgId, emoji);
            });
        });

        document.querySelectorAll(".reaction-badge").forEach(badge => {
            badge.addEventListener("click", () => {
                const msgId = badge.getAttribute("data-msg-id");
                const emoji = badge.getAttribute("data-emoji");
                applyReaction(msgId, emoji);
            });
        });

        document.querySelectorAll(".btn-thread, .btn-view-thread").forEach(btn => {
            btn.addEventListener("click", () => {
                const msgId = btn.getAttribute("data-msg-id");
                openThreadPanel(msgId);
            });
        });

        document.querySelectorAll(".btn-pin-msg").forEach(btn => {
            btn.addEventListener("click", () => {
                const msgId = btn.getAttribute("data-msg-id");
                pinMessage(msgId);
            });
        });

        document.querySelectorAll(".btn-delete-msg").forEach(btn => {
            btn.addEventListener("click", () => {
                const msgId = btn.getAttribute("data-msg-id");
                deleteMessage(msgId);
            });
        });
    }

    function renderRightPanel() {
        const convo = getActiveChat();
        if (!convo || !convoDetailsPanel) return;

        // Render Avatar / Title
        if (rightPanelName) rightPanelName.textContent = convo.name;
        if (rightPanelDesc) rightPanelDesc.textContent = convo.description || "No description provided.";
        
        if (rightPanelAvatar) {
            if (convo.type === "direct") {
                rightPanelAvatar.innerHTML = `<img src="${convo.avatarImg || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8tx6E1eZII4mQ9oixuAcPrqlU_IndeM8ML1THwFYgMEDohmWFO8D6GfOixOqaqEbXn9Hd7Co7_zYi9fhrzUateLRGVBFnaKWnK2u_7EAFyM8CR-0Vy_jNYvcFVyEIyUnO1-aOc9nJmMA-wcC_2D8QPx9ubnYBEBBzUSCH3vqYslJpyTQ8FPkqHA_7nhysJj13S4770INLap9AIDH9fj54R32dwpzc83Dw2mYTFs9zvXaTPUuJujHGWg'}" class="w-16 h-16 rounded-full object-cover border-2 border-outline-variant">`;
            } else {
                rightPanelAvatar.innerHTML = `<div class="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl text-white ${convo.avatarBg || 'bg-surface-container-highest'}">${convo.avatarText || 'CH'}</div>`;
            }
        }

        // Mute / Pin Status
        if (muteLabel) {
            muteLabel.textContent = convo.muted ? "UNMUTE" : "MUTE";
        }
        if (rightBtnMute) {
            rightBtnMute.classList.toggle("opacity-70", convo.muted);
        }
        if (rightBtnPin) {
            rightBtnPin.classList.toggle("bg-primary", convo.pinned);
            rightBtnPin.classList.toggle("text-on-primary", convo.pinned);
            const pinIcon = rightBtnPin.querySelector("span");
            if (pinIcon) pinIcon.textContent = convo.pinned ? "keep_off" : "keep";
        }

        // Render Pinned message stream count
        const pinnedMessages = convo.messages.filter(m => convo.pinnedMessageIds && convo.pinnedMessageIds.includes(m.id));
        if (pinnedCountBadge) pinnedCountBadge.textContent = pinnedMessages.length;
        if (rightPanelPinnedBox) {
            rightPanelPinnedBox.innerHTML = "";
            if (pinnedMessages.length === 0) {
                rightPanelPinnedBox.innerHTML = `<p class="text-[11px] text-on-surface-variant italic">No pinned messages yet.</p>`;
            } else {
                pinnedMessages.forEach(msg => {
                    const pinnedHTML = `
                        <div class="bg-surface-container p-2 rounded-lg border border-outline-variant text-[11px] flex justify-between gap-1 group">
                            <div class="min-width-0 flex-1">
                                <p class="font-semibold text-on-surface truncate">${msg.sender}</p>
                                <p class="text-on-surface-variant line-clamp-2 mt-0.5">${msg.text}</p>
                            </div>
                            <button class="btn-jump-msg text-primary hover:underline text-[10px] shrink-0 self-end" data-msg-id="${msg.id}">JUMP</button>
                        </div>
                    `;
                    rightPanelPinnedBox.insertAdjacentHTML("beforeend", pinnedHTML);
                });

                document.querySelectorAll(".btn-jump-msg").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const msgId = btn.getAttribute("data-msg-id");
                        const targetBubble = chatStreamViewport.querySelector(`[data-message-id="${msgId}"]`);
                        if (targetBubble) {
                            targetBubble.scrollIntoView({ behavior: "smooth", block: "center" });
                            targetBubble.classList.add("btn-success-flash");
                            setTimeout(() => targetBubble.classList.remove("btn-success-flash"), 1000);
                        }
                    });
                });
            }
        }

        // Render files list
        if (rightPanelSharedFiles) {
            rightPanelSharedFiles.innerHTML = "";
            if (!convo.sharedFiles || convo.sharedFiles.length === 0) {
                rightPanelSharedFiles.innerHTML = `<p class="text-[11px] text-on-surface-variant italic">No shared files yet.</p>`;
            } else {
                convo.sharedFiles.forEach(file => {
                    const fileHTML = `
                        <div class="flex items-center gap-2 p-2 bg-surface-container rounded-lg border border-outline-variant text-[11px]">
                            <span class="material-symbols-outlined text-sm text-primary">description</span>
                            <div class="flex-1 min-width-0">
                                <p class="font-semibold text-on-surface truncate">${file.name}</p>
                                <p class="text-[10px] text-on-surface-variant truncate">${file.size} • ${file.sender}</p>
                            </div>
                            <button class="text-primary hover:underline text-[10px] shrink-0 btn-download-file" data-file-name="${file.name}">
                                <span class="material-symbols-outlined text-xs">download</span>
                            </button>
                        </div>
                    `;
                    rightPanelSharedFiles.insertAdjacentHTML("beforeend", fileHTML);
                });

                document.querySelectorAll(".btn-download-file").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const name = btn.getAttribute("data-file-name");
                        triggerToast(`Downloading shared asset: ${name}`);
                    });
                });
            }
        }

        // Render Links list
        if (rightPanelSharedLinks) {
            rightPanelSharedLinks.innerHTML = "";
            if (!convo.sharedLinks || convo.sharedLinks.length === 0) {
                rightPanelSharedLinks.innerHTML = `<p class="text-[11px] text-on-surface-variant italic">No links shared yet.</p>`;
            } else {
                convo.sharedLinks.forEach(link => {
                    const linkHTML = `
                        <a href="${link.url}" target="_blank" class="flex items-center justify-between p-2 bg-surface-container rounded-lg border border-outline-variant text-[11px] hover:border-primary transition-colors">
                            <div class="min-width-0 flex-1">
                                <p class="font-semibold text-on-surface truncate">${link.title}</p>
                                <p class="text-[10px] text-primary truncate">${link.url}</p>
                            </div>
                            <span class="material-symbols-outlined text-xs text-on-surface-variant shrink-0">open_in_new</span>
                        </a>
                    `;
                    rightPanelSharedLinks.insertAdjacentHTML("beforeend", linkHTML);
                });
            }
        }

        // Render Invites / Invitations
        if (rightPanelSharedInvites) {
            rightPanelSharedInvites.innerHTML = "";
            if (!convo.sharedInvites || convo.sharedInvites.length === 0) {
                rightPanelSharedInvites.innerHTML = `<p class="text-[11px] text-on-surface-variant italic">No calendar invites shared.</p>`;
            } else {
                convo.sharedInvites.forEach(inv => {
                    const inviteHTML = `
                        <div class="bg-surface-container p-3 rounded-lg border border-outline-variant text-[11px] space-y-2">
                            <div class="flex items-center gap-1 text-primary">
                                <span class="material-symbols-outlined text-xs">calendar_today</span>
                                <b class="truncate">${inv.title}</b>
                            </div>
                            <p class="text-[10px] text-on-surface-variant leading-none">${inv.date} at ${inv.time}</p>
                            <div class="flex gap-1.5 pt-1">
                                <button class="btn-rsvp flex-1 py-1 bg-primary text-on-primary rounded text-[9px] font-bold" data-status="accepted" data-convo-id="${convo.id}" data-inv-id="${inv.id}">ACCEPT</button>
                                <button class="btn-rsvp flex-1 py-1 bg-surface-container-high border border-outline-variant rounded text-[9px] font-bold text-on-surface" data-status="declined" data-convo-id="${convo.id}" data-inv-id="${inv.id}">DECLINE</button>
                            </div>
                        </div>
                    `;
                    rightPanelSharedInvites.insertAdjacentHTML("beforeend", inviteHTML);
                });

                document.querySelectorAll(".btn-rsvp").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const status = btn.getAttribute("data-status");
                        triggerToast(`Invitation RSVP status set to: ${status}`);
                    });
                });
            }
        }
    }

    function renderAll() {
        renderConversationList();
        renderActiveChat();
        renderRightPanel();
    }

    window.applyMessagesFilter = function (filterType) {
        if (filterType === 'direct') {
            activeCategoryFilter = 'direct';
        } else if (filterType === 'channels') {
            activeCategoryFilter = 'channels';
        } else {
            activeCategoryFilter = 'all';
        }
        renderConversationList();
    };

    // === Database Interactions ===
    function applyReaction(msgId, emoji) {
        const convo = getActiveChat();
        if (!convo) return;

        const msg = convo.messages.find(m => m.id === msgId);
        if (!msg) return;

        if (!msg.reactions) msg.reactions = [];
        const existing = msg.reactions.find(r => r.emoji === emoji);

        if (existing) {
            if (existing.me) {
                existing.count--;
                existing.me = false;
            } else {
                existing.count++;
                existing.me = true;
            }
            if (existing.count <= 0) {
                msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
            }
        } else {
            msg.reactions.push({ emoji: emoji, count: 1, me: true });
        }

        saveDB();
        renderActiveChat();
    }

    function pinMessage(msgId) {
        const convo = getActiveChat();
        if (!convo) return;

        if (!convo.pinnedMessageIds) convo.pinnedMessageIds = [];
        
        if (convo.pinnedMessageIds.includes(msgId)) {
            convo.pinnedMessageIds = convo.pinnedMessageIds.filter(id => id !== msgId);
            triggerToast("Message unpinned");
        } else {
            convo.pinnedMessageIds.push(msgId);
            triggerToast("Message pinned to details panel");
        }

        saveDB();
        renderRightPanel();
        renderActiveChat();
    }

    function deleteMessage(msgId) {
        const convo = getActiveChat();
        if (!convo) return;

        convo.messages = convo.messages.filter(m => m.id !== msgId);
        if (convo.pinnedMessageIds) {
            convo.pinnedMessageIds = convo.pinnedMessageIds.filter(id => id !== msgId);
        }

        saveDB();
        renderActiveChat();
        renderRightPanel();
        triggerToast("Message deleted");
    }

    // === Composer Messaging & Input controls ===
    if (composerSendBtn && composerTextbox) {
        const sendMessage = () => {
            const text = composerTextbox.value.trim();
            const convo = getActiveChat();
            if (!convo || (!text && !selectedUploadFile)) return;

            const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const newMsgId = "msg_" + Date.now();

            const newMsgObj = {
                id: newMsgId,
                sender: "Me",
                text: text || `Shared file attachment: ${selectedUploadFile.name}`,
                time: timeNow,
                self: true,
                reactions: [],
                receipt: "Sent"
            };

            // Process Shared File if any
            if (selectedUploadFile) {
                if (!convo.sharedFiles) convo.sharedFiles = [];
                convo.sharedFiles.push({
                    id: "file_" + Date.now(),
                    name: selectedUploadFile.name,
                    size: selectedUploadFile.size,
                    sender: "Me",
                    time: timeNow
                });
                selectedUploadFile = null;
                if (attachmentTray) attachmentTray.classList.add("hidden");
            }

            convo.messages.push(newMsgObj);
            convo.draft = ""; // Clear draft
            composerTextbox.value = "";
            composerTextbox.style.height = "auto";

            saveDB();
            renderActiveChat();
            renderRightPanel();
            renderConversationList();

            // Simulate read receipts progress
            setTimeout(() => {
                newMsgObj.receipt = "Delivered";
                saveDB();
                renderActiveChat();
                
                setTimeout(() => {
                    newMsgObj.receipt = "Read";
                    saveDB();
                    renderActiveChat();
                }, 1000);
            }, 1000);
        };

        composerSendBtn.addEventListener("click", sendMessage);
        composerTextbox.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Toggle Details Panel
    if (rightPanelToggle && convoDetailsPanel) {
        rightPanelToggle.addEventListener("click", () => {
            convoDetailsPanel.classList.toggle("hidden");
            if (threadSubPanel) threadSubPanel.classList.add("hidden");
            if (aiAssistantPanel) aiAssistantPanel.classList.add("hidden");
        });
    }

    // Toggle AI Copilot Panel
    if (aiAssistantToggle && aiAssistantPanel) {
        aiAssistantToggle.addEventListener("click", () => {
            aiAssistantPanel.classList.toggle("hidden");
            if (convoDetailsPanel) convoDetailsPanel.classList.add("hidden");
            if (threadSubPanel) threadSubPanel.classList.add("hidden");
        });
    }

    if (aiPanelClose && aiAssistantPanel) {
        aiPanelClose.addEventListener("click", () => {
            aiAssistantPanel.classList.add("hidden");
        });
    }

    // Mute Controls Panel
    if (rightBtnMute) {
        rightBtnMute.addEventListener("click", () => {
            const convo = getActiveChat();
            if (!convo) return;

            if (convo.muted) {
                convo.muted = false;
                triggerToast("Chat unmuted");
                if (muteDurationTray) muteDurationTray.classList.add("hidden");
                saveDB();
                renderAll();
            } else {
                if (muteDurationTray) muteDurationTray.classList.toggle("hidden");
            }
        });
    }

    document.querySelectorAll(".mute-dur-opt").forEach(btn => {
        btn.addEventListener("click", () => {
            const convo = getActiveChat();
            if (!convo) return;

            const dur = btn.getAttribute("data-dur");
            convo.muted = true;
            if (muteDurationTray) muteDurationTray.classList.add("hidden");
            triggerToast(dur === "0" ? "Notifications muted permanently" : `Notifications muted for ${dur} hours`);
            saveDB();
            renderAll();
        });
    });

    if (rightBtnPin) {
        rightBtnPin.addEventListener("click", () => {
            const convo = getActiveChat();
            if (!convo) return;

            convo.pinned = !convo.pinned;
            triggerToast(convo.pinned ? "Conversation pinned to top" : "Conversation unpinned");
            saveDB();
            renderAll();
        });
    }

    // Conversation list filtering
    if (convoSearch) {
        convoSearch.addEventListener("input", renderConversationList);
    }

    // === Threaded replies workflow ===
    function openThreadPanel(msgId) {
        currentThreadMsgId = msgId;
        const convo = getActiveChat();
        if (!convo || !threadSubPanel) return;

        const msg = convo.messages.find(m => m.id === msgId);
        if (!msg) return;

        // Render Thread Panel state
        if (convoDetailsPanel) convoDetailsPanel.classList.add("hidden");
        if (aiAssistantPanel) aiAssistantPanel.classList.add("hidden");
        threadSubPanel.classList.remove("hidden");

        // Render Root Message
        if (threadRootMessage) {
            threadRootMessage.innerHTML = `
                <div class="text-xs">
                    <p class="font-semibold text-primary mb-1">${msg.sender}</p>
                    <p class="text-on-surface leading-relaxed">${msg.text}</p>
                    <p class="text-[10px] text-on-surface-variant mt-2">${msg.time}</p>
                </div>
            `;
        }

        renderThreadReplies();
    }

    function renderThreadReplies() {
        if (!threadRepliesViewport || !currentThreadMsgId) return;
        threadRepliesViewport.innerHTML = "";

        const convo = getActiveChat();
        const msg = convo.messages.find(m => m.id === currentThreadMsgId);
        if (!msg) return;

        if (!msg.threadReplies || msg.threadReplies.length === 0) {
            threadRepliesViewport.innerHTML = `<p class="text-[11px] text-on-surface-variant italic p-4 text-center">No replies yet. Start the conversation!</p>`;
        } else {
            msg.threadReplies.forEach(rep => {
                const repHTML = `
                    <div class="bg-surface-container-high border border-outline-variant p-2.5 rounded-lg text-xs space-y-1">
                        <div class="flex justify-between">
                            <span class="font-semibold text-on-surface">${rep.sender}</span>
                            <span class="text-[9px] text-on-surface-variant">${rep.time}</span>
                        </div>
                        <p class="text-on-surface-variant leading-relaxed">${rep.text}</p>
                    </div>
                `;
                threadRepliesViewport.insertAdjacentHTML("beforeend", repHTML);
            });
        }
        threadRepliesViewport.scrollTop = threadRepliesViewport.scrollHeight;
    }

    if (threadComposerSend && threadComposerInput) {
        const sendThreadReply = () => {
            const text = threadComposerInput.value.trim();
            if (!text || !currentThreadMsgId) return;

            const convo = getActiveChat();
            const msg = convo.messages.find(m => m.id === currentThreadMsgId);
            if (!msg) return;

            if (!msg.threadReplies) msg.threadReplies = [];

            msg.threadReplies.push({
                sender: "Me",
                text: text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            threadComposerInput.value = "";
            saveDB();
            renderThreadReplies();
            renderActiveChat();
        };

        threadComposerSend.addEventListener("click", sendThreadReply);
        threadComposerInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") sendThreadReply();
        });
    }

    if (threadPanelClose && threadSubPanel) {
        threadPanelClose.addEventListener("click", () => {
            threadSubPanel.classList.add("hidden");
            currentThreadMsgId = null;
        });
    }

    // === AI Copilot Logic Simulation ===
    if (aiBtnSummarize) {
        aiBtnSummarize.addEventListener("click", () => {
            if (!aiOutputText) return;
            aiOutputText.innerHTML = `<span class="btn-spinner"></span> Generating smart summary...`;
            if (aiSuggestedUseWrap) aiSuggestedUseWrap.classList.add("hidden");

            setTimeout(() => {
                aiOutputText.innerHTML = `
                    <b class="text-primary text-[11px] uppercase tracking-wider block mb-2">Conversation Summary</b>
                    <ul class="list-disc pl-4 space-y-1 text-on-surface-variant">
                        <li>Figma wireframes have been updated for review.</li>
                        <li>Routing configurations need verification against stresses.</li>
                        <li>Login API routing logic was sharded successfully.</li>
                    </ul>
                `;
                triggerToast("Summary generated by AI", "success");
            }, 1200);
        });
    }

    if (aiBtnReply) {
        aiBtnReply.addEventListener("click", () => {
            if (!aiOutputText) return;
            aiOutputText.innerHTML = `<span class="btn-spinner"></span> Suggesting response...`;
            if (aiSuggestedUseWrap) aiSuggestedUseWrap.classList.add("hidden");

            setTimeout(() => {
                const suggestedText = "I will review the Login API database sharding route and run the stress tests before staging deployment.";
                aiOutputText.innerHTML = `
                    <b class="text-primary text-[11px] uppercase tracking-wider block mb-2">Suggested Reply Proposal</b>
                    <p class="text-on-surface leading-relaxed">"${suggestedText}"</p>
                `;
                if (aiSuggestedUseWrap) aiSuggestedUseWrap.classList.remove("hidden");
                
                if (aiUseReplyBtn) {
                    aiUseReplyBtn.onclick = () => {
                        if (composerTextbox) {
                            composerTextbox.value = suggestedText;
                            aiSuggestedUseWrap.classList.add("hidden");
                            triggerToast("Response imported to composer");
                        }
                    };
                }
                triggerToast("AI Suggestion ready", "success");
            }, 1000);
        });
    }

    if (aiSubmit && aiInput) {
        const processAiQuestion = () => {
            const query = aiInput.value.trim();
            if (!query) return;

            if (aiOutputText) {
                aiOutputText.innerHTML = `<span class="btn-spinner"></span> Processing your question...`;
            }
            aiInput.value = "";

            setTimeout(() => {
                if (aiOutputText) {
                    aiOutputText.innerHTML = `
                        <b class="text-primary text-[11px] uppercase tracking-wider block mb-1">AI Copilot Analysis</b>
                        <p class="leading-relaxed">Based on the conversation records, stress tests must be coordinated with <strong>Sai Bhavani</strong> before launching deployment pipelines.</p>
                    `;
                }
            }, 1100);
        };

        aiSubmit.addEventListener("click", processAiQuestion);
        aiInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") processAiQuestion();
        });
    }

    // === Drag & Drop File Upload ===
    const activeChatPane = document.querySelector('main');
    if (activeChatPane) {
        window.addEventListener("dragenter", (e) => {
            e.preventDefault();
            if (dragDropOverlay) dragDropOverlay.classList.remove("hidden");
        });

        if (dragDropOverlay) {
            dragDropOverlay.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            dragDropOverlay.addEventListener("dragleave", (e) => {
                dragDropOverlay.classList.add("hidden");
            });

            dragDropOverlay.addEventListener("drop", (e) => {
                e.preventDefault();
                dragDropOverlay.classList.add("hidden");
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                    handleComposerAttachment(files[0]);
                }
            });
        }
    }

    function handleComposerAttachment(file) {
        selectedUploadFile = {
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + " MB"
        };
        if (attachmentTray && trayFileName && trayFileSize) {
            trayFileName.textContent = selectedUploadFile.name;
            trayFileSize.textContent = selectedUploadFile.size;
            attachmentTray.classList.remove("hidden");
            triggerToast(`Ready to send: ${selectedUploadFile.name}`);
        }
    }

    if (trayRemoveFile) {
        trayRemoveFile.addEventListener("click", () => {
            selectedUploadFile = null;
            if (attachmentTray) attachmentTray.classList.add("hidden");
        });
    }

    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files[0]) {
                handleComposerAttachment(e.target.files[0]);
            }
        });
    }
    if (imageInput) {
        imageInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files[0]) {
                handleComposerAttachment(e.target.files[0]);
            }
        });
    }

    if (attachBtn) {
        attachBtn.addEventListener("click", () => {
            if (fileInput) fileInput.click();
        });
    }
    if (imageBtn) {
        imageBtn.addEventListener("click", () => {
            if (imageInput) imageInput.click();
        });
    }
    if (voiceBtn) {
        voiceBtn.addEventListener("click", () => {
            triggerToast("Voice recording simulation started...", "success");
            setTimeout(() => {
                handleComposerAttachment({ name: "Voice_Recording_Draft.wav", size: 380 * 1024 });
            }, 2000);
        });
    }

    // Emoji Picker Trigger
    if (composerBtnEmoji && emojiPicker) {
        composerBtnEmoji.addEventListener("click", (e) => {
            e.stopPropagation();
            emojiPicker.classList.toggle("hidden");
        });

        document.addEventListener("click", () => {
            emojiPicker.classList.add("hidden");
        });

        document.querySelectorAll(".emoji-opt").forEach(btn => {
            btn.addEventListener("click", () => {
                const em = btn.getAttribute("data-emoji");
                if (composerTextbox) {
                    composerTextbox.value += em;
                }
            });
        });
    }

    // === Search Internal Chats logic ===
    if (chatSearchInput) {
        chatSearchInput.addEventListener("input", renderActiveChat);
    }
    if (chatSearchClose) {
        chatSearchClose.addEventListener("click", () => {
            if (chatSearchInput) {
                chatSearchInput.value = "";
                renderActiveChat();
            }
        });
    }

    // === Navigation Header Filter Switches ===
    if (filterAllBtn) {
        filterAllBtn.addEventListener("click", (e) => {
            e.preventDefault();
            activeCategoryFilter = "all";
            updateFilterTabs(filterAllBtn);
            renderConversationList();
        });
    }
    if (filterDirectBtn) {
        filterDirectBtn.addEventListener("click", (e) => {
            e.preventDefault();
            activeCategoryFilter = "direct";
            updateFilterTabs(filterDirectBtn);
            renderConversationList();
        });
    }
    if (filterChannelsBtn) {
        filterChannelsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            activeCategoryFilter = "channels";
            updateFilterTabs(filterChannelsBtn);
            renderConversationList();
        });
    }

    function updateFilterTabs(activeTab) {
        [filterAllBtn, filterDirectBtn, filterChannelsBtn].forEach(tab => {
            if (tab) {
                tab.className = "text-on-surface-variant hover:text-on-surface h-full flex items-center px-2 cursor-pointer";
            }
        });
        if (activeTab) {
            activeTab.className = "text-primary border-b-2 border-primary font-semibold h-full flex items-center px-2 cursor-pointer";
        }
    }

    // === Simulate Enterprise Live Messaging Traffic ===
    function runTrafficSimulation() {
        setInterval(() => {
            const mockResponses = [
                "I am pushing the latest sharding index tables up.",
                "Let's synchronize on the huddle review schedule.",
                "Ensure parameters are fully optimized prior to branch merge.",
                "Review complete. Pull request 142 approved."
            ];

            const indexToChat = Math.floor(Math.random() * conversations.length);
            const targetConvo = conversations[indexToChat];
            if (targetConvo && targetConvo.id !== currentActiveId) {
                const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                targetConvo.unreadCount++;
                targetConvo.messages.push({
                    id: "sim_" + Date.now(),
                    sender: targetConvo.type === 'direct' ? targetConvo.name : "Bhavani",
                    text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
                    time: timeNow,
                    self: false
                });

                if (typingIndicatorBar) {
                    typingIndicatorBar.innerHTML = `<span class="text-[11px] text-primary typing-indicator"><span></span><span></span><span></span> ${targetConvo.name} is typing...</span>`;
                    setTimeout(() => {
                        typingIndicatorBar.innerHTML = "";
                        saveDB();
                        renderConversationList();
                        if (headerUnreadDot) {
                            const totalUnreads = conversations.reduce((acc, c) => acc + (c.muted ? 0 : c.unreadCount), 0);
                            headerUnreadDot.style.display = totalUnreads > 0 ? '' : 'none';
                        }
                    }, 3000);
                }
            }
        }, 28000);
    }

    // Refresh simulation action handler
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            setButtonLoading(refreshBtn, 'Refreshing...', refreshBtnLabel);

            setTimeout(() => {
                clearButtonLoading(refreshBtn, 'Refresh', refreshBtnLabel);
                flashButtonSuccess(refreshBtn);
                triggerToast('All workspaces and messages up to date.', 'success');
            }, 1200);
        });
    }

    // Initialize Workspace Engine
    loadDB();
    renderAll();
    runTrafficSimulation();
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

// --- NOTIFICATION ENGINE ---
(function() {
  document.addEventListener("DOMContentLoaded", () => {
    const trigger = document.getElementById('notif-trigger');
    const menu = document.getElementById('notif-menu');
    const markAll = document.getElementById('mark-all-read');
    const viewAll = document.getElementById('view-all-notifs');
    const badge = document.getElementById('header-unread-count');
    const bellDot = document.getElementById('bell-dot');

    if (!trigger || !menu) return;

    // 1. Toggle Menu
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('dropdown-open');
    });

    // 2. Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && e.target !== trigger) {
        menu.classList.remove('dropdown-open');
      }
    });

    // 3. Mark individual as read
    document.querySelectorAll('.notif-row').forEach(row => {
      row.addEventListener('click', () => {
        const dot = row.querySelector('.dot-indicator');
        if (dot) dot.remove();
        updateCount();
      });
    });

    // 4. Mark all read
    if (markAll) {
      markAll.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.dot-indicator').forEach(dot => dot.remove());
        updateCount();
      });
    }

    // 5. Navigation
    if (viewAll) {
      viewAll.addEventListener('click', () => {
        window.location.href = "../notification_center/index.html";
      });
    }

    function updateCount() {
      const count = document.querySelectorAll('.dot-indicator').length;
      if (badge) badge.textContent = count;
      if (bellDot) bellDot.style.display = count > 0 ? 'block' : 'none';
    }

    updateCount(); // Run once on load
  });
})();
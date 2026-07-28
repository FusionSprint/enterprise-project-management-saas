const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const searchBtn = document.getElementById("searchBtn");
const filterBtn = document.getElementById("filterBtn");
const createWorkspaceBtn = document.getElementById("createWorkspaceBtn");
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

// NOTE: real Filter / Create Workspace / Search / Sort / Favorite / Archive
// behaviour is implemented in the "WORKSPACE MODULE" block appended below,
// which replaces these two placeholder handlers with working logic wired to
// the backend Workspace API.

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
            if (window.EPM_API) window.EPM_API.logout();

            // Redirect smoothly to the landing/login portal
            window.location.href = "../enterprise_landing_page/index.html";
        }, 1000);
    });
}
// =========================================================
// WORKSPACE MODULE (additive)
// Connects the Workspace Dashboard to the existing backend Workspace API
// (see ../shared/api-client.js). Implements: listing, create, edit,
// delete, archive, favorite, search, filter, sort, member invite/remove/
// role change, announcements, activity timeline, stats, and the
// Create-Project navigation hand-off to the existing Project Overview page.
// Nothing above this block was altered beyond removing the two placeholder
// listeners that this module now replaces with real behaviour.
// =========================================================
(function () {
  const API = window.EPM_API;
  if (!API) return;

  // ---- Auth guard: this page requires a signed-in user ----
  if (!API.isAuthenticated()) {
    window.location.href = "../login/index.html";
    return;
  }

  // ---- State ----
  let workspaces = [];
  let activeFilter = "all";
  let activeSort = "recent";
  let searchTerm = "";
  let editingWorkspaceId = null; // non-null when the modal is in "edit" mode

  const ICON_BY_COLOR_CLASS = { purple: "purple", orange: "orange", cyan: "cyan", success: "cyan", danger: "orange" };

  // ---- DOM refs ----
  const grid = document.getElementById("wsDashboardGrid");
  const searchInput = document.getElementById("wsSearchInput");
  const filterDropdown = document.getElementById("filterDropdown");
  const sortDropdown = document.getElementById("sortDropdown");
  const sortBtn = document.getElementById("sortBtn");
  const wsGreeting = document.getElementById("wsGreeting");
  const wsHeroSubtitle = document.getElementById("wsHeroSubtitle");

  const modalOverlay = document.getElementById("wsModalOverlay");
  const wsForm = document.getElementById("wsForm");
  const wsModalTitle = document.getElementById("wsModalTitle");
  const wsFormError = document.getElementById("wsFormError");
  const wsNameInput = document.getElementById("wsNameInput");
  const wsDescInput = document.getElementById("wsDescInput");
  const wsIconPicker = document.getElementById("wsIconPicker");
  const wsColorPicker = document.getElementById("wsColorPicker");
  const wsTypeSegmented = document.getElementById("wsTypeSegmented");
  const wsTagsInput = document.getElementById("wsTagsInput");
  const wsInviteInput = document.getElementById("wsInviteInput");
  const wsSubmitBtn = document.getElementById("wsSubmitBtn");
  const wsSubmitLabel = document.getElementById("wsSubmitLabel");
  const wsSubmitSpinner = document.getElementById("wsSubmitSpinner");

  // ---- Helpers ----
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

  function findWorkspace(id) {
    return workspaces.find((w) => w.id === id) || null;
  }

  function closeAllDropdowns(except) {
    document.querySelectorAll(".ws-dropdown-panel.open, .ws-card-menu-panel.open").forEach((el) => {
      if (el !== except) el.classList.remove("open");
    });
  }

  // ---- Rendering: workspace cards ----
  function applyHoverTilt(card) {
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
  }

  function getVisibleWorkspaces() {
    let list = workspaces.slice();

    if (activeFilter === "favorites") list = list.filter((w) => w.is_favorite && !w.is_archived);
    else if (activeFilter === "private") list = list.filter((w) => w.workspace_type === "Private" && !w.is_archived);
    else if (activeFilter === "public") list = list.filter((w) => w.workspace_type === "Public" && !w.is_archived);
    else if (activeFilter === "archived") list = list.filter((w) => w.is_archived);
    else list = list.filter((w) => !w.is_archived);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((w) =>
        w.workspace_name.toLowerCase().includes(term) ||
        (w.description || "").toLowerCase().includes(term) ||
        (w.tags || []).some((t) => t.toLowerCase().includes(term))
      );
    }

    if (activeSort === "name") {
      list.sort((a, b) => a.workspace_name.localeCompare(b.workspace_name));
    } else if (activeSort === "members") {
      list.sort((a, b) => b.member_count - a.member_count);
    } else if (activeSort === "created") {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    return list;
  }

  function renderCard(ws) {
    const card = document.createElement("article");
    card.className = "card small-card hover-card ws-workspace-card";
    card.dataset.id = ws.id;

    const tagsHtml = (ws.tags || []).slice(0, 4).map((t) => `<span>${escapeHtml(t)}</span>`).join("");

    card.innerHTML = `
      <div class="card-menu">
        <div class="workspace-icon ${ICON_BY_COLOR_CLASS[ws.color] || "purple"}">
          <span class="material-symbols-outlined">${escapeHtml(ws.icon || "rocket_launch")}</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px;">
          <button type="button" class="icon-btn ws-favorite-btn ${ws.is_favorite ? "is-favorite" : ""}" data-action="favorite" title="Favorite">
            <span class="material-symbols-outlined ${ws.is_favorite ? "filled" : ""}">star</span>
          </button>
          <div class="ws-card-menu-wrap">
            <button type="button" class="icon-btn" data-action="menu-toggle">
              <span class="material-symbols-outlined">more_horiz</span>
            </button>
            <div class="ws-card-menu-panel">
              <button type="button" class="ws-card-menu-item" data-action="open">
                <span class="material-symbols-outlined">visibility</span> Open Overview
              </button>
              <button type="button" class="ws-card-menu-item" data-action="edit">
                <span class="material-symbols-outlined">edit</span> Edit
              </button>
              <button type="button" class="ws-card-menu-item" data-action="archive">
                <span class="material-symbols-outlined">archive</span> ${ws.is_archived ? "Unarchive" : "Archive"}
              </button>
              <button type="button" class="ws-card-menu-item ws-danger-item" data-action="delete">
                <span class="material-symbols-outlined">delete</span> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <h3>${escapeHtml(ws.workspace_name)} ${ws.is_archived ? '<span class="ws-archived-badge">Archived</span>' : ""}</h3>
      <p>${escapeHtml(ws.description || "No description yet.")}</p>
      <div class="card-bottom">
        <span>
          <span class="material-symbols-outlined">group</span>
          ${ws.member_count} member${ws.member_count === 1 ? "" : "s"}
        </span>
        <span class="status ${ws.workspace_type === "Public" ? "blue" : "purple-dot"}">${escapeHtml(ws.workspace_type || "Private")}</span>
      </div>
      ${tagsHtml ? `<div class="ws-card-tags">${tagsHtml}</div>` : ""}
    `;

    applyHoverTilt(card);

    card.querySelector('[data-action="favorite"]').addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(ws.id);
    });

    const menuToggleBtn = card.querySelector('[data-action="menu-toggle"]');
    const menuPanel = card.querySelector(".ws-card-menu-panel");
    menuToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !menuPanel.classList.contains("open");
      closeAllDropdowns();
      if (willOpen) menuPanel.classList.add("open");
    });

    card.querySelector('[data-action="open"]').addEventListener("click", (e) => {
      e.stopPropagation();
      openOverview(ws.id);
    });
    card.querySelector('[data-action="edit"]').addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(ws.id);
    });
    card.querySelector('[data-action="archive"]').addEventListener("click", (e) => {
      e.stopPropagation();
      toggleArchive(ws.id);
    });
    card.querySelector('[data-action="delete"]').addEventListener("click", (e) => {
      e.stopPropagation();
      deleteWorkspace(ws.id);
    });

    card.addEventListener("click", () => openOverview(ws.id));

    return card;
  }

  function renderGrid() {
    grid.querySelectorAll(".ws-workspace-card, .ws-state-block, .ws-skeleton-card").forEach((el) => el.remove());
    const managementCard = grid.querySelector(".management-card");

    const visible = getVisibleWorkspaces();

    if (visible.length === 0) {
      const block = document.createElement("div");
      block.className = "ws-state-block";
      block.innerHTML = `
        <span class="material-symbols-outlined">workspaces</span>
        <h4>${workspaces.length === 0 ? "No workspaces yet" : "No workspaces match your search/filter"}</h4>
        <p>${workspaces.length === 0 ? "Create your first workspace to get started." : "Try a different search term or filter."}</p>
      `;
      grid.insertBefore(block, managementCard);
    } else {
      visible.forEach((ws) => grid.insertBefore(renderCard(ws), managementCard));
    }

    if (wsHeroSubtitle) {
      const activeCount = workspaces.filter((w) => !w.is_archived).length;
      wsHeroSubtitle.textContent = `Here's what's happening across your ${activeCount} active workspace${activeCount === 1 ? "" : "s"}.`;
    }
  }

  function renderSkeleton() {
    grid.querySelectorAll(".ws-workspace-card, .ws-state-block, .ws-skeleton-card").forEach((el) => el.remove());
    const managementCard = grid.querySelector(".management-card");
    for (let i = 0; i < 3; i++) {
      const sk = document.createElement("div");
      sk.className = "ws-skeleton-card";
      grid.insertBefore(sk, managementCard);
    }
  }

  // ---- Data loading ----
  async function loadWorkspaces() {
    renderSkeleton();
    try {
      workspaces = await API.workspaces.list();
      renderGrid();

      const user = API.getCurrentUser();
      if (user && wsGreeting) {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
        wsGreeting.textContent = `${greeting}, ${(user.full_name || "there").split(" ")[0]}`;
      }
    } catch (err) {
      grid.querySelectorAll(".ws-workspace-card, .ws-state-block, .ws-skeleton-card").forEach((el) => el.remove());
      const managementCard = grid.querySelector(".management-card");
      const block = document.createElement("div");
      block.className = "ws-state-block";
      block.innerHTML = `
        <span class="material-symbols-outlined">error</span>
        <h4>Couldn't load workspaces</h4>
        <p>${escapeHtml(err.message || "Something went wrong.")}</p>
      `;
      grid.insertBefore(block, managementCard);
      showToast(err.message || "Failed to load workspaces");
    }
  }

  // ---- Favorite / Archive / Delete ----
  async function toggleFavorite(id) {
    const ws = findWorkspace(id);
    if (!ws) return;
    try {
      const updated = ws.is_favorite ? await API.workspaces.unfavorite(id) : await API.workspaces.favorite(id);
      workspaces = workspaces.map((w) => (w.id === id ? updated : w));
      renderGrid();
      showToast(updated.is_favorite ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      showToast(err.message || "Couldn't update favorite");
    }
  }

  async function toggleArchive(id) {
    const ws = findWorkspace(id);
    if (!ws) return;
    try {
      const updated = ws.is_archived ? await API.workspaces.unarchive(id) : await API.workspaces.archive(id);
      workspaces = workspaces.map((w) => (w.id === id ? updated : w));
      renderGrid();
      showToast(updated.is_archived ? "Workspace archived" : "Workspace restored");
    } catch (err) {
      showToast(err.message || "Couldn't update workspace");
    }
    closeAllDropdowns();
  }

  async function deleteWorkspace(id) {
    const ws = findWorkspace(id);
    if (!ws) return;
    const confirmed = window.confirm(`Delete "${ws.workspace_name}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await API.workspaces.remove(id);
      workspaces = workspaces.filter((w) => w.id !== id);
      renderGrid();
      showToast("Workspace deleted");
    } catch (err) {
      showToast(err.message || "Couldn't delete workspace");
    }
    closeAllDropdowns();
  }

  // ---- Create / Edit modal ----
  function resetForm() {
    wsForm.reset();
    wsFormError.style.display = "none";
    wsIconPicker.querySelectorAll(".ws-icon-opt").forEach((b, i) => b.classList.toggle("active", i === 0));
    wsColorPicker.querySelectorAll(".ws-color-opt").forEach((b, i) => b.classList.toggle("active", i === 0));
    wsTypeSegmented.querySelectorAll(".ws-segment").forEach((b) => b.classList.toggle("active", b.dataset.type === "Private"));
    wsInviteInput.closest(".ws-field").style.display = "flex";
  }

  function openModal(editId) {
    editingWorkspaceId = editId || null;
    resetForm();

    if (editId) {
      const ws = findWorkspace(editId);
      if (!ws) return;
      wsModalTitle.textContent = "Edit Workspace";
      wsSubmitLabel.textContent = "Save Changes";
      wsNameInput.value = ws.workspace_name;
      wsDescInput.value = ws.description || "";
      wsTagsInput.value = (ws.tags || []).join(", ");
      wsIconPicker.querySelectorAll(".ws-icon-opt").forEach((b) => b.classList.toggle("active", b.dataset.icon === ws.icon));
      wsColorPicker.querySelectorAll(".ws-color-opt").forEach((b) => b.classList.toggle("active", b.dataset.color === ws.color));
      wsTypeSegmented.querySelectorAll(".ws-segment").forEach((b) => b.classList.toggle("active", b.dataset.type === ws.workspace_type));
      wsInviteInput.closest(".ws-field").style.display = "none"; // invites happen from the overview panel when editing
    } else {
      wsModalTitle.textContent = "Create Workspace";
      wsSubmitLabel.textContent = "Create Workspace";
    }

    modalOverlay.classList.add("open");
    closeAllDropdowns();
    setTimeout(() => wsNameInput.focus(), 50);
  }

  function closeModal() {
    modalOverlay.classList.remove("open");
    editingWorkspaceId = null;
  }

  wsIconPicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".ws-icon-opt");
    if (!btn) return;
    wsIconPicker.querySelectorAll(".ws-icon-opt").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });

  wsColorPicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".ws-color-opt");
    if (!btn) return;
    wsColorPicker.querySelectorAll(".ws-color-opt").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });

  wsTypeSegmented.addEventListener("click", (e) => {
    const btn = e.target.closest(".ws-segment");
    if (!btn) return;
    wsTypeSegmented.querySelectorAll(".ws-segment").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });

  document.getElementById("wsModalCloseBtn").addEventListener("click", closeModal);
  document.getElementById("wsCancelBtn").addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  wsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    wsFormError.style.display = "none";

    const name = wsNameInput.value.trim();
    if (name.length < 3) {
      wsFormError.textContent = "Workspace name must be at least 3 characters.";
      wsFormError.style.display = "block";
      return;
    }

    const icon = wsIconPicker.querySelector(".ws-icon-opt.active")?.dataset.icon || "rocket_launch";
    const color = wsColorPicker.querySelector(".ws-color-opt.active")?.dataset.color || "purple";
    const workspace_type = wsTypeSegmented.querySelector(".ws-segment.active")?.dataset.type || "Private";
    const tags = wsTagsInput.value.split(",").map((t) => t.trim()).filter(Boolean);

    wsSubmitBtn.disabled = true;
    wsSubmitSpinner.style.display = "inline-block";
    const originalLabel = wsSubmitLabel.textContent;
    wsSubmitLabel.textContent = editingWorkspaceId ? "Saving…" : "Creating…";

    try {
      if (editingWorkspaceId) {
        const updated = await API.workspaces.update(editingWorkspaceId, {
          workspace_name: name,
          description: wsDescInput.value.trim() || null,
          icon,
          color,
          workspace_type,
          tags,
        });
        workspaces = workspaces.map((w) => (w.id === updated.id ? updated : w));
        renderGrid();
        showToast("Workspace updated");
        closeModal();
      } else {
        const invite_emails = wsInviteInput.value
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);

        const created = await API.workspaces.create({
          workspace_name: name,
          description: wsDescInput.value.trim() || null,
          icon,
          color,
          workspace_type,
          tags,
          invite_emails: invite_emails.length ? invite_emails : undefined,
        });

        workspaces.unshift(created);
        renderGrid();
        showToast(`"${created.workspace_name}" created`);
        closeModal();
        openOverview(created.id); // "Open the Workspace Overview" after creation
      }
    } catch (err) {
      wsFormError.textContent = err.message || "Something went wrong. Please try again.";
      wsFormError.style.display = "block";
    } finally {
      wsSubmitBtn.disabled = false;
      wsSubmitSpinner.style.display = "none";
      wsSubmitLabel.textContent = originalLabel;
    }
  });

  document.getElementById("createWorkspaceBtn").addEventListener("click", () => openModal(null));
  document.getElementById("quickSettingsBtn").addEventListener("click", () => {
    if (workspaces.length === 0) { showToast("Create a workspace first"); return; }
    openModal((getVisibleWorkspaces()[0] || workspaces[0]).id);
  });
  document.getElementById("quickMemberMgmtBtn").addEventListener("click", () => {
    if (workspaces.length === 0) { showToast("Create a workspace first"); return; }
    openOverview((getVisibleWorkspaces()[0] || workspaces[0]).id);
  });
  document.getElementById("quickPermissionsBtn").addEventListener("click", () => {
    if (workspaces.length === 0) { showToast("Create a workspace first"); return; }
    openOverview((getVisibleWorkspaces()[0] || workspaces[0]).id);
    showToast("Roles are managed per-member in the Members tab");
  });

  // ---- Overview navigation ----
  // Per the updated Workspace flow, "Open Overview" (card click, menu item,
  // and the Quick Management actions) now navigates to the dedicated
  // Workspace Overview page instead of opening an in-page slide-over.
  // Members/Activity/Announcements management now lives there instead.
  function openOverview(id) {
    window.location.href = `../workspace_overview/index.html?id=${id}`;
  }

  // ---- Search / Filter / Sort ----
  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderGrid();
  });

  document.getElementById("filterBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !filterDropdown.classList.contains("open");
    closeAllDropdowns();
    if (willOpen) filterDropdown.classList.add("open");
  });

  filterDropdown.addEventListener("click", (e) => {
    const btn = e.target.closest(".ws-dropdown-item");
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    filterDropdown.querySelectorAll(".ws-dropdown-item").forEach((b) => b.classList.toggle("active", b === btn));
    document.getElementById("filterBtn").classList.toggle("active", activeFilter !== "all");
    filterDropdown.classList.remove("open");
    renderGrid();
    showToast(`Filter: ${btn.textContent.trim()}`);
  });

  sortBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !sortDropdown.classList.contains("open");
    closeAllDropdowns();
    if (willOpen) sortDropdown.classList.add("open");
  });

  sortDropdown.addEventListener("click", (e) => {
    const btn = e.target.closest(".ws-dropdown-item");
    if (!btn) return;
    activeSort = btn.dataset.sort;
    sortDropdown.querySelectorAll(".ws-dropdown-item").forEach((b) => b.classList.toggle("active", b === btn));
    sortDropdown.classList.remove("open");
    renderGrid();
  });

  document.addEventListener("click", () => closeAllDropdowns());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllDropdowns();
      if (modalOverlay.classList.contains("open")) closeModal();
    }
  });

  // ---- Init ----
  loadWorkspaces();
})();

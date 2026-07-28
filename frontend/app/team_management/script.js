document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn");
  const searchBtn = document.getElementById("searchBtn");
  const newMemberBtn = document.getElementById("newMemberBtn");
  const toast = document.getElementById("toast");

  function showToast(message) {
    if (!toast) {
      console.log(message);
      return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 1600);
  }

  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("show");
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      showToast("Search opened");
    });
  }

  if (newMemberBtn) {
    newMemberBtn.addEventListener("click", () => {
      showToast("New member form opened");
    });
  }

  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      showToast("Command palette triggered");
    }

    if (event.key === "Escape" && sidebar) {
      sidebar.classList.remove("show");
    }
  });

  const teamTabs = document.querySelectorAll(".team-tab");
  const teamViews = document.querySelectorAll(".team-view");

  function openTeamView(viewId, save = true) {
    const targetView = document.getElementById(viewId);
    const activeTab = document.querySelector(`.team-tab[data-team-view="${viewId}"]`);

    if (!targetView || !activeTab) return;

    teamTabs.forEach((tab) => {
      tab.classList.remove("active");
    });

    activeTab.classList.add("active");

    teamViews.forEach((view) => {
      view.classList.remove("active");
    });

    targetView.classList.add("active");

    if (save) {
      localStorage.setItem("activeTeamView", viewId);
    }

    showToast(activeTab.textContent.trim() + " opened");
  }

  teamTabs.forEach((tab) => {
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      openTeamView(tab.dataset.teamView, true);
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const initialTeamView = urlParams.get("tab");

  if (initialTeamView && document.getElementById(initialTeamView)) {
    openTeamView(initialTeamView, false);
  } else {
    const savedView = localStorage.getItem("activeTeamView");

    if (savedView && document.getElementById(savedView)) {
      openTeamView(savedView, false);
    }
  }

  const roleFilter = document.getElementById("roleFilter");

  if (roleFilter) {
    roleFilter.addEventListener("change", () => {
      showToast(roleFilter.value + " filter applied");
    });
  }

  const memberSearch = document.getElementById("memberSearch");

  if (memberSearch) {
    memberSearch.addEventListener("input", () => {
      const searchText = memberSearch.value.toLowerCase();
      const rows = document.querySelectorAll(".team-table tbody tr");

      rows.forEach((row) => {
        const rowText = row.textContent.toLowerCase();

        if (rowText.includes(searchText)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }

  document.querySelectorAll(".view-btn").forEach((button) => {
    button.addEventListener("click", () => {
      showToast("Member profile opened");
    });
  });

  document.querySelectorAll(".team-card").forEach((card) => {
    card.addEventListener("mousedown", () => {
      card.style.transform = "translateY(-4px) scale(0.99)";
    });

    card.addEventListener("mouseup", () => {
      card.style.transform = "";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
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

            // Redirect smoothly to the landing/login portal
            window.location.href = "../enterprise_landing_page/index.html";
        }, 1000);
    });
}
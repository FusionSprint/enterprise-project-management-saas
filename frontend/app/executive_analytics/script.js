const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const searchBtn = document.getElementById("searchBtn");
const dateBtn = document.getElementById("dateBtn");
const exportBtn = document.getElementById("exportBtn");
const toast = document.getElementById("toast");

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
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

if (dateBtn) {
  dateBtn.addEventListener("click", () => {
    showToast("Date range selector opened");
  });
}

if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    showToast("Report export started");
  });
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if ((event.ctrlKey || event.metaKey) && key === "k") {
    event.preventDefault();
    showToast("Command palette triggered");
  }

  if (event.key === "Escape" && sidebar) {
    sidebar.classList.remove("show");
  }
});

/* View switching inside Analytics */
const topNavLinks = document.querySelectorAll(".top-nav a");

const analyticsViews = {
  overview: document.getElementById("overviewView"),
  reports: document.getElementById("reportsView"),
  workload: document.getElementById("workloadView"),
  health: document.getElementById("healthView")
};

function openAnalyticsView(selectedView, shouldSave = true) {
  const targetView = analyticsViews[selectedView];
  const activeLink = document.querySelector(`.top-nav a[data-view="${selectedView}"]`);

  if (!targetView || !activeLink) return;

  topNavLinks.forEach((item) => {
    item.classList.remove("active");
  });

  activeLink.classList.add("active");

  Object.values(analyticsViews).forEach((view) => {
    if (view) {
      view.classList.remove("active");
    }
  });

  targetView.classList.add("active");

  if (shouldSave) {
    localStorage.setItem("activeAnalyticsView", selectedView);
  }

  showToast(`${selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} opened`);
}

topNavLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const selectedView = link.dataset.view;
    openAnalyticsView(selectedView, true);
  });
});

/* Keep same analytics tab after refresh */
const urlParams = new URLSearchParams(window.location.search);
const initialAnalyticsView = urlParams.get("tab");

if (initialAnalyticsView && analyticsViews[initialAnalyticsView]) {
  openAnalyticsView(initialAnalyticsView, false);
} else {
  const savedAnalyticsView = localStorage.getItem("activeAnalyticsView");

  if (savedAnalyticsView && analyticsViews[savedAnalyticsView]) {
    openAnalyticsView(savedAnalyticsView, false);
  }
}

/* Card press micro interaction */
document.querySelectorAll(".hover-card, .overview-card").forEach((card) => {
  card.addEventListener("mousedown", () => {
    card.style.transform = "translateY(-3px) scale(0.99)";
  });

  card.addEventListener("mouseup", () => {
    card.style.transform = "";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

// === Shared Logout Lifecycle controller ===
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

// =========================================================
// UNIFIED NOTIFICATION & MESSAGES DROPDOWN SYSTEM
// =========================================================
(function() {
    // Query elements securely
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

    // Scoped functions to recalculate metrics safely
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

    // Toggle Notifications Dropdown safely (Mutual Exclusion)
    if (notifTrigger && notifMenu) {
        notifTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            notifMenu.classList.toggle('dropdown-open');
            if (msgMenu) msgMenu.classList.remove('dropdown-open'); // <-- Closes messages
        });
    }

    // Toggle Messages Dropdown safely (Mutual Exclusion)
    if (msgTrigger && msgMenu) {
        msgTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            msgMenu.classList.toggle('dropdown-open');
            if (notifMenu) notifMenu.classList.remove('dropdown-open'); // <-- Closes notifications
        });
    }

    // Click outside dropdowns listener (Safely scoped)
    document.addEventListener('click', (e) => {
        if (notifMenu && !notifMenu.contains(e.target) && e.target !== notifTrigger) {
            notifMenu.classList.remove('dropdown-open');
        }
        if (msgMenu && !msgMenu.contains(e.target) && e.target !== msgTrigger) {
            msgMenu.classList.remove('dropdown-open');
        }
    });

    // Click individual notifications to read
    document.querySelectorAll('#notif-menu .notif-row').forEach(row => {
        row.addEventListener('click', () => {
            const dot = row.querySelector('.dot-indicator');
            if (dot) dot.remove();
            updateNotifBadge();
        });
    });

    // Click individual messages to read
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

    // Mark all notifications read
    if (markAllRead && notifMenu) {
        markAllRead.addEventListener('click', (e) => {
            e.stopPropagation();
            notifMenu.querySelectorAll('.dot-indicator').forEach(dot => dot.remove());
            updateNotifBadge();
            
            if (typeof triggerToast === 'function') triggerToast("All notifications marked as read");
            else if (typeof showToast === 'function') showToast("All notifications marked as read");
        });
    }

    // Mark all messages read
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

    // View All notifications link redirect
    if (viewAllNotifs) {
        viewAllNotifs.addEventListener('click', () => {
            window.location.href = "../notification_center/index.html";
        });
    }

    // Dropdown message search filter
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

    // Escape Key closing route
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (notifMenu) notifMenu.classList.remove('dropdown-open');
            if (msgMenu) msgMenu.classList.remove('dropdown-open');
        }
    });

    // Run counts immediately on page load
    updateNotifBadge();
    updateMsgBadge();
})();
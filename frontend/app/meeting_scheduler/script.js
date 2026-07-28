document.addEventListener("DOMContentLoaded", () => {
  // === 1. Sidebar & Toast Elements ===
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn");
  const searchBtn = document.getElementById("searchBtn");
  const toast = document.getElementById("toast");

  // === 2. Modal & Meeting Action Elements ===
  const newMeetingBtn = document.getElementById("newMeetingBtn");
  const scheduleModal = document.getElementById("scheduleModal");
  const scheduleMeetingBtn = document.getElementById("scheduleMeetingBtn");
  const modalMeetLinkInput = document.getElementById("modalMeetLinkInput");
  const heroMeetLink = document.getElementById("heroMeetLink");
  const joinMeetBtn = document.getElementById("joinMeetBtn");
  const meetLinkError = document.getElementById("meetLinkError");
  const viewAgendaBtn = document.getElementById("viewAgendaBtn");
  const agendaSection = document.getElementById("agendaSection");

  // === 3. Notification Dropdown Elements ===
  const notifTrigger = document.getElementById('notif-trigger');
  const notifMenu = document.getElementById('notif-menu');
  const notifList = document.getElementById('notif-list');
  const markAllBtn = document.getElementById('mark-all-read');
  const unreadBadge = document.getElementById('header-unread-count');
  const bellDot = document.getElementById('bell-dot');

  // === 4. Messages Dropdown Elements ===
  const msgTrigger = document.getElementById('msg-trigger');
  const msgMenu = document.getElementById('msg-menu');
  const searchInput = document.getElementById('msg-search');
  const msgItems = document.querySelectorAll('.msg-item');
  const markAllRead = document.getElementById('mark-msgs-read');
  const msgUnreadCount = document.getElementById('msg-unread-count');
  const msgDot = document.getElementById('msg-dot');
  const viewAllMessages = document.getElementById('view-all-messages');

  // === 5. Utility Helper Functions ===
  function showToast(message) {
    if (!toast) {
      console.log(message);
      return;
    }
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 1700);
  }

  function openModal() {
    if (scheduleModal) scheduleModal.classList.remove("hidden");
  }

  function closeModal() {
    if (scheduleModal) scheduleModal.classList.add("hidden");
  }

  function isValidGoogleMeetLink(link) {
    return link.startsWith("https://meet.google.com/") || link.startsWith("http://meet.google.com/");
  }

  function showMeetError(message) {
    if (meetLinkError) meetLinkError.textContent = message;
    if (joinMeetBtn) {
      joinMeetBtn.classList.add("shake");
      setTimeout(() => {
        joinMeetBtn.classList.remove("shake");
      }, 400);
    }
  }

  function clearMeetError() {
    if (meetLinkError) meetLinkError.textContent = "";
  }

  // === 6. Sidebar & Search Click Listeners ===
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

  // === 7. Modal Click Listeners ===
  if (newMeetingBtn) {
    newMeetingBtn.addEventListener("click", () => {
      openModal();
    });
  }

  document.querySelectorAll("[data-close-modal]").forEach((item) => {
    item.addEventListener("click", () => {
      closeModal();
    });
  });

  if (scheduleMeetingBtn) {
    scheduleMeetingBtn.addEventListener("click", () => {
      const modalMeetLink = modalMeetLinkInput ? modalMeetLinkInput.value.trim() : "";

      if (!modalMeetLink) {
        showToast("Please enter Meet link");
        if (modalMeetLinkInput) modalMeetLinkInput.focus();
        return;
      }

      if (!isValidGoogleMeetLink(modalMeetLink)) {
        showToast("Enter valid Google Meet link");
        if (modalMeetLinkInput) modalMeetLinkInput.focus();
        return;
      }

      if (heroMeetLink) {
        heroMeetLink.value = modalMeetLink;
      }

      closeModal();
      showToast("Meeting scheduled with Meet link");
    });
  }

  // === 8. Join Meet & Agenda Scroll Logic ===
  if (joinMeetBtn && heroMeetLink) {
    joinMeetBtn.addEventListener("click", () => {
      const meetLink = heroMeetLink.value.trim();
      clearMeetError();

      if (!meetLink) {
        showMeetError("Please enter Google Meet link");
        showToast("Please enter Meet link");
        heroMeetLink.focus();
        return;
      }

      if (!isValidGoogleMeetLink(meetLink)) {
        showMeetError("Enter valid Google Meet link");
        showToast("Enter valid Google Meet link");
        heroMeetLink.focus();
        return;
      }

      window.open(meetLink, "_blank");
      showToast("Opening Google Meet");
    });

    heroMeetLink.addEventListener("input", () => {
      clearMeetError();
    });
  }

  if (viewAgendaBtn && agendaSection) {
    viewAgendaBtn.addEventListener("click", () => {
      agendaSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      showToast("Full agenda opened");
    });
  }

  // === 9. Universal Dropdown Toggle Logic ===
  if (notifTrigger && notifMenu) {
    notifTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      notifMenu.classList.toggle('dropdown-open');
      if (msgMenu) msgMenu.classList.remove('dropdown-open'); // Close other dropdown
    });
  }

  if (msgTrigger && msgMenu) {
    msgTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      msgMenu.classList.toggle('dropdown-open');
      if (notifMenu) notifMenu.classList.remove('dropdown-open'); // Close other dropdown
    });
  }

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (notifMenu && !notifMenu.contains(e.target) && e.target !== notifTrigger) {
      notifMenu.classList.remove('dropdown-open');
    }
    if (msgMenu && !msgMenu.contains(e.target) && e.target !== msgTrigger) {
      msgMenu.classList.remove('dropdown-open');
    }
  });

  // === 10. Notification Actions & Counters ===
  function updateNotifCount() {
    if (!notifList) return;
    const count = notifList.querySelectorAll('.dot-indicator').length;
    if (unreadBadge) unreadBadge.textContent = count;
    if (bellDot) bellDot.style.display = count > 0 ? 'block' : 'none';
  }

  if (notifList) {
    // Mark single notification as read
    notifList.querySelectorAll('.notif-row').forEach(row => {
      row.addEventListener('click', () => {
        const dot = row.querySelector('.dot-indicator');
        if (dot) dot.remove();
        updateNotifCount();
      });
    });
  }

  if (markAllBtn) {
    markAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (notifList) {
        notifList.querySelectorAll('.dot-indicator').forEach(dot => dot.remove());
      }
      updateNotifCount();
      showToast("All notifications marked as read");
    });
  }

  // === 11. Message Actions & Search Filter ===
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
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

  if (markAllRead) {
    markAllRead.addEventListener('click', (e) => {
      e.stopPropagation();
      msgItems.forEach(item => {
        item.classList.add('is-read');
        item.classList.remove('unread');
        const dot = item.querySelector('.dot-indicator');
        if (dot) dot.remove();
      });
      if (msgUnreadCount) msgUnreadCount.style.display = 'none';
      if (msgDot) msgDot.style.display = 'none';
      showToast("All messages marked as read");
    });
  }

  if (viewAllMessages) {
    viewAllMessages.addEventListener('click', () => {
      showToast("Navigating to messages");
    });
  }

  // Simulate typing indicators
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

  // === 12. Global Keyboard Handlers ===
  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      showToast("Command palette triggered");
    }

    if (event.key === "Escape") {
      closeModal();
      if (sidebar) sidebar.classList.remove("show");
      if (notifMenu) notifMenu.classList.remove('dropdown-open');
      if (msgMenu) msgMenu.classList.remove('dropdown-open');
    }
  });

  // === 13. Tabs & View Navigation ===
  const meetingTabs = document.querySelectorAll(".meeting-tab");
  const meetingViews = document.querySelectorAll(".meeting-view");

  function openMeetingView(viewId, save = true) {
    const targetView = document.getElementById(viewId);
    const activeTab = document.querySelector(`.meeting-tab[data-meeting-view="${viewId}"]`);

    if (!targetView || !activeTab) return;

    meetingTabs.forEach((tab) => {
      tab.classList.remove("active");
    });
    activeTab.classList.add("active");

    meetingViews.forEach((view) => {
      view.classList.remove("active");
    });
    targetView.classList.add("active");

    if (save) {
      localStorage.setItem("activeMeetingView", viewId);
    }
    showToast(activeTab.textContent.trim() + " opened");
  }

  meetingTabs.forEach((tab) => {
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      openMeetingView(tab.dataset.meetingView, true);
    });
  });

  document.querySelectorAll("[data-meeting-view-button]").forEach((button) => {
    button.addEventListener("click", () => {
      openMeetingView(button.dataset.meetingViewButton, true);
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const initialMeetingView = urlParams.get("tab");

  if (initialMeetingView && document.getElementById(initialMeetingView)) {
    openMeetingView(initialMeetingView, false);
  } else {
    const savedView = localStorage.getItem("activeMeetingView");
    if (savedView && document.getElementById(savedView)) {
      openMeetingView(savedView, false);
    }
  }

  // === 14. Agenda Checklist Interactions ===
  const addActionBtn = document.getElementById("addActionBtn");
  if (addActionBtn) {
    addActionBtn.addEventListener("click", () => {
      showToast("New action item added");
    });
  }

  document.querySelectorAll(".action-item input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const item = checkbox.closest(".action-item");
      if (checkbox.checked) {
        if (item) item.classList.add("done");
        showToast("Action item completed");
      } else {
        if (item) item.classList.remove("done");
        showToast("Action item reopened");
      }
    });
  });

  // Card Press Actions
  document.querySelectorAll(".meeting-card").forEach((card) => {
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

  // Run initial state setups
  updateNotifCount();
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
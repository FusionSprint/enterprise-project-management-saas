// Shared, non-visual notification data binding for existing header bells.
(async function () {
  if (!window.EPM_API || !EPM_API.isAuthenticated()) return;
  const list = document.getElementById("notif-list");
  const badge = document.getElementById("header-unread-count");
  const dot = document.getElementById("bell-dot");
  const markAll = document.getElementById("mark-all-read");
  const escapeHtml = (value) => { const el = document.createElement("div"); el.textContent = value || ""; return el.innerHTML; };
  async function refresh() {
    try {
      const notifications = await EPM_API.notifications.list();
      const unread = notifications.filter((item) => !item.is_read).length;
      if (badge) badge.textContent = unread;
      if (dot) dot.style.display = unread ? "block" : "none";
      if (list) {
        list.innerHTML = notifications.slice(0, 5).map((item) => `<li class="notif-row ${item.is_read ? "" : "unread"}" data-notification-id="${item.id}"><span class="material-symbols-outlined icon-blue">notifications</span><div class="notif-info"><p class="notif-headline">${escapeHtml(item.title)}</p><p class="notif-sub">${escapeHtml(item.body)}</p><span class="notif-moment">${new Date(item.created_at).toLocaleString()}</span></div>${item.is_read ? "" : '<div class="dot-indicator"></div>'}</li>`).join("") || '<li class="notif-row"><div class="notif-info"><p class="notif-sub">No notifications yet.</p></div></li>';
        list.querySelectorAll("[data-notification-id]").forEach((item) => item.addEventListener("click", async () => { await EPM_API.notifications.markRead(item.dataset.notificationId); await refresh(); }));
      }
    } catch (err) { console.error("Couldn't load notification badge", err); }
  }
  if (markAll) markAll.addEventListener("click", async () => { await EPM_API.notifications.markAllRead(); await refresh(); });
  await refresh();
})();

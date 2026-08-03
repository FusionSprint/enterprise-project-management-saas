// One footer implementation for every app shell.
//
// Every main tab links this single file from /shared, so there is exactly
// one place to edit copy, links, support email, or credits. Any footer
// markup already in a page is removed first so pages can't drift into
// their own page-specific footer variants.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("footer.enterprise-footer").forEach((footer) => footer.remove());

  const PROJECT_NAME = "Acme Corp";
  const YEAR = new Date().getFullYear();

  // TODO: replace with your real support inbox.
  const SUPPORT_EMAIL = "saibhavaniyedla35@gmail.com";

  const TEAM = [
    { name: "Sai Bhavani Yedla", college: "CBIT" },
    { name: "Bhargavi", college: "Vasavi" },
  ];
  const TEAM_YEAR = "3rd Year";

  const links = [
    { label: "Home", href: "../workspace_dashboard/index.html" },
    { label: "About", action: "about",href: "#about.html" },
    { label: "Feedback", href: `mailto:${SUPPORT_EMAIL}?subject=Feedback` },
    { label: "Contact", href: `mailto:${SUPPORT_EMAIL}` },
  ];

  const footer = document.createElement("footer");
  footer.className = "enterprise-footer";
  footer.innerHTML = `
    <div class="enterprise-footer-inner">
      <div class="enterprise-footer-row">
        <span class="enterprise-footer-brand">${PROJECT_NAME}</span>
        <nav class="enterprise-footer-links" aria-label="Footer">
          ${links
            .map((link) =>
              link.action
                ? `<a href="#" data-footer-action="${link.action}">${link.label}</a>`
                : `<a href="${link.href}">${link.label}</a>`
            )
            .join("")}
        </nav>
        <span class="enterprise-footer-copyright">© ${YEAR} ${PROJECT_NAME}. All rights reserved.</span>
      </div>
      <div class="enterprise-footer-meta">
        <span class="enterprise-footer-support">Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></span>
        <span class="enterprise-footer-credits">
          Built by ${TEAM.map((m) => `${m.name} (${m.college})`).join(" &amp; ")} — ${TEAM_YEAR}
        </span>
      </div>
    </div>
  `;

  const shell =
    document.getElementById("pageContent") ||
    document.querySelector(".page-content") ||
    document.querySelector(".meeting-page, .team-page, .analytics-page, .dev-page") ||
    document.querySelector("main") ||
    document.body;
  shell.appendChild(footer);

  // "About" has nowhere dedicated to link to yet, so it opens a small
  // in-page panel with the project + team info instead of a dead "#" link.
  const aboutLink = footer.querySelector('[data-footer-action="about"]');
  if (aboutLink) {
    aboutLink.addEventListener("click", (event) => {
      event.preventDefault();
      let modal = document.getElementById("footerAboutModal");
      if (!modal) {
        modal = document.createElement("div");
        modal.id = "footerAboutModal";
        modal.className = "enterprise-footer-modal";
        modal.innerHTML = `
          <div class="enterprise-footer-modal-card">
            <button type="button" class="enterprise-footer-modal-close" aria-label="Close">&times;</button>
            <h3>${PROJECT_NAME}</h3>
            <p>Enterprise project management, built as a student project.</p>
            <p class="enterprise-footer-modal-team">
              ${TEAM.map((m) => `${m.name} — ${m.college}`).join("<br>")}<br>${TEAM_YEAR}
            </p>
            <p>Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
          </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener("click", (e) => {
          if (e.target === modal || e.target.classList.contains("enterprise-footer-modal-close")) {
            modal.remove();
          }
        });
      }
    });
  }
});
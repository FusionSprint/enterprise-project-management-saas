// One footer implementation for all app shells. Existing footer markup is
// removed so pages cannot drift into page-specific footer variants.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("footer.enterprise-footer").forEach((footer) => footer.remove());
  const footer = document.createElement("footer");
  footer.className = "enterprise-footer";
  footer.innerHTML = `<div class="enterprise-footer-grid"><section><div class="enterprise-footer-brand"><span class="enterprise-footer-mark">A</span><div><h4>Acme Corp</h4><p>Enterprise Engine</p></div></div><p>Simplifying collaborative workflows and enterprise operations.</p></section><section><h4>Engineering Blogs</h4><ul><li><a href="#">SSO Sharding Best Practices</a></li><li><a href="#">Next.js Performance Tuning</a></li><li><a href="#">MongoDB at Scale</a></li></ul></section><section><h4>Support & Contacts</h4><ul><li>ops@acme.corp</li><li>+1 (800) 555-ACME</li><li><a href="#">Submit Incident Ticket</a></li></ul></section><section><h4>Developer Broadcasts</h4><p>Get platform updates and downtime notices.</p><form class="enterprise-footer-newsletter"><input type="email" placeholder="dev@acme.corp" aria-label="Email address" required><button type="submit">JOIN</button></form></section></div><div class="enterprise-footer-bottom"><span>© 2026 Acme Corp. All rights reserved.<span class="enterprise-footer-version">v2.4.2-stable</span></span><span>All Systems Operational</span></div>`;
  footer.querySelector("form").addEventListener("submit", (event) => event.preventDefault());
  // App pages use different shell names, but their scrollable content is
  // consistently exposed by one of these containers. Appending there keeps
  // the footer reachable after every tab's content rather than outside a
  // fixed-height application shell.
  const shell = document.getElementById("pageContent") || document.querySelector(".page-content") || document.querySelector(".meeting-page, .team-page, .analytics-page, .dev-page") || document.querySelector("main") || document.body;
  shell.appendChild(footer);
});

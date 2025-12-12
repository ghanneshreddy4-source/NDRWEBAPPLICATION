// assets/js/notifications.js

(async function init() {
  requireAuthStudent();
  renderStudentLayout("Announcements");
  setSidebarActive("nav-notifications");

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <h2 class="section-title">Announcements</h2>
    <p style="font-size:0.85rem; color:#9ca3af; margin-bottom:1rem;">
      Stay up to date with the latest updates from your admins.
    </p>
    <div class="list" id="annList">
      <p style="font-size:0.85rem; color:#6b7280;">Loading...</p>
    </div>
  `;

  const listEl = document.getElementById("annList");

  try {
    const anns = await apiRequest("/announcements", "GET", null, false);

    if (!anns.length) {
      listEl.innerHTML =
        '<p style="font-size:0.85rem; color:#6b7280;">No announcements yet.</p>';
      return;
    }

    listEl.innerHTML = anns
      .map((a) => {
        const created = new Date(a.createdAt);
        const dateStr = created.toLocaleDateString();
        return `
          <div class="list-item">
            <div class="list-item-title">
              ${a.isPinned ? "📌 " : ""}${a.title}
            </div>
            <div class="list-item-sub" style="margin-top:0.25rem;">
              ${a.body}
            </div>
            <div style="margin-top:0.4rem; font-size:0.75rem; color:#6b7280;">
              Posted on ${dateStr}
            </div>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("student announcements error:", err);
    listEl.innerHTML = `<p style="color:#fda4af; font-size:0.85rem;">${err.message}</p>`;
  }
})();

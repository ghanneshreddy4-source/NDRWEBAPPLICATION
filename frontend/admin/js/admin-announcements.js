// admin/js/admin-announcements.js

(async function init() {
  requireAuthAdmin();
  renderAdminLayout("Announcements");

  // 🔥 FIX: this ID must match the link in admin-auth.js
  setAdminNavActive("admin-nav-ann");

  const content = document.getElementById("adminPageContent");
  content.innerHTML = `
    <section class="section">
      <h2 class="section-title">Create Announcement</h2>
      <div class="card">
        <form id="annForm" class="admin-form">
          <div>
            <label for="annTitle">Title</label>
            <input id="annTitle" required placeholder="e.g. Weekly Test" />
          </div>
          <div>
            <label for="annBody">Message</label>
            <textarea id="annBody" rows="3" required placeholder="Announcement details..."></textarea>
          </div>
          <div style="display:flex; align-items:center; gap:0.4rem; font-size:0.8rem;">
            <input type="checkbox" id="annPinned" />
            <label for="annPinned" style="margin:0;">Pin this announcement</label>
          </div>
          <p id="annMsg" class="admin-msg"></p>
          <button type="submit" class="admin-btn">Publish</button>
        </form>
      </div>
    </section>

    <section class="section" style="margin-top:1.5rem;">
      <h3 class="section-title">Existing Announcements</h3>
      <div class="list" id="annList">
        <p style="font-size:0.85rem; color:#6b7280;">Loading...</p>
      </div>
    </section>
  `;

  const annForm = document.getElementById("annForm");
  const annMsg = document.getElementById("annMsg");
  const annList = document.getElementById("annList");

  async function loadAnnouncements() {
    annList.innerHTML = `<p style="color:#9ca3af;">Loading...</p>`;

    try {
      const anns = await apiRequest("/announcements", "GET", null, false);

      if (!anns.length) {
        annList.innerHTML = `<p style="color:#9ca3af;">No announcements yet.</p>`;
        return;
      }

      annList.innerHTML = "";
      anns.forEach((a) => {
        const created = new Date(a.createdAt).toLocaleString();

        const div = document.createElement("div");
        div.className = "list-item";

        div.innerHTML = `
          <div class="list-item-title">${a.isPinned ? "📌 " : ""}${a.title}</div>
          <div class="list-item-sub" style="margin-top:0.25rem;">${a.body}</div>

          <div style="margin-top:0.4rem; font-size:0.75rem; color:#6b7280;">
            Posted on ${created}
          </div>

          <div style="margin-top:0.5rem; display:flex; gap:0.5rem;">
            <button class="btn secondary btn-small" data-id="${a.id}" data-action="pin">
              ${a.isPinned ? "Unpin" : "Pin"}
            </button>
            <button class="btn secondary btn-small" data-id="${a.id}" data-action="delete">
              Delete
            </button>
          </div>
        `;

        annList.appendChild(div);
      });

      // attach action listeners
      annList.querySelectorAll("button[data-action]").forEach((btn) => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          const action = btn.dataset.action;

          try {
            if (action === "delete") {
              await apiRequest(`/announcements/${id}`, "DELETE", null, true);
            } else if (action === "pin") {
              // if current label is "Pin", we are setting pinned = true
              const newPinnedState = btn.textContent.trim() === "Pin";
              await apiRequest(
                `/announcements/${id}`,
                "PUT",
                { isPinned: newPinnedState },
                true
              );
            }
            await loadAnnouncements();
          } catch (err) {
            alert("Error: " + err.message);
          }
        };
      });
    } catch (err) {
      console.error("loadAnnouncements error:", err);
      annList.innerHTML = `<p style="color:#f87171;">Server error</p>`;
    }
  }

  annForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    annMsg.style.color = "#9ca3af";
    annMsg.textContent = "Publishing...";

    const title = document.getElementById("annTitle").value.trim();
    const body = document.getElementById("annBody").value.trim();
    const isPinned = document.getElementById("annPinned").checked;

    try {
      await apiRequest("/announcements", "POST", { title, body, isPinned }, true);

      annMsg.style.color = "#4ade80";
      annMsg.textContent = "Published!";
      annForm.reset();

      await loadAnnouncements();
    } catch (err) {
      annMsg.style.color = "#f87171";
      annMsg.textContent = err.message;
    }
  });

  await loadAnnouncements();
})();

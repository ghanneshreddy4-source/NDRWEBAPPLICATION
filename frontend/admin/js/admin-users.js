// admin/js/admin-users.js
document.addEventListener("DOMContentLoaded", async () => {
  const user = requireAuthAdmin();
  renderAdminLayout("Approve Users");
  setAdminNavActive("admin-nav-users");

  const container = document.getElementById("adminPageContent");
  container.innerHTML = `
    <h2 class="section-title">Pending Student Approvals</h2>
    <div id="pendingList" class="list">
      <p style="font-size:0.85rem; color:#6b7280;">Loading...</p>
    </div>
  `;

  const pendingListEl = document.getElementById("pendingList");

  try {
    const pending = await apiRequest("/admin/pending-users", "GET", null, true);

    if (!pending.length) {
      pendingListEl.textContent = "No pending students.";
      return;
    }

    pendingListEl.innerHTML = pending
      .map(
        (u) => `
      <div class="list-item pending-user-card">
        <div>
          <div class="list-item-title">
            <strong>${u.name}</strong> (${u.email})
          </div>
          <div class="list-item-sub">
            Registered: ${new Date(u.createdAt).toLocaleString()}
          </div>
        </div>
        <button class="admin-btn btn-approve" data-id="${u.id}">
          Approve
        </button>
      </div>
    `
      )
      .join("");

    // Event delegation for approve buttons
    pendingListEl.addEventListener("click", async (e) => {
      const btn = e.target.closest(".btn-approve");
      if (!btn) return;

      const id = btn.getAttribute("data-id");
      btn.disabled = true;
      btn.textContent = "Approving...";

      try {
        // ✅ IMPORTANT FIX: use PUT (matches backend route)
        await apiRequest(`/admin/approve-user/${id}`, "PUT", null, true);

        btn.parentElement.remove();
        if (!pendingListEl.children.length) {
          pendingListEl.textContent = "No pending students.";
        }
      } catch (err) {
        btn.disabled = false;
        btn.textContent = "Approve";
        alert(err.message || "Failed to approve");
      }
    });
  } catch (err) {
    console.error(err);
    pendingListEl.textContent = "Server error";
  }
});

// admin/js/admin-queries.js

(async function init() {
  requireAuthAdmin();
  renderAdminLayout("Student Queries");
  setAdminNavActive("admin-nav-queries");

  const content = document.getElementById("adminPageContent");
  content.innerHTML = `
    <h2 class="section-title">Student Queries</h2>
    <div id="queryList" class="list">
      <p style="font-size:0.85rem; color:#6b7280;">Loading...</p>
    </div>
  `;

  const queryList = document.getElementById("queryList");

  async function loadQueries() {
    queryList.innerHTML =
      '<p style="font-size:0.85rem; color:#6b7280;">Loading...</p>';

    try {
      // GET /api/queries (admin)
      const queries = await apiRequest("/queries", "GET", null, true);

      if (!queries.length) {
        queryList.innerHTML =
          '<p style="font-size:0.85rem; color:#6b7280;">No queries.</p>';
        return;
      }

      queryList.innerHTML = "";

      queries.forEach((q) => {
        const item = document.createElement("div");
        item.className = "list-item";
        item.dataset.id = q.id; // ✅ store id here

        item.innerHTML = `
          <div class="list-item-title">${q.message}</div>
          <div class="list-item-sub">
            From: ${q.user?.name || ""} (${q.user?.email || ""})<br/>
            Status: ${q.status}<br/>
            ${
              q.adminReply
                ? `<span style="color:#4ade80;">Reply:</span> ${q.adminReply}<br/>`
                : ""
            }
            <span style="color:#6b7280;">${new Date(
              q.createdAt
            ).toLocaleString()}</span>
          </div>
          <div style="margin-top:0.4rem;">
            <textarea
              class="replyText"
              rows="2"
              placeholder="Type reply..."
              style="width:100%; padding:0.4rem 0.5rem; border-radius:0.6rem; border:1px solid #1f2937; background:#020617; color:#f9fafb;"
            >${q.adminReply || ""}</textarea>
            <button class="admin-btn replyBtn" style="margin-top:0.3rem;">
              ${q.status === "answered" ? "Update Reply" : "Send Reply"}
            </button>
          </div>
        `;

        const replyBtn = item.querySelector(".replyBtn");
        const replyText = item.querySelector(".replyText");

        replyBtn.addEventListener("click", async () => {
          const text = replyText.value.trim();
          if (!text) {
            alert("Reply cannot be empty");
            return;
          }

          const id = item.dataset.id; // ✅ always defined now
          if (!id) {
            alert("Query id missing");
            return;
          }

          replyBtn.disabled = true;
          replyBtn.textContent = "Sending...";

          try {
            await apiRequest(
              `/queries/${id}/reply`,
              "PUT",
              { adminReply: text, status: "answered" },
              true
            );
            await loadQueries(); // refresh list
          } catch (err) {
            alert(err.message);
            replyBtn.disabled = false;
            replyBtn.textContent = "Send Reply";
          }
        });

        queryList.appendChild(item);
      });
    } catch (err) {
      console.error("Admin queries error:", err);
      queryList.innerHTML = `<p style="color:#fda4af; font-size:0.85rem;">${err.message}</p>`;
    }
  }

  loadQueries();
})();

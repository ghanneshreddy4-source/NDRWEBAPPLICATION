// assets/js/queries.js

(async function init() {
  requireAuthStudent();
  renderStudentLayout("Queries");
  setSidebarActive("nav-queries");

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <h2 class="section-title">Queries / Doubts</h2>
    <div class="card" style="margin-bottom:1rem;">
      <div class="card-title">Ask a question to admin</div>
      <form id="queryForm" style="margin-top:0.8rem; display:flex; flex-direction:column; gap:0.7rem;">
        <textarea
          id="queryText"
          rows="3"
          required
          placeholder="Type your query..."
        ></textarea>
        <button
          type="submit"
          class="btn"
          style="align-self:flex-start; font-size:0.85rem;"
        >
          Submit Query
        </button>
        <p id="queryMsg" style="font-size:0.85rem;"></p>
      </form>
    </div>

    <div>
      <h3 class="section-title">My previous queries</h3>
      <div class="list" id="queryList">
        <p style="font-size:0.85rem; color:#6b7280;">Loading...</p>
      </div>
    </div>
  `;

  const form = document.getElementById("queryForm");
  const msgEl = document.getElementById("queryMsg");
  const queryList = document.getElementById("queryList");

  async function loadMyQueries() {
    queryList.innerHTML =
      '<p style="font-size:0.85rem; color:#6b7280;">Loading...</p>';
    try {
      const data = await apiRequest("/queries/my", "GET", null, true);
      if (!data.length) {
        queryList.innerHTML =
          '<p style="font-size:0.85rem; color:#6b7280;">No queries yet.</p>';
        return;
      }

      queryList.innerHTML = "";
      data.forEach((q) => {
        const item = document.createElement("div");
        item.className = "list-item";
        item.innerHTML = `
          <div class="list-item-title">${q.message}</div>
          <div class="list-item-sub">
            Status: ${q.status}
            ${
              q.adminReply
                ? `<br/><span style="color:#16a34a;">Admin reply:</span> ${q.adminReply}`
                : ""
            }
          </div>
        `;
        queryList.appendChild(item);
      });
    } catch (err) {
      queryList.innerHTML = `<p style="color:#ef4444; font-size:0.85rem;">${err.message}</p>`;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.style.color = "#6b7280";
    msgEl.textContent = "Sending...";

    const message = document.getElementById("queryText").value.trim();

    try {
      await apiRequest("/queries", "POST", { message }, true);
      msgEl.style.color = "#16a34a";
      msgEl.textContent = "Query submitted.";
      form.reset();
      loadMyQueries();
    } catch (err) {
      msgEl.style.color = "#ef4444";
      msgEl.textContent = err.message;
    }
  });

  loadMyQueries();
})();

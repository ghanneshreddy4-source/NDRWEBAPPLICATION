// admin/js/admin-dashboard.js

(async function init() {
  requireAuthAdmin();
  renderAdminLayout("Dashboard");
  setAdminNavActive("admin-nav-dashboard");

  const content = document.getElementById("adminPageContent");
  content.innerHTML = `
    <h2 class="section-title">Overview</h2>
    <div class="dashboard-grid" id="adminStats">
      <p style="font-size:0.85rem; color:#6b7280;">Loading stats...</p>
    </div>
  `;

  const statsEl = document.getElementById("adminStats");

  try {
    const stats = await apiRequest("/admin/stats", "GET", null, true);
    statsEl.innerHTML = `
      <div class="card">
        <div class="card-title">Total Users</div>
        <div class="card-value">${stats.totalUsers}</div>
      </div>
      <div class="card">
        <div class="card-title">Students</div>
        <div class="card-value">${stats.totalStudents}</div>
      </div>
      <div class="card">
        <div class="card-title">Approved Students</div>
        <div class="card-value">${stats.approvedStudents}</div>
      </div>
      <div class="card">
        <div class="card-title">Courses</div>
        <div class="card-value">${stats.totalCourses}</div>
      </div>
      <div class="card">
        <div class="card-title">Topic Tests</div>
        <div class="card-value">${stats.totalTests}</div>
      </div>
      <div class="card">
        <div class="card-title">Major Tests</div>
        <div class="card-value">${stats.totalMajorTests}</div>
      </div>
      <div class="card">
        <div class="card-title">Results</div>
        <div class="card-value">${stats.totalResults}</div>
      </div>
    `;
  } catch (err) {
    statsEl.innerHTML = `<p style="color:#fda4af; font-size:0.85rem;">${err.message}</p>`;
  }
})();

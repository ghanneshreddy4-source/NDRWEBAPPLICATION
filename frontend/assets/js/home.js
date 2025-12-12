// assets/js/home.js

(async function init() {
  const user = requireAuthStudent();
  renderStudentLayout("Dashboard");
  setSidebarActive("nav-home");

  const content = document.getElementById("pageContent");

  content.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h2 class="section-title">Welcome, ${user.name}</h2>
        <p class="dashboard-subtitle">
          Track your course progress, topic tests, and weekly majors in one place.
        </p>
      </div>
    </div>

    <div class="dashboard-grid" id="dashStats">
      <!-- filled via JS -->
    </div>

    <div class="dashboard-row">
      <div class="card">
        <div class="card-title">Recent Announcements</div>
        <div class="list" id="homeAnnouncements">
          <p class="muted-small">Loading...</p>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Next Steps</div>
        <ul class="next-steps-list" id="nextSteps">
          <li class="muted-small">Loading...</li>
        </ul>
      </div>
    </div>
  `;

  const dashStats = document.getElementById("dashStats");

  // For now static placeholders – later you can pull from API
  const overallProgress = 42; // %
  const avgScore = 78; // %
  const timeSpent = "3h 15m this week";

  dashStats.innerHTML = `
    <div class="card stat-card">
      <div class="card-title">Overall Progress</div>
      <div class="card-value">${overallProgress}%</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${overallProgress}%;"></div>
      </div>
      <p class="muted-small">Based on completed topics across all courses.</p>
    </div>

    <div class="card stat-card">
      <div class="card-title">Average Score</div>
      <div class="card-value">${avgScore}%</div>
      <p class="muted-small">Across your latest topic-wise and major tests.</p>
    </div>

    <div class="card stat-card">
      <div class="card-title">Time Spent</div>
      <div class="card-value">${timeSpent}</div>
      <p class="muted-small">Active time inside tests and practice modules.</p>
    </div>

    <div class="card stat-card">
      <div class="card-title">Account</div>
      <div class="card-value">${user.isApproved ? "Approved" : "Pending"}</div>
      <p class="muted-small">Role: <strong>${user.role}</strong></p>
    </div>
  `;

  // ------- Announcements ----------
  try {
    const anns = await apiRequest("/announcements", "GET", null, false);
    const annContainer = document.getElementById("homeAnnouncements");

    if (!anns.length) {
      annContainer.innerHTML =
        '<p class="muted-small">No announcements yet.</p>';
    } else {
      annContainer.innerHTML = "";
      anns.slice(0, 4).forEach((a) => {
        const div = document.createElement("div");
        div.className = "list-item";
        const dateStr = new Date(a.createdAt).toLocaleDateString();
        div.innerHTML = `
          <div class="list-item-title">
            ${a.isPinned ? "📌 " : ""}${a.title}
          </div>
          <div class="list-item-sub">${a.body}</div>
          <div class="muted-tiny">Posted on ${dateStr}</div>
        `;
        annContainer.appendChild(div);
      });
    }
  } catch (err) {
    console.error(err);
    const annContainer = document.getElementById("homeAnnouncements");
    annContainer.innerHTML =
      '<p class="muted-small" style="color:#b91c1c;">Unable to load announcements.</p>';
  }

  // ------- Next Steps (simple suggestions) ----------
  const nextSteps = document.getElementById("nextSteps");
  nextSteps.innerHTML = `
    <li>Continue your current course from the <strong>Courses</strong> tab.</li>
    <li>Attempt the latest <strong>Topic Test</strong> to boost your average score.</li>
    <li>Check upcoming <strong>Major Tests</strong> and plan your revision.</li>
  `;
})();

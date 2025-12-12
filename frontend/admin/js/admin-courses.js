// admin/js/admin-courses.js

(async function init() {
  requireAuthAdmin();
  renderAdminLayout("Courses");
  setAdminNavActive("admin-nav-course");

  const content = document.getElementById("adminPageContent");
  content.innerHTML = `
    <h2 class="section-title">Add Course</h2>
    <div class="card">
      <form id="courseForm" class="admin-form">
        <div>
          <label>Course Name</label>
          <input id="courseName" required placeholder="e.g. ABAP, SAP, Snowflake" />
        </div>
        <div>
          <label>Course Code (unique)</label>
          <input id="courseCode" required placeholder="e.g. ABAP101, SAP01" />
        </div>
        <div>
          <label>Description</label>
          <textarea id="courseDesc" rows="2" placeholder="Short description..."></textarea>
        </div>
        <button type="submit" class="admin-btn">Create Course</button>
        <p id="courseMsg" class="admin-msg"></p>
      </form>
    </div>

    <h3 class="section-title" style="margin-top:1.5rem;">Existing Courses</h3>
    <div id="courseList" class="courses-grid">
      <p style="font-size:0.85rem; color:#6b7280;">Loading...</p>
    </div>
  `;

  const form = document.getElementById("courseForm");
  const msgEl = document.getElementById("courseMsg");
  const courseList = document.getElementById("courseList");

  async function loadCourses() {
    courseList.innerHTML =
      '<p style="font-size:0.85rem; color:#6b7280;">Loading...</p>';
    try {
      const courses = await apiRequest("/courses", "GET", null, false);
      if (!courses.length) {
        courseList.innerHTML =
          '<p style="font-size:0.85rem; color:#6b7280;">No courses yet.</p>';
        return;
      }
      courseList.innerHTML = "";
      courses.forEach((c) => {
        const card = document.createElement("div");
        card.className = "course-card";
        card.innerHTML = `
          <div class="course-code">${c.code}</div>
          <div class="course-name">${c.name}</div>
          <div class="course-desc">${
            c.description || "No description provided."
          }</div>
        `;
        courseList.appendChild(card);
      });
    } catch (err) {
      courseList.innerHTML = `<p style="color:#fda4af; font-size:0.85rem;">${err.message}</p>`;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.style.color = "#9ca3af";
    msgEl.textContent = "Creating...";

    const name = document.getElementById("courseName").value.trim();
    const code = document.getElementById("courseCode").value.trim();
    const description = document.getElementById("courseDesc").value.trim();

    try {
      await apiRequest(
        "/courses",
        "POST",
        { name, code, description },
        true
      );
      msgEl.style.color = "#4ade80";
      msgEl.textContent = "Course created.";
      form.reset();
      loadCourses();
    } catch (err) {
      msgEl.style.color = "#fda4af";
      msgEl.textContent = err.message;
    }
  });

  loadCourses();
})();

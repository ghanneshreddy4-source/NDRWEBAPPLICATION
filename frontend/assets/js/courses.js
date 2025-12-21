// frontend/assets/js/courses.js
(async function init() {
  requireAuthStudent();
  renderStudentLayout("Courses");
  setSidebarActive("nav-courses");

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <h2 class="section-title">Courses</h2>
    <p style="font-size:0.85rem; color:#9ca3af; margin-bottom:1rem;">
      Choose a course to view its topics and tests.
    </p>
    <div id="coursesContainer" class="courses-grid">
      <p style="font-size:0.85rem; color:#6b7280;">Loading courses...</p>
    </div>
  `;

  const container = document.getElementById("coursesContainer");

  try {
    const courses = await apiRequest("/courses", "GET", null, false);
    if (!courses.length) {
      container.innerHTML = `<p style="font-size:0.85rem; color:#6b7280;">No courses available.</p>`;
      return;
    }

    // ✅ Ensure allowedCourses is always a numeric array
    const user = JSON.parse(localStorage.getItem("ndr_logged_user") || "{}");
    let allowedCourses = [];

    if (user.allowedCourses) {
      if (Array.isArray(user.allowedCourses)) {
        allowedCourses = user.allowedCourses;
      } else if (typeof user.allowedCourses === "string") {
        try {
          // handle string like "[2]" or "{2}"
          allowedCourses = JSON.parse(
            user.allowedCourses.replace(/[{}]/g, "[").replace(/}/g, "]")
          );
        } catch {
          allowedCourses = [];
        }
      }
    }

    // fallback
    if (!Array.isArray(allowedCourses)) allowedCourses = [];
    allowedCourses = allowedCourses.map((x) => parseInt(x, 10)).filter(Boolean);

    console.log("🎯 Allowed courses:", allowedCourses);

    container.innerHTML = "";
    courses.forEach((c) => {
      const courseId = parseInt(c.id, 10);
      const isLocked = !allowedCourses.includes(courseId);

      const card = document.createElement("div");
      card.className = "course-card";
      card.innerHTML = `
        <div class="course-code">${c.code || ""}</div>
        <div class="course-name">${c.name}</div>
        <div class="course-desc">${c.description || "No description provided."}</div>
        ${
          isLocked
            ? `<button class="locked-btn" disabled><i class="fas fa-lock"></i> Locked</button>`
            : `<button class="know-btn"><i class="fas fa-book-open"></i> Open Course</button>`
        }
      `;

      if (!isLocked) {
        card.querySelector(".know-btn").addEventListener("click", () => {
          localStorage.setItem("ndr_selected_course", courseId);
          localStorage.setItem("ndr_selected_course_name", c.name);
          window.location.href = "topics.html";
        });
      }

      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Error loading courses:", err);
    container.innerHTML = `<p style="color:#fda4af; font-size:0.85rem;">${err.message}</p>`;
  }
})();

// assets/js/courses.js

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
      container.innerHTML =
        '<p style="font-size:0.85rem; color:#6b7280;">No courses available.</p>';
      return;
    }

    container.innerHTML = "";
    courses.forEach((c) => {
      const card = document.createElement("div");
      card.className = "course-card";
      card.innerHTML = `
        <div class="course-code">${c.code}</div>
        <div class="course-name">${c.name}</div>
        <div class="course-desc">${c.description || "No description provided."}</div>
      `;
      card.addEventListener("click", () => {
        localStorage.setItem("ndr_selected_course", c.id);
        localStorage.setItem("ndr_selected_course_name", c.name);
        window.location.href = "topics.html";
      });
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p style="color:#fda4af; font-size:0.85rem;">${err.message}</p>`;
  }
})();

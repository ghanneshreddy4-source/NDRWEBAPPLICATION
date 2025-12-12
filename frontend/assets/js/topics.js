// assets/js/topics.js

(async function init() {
  requireAuthStudent();
  renderStudentLayout("Topics");
  setSidebarActive("nav-courses");

  const courseId = localStorage.getItem("ndr_selected_course");
  const courseName = localStorage.getItem("ndr_selected_course_name");

  if (!courseId) {
    window.location.href = "courses.html";
    return;
  }

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <h2 class="section-title">Topics - ${courseName || ""}</h2>
    <p style="font-size:0.85rem; color:#9ca3af; margin-bottom:1rem;">
      Choose a topic to view and take the tests.
    </p>
    <div id="topicsContainer" class="courses-grid">
      <p style="font-size:0.85rem; color:#6b7280;">Loading topics...</p>
    </div>
  `;

  const container = document.getElementById("topicsContainer");

  try {
    const topics = await apiRequest(
      `/courses/${courseId}/topics`,
      "GET",
      null,
      false
    );
    if (!topics.length) {
      container.innerHTML =
        '<p style="font-size:0.85rem; color:#6b7280;">No topics available for this course.</p>';
      return;
    }

    container.innerHTML = "";
    topics.forEach((t) => {
      const card = document.createElement("div");
      card.className = "course-card";

      const primaryRes = (t.resources && t.resources[0]) || null;

      card.innerHTML = `
        <div class="course-code">Topic</div>
        <div class="course-name">${t.name}</div>
        <div class="course-desc">${t.description || "No description provided."}</div>
      `;

      if (primaryRes && primaryRes.url) {
        const btn = document.createElement("button");
        btn.textContent =
          primaryRes.type === "video" ? "Watch Topic Video" : "Open Topic Resource";
        btn.style.marginTop = "0.5rem";
        btn.style.fontSize = "0.8rem";
        btn.style.padding = "0.3rem 0.7rem";
        btn.style.borderRadius = "999px";
        btn.style.border = "none";
        btn.style.background = "#38bdf8";
        btn.style.color = "#020617";
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          window.open(primaryRes.url, "_blank");
        });
        card.appendChild(btn);
      }

      card.addEventListener("click", () => {
        localStorage.setItem("ndr_selected_topic", t.id);
        localStorage.setItem("ndr_selected_topic_name", t.name);
        window.location.href = "tests.html";
      });
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p style="color:#fda4af; font-size:0.85rem;">${err.message}</p>`;
  }
})();

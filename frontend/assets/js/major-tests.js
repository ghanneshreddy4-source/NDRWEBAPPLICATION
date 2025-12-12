// assets/js/major-tests.js

let currentMajorTest = null;

(async function init() {
  requireAuthStudent();
  renderStudentLayout("Major Tests");
  setSidebarActive("nav-major-tests");

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <h2 class="section-title">Major Tests</h2>
    <p style="font-size:0.85rem; color:#9ca3af; margin-bottom:1rem;">
      Select a course to view and take its major tests.
    </p>
    <div id="courseList" class="courses-grid" style="margin-bottom:1.5rem;">
      <p style="font-size:0.85rem; color:#6b7280;">Loading courses...</p>
    </div>
    <div id="majorTestsList" class="list" style="margin-bottom:1.5rem;"></div>
    <div id="majorTestArea"></div>
  `;

  const courseList = document.getElementById("courseList");
  const testsList = document.getElementById("majorTestsList");
  const testArea = document.getElementById("majorTestArea");

  function renderMajorTest(test) {
    currentMajorTest = test;
    if (!test.questions || !test.questions.length) {
      testArea.innerHTML =
        '<p style="font-size:0.85rem; color:#6b7280;">No questions in this major test.</p>';
      return;
    }

    let html = `
      <div class="card">
        <div class="card-title">Taking major test</div>
        <div class="card-value" style="font-size:1rem;">${test.title}</div>
        <div style="font-size:0.8rem; color:#9ca3af; margin-top:0.4rem;">
          Duration: ${test.durationMinutes} minutes • Questions: ${test.questions.length}
        </div>
      </div>
      <form id="majorTestForm" class="list" style="margin-top:1rem;">
    `;

    test.questions.forEach((q, idx) => {
      const qId = q._id ?? idx; // ✅ fallback
      html += `
        <div class="list-item">
          <div class="list-item-title">
            Q${idx + 1}. ${q.questionText}
          </div>
          <div style="margin-top:0.4rem;">
            ${q.options
              .map(
                (opt, optIdx) => `
                <label style="display:block; font-size:0.85rem; margin-bottom:0.2rem; cursor:pointer;">
                  <input
                    type="radio"
                    name="question_${qId}"
                    value="${optIdx}"
                    style="margin-right:0.35rem;"
                  />
                  ${opt.optionText}
                </label>
              `
              )
              .join("")}
          </div>
        </div>
      `;
    });

    html += `
        <button type="submit"
          style="margin-top:0.7rem; align-self:flex-start; font-size:0.85rem; padding:0.4rem 0.9rem; border-radius:999px; border:none; background:#22c55e; color:#020617;">
          Submit Major Test
        </button>
        <p id="majorTestMessage" style="font-size:0.85rem; margin-top:0.5rem;"></p>
      </form>
    `;

    testArea.innerHTML = html;

    const form = document.getElementById("majorTestForm");
    const msgEl = document.getElementById("majorTestMessage");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msgEl.style.color = "#9ca3af";
      msgEl.textContent = "Submitting...";

      try {
        const answers = currentMajorTest.questions
          .map((q, idx) => {
            const qId = q._id ?? idx;
            const selected = document.querySelector(
              `input[name="question_${qId}"]:checked`
            );
            if (!selected) return null;
            return {
              questionId: qId,
              selectedOptionIndex: Number(selected.value),
            };
          })
          .filter(Boolean);

        const data = await apiRequest(
          `/tests/major/${currentMajorTest.id}/submit`, // ✅ use id
          "POST",
          { answers },
          true
        );

        msgEl.style.color = "#4ade80";
        msgEl.textContent = `Submitted! Score: ${data.score} / ${data.totalMarks}`;
      } catch (err) {
        msgEl.style.color = "#fda4af";
        msgEl.textContent = err.message;
      }
    });
  }

  async function loadMajorTests(courseId, courseName) {
    testsList.innerHTML =
      '<p style="font-size:0.85rem; color:#6b7280;">Loading major tests...</p>';
    testArea.innerHTML = "";

    try {
      const tests = await apiRequest(
        `/tests/major/by-course/${courseId}`,
        "GET",
        null,
        true
      );
      if (!tests.length) {
        testsList.innerHTML = `<p style="font-size:0.85rem; color:#6b7280;">No major tests found for ${courseName}.</p>`;
        return;
      }

      testsList.innerHTML = `
        <h3 class="section-title">Major tests for: ${courseName}</h3>
      `;
      tests.forEach((t) => {
        const item = document.createElement("div");
        item.className = "list-item";
        item.innerHTML = `
          <div class="list-item-title">${t.title}</div>
          <div class="list-item-sub">
            Duration: ${t.durationMinutes} minutes • Questions: ${t.questions.length}
          </div>
          <button style="margin-top:0.4rem; font-size:0.8rem; padding:0.3rem 0.7rem; border-radius:999px; border:none; background:#22c55e; color:#020617;">
            Start Major Test
          </button>
        `;
        item
          .querySelector("button")
          .addEventListener("click", () =>
            (async () => {
              testArea.innerHTML =
                '<p style="font-size:0.85rem; color:#6b7280;">Loading major test...</p>';
              try {
                const data = await apiRequest(
                  `/tests/major/${t.id}`, // ✅ use id
                  "GET",
                  null,
                  true
                );
                renderMajorTest(data);
              } catch (err) {
                testArea.innerHTML = `<p style="color:#fda4af; font-size:0.85rem;">${err.message}</p>`;
              }
            })()
          );

        testsList.appendChild(item);
      });
    } catch (err) {
      testsList.innerHTML = `<p style="color:#fda4af; font-size:0.85rem;">${err.message}</p>`;
    }
  }

  // Load courses first
  try {
    const courses = await apiRequest("/courses", "GET", null, false);
    if (!courses.length) {
      courseList.innerHTML =
        '<p style="font-size:0.85rem; color:#6b7280;">No courses available.</p>';
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
      card.addEventListener("click", () => loadMajorTests(c.id, c.name)); // ✅ id
      courseList.appendChild(card);
    });
  } catch (err) {
    courseList.innerHTML = `<p style="color:#fda4af; font-size:0.85rem;">${err.message}</p>`;
  }
})();

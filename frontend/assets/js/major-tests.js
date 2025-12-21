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

  /* -------------------------------
     RENDER MAJOR TEST WITH OPTIONS
  --------------------------------*/
  function renderMajorTest(test) {
    currentMajorTest = test;

    if (!test.questions || !test.questions.length) {
      testArea.innerHTML =
        '<p style="font-size:0.85rem; color:#6b7280;">No questions available.</p>';
      return;
    }

    let html = `
      <div class="card">
        <div class="card-title">Taking Major Test</div>
        <div class="card-value" style="font-size:1rem;">${test.title}</div>
        <div style="font-size:0.8rem; color:#9ca3af; margin-top:0.4rem;">
          Duration: ${test.durationMinutes} min • Questions: ${test.questions.length}
        </div>
      </div>

      <form id="majorTestForm" class="list" style="margin-top:1rem;">
    `;

    test.questions.forEach((q, idx) => {
      const qId = q._id ?? idx;

      html += `
        <div class="list-item">
          <div class="list-item-title">Q${idx + 1}. ${q.questionText}</div>
          <div class="options-container" id="options_${qId}" style="margin-top:0.4rem;">
      `;

      q.options.forEach((opt, optIdx) => {
        html += `
          <div class="option-box"
            data-qid="${qId}"
            data-option="${optIdx}"
            id="option_${qId}_${optIdx}">
            ${opt.optionText}
          </div>
        `;
      });

      html += `
          </div>
          <div id="correct_${qId}" class="correct-answer-text"></div>
        </div>
      `;
    });

    html += `
        <button type="submit"
          style="margin-top:0.7rem; font-size:0.85rem;
          padding:0.45rem 1rem; border-radius:999px; background:#22c55e; color:#020617; border:none;">
          Submit Major Test
        </button>

        <p id="majorTestMessage" style="font-size:0.85rem; margin-top:0.5rem;"></p>
      </form>
    `;

    testArea.innerHTML = html;

    /* -------------------------------
       CLICK HANDLER FOR OPTION BOXES
    --------------------------------*/
    document.querySelectorAll(".option-box").forEach((box) => {
      box.addEventListener("click", () => {
        const qId = box.dataset.qid;

        // Remove previous selections
        document.querySelectorAll(`#options_${qId} .option-box`)
          .forEach((b) => b.classList.remove("option-selected"));

        // Mark clicked one
        box.classList.add("option-selected");
      });
    });

    /* -------------------------------
         SUBMIT TEST
    --------------------------------*/
    const form = document.getElementById("majorTestForm");
    const msgEl = document.getElementById("majorTestMessage");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msgEl.style.color = "#9ca3af";
      msgEl.textContent = "Submitting...";

      // Build answers
      const answers = currentMajorTest.questions.map((q, idx) => {
        const qId = q._id ?? idx;

        const selectedBox = document.querySelector(
          `.option-box.option-selected[data-qid="${qId}"]`
        );

        if (!selectedBox) return null;

        return {
          questionId: qId,
          selectedOptionIndex: Number(selectedBox.dataset.option),
        };
      }).filter(Boolean);

      try {
        const result = await apiRequest(
          `/tests/major/${currentMajorTest.id}/submit`,
          "POST",
          { answers },
          true
        );

        msgEl.style.color = "#4ade80";
        msgEl.textContent = `Submitted! Score: ${result.score} / ${result.totalMarks}`;

        /* ----------------------------------------------------------
           HIGHLIGHT CORRECT & WRONG ANSWERS AFTER SUBMISSION
        -----------------------------------------------------------*/

        currentMajorTest.questions.forEach((q, idx) => {
          const qId = q._id ?? idx;
          const correctIdx = q.correctOptionIndex;

          // Highlight correct answer
          const correctBox = document.getElementById(`option_${qId}_${correctIdx}`);
          if (correctBox) correctBox.classList.add("option-correct");

          // Highlight wrong selection
          const userBox = document.querySelector(
            `.option-box.option-selected[data-qid="${qId}"]`
          );

          if (userBox && Number(userBox.dataset.option) !== correctIdx) {
            userBox.classList.add("option-wrong");
          }

          // Show correct answer text
          document.getElementById(`correct_${qId}`).innerHTML =
            `Correct answer: <strong>${q.options[correctIdx].optionText}</strong>`;
        });

        // Disable further selecting
        document.querySelectorAll(".option-box").forEach((box) => {
          box.style.pointerEvents = "none";
        });

      } catch (err) {
        msgEl.style.color = "#fda4af";
        msgEl.textContent = err.message;
      }
    });
  }

  /*-------------------------------------------
    LOAD ALL MAJOR TESTS FOR A COURSE
  -------------------------------------------*/
  async function loadMajorTests(courseId, courseName) {
    testsList.innerHTML = `<p style="font-size:0.85rem; color:#6b7280;">Loading major tests...</p>`;
    testArea.innerHTML = "";

    try {
      const tests = await apiRequest(`/tests/major/by-course/${courseId}`, "GET", null, true);

      if (!tests.length) {
        testsList.innerHTML = `<p>No major tests found for ${courseName}</p>`;
        return;
      }

      testsList.innerHTML = `<h3 class="section-title">Major tests for: ${courseName}</h3>`;

      tests.forEach((t) => {
        const item = document.createElement("div");
        item.className = "list-item";
        item.innerHTML = `
          <div class="list-item-title">${t.title}</div>
          <div class="list-item-sub">
            Duration: ${t.durationMinutes} min • Questions: ${t.questions.length}
          </div>
          <button style="margin-top:0.4rem; font-size:0.8rem; padding:0.3rem 0.7rem;
            border-radius:999px; background:#22c55e; border:none; color:#020617;">
            Start Major Test
          </button>
        `;

        item.querySelector("button").addEventListener("click", async () => {
          testArea.innerHTML = `<p>Loading test...</p>`;
          const fullTest = await apiRequest(`/tests/major/${t.id}`, "GET", null, true);
          renderMajorTest(fullTest);
        });

        testsList.appendChild(item);
      });

    } catch (err) {
      testsList.innerHTML = `<p style="color:#fda4af;">${err.message}</p>`;
    }
  }

  /*-------------------------------------------
    LOAD COURSES FIRST
  -------------------------------------------*/
  try {
    const courses = await apiRequest("/courses", "GET", null, false);

    if (!courses.length) {
      courseList.innerHTML = `<p>No courses available.</p>`;
      return;
    }

    courseList.innerHTML = "";

    courses.forEach((c) => {
      const card = document.createElement("div");
      card.className = "course-card";
      card.innerHTML = `
        <div class="course-code">${c.code}</div>
        <div class="course-name">${c.name}</div>
        <div class="course-desc">${c.description || "No description provided."}</div>
      `;
      card.addEventListener("click", () => loadMajorTests(c.id, c.name));
      courseList.appendChild(card);
    });

  } catch (err) {
    courseList.innerHTML = `<p style="color:#fda4af;">${err.message}</p>`;
  }

})();

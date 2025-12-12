// admin/js/admin-tests.js

(async function init() {
  requireAuthAdmin();
  const pageType = document.body.getAttribute("data-page");

  if (pageType === "topic-test") {
    renderAdminLayout("Topic Tests");
    setAdminNavActive("admin-nav-test");
    setupTopicTestPage();
  } else if (pageType === "major-test") {
    renderAdminLayout("Major Tests");
    setAdminNavActive("admin-nav-major");
    setupMajorTestPage();
  }
})();

async function getCourses() {
  return apiRequest("/courses", "GET", null, false);
}

async function getTopics(courseId) {
  return apiRequest(`/courses/${courseId}/topics`, "GET", null, false);
}

// ---------- Topic-wise test page ----------
async function setupTopicTestPage() {
  const content = document.getElementById("adminPageContent");
  content.innerHTML = `
    <h2 class="section-title">Create Topic-wise Test</h2>
    <div class="card">
      <form id="topicTestForm" class="admin-form">
        <div>
          <label>Course</label>
          <select id="testCourse" required></select>
        </div>
        <div>
          <label>Topic</label>
          <select id="testTopic" required></select>
        </div>
        <div>
          <label>Test Title</label>
          <input id="testTitle" required placeholder="Unit-1 Test" />
        </div>
        <div>
          <label>Duration (minutes)</label>
          <input type="number" id="testDuration" value="30" />
        </div>

        <div>
          <label>Questions</label>
          <div id="questionsContainer"></div>
          <button type="button" class="admin-btn" id="addQuestionBtn">+ Add Question</button>
        </div>

        <button type="submit" class="admin-btn" style="margin-top:0.5rem;">Create Test</button>
        <p id="testMsg" class="admin-msg"></p>
      </form>
    </div>
  `;

  const courseSelect = document.getElementById("testCourse");
  const topicSelect = document.getElementById("testTopic");
  const qContainer = document.getElementById("questionsContainer");
  const addQBtn = document.getElementById("addQuestionBtn");
  const form = document.getElementById("topicTestForm");
  const msgEl = document.getElementById("testMsg");

  courseSelect.innerHTML = `<option value="">Loading...</option>`;
  try {
    const courses = await getCourses();
    if (!courses.length) {
      courseSelect.innerHTML = `<option value="">No courses</option>`;
    } else {
      courseSelect.innerHTML = `<option value="">Select course</option>`;
      courses.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.code} - ${c.name}`;
        courseSelect.appendChild(opt);
      });
    }
  } catch {
    courseSelect.innerHTML = `<option value="">Error loading courses</option>`;
  }

  courseSelect.addEventListener("change", async () => {
    const courseId = courseSelect.value;
    topicSelect.innerHTML = `<option value="">Loading...</option>`;
    if (!courseId) {
      topicSelect.innerHTML = `<option value="">Select course first</option>`;
      return;
    }
    try {
      const topics = await getTopics(courseId);
      if (!topics.length) {
        topicSelect.innerHTML = `<option value="">No topics</option>`;
      } else {
        topicSelect.innerHTML = `<option value="">Select topic</option>`;
        topics.forEach((t) => {
          const opt = document.createElement("option");
          opt.value = t.id;
          opt.textContent = t.name;
          topicSelect.appendChild(opt);
        });
      }
    } catch {
      topicSelect.innerHTML = `<option value="">Error loading topics</option>`;
    }
  });

  function addQuestionBlock() {
    const idx = qContainer.children.length + 1;
    const div = document.createElement("div");
    div.className = "card";
    div.style.marginTop = "0.6rem";
    div.innerHTML = `
      <div class="card-title">Question ${idx}</div>
      <div class="admin-form" style="margin-top:0.4rem;">
        <div>
          <label>Question Text</label>
          <textarea class="q-text" rows="2" required></textarea>
        </div>
        <div>
          <label>Option A</label>
          <input class="q-opt" data-index="0" required />
        </div>
        <div>
          <label>Option B</label>
          <input class="q-opt" data-index="1" required />
        </div>
        <div>
          <label>Option C</label>
          <input class="q-opt" data-index="2" />
        </div>
        <div>
          <label>Option D</label>
          <input class="q-opt" data-index="3" />
        </div>
        <div>
          <label>Correct Option (0-3)</label>
          <input type="number" class="q-correct" value="0" min="0" max="3" />
        </div>
        <div>
          <label>Marks</label>
          <input type="number" class="q-marks" value="1" />
        </div>
      </div>
    `;
    qContainer.appendChild(div);
  }

  addQBtn.addEventListener("click", () => addQuestionBlock());
  addQuestionBlock();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.style.color = "#9ca3af";
    msgEl.textContent = "Creating test...";

    const course = courseSelect.value; // courseId
    const topic = topicSelect.value;   // topicId
    const title = document.getElementById("testTitle").value.trim();
    const durationMinutes = Number(
      document.getElementById("testDuration").value || 30
    );

    if (!course || !topic) {
      msgEl.style.color = "#fda4af";
      msgEl.textContent = "Select course and topic.";
      return;
    }

    const qBlocks = Array.from(qContainer.children);
    const questions = qBlocks.map((block, idx) => {
      const qText = block.querySelector(".q-text").value.trim();
      const optEls = block.querySelectorAll(".q-opt");
      const options = Array.from(optEls)
        .map((o) => o.value.trim())
        .filter((v) => v);
      const correctOptionIndex = Number(
        block.querySelector(".q-correct").value || 0
      );
      const marks = Number(block.querySelector(".q-marks").value || 1);

      return {
        _id: idx,
        questionText: qText,
        options: options.map((o) => ({ optionText: o })),
        correctOptionIndex,
        marks,
      };
    });

    try {
      await apiRequest(
        "/tests",
        "POST",
        { title, course, topic, durationMinutes, questions },
        true
      );
      msgEl.style.color = "#4ade80";
      msgEl.textContent = "Test created.";
    } catch (err) {
      msgEl.style.color = "#fda4af";
      msgEl.textContent = err.message;
    }
  });
}

// ---------- Major test page ----------
async function setupMajorTestPage() {
  const content = document.getElementById("adminPageContent");
  content.innerHTML = `
    <h2 class="section-title">Create Major Test (Weekly)</h2>
    <div class="card">
      <form id="majorTestForm" class="admin-form">
        <div>
          <label>Course</label>
          <select id="majorCourse" required></select>
        </div>
        <div>
          <label>Test Title</label>
          <input id="majorTitle" required placeholder="Week 1 Test" />
        </div>
        <div>
          <label>Duration (minutes)</label>
          <input type="number" id="majorDuration" value="60" />
        </div>

        <div>
          <label>Questions</label>
          <div id="majorQuestionsContainer"></div>
          <button type="button" class="admin-btn" id="addMajorQuestionBtn">+ Add Question</button>
        </div>

        <button type="submit" class="admin-btn" style="margin-top:0.5rem;">Create Major Test</button>
        <p id="majorTestMsg" class="admin-msg"></p>
      </form>
    </div>
  `;

  const courseSelect = document.getElementById("majorCourse");
  const qContainer = document.getElementById("majorQuestionsContainer");
  const addQBtn = document.getElementById("addMajorQuestionBtn");
  const form = document.getElementById("majorTestForm");
  const msgEl = document.getElementById("majorTestMsg");

  courseSelect.innerHTML = `<option value="">Loading...</option>`;
  try {
    const courses = await getCourses();
    if (!courses.length) {
      courseSelect.innerHTML = `<option value="">No courses</option>`;
    } else {
      courseSelect.innerHTML = `<option value="">Select course</option>`;
      courses.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.code} - ${c.name}`;
        courseSelect.appendChild(opt);
      });
    }
  } catch {
    courseSelect.innerHTML = `<option value="">Error loading courses</option>`;
  }

  function addQuestionBlock() {
    const idx = qContainer.children.length + 1;
    const div = document.createElement("div");
    div.className = "card";
    div.style.marginTop = "0.6rem";
    div.innerHTML = `
      <div class="card-title">Question ${idx}</div>
      <div class="admin-form" style="margin-top:0.4rem;">
        <div>
          <label>Question Text</label>
          <textarea class="q-text" rows="2" required></textarea>
        </div>
        <div>
          <label>Option A</label>
          <input class="q-opt" data-index="0" required />
        </div>
        <div>
          <label>Option B</label>
          <input class="q-opt" data-index="1" required />
        </div>
        <div>
          <label>Option C</label>
          <input class="q-opt" data-index="2" />
        </div>
        <div>
          <label>Option D</label>
          <input class="q-opt" data-index="3" />
        </div>
        <div>
          <label>Correct Option (0-3)</label>
          <input type="number" class="q-correct" value="0" min="0" max="3" />
        </div>
        <div>
          <label>Marks</label>
          <input type="number" class="q-marks" value="1" />
        </div>
      </div>
    `;
    qContainer.appendChild(div);
  }

  addQBtn.addEventListener("click", () => addQuestionBlock());
  addQuestionBlock();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.style.color = "#9ca3af";
    msgEl.textContent = "Creating major test...";

    const course = courseSelect.value; // courseId
    const title = document.getElementById("majorTitle").value.trim();
    const durationMinutes = Number(
      document.getElementById("majorDuration").value || 60
    );

    if (!course) {
      msgEl.style.color = "#fda4af";
      msgEl.textContent = "Select course.";
      return;
    }

    const qBlocks = Array.from(qContainer.children);
    const questions = qBlocks.map((block, idx) => {
      const qText = block.querySelector(".q-text").value.trim();
      const optEls = block.querySelectorAll(".q-opt");
      const options = Array.from(optEls)
        .map((o) => o.value.trim())
        .filter((v) => v);
      const correctOptionIndex = Number(
        block.querySelector(".q-correct").value || 0
      );
      const marks = Number(block.querySelector(".q-marks").value || 1);

      return {
        _id: idx,
        questionText: qText,
        options: options.map((o) => ({ optionText: o })),
        correctOptionIndex,
        marks,
      };
    });

    try {
      await apiRequest(
        "/tests/major",
        "POST",
        { title, course, durationMinutes, questions },
        true
      );
      msgEl.style.color = "#4ade80";
      msgEl.textContent = "Major test created.";
    } catch (err) {
      msgEl.style.color = "#fda4af";
      msgEl.textContent = err.message;
    }
  });
}

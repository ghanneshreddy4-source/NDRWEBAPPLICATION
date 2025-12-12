// assets/js/tests.js

let currentTest = null;

(async function init() {
  requireAuthStudent();
  renderStudentLayout("Topic Tests");
  setSidebarActive("nav-courses");

  const topicId = localStorage.getItem("ndr_selected_topic");
  const topicName = localStorage.getItem("ndr_selected_topic_name");
  const content = document.getElementById("pageContent");

  if (!topicId) {
    window.location.href = "topics.html";
    return;
  }

  content.innerHTML = `
    <h2 class="section-title">Tests for: ${topicName || ""}</h2>
    <div id="testsList" class="list" style="margin-bottom:1.5rem;">
      <p style="font-size:0.85rem; color:#6b7280;">Loading tests...</p>
    </div>
    <div id="testArea"></div>
  `;

  const testsList = document.getElementById("testsList");
  const testArea = document.getElementById("testArea");

  function renderTest(test) {
    currentTest = test;
    if (!test.questions || !test.questions.length) {
      testArea.innerHTML =
        '<p style="font-size:0.85rem; color:#6b7280;">No questions in this test.</p>';
      return;
    }

    let html = `
      <div class="card">
        <div class="card-title">Taking test</div>
        <div class="card-value" style="font-size:1rem;">${test.title}</div>
        <div style="font-size:0.8rem; color:#9ca3af; margin-top:0.4rem;">
          Duration: ${test.durationMinutes} minutes • Questions: ${test.questions.length}
        </div>
      </div>
      <form id="testForm" class="list" style="margin-top:1rem;">
    `;

    test.questions.forEach((q, idx) => {
      const qId = q._id ?? idx;
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
          Submit Test
        </button>
        <p id="testMessage" style="font-size:0.85rem; margin-top:0.5rem;"></p>
      </form>
    `;

    testArea.innerHTML = html;

    const form = document.getElementById("testForm");
    const msgEl = document.getElementById("testMessage");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msgEl.style.color = "#9ca3af";
      msgEl.textContent = "Submitting...";

      try {
        const answers = currentTest.questions
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
          `/tests/${currentTest.id}/submit`,
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

  async function loadAndRenderTest(testId) {
    testArea.innerHTML =
      '<p style="font-size:0.85rem; color:#6b7280;">Loading test...</p>';
    try {
      const test = await apiRequest(`/tests/${testId}`, "GET", null, true);
      renderTest(test);
    } catch (err) {
      testArea.innerHTML = `<p style="color:#fda4af; font-size:0.85rem;">${err.message}</p>`;
    }
  }

  try {
    const tests = await apiRequest(
      `/tests/by-topic/${topicId}`,
      "GET",
      null,
      true
    );
    if (!tests.length) {
      testsList.innerHTML =
        '<p style="font-size:0.85rem; color:#6b7280;">No tests available for this topic.</p>';
      return;
    }

    testsList.innerHTML = "";
    tests.forEach((t) => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <div class="list-item-title">${t.title}</div>
        <div class="list-item-sub">
          Duration: ${t.durationMinutes} minutes • Questions: ${t.questions.length}
        </div>
        <button style="margin-top:0.4rem; font-size:0.8rem; padding:0.3rem 0.7rem; border-radius:999px; border:none; background:#22c55e; color:#020617;">
          Start Test
        </button>
      `;
      item
        .querySelector("button")
        .addEventListener("click", () => loadAndRenderTest(t.id));
      testsList.appendChild(item);
    });
  } catch (err) {
    testsList.innerHTML = `<p style="color:#fda4af; font-size:0.85rem;">${err.message}</p>`;
  }
})();

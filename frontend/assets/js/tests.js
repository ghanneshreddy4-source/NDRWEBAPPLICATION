// assets/js/tests.js
(async function init() {
  requireAuthStudent();
  renderStudentLayout("Topic Test");
  setSidebarActive("nav-courses");

  const topicId = localStorage.getItem("ndr_current_topic_id");
  const topicName = localStorage.getItem("ndr_current_topic_name");
  const nextIndex = localStorage.getItem("ndr_resume_topic_index");

  const content = document.getElementById("pageContent") || document.body;

  if (!topicId) {
    content.innerHTML = `<p style="padding:2rem;color:red;">No topic selected for test.</p>`;
    setTimeout(() => (window.location.href = "topics.html"), 2000);
    return;
  }

  content.innerHTML = `
    <div style="padding:2rem; max-width:900px; margin:auto;">
      <h2 style="color:#5fd8ff; margin-bottom:1rem;">Test for: ${topicName}</h2>
      <div id="testArea" style="text-align:center;">
        <p>Loading test...</p>
      </div>
    </div>
  `;

  const testArea = document.getElementById("testArea");

  try {
    let tests = [];
    try {
      tests = await apiRequest(`/tests/by-topic/${topicId}`, "GET", null, true);
    } catch {
      tests = await apiRequest(`/topics/${topicId}/tests`, "GET", null, true);
    }

    console.log("Loaded tests:", tests);

    if (!tests || !tests.length) {
      testArea.innerHTML = `<p style="color:#ccc;">No test found for this topic.</p>`;
      return;
    }

    const test = tests[0];
    if (!test.questions || !test.questions.length) {
      testArea.innerHTML = `<p style="color:#ccc;">This test has no questions yet.</p>`;
      return;
    }

    let html = `
      <form id="testForm" style="text-align:left;">
        <h3 style="color:#fff;">${test.title}</h3>
        <p style="color:#9ca3af;">${test.questions.length} questions</p>
    `;

    test.questions.forEach((q, idx) => {
      html += `
        <div style="background:#1a2035; padding:1rem; margin-top:1rem; border-radius:8px;">
          <strong>Q${idx + 1}.</strong> ${q.questionText}
          <div style="margin-top:0.5rem;">
            ${q.options
              .map(
                (opt, i) => `
                <label style="display:block; margin-bottom:4px;">
                  <input type="radio" name="q${idx}" value="${i}" style="margin-right:6px;" />
                  ${opt.optionText}
                </label>`
              )
              .join("")}
          </div>
        </div>
      `;
    });

    html += `
        <button type="submit" style="margin-top:1.5rem;
          background:linear-gradient(90deg,#3245ff,#d91d42);
          color:#fff;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;">
          Submit Test
        </button>
        <p id="msg" style="margin-top:1rem;"></p>
      </form>
    `;

    testArea.innerHTML = html;

    const form = document.getElementById("testForm");
    const msg = document.getElementById("msg");

    form.onsubmit = async (e) => {
      e.preventDefault();
      const answers = [];
      test.questions.forEach((q, idx) => {
        const selected = form.querySelector(`input[name="q${idx}"]:checked`);
        if (selected)
          answers.push({
            questionId: q._id,
            selectedOptionIndex: parseInt(selected.value),
          });
      });

      msg.textContent = "Submitting test...";
      msg.style.color = "#9ca3af";

      try {
        const data = await apiRequest(
          `/tests/${test._id}/submit`,
          "POST",
          { answers },
          true
        );
        msg.textContent = `✅ Submitted! Score: ${data.score} / ${data.totalMarks}`;
        msg.style.color = "#4ade80";

        setTimeout(() => {
          localStorage.removeItem("ndr_current_topic_id");
          localStorage.removeItem("ndr_current_topic_name");
          window.location.href = "topics.html";
        }, 2500);
      } catch (err) {
        msg.textContent = err.message;
        msg.style.color = "#f87171";
      }
    };
  } catch (err) {
    console.error("Error loading test:", err);
    testArea.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
})();

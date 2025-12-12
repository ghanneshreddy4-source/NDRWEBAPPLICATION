// admin/js/admin-topics.js

(async function init() {
  requireAuthAdmin();
  renderAdminLayout("Topics");
  setAdminNavActive("admin-nav-topic");

  const content = document.getElementById("adminPageContent");
  content.innerHTML = `
    <section class="section">
      <h2 class="section-title">Add Topic</h2>
      <div class="card">
        <form id="topicForm" class="form">
          <div class="form-group">
            <label for="topicCourse">Course</label>
            <select id="topicCourse" required></select>
          </div>
          <div class="form-group">
            <label for="topicName">Topic Title</label>
            <input id="topicName" type="text" required />
          </div>
          <div class="form-group">
            <label for="topicDescription">Topic Summary</label>
            <textarea id="topicDescription" rows="3" placeholder="Short summary of the topic"></textarea>
          </div>
          <div class="form-group">
            <label for="topicOrder">Order (for sorting)</label>
            <input id="topicOrder" type="number" min="1" value="1" />
          </div>

          <hr style="border:none; border-top:1px solid #1f2937; margin:0.75rem 0;" />

          <div class="form-group">
            <label for="topicResourceType">Primary Resource Type</label>
            <select id="topicResourceType">
              <option value="">None</option>
              <option value="video">Video</option>
              <option value="link">Article / Website</option>
            </select>
          </div>
          <div class="form-group">
            <label for="topicResourceUrl">
              Resource URL
              <span style="font-size:0.75rem; color:#6b7280;">(YouTube / docs link, etc.)</span>
            </label>
            <input
              id="topicResourceUrl"
              type="url"
              placeholder="https://youtube.com/..."
            />
          </div>

          <p id="topicError" class="text-error"></p>
          <button type="submit" class="admin-btn">Create Topic</button>
        </form>
      </div>
    </section>

    <section class="section" style="margin-top:1.5rem;">
      <h3 class="section-title">Topics for selected course</h3>
      <div id="topicList" class="list">
        <p style="font-size:0.85rem; color:#6b7280;">Loading...</p>
      </div>
    </section>
  `;

  const topicCourseSelect = document.getElementById("topicCourse");
  const topicForm = document.getElementById("topicForm");
  const topicList = document.getElementById("topicList");
  const topicError = document.getElementById("topicError");

  let selectedCourseId = null;

  async function loadCourses() {
    try {
      const courses = await apiRequest("/courses", "GET", null, true);

      if (!courses.length) {
        topicCourseSelect.innerHTML =
          '<option value="">No courses found</option>';
        selectedCourseId = null;
        topicList.innerHTML =
          '<p style="font-size:0.85rem; color:#6b7280;">Create a course first.</p>';
        return;
      }

      topicCourseSelect.innerHTML = courses
        .map(
          (c) => `
          <option value="${c.id}">
            ${c.code ? c.code.padStart(2, "0") : c.id} - ${c.name}
          </option>`
        )
        .join("");

      selectedCourseId = topicCourseSelect.value;
      await loadTopics();
    } catch (err) {
      console.error("loadCourses error:", err);
      topicCourseSelect.innerHTML =
        '<option value="">Error loading courses</option>';
      topicList.innerHTML =
        '<p style="color:#fda4af; font-size:0.85rem;">Server error</p>';
    }
  }

  topicCourseSelect.addEventListener("change", async (e) => {
    selectedCourseId = e.target.value || null;
    await loadTopics();
  });

  async function loadTopics() {
    if (!selectedCourseId) {
      topicList.innerHTML =
        '<p style="font-size:0.85rem; color:#6b7280;">Select a course.</p>';
      return;
    }

    topicList.innerHTML =
      '<p style="font-size:0.85rem; color:#6b7280;">Loading...</p>';

    try {
      const topics = await apiRequest(
        `/courses/${selectedCourseId}/topics`,
        "GET",
        null,
        true
      );

      if (!topics.length) {
        topicList.innerHTML =
          '<p style="font-size:0.85rem; color:#6b7280;">No topics yet.</p>';
        return;
      }

      topicList.innerHTML = topics
        .map((t) => {
          const primaryRes = (t.resources && t.resources[0]) || null;
          const resLine = primaryRes && primaryRes.url
            ? `Resource: <a href="${primaryRes.url}" target="_blank" style="color:#38bdf8;">${primaryRes.type === "video" ? "Video" : "Link"}</a>`
            : "Resource: -";

          return `
          <div class="list-item">
            <div class="list-item-title">${t.name}</div>
            <div class="list-item-sub">
              Order: ${t.order ?? "-"}<br/>
              ${t.description || ""}<br/>
              ${resLine}
            </div>
          </div>
        `;
        })
        .join("");
    } catch (err) {
      console.error("loadTopics error:", err);
      topicList.innerHTML =
        '<p style="color:#fda4af; font-size:0.85rem;">Server error</p>';
    }
  }

  topicForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    topicError.textContent = "";

    if (!selectedCourseId) {
      topicError.textContent = "Select a course first.";
      return;
    }

    const name = document.getElementById("topicName").value.trim();
    const description =
      document.getElementById("topicDescription").value.trim();
    const orderVal = document.getElementById("topicOrder").value;
    const resourceType = document.getElementById("topicResourceType").value;
    const resourceUrl = document
      .getElementById("topicResourceUrl")
      .value.trim();

    if (!name) {
      topicError.textContent = "Topic title is required.";
      return;
    }

    let resources = [];
    if (resourceType && resourceUrl) {
      resources.push({
        type: resourceType,
        label:
          resourceType === "video" ? "Topic video" : "Topic reference link",
        url: resourceUrl,
      });
    }

    const payload = {
      name,
      description,
      order: orderVal ? parseInt(orderVal, 10) : null,
      resources,
    };

    try {
      await apiRequest(
        `/courses/${selectedCourseId}/topics`,
        "POST",
        payload,
        true
      );

      topicForm.reset();
      document.getElementById("topicOrder").value = "1";
      await loadTopics();
    } catch (err) {
      console.error("createTopic error:", err);
      topicError.textContent = err.message || "Server error";
    }
  });

  await loadCourses();
})();

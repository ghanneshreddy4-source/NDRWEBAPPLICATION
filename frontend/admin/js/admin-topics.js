(async function initAdminTopics() {
  requireAuthAdmin();
  renderAdminLayout("Topics");
  setAdminNavActive("admin-nav-topic");

  const content = document.getElementById("adminPageContent");
  content.innerHTML = `
    <section class="section">
      <h2 class="section-title">Add / Edit Topic</h2>
      <div class="card">
        <form id="topicForm" class="form">
          <input type="hidden" id="topicId" />

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

          <div class="form-group">
            <label for="topicVideo">Primary Video URL (Google Drive only)</label>
            <input id="topicVideo" type="url" placeholder="https://drive.google.com/file/d/.../view?usp=sharing" />
          </div>

          <div class="form-group">
            <label for="topicResourceUrl">Resource Link (optional PDF)</label>
            <input id="topicResourceUrl" type="url" placeholder="https://..." />
          </div>

          <p id="topicError" class="text-error"></p>
          <button type="submit" class="admin-btn">Save Topic</button>
          <button type="button" id="cancelEditBtn" class="admin-btn" style="background:#6b7280;display:none;">Cancel Edit</button>
        </form>
      </div>
    </section>

    <section class="section" style="margin-top:1.5rem;">
      <h3 class="section-title">Topics for selected course</h3>
      <div id="topicList" class="list"></div>
    </section>
  `;

  const courseSelect = document.getElementById("topicCourse");
  const topicForm = document.getElementById("topicForm");
  const topicList = document.getElementById("topicList");
  const topicError = document.getElementById("topicError");
  const cancelEditBtn = document.getElementById("cancelEditBtn");

  let selectedCourseId = null;
  let editingId = null;

  // Load Courses
  async function loadCourses() {
    try {
      const courses = await apiRequest("/courses", "GET", null, true);
      courseSelect.innerHTML = courses.map(c => 
        `<option value="${c.id}">${c.name}</option>`
      ).join("");
      selectedCourseId = courseSelect.value;
      await loadTopics();
    } catch (err) {
      topicList.innerHTML = `<p style="color:red;">Error loading courses</p>`;
    }
  }

  // Load Topics
  async function loadTopics() {
    if (!selectedCourseId) return;
    topicList.innerHTML = `<p>Loading topics...</p>`;
    try {
      const topics = await apiRequest(`/courses/${selectedCourseId}/topics`, "GET", null, true);
      if (!topics.length) {
        topicList.innerHTML = `<p>No topics found.</p>`;
        return;
      }

      topicList.innerHTML = topics.map(t => `
        <div class="list-item" style="border-bottom:1px solid #1f2937;padding:1rem;">
          <div><strong>${t.order || "-"}.</strong> ${t.name}</div>
          <p style="margin:0.3rem 0;color:#9ca3af;">${t.description || ""}</p>
          <p style="margin:0;font-size:0.85rem;">
            Video: ${t.primaryVideoUrl ? `<a href="${t.primaryVideoUrl}" target="_blank" style="color:#5fd8ff;">View Video</a>` : "None"} |
            Resources: ${t.resources?.length || 0}
          </p>
          <div style="margin-top:0.5rem;">
            <button class="admin-btn" style="padding:4px 8px;font-size:0.8rem;" onclick="editTopic(${t.id})">✏️ Edit</button>
            <button class="admin-btn" style="padding:4px 8px;font-size:0.8rem;background:#dc2626;" onclick="deleteTopic(${t.id})">🗑 Delete</button>
          </div>
        </div>
      `).join("");
    } catch (err) {
      topicList.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
  }

  // Save or Update Topic
  topicForm.addEventListener("submit", async e => {
    e.preventDefault();
    topicError.textContent = "";
    const name = document.getElementById("topicName").value.trim();
    const description = document.getElementById("topicDescription").value.trim();
    const order = parseInt(document.getElementById("topicOrder").value) || 1;
    const videoUrl = document.getElementById("topicVideo").value.trim();
    const resourceUrl = document.getElementById("topicResourceUrl").value.trim();

    if (!name) return topicError.textContent = "Topic title is required.";
    if (videoUrl && !videoUrl.includes("drive.google.com")) return topicError.textContent = "Only Google Drive videos are allowed.";

    const payload = {
      name, description, order,
      primaryVideoUrl: videoUrl || null,
      resources: resourceUrl ? [{ url: resourceUrl, label: "PDF Notes" }] : []
    };

    try {
      if (editingId) {
        await apiRequest(`/courses/${selectedCourseId}/topics/${editingId}`, "PUT", payload, true);
      } else {
        await apiRequest(`/courses/${selectedCourseId}/topics`, "POST", payload, true);
      }

      topicForm.reset();
      cancelEditBtn.style.display = "none";
      editingId = null;
      await loadTopics();
    } catch (err) {
      topicError.textContent = err.message || "Server error";
    }
  });

  // Edit Topic
  window.editTopic = async function (id) {
    const topics = await apiRequest(`/courses/${selectedCourseId}/topics`, "GET", null, true);
    const t = topics.find(x => x.id === id);
    if (!t) return;

    document.getElementById("topicName").value = t.name;
    document.getElementById("topicDescription").value = t.description || "";
    document.getElementById("topicOrder").value = t.order || 1;
    document.getElementById("topicVideo").value = t.primaryVideoUrl || "";
    document.getElementById("topicResourceUrl").value = t.resources?.[0]?.url || "";

    editingId = id;
    cancelEditBtn.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete Topic
  window.deleteTopic = async function (id) {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      await apiRequest(`/courses/${selectedCourseId}/topics/${id}`, "DELETE", null, true);
      await loadTopics();
    } catch (err) {
      alert("Failed to delete topic");
    }
  };

  cancelEditBtn.addEventListener("click", () => {
    topicForm.reset();
    editingId = null;
    cancelEditBtn.style.display = "none";
  });

  courseSelect.addEventListener("change", async e => {
    selectedCourseId = e.target.value;
    await loadTopics();
  });

  await loadCourses();
})();

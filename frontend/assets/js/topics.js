(async function initCourseContent() {
  requireAuthStudent();
  renderStudentLayout("Course Content");
  setSidebarActive("nav-courses");

  const courseId = localStorage.getItem("ndr_selected_course");
  const courseName = localStorage.getItem("ndr_selected_course_name");
  const content = document.getElementById("pageContent");

  if (!courseId) {
    content.innerHTML = `<p style="padding:2rem;">No course selected.</p>`;
    return;
  }

  // ---------- PAGE STRUCTURE ----------
  content.innerHTML = `
    <div class="course-layout" style="display:flex; height:100vh;">
      <!-- MAIN PLAYER -->
      <div class="main-player" style="flex:1; padding:2rem; overflow-y:auto; background:#0b0f1a;">
        <div class="video-box" style="background:#121826; border-radius:10px; padding:1rem; box-shadow:0 0 10px rgba(0,0,0,0.5);">
          <h2 id="topicTitle" style="margin-bottom:0.5rem; color:#5fd8ff;">${courseName}</h2>
          <div id="videoContainer"></div>
          <p id="topicDescription" style="margin-top:1rem; color:#cfd8e8;"></p>
        </div>

        <div class="resources" style="margin-top:2rem; background:#121826; padding:1rem; border-radius:10px;">
          <h3 style="color:#5fd8ff;">Resources</h3>
          <div id="topicResources"></div>
        </div>
      </div>

      <!-- SIDEBAR -->
      <div class="sidebar" style="width:360px; background:#141a2b; padding:1rem; border-left:2px solid #1f2337; overflow-y:auto;">
        <h3 style="color:#5fd8ff; text-align:center;">Course Content</h3>
        <div id="topicsList">Loading topics...</div>
      </div>
    </div>
  `;

  const listEl = document.getElementById("topicsList");
  const videoEl = document.getElementById("videoContainer");
  const descEl = document.getElementById("topicDescription");
  const titleEl = document.getElementById("topicTitle");
  const resEl = document.getElementById("topicResources");

  let topics = [];
  let currentIndex = 0;

  // ---------- LOAD TOPICS ----------
  async function loadTopics() {
    try {
      const response = await apiRequest(`/courses/${courseId}/topics`, "GET", null, true);
      topics = response.filter(t => t.isActive);

      if (!topics.length) {
        listEl.innerHTML = `<p>No valid topics found.</p>`;
        return;
      }

      listEl.innerHTML = "";
      topics.forEach((topic, i) => {
        const div = document.createElement("div");
        div.className = "topic-item";
        div.style.cssText = `
          padding:0.8rem 1rem;
          margin-bottom:0.6rem;
          background:#1a2035;
          border-radius:8px;
          cursor:pointer;
          color:#fff;
          transition:background 0.3s;
        `;
        div.innerHTML = `
          <h4 style="margin:0;">${i + 1}. ${topic.name}</h4>
          <p style="margin:0; color:#a9b1d6; font-size:0.85rem;">${topic.description || ""}</p>
        `;
        div.onclick = () => openTopic(i);
        listEl.appendChild(div);
      });

      openTopic(0);
    } catch (err) {
      console.error("loadTopics error:", err);
      listEl.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
  }

  // ---------- OPEN TOPIC ----------
  function openTopic(index) {
    currentIndex = index;
    const topic = topics[index];

    // highlight sidebar item
    document.querySelectorAll(".topic-item").forEach((e, i) => {
      e.style.background =
        i === index ? "linear-gradient(90deg, #d91d42, #3245ff)" : "#1a2035";
    });

    titleEl.textContent = topic.name;
    descEl.textContent = topic.description || "";
    videoEl.innerHTML = "";
    resEl.innerHTML = "";

    // render main video
    if (topic.primaryVideoUrl) {
      renderDriveVideo(topic.primaryVideoUrl);
    } else {
      videoEl.innerHTML = `<p style="color:#777;">No video available for this topic.</p>`;
    }

    // render resources (PDFs, images, links)
    if (Array.isArray(topic.resources) && topic.resources.length) {
      topic.resources.forEach((r) => {
        const url = r.url || "";
        let content = "";

        if (url.endsWith(".pdf")) {
          content = `
            <button 
              style="margin-top:8px;background:#3245ff;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;"
              onclick="openPdfPopup('${url}')">
              View PDF
            </button>`;
        } else if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
          content = `<img src="${url}" alt="Resource" style="max-width:100%;border-radius:8px;">`;
        } else {
          content = `<p><a href="${url}" target="_blank" style="color:#5fd8ff;">${r.label || "Open Resource"}</a></p>`;
        }

        resEl.innerHTML += `
          <div style="margin-top:1rem;padding:1rem;background:#1a2035;border-radius:8px;">
            <strong>${r.label || "Resource"}</strong><br>${content}
          </div>`;
      });
    } else {
      resEl.innerHTML = `<p>No additional resources.</p>`;
    }
  }

  // ---------- GOOGLE DRIVE VIDEO PROXY PLAYER ----------
function renderDriveVideo(url) {
  const match = url.match(/\/file\/d\/([^/]+)/);
  const fileId = match ? match[1] : null;

  if (!fileId) {
    videoEl.innerHTML = `<p style="color:red;">Invalid Google Drive video link.</p>`;
    return;
  }

  // ✅ Use backend proxy instead of Google Drive direct URL
  const backendBase =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://your-backend-domain.com"; // change this when you deploy

  const proxyUrl = `${backendBase}/api/drive-video/${fileId}`;

  videoEl.innerHTML = `
    <video
      width="100%"
      height="500"
      controls
      controlsList="nodownload noplaybackrate"
      disablePictureInPicture
      oncontextmenu="return false"
      style="border-radius:10px; background:#000;">
      <source src="${proxyUrl}" type="video/mp4">
      Your browser does not support HTML5 video.
    </video>
  `;
}




  // ---------- AUTO NEXT TOPIC / TEST ----------
  function trackVideoCompletion() {
    const SIMULATED_WATCH_DURATION = 180000; // 3 minutes
    clearTimeout(window.videoTimer);
    window.videoTimer = setTimeout(() => {
      if (currentIndex + 1 < topics.length) {
        openTopic(currentIndex + 1);
      } else {
        window.location.href = "topic-tests.html";
      }
    }, SIMULATED_WATCH_DURATION);
  }

  // ---------- SECURE PDF POPUP ----------
  window.openPdfPopup = function (url) {
    const modal = document.createElement("div");
    modal.style.cssText = `
      position:fixed;
      top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.85);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:9999;
    `;

    modal.innerHTML = `
      <div style="background:#121826; border-radius:10px; width:80%; height:90%; position:relative; box-shadow:0 0 20px rgba(0,0,0,0.6);">
        <button id="closePdfBtn" style="
          position:absolute; top:10px; right:10px;
          background:#d91d42; border:none; color:white;
          font-size:16px; padding:5px 12px; border-radius:5px; cursor:pointer;">✕ Close</button>
        <iframe src="${url}#toolbar=0&navpanes=0&scrollbar=0"
          width="100%"
          height="100%"
          frameborder="0"
          sandbox="allow-same-origin"
          style="border:none; border-radius:10px;"
          oncontextmenu="return false"></iframe>
      </div>
    `;

    document.body.appendChild(modal);
    document.getElementById("closePdfBtn").onclick = () => modal.remove();
  };

  // ---------- BLOCK DOWNLOAD SHORTCUTS ----------
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && ["s", "u", "p"].includes(e.key.toLowerCase())) e.preventDefault();
  });

  loadTopics();
})();

// assets/js/sidebar.js

function requireAuthStudent() {
  const user = getUser();
  const token = getToken();
  if (!user || !token || user.role !== "student") {
    window.location.href = "login.html";
  }
  return user;
}

function setSidebarActive(id) {
  const links = document.querySelectorAll(".sidebar-link");
  links.forEach((link) => {
    if (link.id === id) link.classList.add("active");
    else link.classList.remove("active");
  });
}

function renderStudentLayout(pageTitle) {
  const user = getUser();

  const layoutHtml = `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <div class="sidebar-logo-pill">N</div>
            <div class="sidebar-logo-text">
              <span class="logo-main">NDR</span>
              <span class="logo-sub">Student Portal</span>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-section-label">Overview</div>
          <a href="home.html" class="sidebar-link" id="nav-home">
            <span class="icon-bullet">●</span>
            <span>Dashboard</span>
          </a>

          <div class="sidebar-section-label">Practice</div>
          <a href="courses.html" class="sidebar-link" id="nav-courses">
            <span class="icon-bullet">●</span>
            <span>Courses & Topics</span>
          </a>
          <a href="tests.html" class="sidebar-link" id="nav-tests">
            <span class="icon-bullet">●</span>
            <span>Topic Tests</span>
          </a>
          <a href="major-tests.html" class="sidebar-link" id="nav-major-tests">
            <span class="icon-bullet">●</span>
            <span>Major Tests</span>
          </a>

          <div class="sidebar-section-label">Communication</div>
          <a href="notifications.html" class="sidebar-link" id="nav-notifications">
            <span class="icon-bullet">●</span>
            <span>Announcements</span>
          </a>
          <a href="queries.html" class="sidebar-link" id="nav-queries">
            <span class="icon-bullet">●</span>
            <span>Queries</span>
          </a>

          <div class="sidebar-section-label">Account</div>
          <a href="profile.html" class="sidebar-link" id="nav-profile">
            <span class="icon-bullet">●</span>
            <span>Profile</span>
          </a>
          <a href="settings.html" class="sidebar-link" id="nav-settings">
            <span class="icon-bullet">●</span>
            <span>Settings</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a href="logout.html" class="sidebar-link sidebar-link-logout" id="nav-logout">
            <span>Logout</span>
          </a>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div class="topbar-left">
            <div class="topbar-title">${pageTitle || "NDR Portal"}</div>
            <div class="topbar-breadcrumb">NDR Web • Student</div>
          </div>
          <div class="topbar-right">
            <div class="topbar-user-chip">
              <div class="user-avatar">
                ${(user && user.name ? user.name[0] : "S").toUpperCase()}
              </div>
              <div class="user-meta">
                <div class="user-name">${user?.name || "Student"}</div>
                <div class="user-email">${user?.email || ""}</div>
              </div>
            </div>
          </div>
        </header>

        <section class="content" id="pageContent"></section>
      </main>
    </div>
  `;

  document.body.innerHTML = layoutHtml;
}

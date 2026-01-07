// ===============================
// ADMIN AUTH HELPERS
// ===============================

// Get stored user
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("ndr_user"));
  } catch {
    return null;
  }
}

// Get stored token
function getToken() {
  return localStorage.getItem("ndr_token");
}

// Save user + token after login
function saveUserAndToken(user, token) {
  localStorage.setItem("ndr_user", JSON.stringify(user));
  localStorage.setItem("ndr_token", token);
}

// Require admin access
function requireAuthAdmin() {
  const user = getUser();
  const token = getToken();

  if (!user || !token || user.role !== "admin") {
    window.location.href = "admin-login.html";
    return null;
  }

  return user;
}

// ===============================
// ADMIN LAYOUT RENDER
// ===============================

function renderAdminLayout(pageTitle) {
  const user = getUser();

  const layoutHtml = `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <img src="../assets/images/logo.png"
                alt="NDR Logo"
                style="width:40px;height:40px;border-radius:8px;object-fit:cover;" />
            <div class="sidebar-logo-text">
                <span class="logo-main">NDR</span>
                <span class="logo-sub">Admin Console</span>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-section-label">Overview</div>
          <a href="admin-dashboard.html" class="sidebar-link" id="admin-nav-dashboard">
            <span class="icon-bullet">●</span><span>Dashboard</span>
          </a>

          <div class="sidebar-section-label">Content</div>
          <a href="add-course.html" class="sidebar-link" id="admin-nav-course"><span class="icon-bullet">●</span><span>Courses</span></a>
          <a href="add-topic.html" class="sidebar-link" id="admin-nav-topic"><span class="icon-bullet">●</span><span>Topics</span></a>
          <a href="add-test.html" class="sidebar-link" id="admin-nav-test"><span class="icon-bullet">●</span><span>Topic Tests</span></a>
          <a href="add-major-test.html" class="sidebar-link" id="admin-nav-major"><span class="icon-bullet">●</span><span>Major Tests</span></a>

          <div class="sidebar-section-label">Students</div>
          <a href="approve-users.html" class="sidebar-link" id="admin-nav-users"><span class="icon-bullet">●</span><span>Approve Users</span></a>
          <a href="announcements.html" class="sidebar-link" id="admin-nav-ann"><span class="icon-bullet">●</span><span>Announcements</span></a>
          <a href="queries.html" class="sidebar-link" id="admin-nav-queries"><span class="icon-bullet">●</span><span>Student Queries</span></a>
        </nav>

        <div class="sidebar-footer">
          <a href="../logout.html" class="sidebar-link sidebar-link-logout"><span>Logout</span></a>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div class="topbar-left">
            <div class="topbar-title">${pageTitle || "Admin Panel"}</div>
            <div class="topbar-breadcrumb">NDR Web • Admin</div>
          </div>
          <div class="topbar-right">
            <div class="topbar-user-chip">
              <div class="user-avatar">${user && user.name ? user.name[0].toUpperCase() : "A"}</div>
              <div class="user-meta">
                <div class="user-name">${user?.name || "Admin"}</div>
                <div class="user-email">${user?.email || ""}</div>
              </div>
            </div>
          </div>
        </header>

        <section class="content" id="adminPageContent"></section>
      </main>
    </div>
  `;

  document.body.innerHTML = layoutHtml;
}

function setAdminNavActive(id) {
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.classList.toggle("active", link.id === id);
  });
}

// ===============================
// ADMIN AUTH LOGIC (OTP + PASSWORD)
// ===============================

// Elements
const adminSendOtpBtn = document.getElementById("adminSendOtpBtn");
const adminEmailInput = document.getElementById("adminLoginEmail");

const adminOtpRow = document.getElementById("adminOtpRow");
const adminOtpInput = document.getElementById("adminLoginOtp");
const adminVerifyOtpBtn = document.getElementById("adminVerifyOtpBtn");
const adminResendOtpBtn = document.getElementById("adminResendOtpBtn");

const adminLoginError = document.getElementById("adminLoginError");
const adminOtpError = document.getElementById("adminOtpError");

let adminCurrentEmailForOtp = null;

// API calls
async function adminSendOtp(email) {
  return apiRequest("/auth/request-otp", "POST", { email });
}
async function adminVerifyOtp(email, otp) {
  return apiRequest("/auth/verify-otp", "POST", { email, otp });
}
async function adminLoginPassword(email, password) {
  return apiRequest("/auth/login", "POST", { email, password });
}

function adminShowOtpUI(email) {
  adminCurrentEmailForOtp = email;
  if (adminOtpRow) adminOtpRow.style.display = "block";
  if (adminSendOtpBtn) adminSendOtpBtn.style.display = "none";
  if (adminOtpInput) adminOtpInput.focus();
  adminLoginError.textContent = "";
}

// OTP LOGIN
if (adminSendOtpBtn) {
  adminSendOtpBtn.addEventListener("click", async () => {
    adminLoginError.textContent = "";
    adminOtpError.textContent = "";
    const email = (adminEmailInput.value || "").trim();
    if (!email) { adminLoginError.textContent = "Enter admin email"; return; }
    try {
      await adminSendOtp(email);
      adminShowOtpUI(email);
      adminLoginError.textContent = "OTP sent — check your email.";
    } catch (err) {
      adminLoginError.textContent = err.message || "Failed to send OTP";
    }
  });
}

if (adminVerifyOtpBtn) {
  adminVerifyOtpBtn.addEventListener("click", async () => {
    adminOtpError.textContent = "";
    if (!adminCurrentEmailForOtp) { adminOtpError.textContent = "No OTP requested."; return; }
    const otp = (adminOtpInput.value || "").trim();
    if (!otp) { adminOtpError.textContent = "Enter the code"; return; }
    try {
      const res = await adminVerifyOtp(adminCurrentEmailForOtp, otp);
      if (!res.user || res.user.role !== "admin") {
        adminOtpError.textContent = "Invalid admin account";
        return;
      }
      saveUserAndToken(res.user, res.token);
      window.location.href = "admin-dashboard.html";
    } catch (err) {
      adminOtpError.textContent = err.message || "OTP verification failed";
    }
  });
}

if (adminResendOtpBtn) {
  adminResendOtpBtn.addEventListener("click", async () => {
    adminOtpError.textContent = "";
    if (!adminCurrentEmailForOtp) { adminOtpError.textContent = "No email to resend to."; return; }
    try {
      await adminSendOtp(adminCurrentEmailForOtp);
      adminOtpError.style.color = "#86efac";
      adminOtpError.textContent = "OTP resent — check email.";
      setTimeout(() => { adminOtpError.textContent = ""; adminOtpError.style.color = ""; }, 2800);
    } catch (err) {
      adminOtpError.textContent = err.message || "Could not resend OTP";
    }
  });
}

// PASSWORD LOGIN
const adminPwLoginForm = document.getElementById("adminPasswordLoginForm");
const adminPwEmail = document.getElementById("adminLoginEmailPw");
const adminPwPassword = document.getElementById("adminLoginPassword");
const adminPwError = document.getElementById("adminPwError");

if (adminPwLoginForm) {
  adminPwLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    adminPwError.textContent = "";
    const email = adminPwEmail.value.trim();
    const password = adminPwPassword.value.trim();
    if (!email || !password) {
      adminPwError.textContent = "Enter email and password.";
      return;
    }

    try {
      const res = await adminLoginPassword(email, password);
      if (!res.user || res.user.role !== "admin") {
        adminPwError.textContent = "Access denied — not an admin account.";
        return;
      }
      saveUserAndToken(res.user, res.token);
      window.location.href = "admin-dashboard.html";
    } catch (err) {
      adminPwError.textContent = err.message || "Login failed.";
    }
  });
}

// TOGGLE LOGIN MODES
const toggleAdminPasswordLogin = document.getElementById("toggleAdminPasswordLogin");
const toggleAdminOtpLogin = document.getElementById("toggleAdminOtpLogin");
const adminPasswordLoginForm = document.getElementById("adminPasswordLoginForm");
const adminOtpLoginForm = document.getElementById("adminLoginForm");

if (toggleAdminPasswordLogin && toggleAdminOtpLogin) {
  toggleAdminPasswordLogin.addEventListener("click", () => {
    adminPasswordLoginForm.style.display = "block";
    adminOtpLoginForm.style.display = "none";
  });

  toggleAdminOtpLogin.addEventListener("click", () => {
    adminPasswordLoginForm.style.display = "none";
    adminOtpLoginForm.style.display = "block";
  });
}

// =======================================================
// frontend/assets/js/auth.js
// depends on: apiRequest (assets/js/api.js), storage.js
// =======================================================

// ================== LOGIN WITH OTP ==================

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("loginEmail");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const loginOtpRow = document.getElementById("loginOtpRow");
const loginOtpInput = document.getElementById("loginOtp");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const resendOtpBtn = document.getElementById("resendOtpBtn");
const loginError = document.getElementById("loginError");
const otpError = document.getElementById("otpError");
const pwForm = document.getElementById("passwordLoginForm");
const pwEmail = document.getElementById("pwEmail");
const pwPassword = document.getElementById("pwPassword");
const pwError = document.getElementById("pwError");

if (pwForm) {
  pwForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    pwError.textContent = "";

    const email = pwEmail.value.trim();
    const password = pwPassword.value.trim();
    if (!email || !password) {
      pwError.textContent = "Email and password are required.";
      return;
    }

    try {
      const res = await apiRequest("/auth/login", "POST", { email, password });
      const user = res.user || {};
      saveUserAndToken(user, res.token);
      if (user.role === "admin") {
        window.location.href = "admin/admin-dashboard.html";
      } else {
        window.location.href = "home.html";
      }
    } catch (err) {
      pwError.textContent = err.message || "Login failed.";
    }
  });
}

// ================== TOGGLE BETWEEN LOGIN METHODS (ADDED) ==================
const togglePasswordLogin = document.getElementById("togglePasswordLogin");
const toggleOtpLogin = document.getElementById("toggleOtpLogin");
const passwordLoginForm = document.getElementById("passwordLoginForm");
const otpLoginForm = document.getElementById("loginForm");

if (togglePasswordLogin && toggleOtpLogin) {
  togglePasswordLogin.addEventListener("click", () => {
    passwordLoginForm.style.display = "block";
    otpLoginForm.style.display = "none";
  });

  toggleOtpLogin.addEventListener("click", () => {
    passwordLoginForm.style.display = "none";
    otpLoginForm.style.display = "block";
  });
}

// ================== LOGIN WITH OTP ==================

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("loginEmail");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const loginOtpRow = document.getElementById("loginOtpRow");
const loginOtpInput = document.getElementById("loginOtp");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const resendOtpBtn = document.getElementById("resendOtpBtn");
const loginError = document.getElementById("loginError");
const otpError = document.getElementById("otpError");

let currentEmailForOtp = null;

// ---- API Helpers ----
async function sendOtp(email) {
  return apiRequest("/auth/request-otp", "POST", { email });
}

async function verifyOtp(email, otp) {
  return apiRequest("/auth/verify-otp", "POST", { email, otp });
}

// ---- UI Helpers ----
function showOtpUI(email) {
  currentEmailForOtp = email;
  if (loginOtpRow) loginOtpRow.style.display = "block";
  if (sendOtpBtn) sendOtpBtn.style.display = "none";
  if (loginError) loginError.textContent = "";
  if (loginOtpInput) loginOtpInput.focus();
}

function hideOtpUI() {
  currentEmailForOtp = null;
  if (loginOtpRow) loginOtpRow.style.display = "none";
  if (sendOtpBtn) sendOtpBtn.style.display = "inline-block";
  if (otpError) otpError.textContent = "";
}

// ---- SEND OTP ----
if (sendOtpBtn) {
  sendOtpBtn.addEventListener("click", async () => {
    loginError.textContent = "";
    otpError.textContent = "";
    const email = (emailInput.value || "").trim();

    if (!email) {
      loginError.textContent = "Enter email";
      return;
    }

    try {
      await sendOtp(email);
      showOtpUI(email);
      loginError.style.color = "#86efac";
      loginError.textContent = "OTP sent — check your email.";
    } catch (err) {
      loginError.style.color = "#f87171";
      loginError.textContent = err.message || "Failed to send OTP.";
    }
  });
}

// ---- VERIFY OTP ----
if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener("click", async () => {
    otpError.textContent = "";
    if (!currentEmailForOtp) {
      otpError.textContent = "No OTP requested. Enter email and click Send code.";
      return;
    }

    const otp = (loginOtpInput.value || "").trim();
    if (!otp) {
      otpError.textContent = "Enter the OTP code.";
      return;
    }

    try {
      const res = await verifyOtp(currentEmailForOtp, otp);
      let user = res.user || {};

      // ✅ Normalize allowedCourses data
      if (!user.allowedCourses || !Array.isArray(user.allowedCourses)) {
        if (user.selectedCourse) {
          user.allowedCourses = [user.selectedCourse];
        } else {
          // fallback (local users if using mock storage)
          const localUsers = JSON.parse(localStorage.getItem("ndr_users") || "[]");
          const found = localUsers.find((u) => u.email === user.email);
          if (found?.allowedCourses) user.allowedCourses = found.allowedCourses;
          else if (found?.selectedCourse) user.allowedCourses = [found.selectedCourse];
          else user.allowedCourses = [];
        }
      }

      // ✅ Save login session
      saveUserAndToken(user, res.token);

      // Redirect based on role
      if (user.role === "admin") {
        window.location.href = "admin/admin-dashboard.html";
      } else {
        window.location.href = "home.html";
      }
    } catch (err) {
      otpError.style.color = "#f87171";
      otpError.textContent = err.message || "OTP verification failed.";
    }
  });
}

// ---- RESEND OTP ----
// ---- VERIFY OTP ----
if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener("click", async () => {
    otpError.textContent = "";
    if (!currentEmailForOtp) {
      otpError.textContent = "No OTP requested. Enter email and click Send code.";
      return;
    }

    const otp = (loginOtpInput.value || "").trim();
    if (!otp) {
      otpError.textContent = "Enter the OTP code.";
      return;
    }

    try {
      const res = await verifyOtp(currentEmailForOtp, otp);
      let user = res.user || {};

      console.log("✅ Backend verifyOtp response:", user);

      // ✅ Ensure allowedCourses is an array of integers
      if (typeof user.allowedCourses === "string") {
        try {
          user.allowedCourses = user.allowedCourses
            .replace(/[{}]/g, "")
            .split(",")
            .map((n) => parseInt(n.trim(), 10))
            .filter((n) => !isNaN(n));
        } catch {
          user.allowedCourses = [];
        }
      }

      if (!Array.isArray(user.allowedCourses)) {
        if (user.selectedCourse) {
          user.allowedCourses = [user.selectedCourse];
        } else {
          user.allowedCourses = [];
        }
      }

      console.log("🎯 Final allowedCourses (frontend):", user.allowedCourses);

      // ✅ Save user & token
      saveUserAndToken(user, res.token);
      console.log("💾 Stored user in localStorage:", JSON.parse(localStorage.getItem("ndr_logged_user")));

      // ✅ Redirect by role
      if (user.role === "admin") {
        window.location.href = "admin/admin-dashboard.html";
      } else {
        window.location.href = "home.html";
      }
    } catch (err) {
      otpError.style.color = "#f87171";
      otpError.textContent = err.message || "OTP verification failed.";
    }
  });
}

// ================== COURSE ACCESS CONTROL ==================
function getLoggedUser() {
  try {
    return JSON.parse(localStorage.getItem("ndr_logged_user") || "{}");
  } catch {
    return {};
  }
}

// ================== REGISTRATION ==================

const registerForm = document.getElementById("registerForm");
const regName = document.getElementById("regName");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const regCourse = document.getElementById("regCourse");
const regError = document.getElementById("regError");
const regSuccess = document.getElementById("regSuccess");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    regError.textContent = "";
    regSuccess.textContent = "";

    const name = regName.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value.trim();
    const selectedCourse = parseInt(regCourse.value, 10); // ensure integer

    console.log("📤 Registering:", { name, email, selectedCourse });

    if (!name || !email || !password || !selectedCourse) {
      regError.textContent = "All fields including course are required.";
      return;
    }

    try {
      const res = await apiRequest("/auth/register", "POST", {
        name,
        email,
        password,
        selectedCourse,
      });

      regSuccess.textContent =
        res.message || "Registered successfully. Wait for admin approval.";
      registerForm.reset();
      setTimeout(() => (window.location.href = "login.html"), 2000);
    } catch (err) {
      console.error("❌ Registration failed:", err);
      regError.textContent = err.message || "Registration failed.";
    }
  });
}

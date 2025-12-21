// frontend/assets/js/auth.js
// depends on apiRequest (assets/js/api.js) and saveUserAndToken (assets/js/storage.js)

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

async function sendOtp(email) {
  return apiRequest("https://ndrwebapplication-1.onrender.com/auth/request-otp", "POST", { email });
}

async function verifyOtp(email, otp) {
  return apiRequest("https://ndrwebapplication-1.onrender.com/auth/verify-otp", "POST", { email, otp });
}

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

if (sendOtpBtn) {
  sendOtpBtn.addEventListener("click", async () => {
    loginError.textContent = "";
    otpError.textContent = "";
    const email = (emailInput.value || "").trim();
    if (!email) { loginError.textContent = "Enter email"; return; }
    try {
      await sendOtp(email);
      showOtpUI(email);
      loginError.textContent = "OTP sent — check your email.";
    } catch (err) {
      loginError.textContent = err.message || "Failed to send OTP";
    }
  });
}

if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener("click", async () => {
    otpError.textContent = "";
    if (!currentEmailForOtp) { otpError.textContent = "No OTP requested. Enter email and click Send code."; return; }
    const otp = (loginOtpInput.value || "").trim();
    if (!otp) { otpError.textContent = "Enter the code"; return; }
    try {
      const res = await verifyOtp(currentEmailForOtp, otp);
      saveUserAndToken(res.user, res.token);
      if (res.user.role === "admin") window.location.href = "admin/admin-dashboard.html";
      else window.location.href = "home.html";
    } catch (err) {
      otpError.textContent = err.message || "OTP verification failed";
    }
  });
}

if (resendOtpBtn) {
  resendOtpBtn.addEventListener("click", async () => {
    otpError.textContent = "";
    if (!currentEmailForOtp) { otpError.textContent = "No email to resend to."; return; }
    try {
      await sendOtp(currentEmailForOtp);
      otpError.style.color = "#86efac";
      otpError.textContent = "OTP resent — check email.";
      setTimeout(() => { otpError.textContent = ""; otpError.style.color = ""; }, 2800);
    } catch (err) {
      otpError.textContent = err.message || "Could not resend OTP";
    }
  });
}

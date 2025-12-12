// assets/js/settings.js

(async function init() {
  requireAuthStudent();
  renderStudentLayout("Settings");

  // 🔥 FIX: highlight Settings tab, not Profile
  setSidebarActive("nav-settings");

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <h2 class="section-title">Change Password</h2>
    <div class="card">
      <div class="card-title">Update your password</div>
      <form id="pwdForm" style="margin-top:0.7rem; display:flex; flex-direction:column; gap:0.7rem;">
        <div>
          <label style="font-size:0.8rem;">Current Password</label>
          <input
            type="password"
            id="curPwd"
            required
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label style="font-size:0.8rem;">New Password</label>
          <input
            type="password"
            id="newPwd"
            required
            minlength="6"
            placeholder="Minimum 6 characters"
          />
        </div>
        <button
          type="submit"
          class="btn"
          style="margin-top:0.3rem; align-self:flex-start; font-size:0.85rem;"
        >
          Change Password
        </button>
        <p id="pwdMsg" style="font-size:0.85rem;"></p>
      </form>
    </div>
  `;

  const form = document.getElementById("pwdForm");
  const msgEl = document.getElementById("pwdMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.style.color = "#6b7280";
    msgEl.textContent = "Updating...";

    const currentPassword = document.getElementById("curPwd").value.trim();
    const newPassword = document.getElementById("newPwd").value.trim();

    try {
      await apiRequest(
        "/users/change-password",
        "PUT",
        { currentPassword, newPassword },
        true
      );
      msgEl.style.color = "#16a34a";
      msgEl.textContent = "Password updated successfully.";
      form.reset();
    } catch (err) {
      msgEl.style.color = "#ef4444";
      msgEl.textContent = err.message;
    }
  });
})();

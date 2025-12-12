// assets/js/profile.js

(async function init() {
  const user = requireAuthStudent();
  renderStudentLayout("Profile");
  setSidebarActive("nav-profile");

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <h2 class="section-title">Profile</h2>
    <div class="card" style="margin-bottom:1rem;">
      <div class="card-title">Account details</div>
      <div style="margin-top:0.6rem; font-size:0.9rem; display:grid; gap:0.25rem;">
        <div><strong>Name:</strong> <span id="profName">${user.name}</span></div>
        <div><strong>Email:</strong> <span id="profEmail">${user.email}</span></div>
        <div><strong>Role:</strong> ${user.role}</div>
        <div><strong>Status:</strong> ${
          user.isApproved ? "Approved" : "Pending approval"
        }</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Update profile</div>
      <form id="profileForm" style="margin-top:0.8rem; display:flex; flex-direction:column; gap:0.7rem;">
        <div>
          <label style="font-size:0.8rem;">Full Name</label>
          <input id="updName" value="${user.name}" placeholder="Your full name" />
        </div>
        <div>
          <label style="font-size:0.8rem;">Email</label>
          <input id="updEmail" value="${user.email}" placeholder="you@example.com" />
        </div>
        <button
          type="submit"
          class="btn"
          style="margin-top:0.3rem; align-self:flex-start; font-size:0.85rem;"
        >
          Save Changes
        </button>
        <p id="profMsg" style="font-size:0.85rem;"></p>
      </form>
    </div>
  `;

  const form = document.getElementById("profileForm");
  const msgEl = document.getElementById("profMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.style.color = "#6b7280";
    msgEl.textContent = "Updating...";

    const name = document.getElementById("updName").value.trim();
    const email = document.getElementById("updEmail").value.trim();

    try {
      const data = await apiRequest(
        "/users/me",
        "PUT",
        { name, email },
        true
      );
      msgEl.style.color = "#16a34a";
      msgEl.textContent = "Profile updated.";

      saveUserAndToken(data.user, getToken());
      document.getElementById("profName").textContent = data.user.name;
      document.getElementById("profEmail").textContent = data.user.email;
    } catch (err) {
      msgEl.style.color = "#ef4444";
      msgEl.textContent = err.message;
    }
  });
})();

// ==============================
// storage.js (Standardized)
// ==============================

// Save user + token consistently
function saveUserAndToken(user, token) {
  if (token) localStorage.setItem("ndr_token", token);
  if (user) localStorage.setItem("ndr_logged_user", JSON.stringify(user));
}

// Get token
function getToken() {
  return localStorage.getItem("ndr_token");
}
// Add at the bottom of storage.js
function getUser() {
  return getLoggedUser();
}


// Get logged user
function getLoggedUser() {
  const raw = localStorage.getItem("ndr_logged_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Clear authentication info
function clearAuth() {
  localStorage.removeItem("ndr_token");
  localStorage.removeItem("ndr_logged_user");
}

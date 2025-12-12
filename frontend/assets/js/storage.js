// assets/js/storage.js
function saveUserAndToken(user, token) {
  if (token) localStorage.setItem("ndr_token", token);
  if (user) localStorage.setItem("ndr_user", JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem("ndr_token");
}

function getUser() {
  const raw = localStorage.getItem("ndr_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearAuth() {
  localStorage.removeItem("ndr_token");
  localStorage.removeItem("ndr_user");
}

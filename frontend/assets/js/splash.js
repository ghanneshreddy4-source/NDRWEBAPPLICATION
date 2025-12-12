// assets/js/splash.js
window.addEventListener("load", () => {
  const user = getUser();
  const token = getToken();

  setTimeout(() => {
    if (token && user) {
      window.location.href = "home.html";
    } else {
      window.location.href = "login.html";
    }
  }, 2000);
});

document.addEventListener("DOMContentLoaded", () => {
  const authContainer = document.getElementById("authContainer");
  const passwordToggles = document.querySelectorAll(".toggle-password");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (!authContainer) {
    console.error("authContainer not found");
    return;
  }

  function openRegister() {
    authContainer.classList.add("register-mode");
  }

  function openLogin() {
    authContainer.classList.remove("register-mode");
  }

  document.addEventListener("click", event => {
    const registerButton = event.target.closest("#showRegisterBtn, #mobileRegisterBtn");
    const loginButton = event.target.closest("#showLoginBtn, #mobileLoginBtn");

    if (registerButton) {
      openRegister();
    }

    if (loginButton) {
      openLogin();
    }
  });

  const params = new URLSearchParams(window.location.search);

  if (params.get("mode") === "register") {
    openRegister();
  }

  passwordToggles.forEach(button => {
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector(".password-input");
      const icon = button.querySelector(".material-symbols-outlined");

      if (!input || !icon) return;

      if (input.type === "password") {
        input.type = "text";
        icon.textContent = "visibility_off";
      } else {
        input.type = "password";
        icon.textContent = "visibility";
      }
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      window.location.href = "../executive_dashboard/index.html";
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", event => {
      event.preventDefault();
      window.location.href = "../executive_dashboard/index.html";
    });
  }
});
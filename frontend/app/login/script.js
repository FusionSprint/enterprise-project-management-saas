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
    loginForm.addEventListener("submit", async event => {
      event.preventDefault();

      const emailInput = document.getElementById("loginEmail");
      const passwordInput = document.getElementById("loginPassword");
      const errorEl = document.getElementById("loginError");
      const submitBtn = document.getElementById("loginSubmitBtn");

      if (!emailInput || !passwordInput || !window.EPM_API) {
        window.location.href = "../workspace_dashboard/index.html";
        return;
      }

      errorEl.style.display = "none";
      const originalLabel = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Signing in…";

      try {
        const result = await window.EPM_API.auth.login(
          emailInput.value.trim(),
          passwordInput.value
        );
        window.EPM_API.setToken(result.access_token);
        window.location.href = "../workspace_dashboard/index.html";
      } catch (err) {
        errorEl.textContent = err.message || "Login failed. Please try again.";
        errorEl.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalLabel;
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async event => {
      event.preventDefault();

      const nameInput = document.getElementById("registerName");
      const emailInput = document.getElementById("registerEmail");
      const passwordInput = document.getElementById("registerPassword");
      const errorEl = document.getElementById("registerError");
      const submitBtn = document.getElementById("registerSubmitBtn");

      if (!nameInput || !emailInput || !passwordInput || !window.EPM_API) {
        window.location.href = "../workspace_dashboard/index.html";
        return;
      }

      errorEl.style.display = "none";
      const originalLabel = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Creating account…";

      try {
        await window.EPM_API.auth.register(
          nameInput.value.trim(),
          emailInput.value.trim(),
          passwordInput.value
        );
        // Registration succeeded; log the new user in immediately.
        const result = await window.EPM_API.auth.login(
          emailInput.value.trim(),
          passwordInput.value
        );
        window.EPM_API.setToken(result.access_token);
        window.location.href = "../workspace_dashboard/index.html";
      } catch (err) {
        errorEl.textContent = err.message || "Registration failed. Please try again.";
        errorEl.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalLabel;
      }
    });
  }
});
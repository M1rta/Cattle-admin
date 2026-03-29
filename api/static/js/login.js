const API = "";

document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    return alert("Completa todos los campos.");
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return alert(data.error || "Login inválido");
    }

    localStorage.setItem("token", data.token);

    window.location.href = "/index";

  } catch (err) {
    console.error(err);
    alert("Error conectando con el backend.");
  }
});
const API = "http://127.0.0.1:5000";

document.getElementById("btn-login").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login inválido");

    localStorage.setItem("token", data.token);
    window.location.href = "index.html";
  } catch (err) {
    document.getElementById("msg").innerText = err.message || "Failed to fetch (backend caído o endpoint no existe)";
  }
});
  // Evita que el form recargue la página
  
document.getElementById("login-form")?.addEventListener("submit", (e) => e.preventDefault());

  document.getElementById("btn-login").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) return alert("Completa todos los campos.");

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return alert(data.error || "Login falló.");
      }

      // Guarda token
      localStorage.setItem("token", data.token);

      // Opcional: guardar user
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      // Ir al sistema
      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      alert("Failed to fetch: revisa que el backend esté corriendo en http://127.0.0.1:5000");
    }
  });
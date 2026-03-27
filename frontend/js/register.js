const API = "http://127.0.0.1:5000";

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const p1 = document.getElementById("register-password").value.trim();
  const p2 = document.getElementById("register-password2").value.trim();

  if (!nombre || !email || !p1 || !p2) {
    alert("Completa todos los campos.");
    return;
  }

  if (p1 !== p2) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  if (p1.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        email,
        password: p1
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.error || "Error registrando usuario");
      return;
    }

    alert("✅ Cuenta creada. Revisa tu correo e inicia sesión.");
    window.location.href = "login.html";
  } catch (err) {
    console.error(err);
    alert("❌ Failed to fetch. Revisa que el backend esté corriendo en 127.0.0.1:5000");
  }
});
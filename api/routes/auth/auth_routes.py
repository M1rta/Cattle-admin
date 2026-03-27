from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from db.connection import get_connection
from utils.email_sender import send_welcome_email

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.json or {}

    nombre = (data.get("nombre") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not nombre or not email or not password:
        return jsonify({"error": "Faltan campos: nombre, email, password"}), 400

    if len(password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

    password_hash = generate_password_hash(password)

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO users (nombre, email, password_hash)
            VALUES (?, ?, ?)
        """, (nombre, email, password_hash))

        conn.commit()

        try:
            send_welcome_email(email, nombre)
        except Exception as email_error:
            print("Error enviando correo:", email_error)

        return jsonify({"message": "Usuario registrado correctamente"}), 201

    except Exception as e:
        msg = str(e).lower()
        if "unique" in msg or "users.email" in msg:
            return jsonify({"error": "Ese email ya está registrado"}), 409
        return jsonify({"error": f"Error registrando usuario: {str(e)}"}), 500

    finally:
        conn.close()


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.json or {}

    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "Faltan campos: email, password"}), 400

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, nombre, email, password_hash FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Credenciales inválidas"}), 401

    user = dict(row)

    if not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    return jsonify({
        "message": "Login OK",
        "token": str(user["id"]),
        "user": {
            "id": user["id"],
            "nombre": user.get("nombre"),
            "email": user["email"]
        }
    }), 200
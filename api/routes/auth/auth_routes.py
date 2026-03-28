from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
# Cambiamos get_connection por get_db
from db.connection import get_db 
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
    
    # Obtenemos la base de datos de MongoDB
    db = get_db()

    try:
        # Verificamos si el email ya existe en MongoDB
        if db.users.find_one({"email": email}):
            return jsonify({"error": "Ese email ya está registrado"}), 409

        # Insertamos el nuevo usuario
        nuevo_usuario = {
            "nombre": nombre,
            "email": email,
            "password_hash": password_hash
        }
        
        resultado = db.users.insert_one(nuevo_usuario)

        # Intentamos enviar el correo
        try:
            send_welcome_email(email, nombre)
        except Exception as email_error:
            print("Error enviando correo:", email_error)

        return jsonify({"message": "Usuario registrado correctamente"}), 201

    except Exception as e:
        return jsonify({"error": f"Error registrando usuario: {str(e)}"}), 500


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.json or {}

    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "Faltan campos: email, password"}), 400

    db = get_db()
    
    # Buscamos al usuario por email
    user = db.users.find_one({"email": email})

    if not user:
        return jsonify({"error": "Credenciales inválidas"}), 401

    # Verificamos la contraseña
    if not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    # En MongoDB el ID es un objeto especial llamado ObjectId, lo pasamos a string
    user_id = str(user["_id"])

    return jsonify({
        "message": "Login OK",
        "token": user_id,
        "user": {
            "id": user_id,
            "nombre": user.get("nombre"),
            "email": user["email"]
        }
    }), 200
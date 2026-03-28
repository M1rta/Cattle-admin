from flask import jsonify, request
from utils.auth import get_user_id_from_auth
from services.ganado_service import (
    crear_ganado,
    listar_ganado,
    actualizar_ganado_db,
    eliminar_ganado_db,
    mover_ganado_db,
    listar_catalogo_vacunas,
    animal_pertenece_a_usuario,
    vacunas_de_animal_db,
    asignar_vacunas_db,
)

def ping_controller():
    return jsonify({"message": "Servidor funcionando"})

# -------------------------
# GANADO CRUD
# -------------------------
def agregar_ganado_controller():
    user_id = get_user_id_from_auth()
    if not user_id:
        return jsonify({"error": "No autorizado"}), 401

    data = request.json or {}
    payload, status = crear_ganado(user_id, data)
    return jsonify(payload), status


def ver_ganado_controller():
    user_id = get_user_id_from_auth()
    if not user_id:
        return jsonify({"error": "No autorizado"}), 401

    rows, status = listar_ganado(user_id)
    return jsonify(rows), status


def actualizar_ganado_controller(ganado_id):
    user_id = get_user_id_from_auth()
    if not user_id:
        return jsonify({"error": "No autorizado"}), 401

    data = request.json or {}
    payload, status = actualizar_ganado_db(user_id, ganado_id, data)
    return jsonify(payload), status


def eliminar_ganado_controller(ganado_id):
    user_id = get_user_id_from_auth()
    if not user_id:
        return jsonify({"error": "No autorizado"}), 401

    payload, status = eliminar_ganado_db(user_id, ganado_id)
    return jsonify(payload), status


def mover_ganado_controller(ganado_id):
    user_id = get_user_id_from_auth()
    if not user_id:
        return jsonify({"error": "No autorizado"}), 401

    data = request.json or {}
    payload, status = mover_ganado_db(user_id, ganado_id, data)
    return jsonify(payload), status


# -------------------------
# VACUNAS (CATALOGO)
# -------------------------
def listar_vacunas_controller():
    rows, status = listar_catalogo_vacunas()
    return jsonify(rows), status


# -------------------------
# VACUNAS POR ANIMAL
# -------------------------
def vacunas_de_animal_controller(ganado_id):
    user_id = get_user_id_from_auth()
    if not user_id:
        return jsonify({"error": "No autorizado"}), 401

    if not animal_pertenece_a_usuario(user_id, ganado_id):
        return jsonify({"error": "Ese animal no pertenece a tu usuario"}), 403

    rows, status = vacunas_de_animal_db(user_id, ganado_id)
    return jsonify(rows), status


def asignar_vacunas_controller(ganado_id):
    user_id = get_user_id_from_auth()
    if not user_id:
        return jsonify({"error": "No autorizado"}), 401

    if not animal_pertenece_a_usuario(user_id, ganado_id):
        return jsonify({"error": "Ese animal no pertenece a tu usuario"}), 403

    data = request.json or {}
    payload, status = asignar_vacunas_db(user_id, ganado_id, data)
    return jsonify(payload), status
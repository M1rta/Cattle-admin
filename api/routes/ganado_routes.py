from flask import Blueprint
from controllers.ganado_controller import (
    ping_controller,
    agregar_ganado_controller,
    ver_ganado_controller,
    actualizar_ganado_controller,
    eliminar_ganado_controller,
    mover_ganado_controller,
    listar_vacunas_controller,
    vacunas_de_animal_controller,
    asignar_vacunas_controller,
)

ganado_bp = Blueprint("ganado", __name__)

@ganado_bp.route("/ping")
def ping():
    return ping_controller()

# -------------------------
# GANADO CRUD
# -------------------------
@ganado_bp.route("/ganado", methods=["POST"])
def agregar_ganado():
    return agregar_ganado_controller()

@ganado_bp.route("/ganado", methods=["GET"])
def ver_ganado():
    return ver_ganado_controller()

@ganado_bp.route("/ganado/<id>", methods=["PUT"])
def actualizar_ganado(id):
    return actualizar_ganado_controller(id)

@ganado_bp.route("/ganado/<id>", methods=["DELETE"])
def eliminar_ganado(id):
    return eliminar_ganado_controller(id)

@ganado_bp.route("/ganado/<id>/mover", methods=["PUT"])
def mover_ganado(id):
    return mover_ganado_controller(id)

# -------------------------
# VACUNAS (CATALOGO)
# -------------------------
@ganado_bp.route("/vacunas", methods=["GET"])
def listar_vacunas():
    return listar_vacunas_controller()

# -------------------------
# VACUNAS POR ANIMAL
# -------------------------
@ganado_bp.route("/ganado/<ganado_id>/vacunas", methods=["GET"])
def vacunas_de_animal(ganado_id):
    return vacunas_de_animal_controller(ganado_id)

@ganado_bp.route("/ganado/<ganado_id>/vacunas", methods=["POST"])
def asignar_vacunas(ganado_id):
    return asignar_vacunas_controller(ganado_id)
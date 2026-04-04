from db.connection import get_db
from bson.objectid import ObjectId
from datetime import datetime

# -------------------------
# GANADO (DB)
# -------------------------
def crear_ganado(user_id, data: dict):
    nombre = (data.get("nombre") or "").strip()
    color = (data.get("color") or "").strip()
    edad = data.get("edad", None)
    finca_actual = (data.get("finca_actual") or "").strip().upper()
    tipo = (data.get("tipo") or "").strip()

    if not nombre or not color or edad is None or not finca_actual or not tipo:
        return {"error": "Faltan campos obligatorios"}, 400

    db = get_db()
    
    nuevo_animal = {
        "nombre": nombre,
        "color": color,
        "edad": int(edad),
        "sexo": "", 
        "tiene_cria": int(data.get("tiene_cria", 0)),
        "finca_actual": finca_actual,
        "lat": float(data.get("lat")) if data.get("lat") is not None else None,
        "lng": float(data.get("lng")) if data.get("lng") is not None else None,
        "tipo": tipo,
        "madre_id": data.get("madre_id"), # En Mongo puede ser string o None
        "user_id": user_id,
        "fecha_creacion": datetime.utcnow()
    }

    db.ganado.insert_one(nuevo_animal)
    return {"message": "Ganado guardado correctamente en la nube"}, 201


def listar_ganado(user_id):
    db = get_db()
    # Buscamos solo los que pertenecen a este usuario
    rows = list(db.ganado.find({"user_id": user_id}).sort("_id", -1))
    
    for r in rows:
        r["id"] = str(r["_id"]) # Renombramos _id a id para el frontend
        del r["_id"]
        
    return rows, 200


def actualizar_ganado_db(user_id, ganado_id, data: dict):
    db = get_db()
    
    update_data = {
        "nombre": data.get("nombre"),
        "color": data.get("color"),
        "edad": int(data.get("edad")) if data.get("edad") is not None else None,
        "tiene_cria": int(data.get("tiene_cria", 0)),
        "finca_actual": (data.get("finca_actual") or "").upper(),
        "lat": float(data.get("lat")) if data.get("lat") is not None else None,
        "lng": float(data.get("lng")) if data.get("lng") is not None else None,
        "tipo": data.get("tipo", ""),
        "madre_id": data.get("madre_id")
    }

    result = db.ganado.update_one(
        {"_id": ObjectId(ganado_id), "user_id": user_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return {"error": "No existe o no te pertenece"}, 404
    return {"message": "Actualizado"}, 200


def eliminar_ganado_db(user_id, ganado_id):
    db = get_db()
    result = db.ganado.delete_one({"_id": ObjectId(ganado_id), "user_id": user_id})

    if result.deleted_count == 0:
        return {"error": "No existe o no te pertenece"}, 404
    return {"message": "Eliminado"}, 200


def mover_ganado_db(user_id, ganado_id, data: dict):
    db = get_db()
    finca = (data.get("finca_actual") or "").upper()
    
    result = db.ganado.update_one(
        {"_id": ObjectId(ganado_id), "user_id": user_id},
        {"$set": {
            "finca_actual": finca, 
            "lat": float(data.get("lat")), 
            "lng": float(data.get("lng"))
        }}
    )

    if result.matched_count == 0:
        return {"error": "No existe o no te pertenece"}, 404
    return {"message": "Movido correctamente"}, 200


# -------------------------
# VACUNAS (CATALOGO GLOBAL)
# -------------------------

def listar_catalogo_vacunas():
    db = get_db()
    
    # Si la colección de vacunas está vacía, insertamos las opciones por defecto
    if db.vacunas.count_documents({}) == 0:
        vacunas_por_defecto = [
            {"nombre": "Brucelosis", "descripcion": "Vacuna contra la Brucelosis"},
            {"nombre": "Clostridiosis", "descripcion": "Vacuna contra Clostridiosis"},
            {"nombre": "Leptospirosis", "descripcion": "Vacuna contra Leptospirosis"},
            {"nombre": "Rabia", "descripcion": "Vacuna Antirrábica"}
        ]
        db.vacunas.insert_many(vacunas_por_defecto)

    # Ahora sí, buscamos las vacunas y las devolvemos
    rows = list(db.vacunas.find().sort("nombre", 1))
    for r in rows:
        r["id"] = str(r["_id"])
        del r["_id"]
        
    return rows, 200


# -------------------------
# VACUNAS POR ANIMAL (DB)
# -------------------------
def animal_pertenece_a_usuario(user_id, ganado_id) -> bool:
    db = get_db()
    try:
        ok = db.ganado.find_one({"_id": ObjectId(ganado_id), "user_id": user_id})
        return ok is not None
    except (TypeError, ValueError):
        return False


def vacunas_de_animal_db(user_id, ganado_id):
    db = get_db()
    # Buscamos las vacunas aplicadas a este animal
    rows = list(db.ganado_vacunas.find({"ganado_id": ganado_id, "user_id": user_id}))
    
    for r in rows:
        r["asignacion_id"] = str(r["_id"])
        # Buscamos el nombre de la vacuna para simular el JOIN
        vacuna_info = db.vacunas.find_one({"_id": ObjectId(r["vacuna_id"])})
        if vacuna_info:
            r["nombre"] = vacuna_info["nombre"]
            r["descripcion"] = vacuna_info.get("descripcion", "")
        del r["_id"]
        
    return rows, 200


def asignar_vacunas_db(user_id, ganado_id, data: dict):
    vacuna_ids = data.get("vacuna_ids", [])
    fecha = data.get("fecha") or datetime.now().strftime("%Y-%m-%d")
    notas = data.get("notas", "")

    if not isinstance(vacuna_ids, list) or len(vacuna_ids) == 0:
        return {"error": "vacuna_ids debe ser una lista"}, 400

    db = get_db()
    nuevas_vacunas = []
    
    for vid in vacuna_ids:
        nuevas_vacunas.append({
            "ganado_id": ganado_id,
            "vacuna_id": vid, # ID de la vacuna
            "fecha": fecha,
            "notas": notas,
            "user_id": user_id
        })

    if nuevas_vacunas:
        db.ganado_vacunas.insert_many(nuevas_vacunas)

    return {"message": "Vacunas asignadas"}, 201

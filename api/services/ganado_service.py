from db.connection import get_connection

# -------------------------
# GANADO (DB)
# -------------------------
def crear_ganado(user_id: int, data: dict):
    nombre = (data.get("nombre") or "").strip()
    color = (data.get("color") or "").strip()
    edad = data.get("edad", None)
    finca_actual = (data.get("finca_actual") or "").strip().upper()
    tipo = (data.get("tipo") or "").strip()
    madre_id = data.get("madre_id", None)
    lat = data.get("lat", None)
    lng = data.get("lng", None)

    if not nombre or not color or edad is None or not finca_actual or not tipo:
        return {"error": "Faltan campos obligatorios"}, 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO ganado (nombre, color, edad, sexo, tiene_cria, finca_actual, lat, lng, tipo, madre_id, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        nombre,
        color,
        int(edad),
        "",  # sexo (ya no lo usas)
        int(data.get("tiene_cria", 0)),
        finca_actual,
        float(lat) if lat is not None else None,
        float(lng) if lng is not None else None,
        tipo,
        int(madre_id) if madre_id else None,
        user_id
    ))

    conn.commit()
    conn.close()
    return {"message": "Ganado guardado"}, 201


def listar_ganado(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ganado WHERE user_id = ? ORDER BY id DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows], 200


def actualizar_ganado_db(user_id: int, ganado_id: int, data: dict):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE ganado
        SET nombre = ?,
            color = ?,
            edad = ?,
            tiene_cria = ?,
            finca_actual = ?,
            lat = ?,
            lng = ?,
            tipo = ?,
            madre_id = ?
        WHERE id = ? AND user_id = ?
    """, (
        data.get("nombre"),
        data.get("color"),
        int(data.get("edad")) if data.get("edad") is not None else None,
        int(data.get("tiene_cria", 0)),
        (data.get("finca_actual") or "").upper(),
        float(data.get("lat")) if data.get("lat") is not None else None,
        float(data.get("lng")) if data.get("lng") is not None else None,
        data.get("tipo", ""),
        int(data.get("madre_id")) if data.get("madre_id") else None,
        ganado_id,
        user_id
    ))

    conn.commit()
    changed = cursor.rowcount
    conn.close()

    if changed == 0:
        return {"error": "No existe o no te pertenece"}, 404
    return {"message": "Actualizado"}, 200


def eliminar_ganado_db(user_id: int, ganado_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM ganado WHERE id = ? AND user_id = ?", (ganado_id, user_id))
    conn.commit()
    deleted = cursor.rowcount
    conn.close()

    if deleted == 0:
        return {"error": "No existe o no te pertenece"}, 404
    return {"message": "Eliminado"}, 200


def mover_ganado_db(user_id: int, ganado_id: int, data: dict):
    finca = (data.get("finca_actual") or "").upper()
    lat = data.get("lat")
    lng = data.get("lng")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE ganado
        SET finca_actual = ?, lat = ?, lng = ?
        WHERE id = ? AND user_id = ?
    """, (finca, float(lat), float(lng), ganado_id, user_id))

    conn.commit()
    changed = cursor.rowcount
    conn.close()

    if changed == 0:
        return {"error": "No existe o no te pertenece"}, 404
    return {"message": "Movido correctamente"}, 200


# -------------------------
# VACUNAS (CATALOGO GLOBAL)
# -------------------------
def listar_catalogo_vacunas():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, descripcion FROM vacunas ORDER BY nombre")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows], 200


# -------------------------
# VACUNAS POR ANIMAL (DB)
# -------------------------
def animal_pertenece_a_usuario(user_id: int, ganado_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM ganado WHERE id = ? AND user_id = ?", (ganado_id, user_id))
    ok = cursor.fetchone() is not None
    conn.close()
    return ok


def vacunas_de_animal_db(user_id: int, ganado_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT gv.id as asignacion_id, v.id as vacuna_id, v.nombre, v.descripcion, gv.fecha, gv.notas
        FROM ganado_vacunas gv
        JOIN vacunas v ON v.id = gv.vacuna_id
        WHERE gv.ganado_id = ? AND gv.user_id = ?
        ORDER BY gv.fecha DESC, v.nombre ASC
    """, (ganado_id, user_id))

    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows], 200


def asignar_vacunas_db(user_id: int, ganado_id: int, data: dict):
    vacuna_ids = data.get("vacuna_ids", [])
    fecha = data.get("fecha")  # "YYYY-MM-DD" opcional
    notas = data.get("notas", "")

    if not isinstance(vacuna_ids, list) or len(vacuna_ids) == 0:
        return {"error": "vacuna_ids debe ser una lista con al menos 1 id"}, 400

    conn = get_connection()
    cursor = conn.cursor()

    for vid in vacuna_ids:
        if fecha:
            cursor.execute("""
                INSERT INTO ganado_vacunas (ganado_id, vacuna_id, fecha, notas, user_id)
                VALUES (?, ?, ?, ?, ?)
            """, (ganado_id, int(vid), fecha, notas, user_id))
        else:
            cursor.execute("""
                INSERT INTO ganado_vacunas (ganado_id, vacuna_id, notas, user_id)
                VALUES (?, ?, ?, ?)
            """, (ganado_id, int(vid), notas, user_id))

    conn.commit()
    conn.close()

    return {"message": "Vacunas asignadas"}, 201
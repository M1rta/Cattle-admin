from flask import request

def get_user_id_from_auth():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.replace("Bearer ", "").strip()
    if not token.isdigit():
        return None
    return int(token)
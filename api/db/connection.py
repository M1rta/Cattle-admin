from pymongo import MongoClient
import os

# 1. Obtenemos la URL de la variable de entorno (para Vercel)
# 2. Si no existe (en local), puedes poner tu URL de Mongo directamente para probar
MONGO_URI = os.getenv("MONGO_URI", "tu_url_de_mongodb_aqui")

client = MongoClient(MONGO_URI)
db = client['AdminGanado']  # Nombre de tu DB en Atlas

def get_db():
    """
    Esta función reemplaza a get_connection(). 
    En lugar de una conexión SQL, devuelve la base de datos de MongoDB.
    """
    return db
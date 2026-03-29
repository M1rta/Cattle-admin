from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "tu_url_de_mongodb_aqui")

client = MongoClient(MONGO_URI)
db = client['AdminGanado']  # Este es el nombre de mi DB en MongoDB

def get_db():
    """
    Esta función reemplaza a get_connection(). 
    En lugar de una conexión SQL, devuelve la base de datos de MongoDB.
    """
    return db
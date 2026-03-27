from flask import Flask
from flask_cors import CORS
from routes.ganado_routes import ganado_bp
from routes.auth.auth_routes import auth_bp


app = Flask(__name__)
CORS(app)

app.register_blueprint(ganado_bp)
app.register_blueprint(auth_bp)

@app.route("/")
def home():
    return "Flask working 🚀"

if __name__ == '__main__':
    app.run(debug=True)
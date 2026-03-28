import os
from flask import Flask, render_template
from flask_cors import CORS

from routes.auth.auth_routes import auth_bp
from routes.ganado_routes import ganado_bp
app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)

CORS(app)
app.register_blueprint(auth_bp)
app.register_blueprint(ganado_bp)

@app.route("/test")
def test():
    return "Servidor funcionando"

@app.route("/")
@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/register")
def register():
    return render_template("register.html")


@app.route("/index")
def home():
    return render_template("index.html")

def handler(request):
    return app(request)


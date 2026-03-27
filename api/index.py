from flask import Flask, render_template
from flask_cors import CORS

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

@app.route("/")
def home():
    return render_template("index.html")

# 👇 ESTO ES CLAVE PARA VERCEL
def handler(request):
    return app(request)
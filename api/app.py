from flask import Flask, render_template
from flask_cors import CORS
from routes.ganado_routes import ganado_bp
from routes.auth.auth_routes import auth_bp


app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

app.register_blueprint(ganado_bp)
app.register_blueprint(auth_bp)

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True)
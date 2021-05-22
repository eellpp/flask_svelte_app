import random
from flask import Flask, send_from_directory, _app_ctx_stack, jsonify, url_for
from flask_cors import CORS
from sqlalchemy.orm import scoped_session

from app import models
from app.database import SessionLocal, init_db

app = Flask(__name__)
CORS(app)
app.session = scoped_session(SessionLocal, scopefunc=_app_ctx_stack.__ident_func__)



@app.route("/db")
def main():
    return f"See the data at {url_for('show_records')}"


@app.route("/records/")
def show_records():
    records = app.session.query(models.Record).all()
    rows = [record.to_dict() for record in records]
    columns = list(rows[0].keys()) if rows else []
    return jsonify({"COLUMN_NAMES":columns,"ROWS":rows})


@app.teardown_appcontext
def remove_session(*args, **kwargs):
    app.session.remove()

# Path for our main Svelte page
@app.route("/")
def base():
    return send_from_directory('client/public', 'index.html')

# Path for all the static files (compiled JS/CSS, etc.)
@app.route("/<path:path>")
def home(path):
    return send_from_directory('client/public', path)


@app.route("/rand")
def hello():
    return str(random.randint(0, 100))

if __name__ == "__main__":
    init_db()
    app.run(port=3000)

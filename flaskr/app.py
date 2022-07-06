from flask import Flask, redirect, render_template, make_response, request as req
import flask_socketio as socketio
from flask_assets import Environment, Bundle
from tinydb import TinyDB, Query

import os
import re
from uuid import uuid4

from game import Game, NotEnoughPlayersError

app = Flask(__name__)
io = socketio.SocketIO(app)
assets = Environment(app)

dirname = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")

scss = Bundle(
    dirname + "/scss/style.scss", filters="pyscss", output="style.css"
)
assets.register("scss", scss)

db = TinyDB(dirname + "/db.json")
users = db.table("users")
User = Query()

default_user_regex = re.compile("^user\d+$")

game = Game(dirname + "/cards.json")

### - Socket io - ###
@io.on("connect")
def on_connect(auth):
    print("new connection", req.sid)

@io.on("join_game")
def join_game(data):
    query_result = users.search(User.id == data)
    if len(query_result) == 0:
        print("unknown id", data)
        return

    user = query_result[0] 
    game.new_player(data, user)
    socketio.join_room(data)
    
    io.emit("new_user", user["nick"], include_self=False)

@io.on("disconnect")
def on_connect():
    print("disconnected", req.sid)

### - Routes - ###
def logged_in():
    if not "id" in req.cookies:
        return False
    if not users.contains(User.id == req.cookies["id"]):
        return False
    return True

@app.route("/")
def root():
    players = map(lambda x: x.metadata, game.get_players())
    if "id" in req.cookies:
        query_result = users.search(User.id == req.cookies["id"])
        if len(query_result) > 0:
            user = query_result[0]
            return render_template("index.html", user=user, players=players)

    new_user = {
        "nick": f"user{len(users) + 1}",
        "id": uuid4().hex
    }
    print("New user:", new_user)
    users.insert(new_user)
    res = make_response(render_template("index.html", user=new_user, players=players))
    res.set_cookie("id", new_user["id"])

    return res

@app.route("/start")
def start():
    if not logged_in(): return redirect("/")

    try:
        game.start()
    except NotEnoughPlayersError:
        return "Not enough players", 405

    round_data = game.new_round()
    # TODO: send data to users ad begin the game
    return ""

@app.route("/change_nick")
def change_nick():
    if not logged_in(): return redirect("/")
    if not "id" in req.cookies:
        return "Not logged in", 401
    if not "n" in req.args:
        return "No n parameter in request", 400
    if default_user_regex.match(req.args["n"]):
        return "Nick cannot match user{number}", 400
    if users.contains(User.nick == req.args["n"]):
        return "Nick already taken", 409
    
    users.update({"nick": req.args["n"]}, User.id == req.cookies["id"])
    return ""

if __name__ == "__main__":
    io.run(app, host="0.0.0.0", port=8080)

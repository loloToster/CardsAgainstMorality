from flask import Flask, redirect, render_template, make_response, request as req
import flask_socketio as socketio
from flask_assets import Environment, Bundle
from tinydb import TinyDB, Query

import os
import re
from uuid import uuid4
from random import shuffle

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
def on_connect():
    print("new connection", req.sid)

def update_users(): 
    io.emit("players", list(map(lambda p: {
        "nick": p.metadata["nick"], 
        "points": p.points,
        "crown": p.is_tsar,
        "check": len(p.choice) > 0
    }, game.get_players())))

@io.on("join_game")
def join_game(data):
    query_result = users.search(User.id == data)
    if len(query_result) == 0:
        print("unknown id", data)
        return

    user = query_result[0] 
    game.new_player(data, user)
    socketio.join_room(data)

    update_users()

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
    # if user has valid cookie render page
    if "id" in req.cookies:
        query_result = users.search(User.id == req.cookies["id"])
        if len(query_result) > 0:
            user = query_result[0]
            return render_template("index.html")

    # if user does not have cookie or cookie is invalid create new user
    new_user = {
        "nick": f"user{len(users) + 1}",
        "id": uuid4().hex
    }
    print("New user:", new_user)
    users.insert(new_user)
    res = make_response(render_template("index.html"))
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
    for p in game.get_players():
        io.emit("new_round", {
            "tsar": p.is_tsar, 
            "cards": p.cards, 
            "black_card": round_data["black_card"]
        }, room=p.id)
    update_users()

    return ""

@app.route("/submit_cards", methods=["POST"])
def submit_cards():
    if not logged_in(): return redirect("/")

    player = game.players[req.cookies["id"]]

    if player.is_tsar: return "User is tsar", 405
    if len(player.choice) > 0: return "Already chose", 405 

    cards = req.json
    player.choose(cards)
    
    if game.all_chose():
        choices = [p.choice for p in game.get_players() if not p.is_tsar]
        shuffle(choices)
        io.emit("choices", choices)

    update_users()

    return ""

@app.route("/tsar_decision", methods=["POST"])
def tsar_decision():
    if not logged_in(): return redirect("/")

    player = game.players[req.cookies["id"]]
    
    if not player.is_tsar: return "User is not tsar", 405
    if not game.all_chose(): return "Not all users submitted choice", 405

    decision = req.json["decision"]
    winner = game.get_player_from_choice_hash(decision)
    winner.points += 1

    round_data = game.new_round()
    for p in game.get_players():
        io.emit("new_round", {
            "tsar": p.is_tsar, 
            "cards": p.cards, 
            "black_card": round_data["black_card"]
        }, room=p.id)
    update_users()

    return ""


@app.route("/change_nick")
def change_nick():
    if not logged_in(): return redirect("/")
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

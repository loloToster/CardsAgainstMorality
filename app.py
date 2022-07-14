from flask import Flask, redirect, render_template, make_response, request as req
import flask_socketio as socketio
from flask_assets import Environment, Bundle
from tinydb import TinyDB, Query
from PIL import Image

import argparse
import os
import json
import re
from uuid import uuid4
from io import BytesIO
import base64

from game import Game, BadCardsError, NotEnoughPlayersError, WrongStageError

# Parsing args
parser = argparse.ArgumentParser(description="Launch app.")
parser.add_argument(
    "-d",
    "--domain",
    type=str,
    metavar="",
    help="sets the domain that is used when setting a cookie of new user",
)
parser.add_argument(
    "-c",
    "--custom-cards",
    type=str,
    metavar="",
    help="loads json file with custom cards",
)
args = parser.parse_args()

# Setup Flask
app = Flask(__name__)
app.config.update(TEMPLATES_AUTO_RELOAD=True)
io = socketio.SocketIO(app)
assets = Environment(app)

dirname = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")

scss = Bundle(
    dirname + "/scss/style.scss",
    filters="pyscss",
    output="style.css",
    depends=dirname + "/scss/**/*.scss",
)
assets.register("scss", scss)

# Setup DB
db = TinyDB(dirname + "/db.json")
users = db.table("users")
User = Query()

# Setup Game
with open(dirname + "/cards.json") as f:
    cards_dict = json.load(f)

if args.custom_cards:
    with open(args.custom_cards) as f:
        custom_cards = json.load(f)

    for pack in custom_cards["packs"]:
        cards_dict["packs"][f"C-{pack}"] = custom_cards["packs"][pack]

    for white_card in custom_cards["white"]:
        white_card["watermark"] = "C-" + white_card["watermark"]
        cards_dict["white"].append(white_card)

    for black_card in custom_cards["black"]:
        black_card["watermark"] = "C-" + black_card["watermark"]
        cards_dict["black"].append(black_card)

try:
    game = Game(cards_dict)
except BadCardsError as e:
    print("Could not load cards to game:", e)
    exit()

### - Socket io - ###
players_by_sid = {}


@io.on("connect")
def on_connect():
    print("new connection", req.sid)


def update_users():
    io.emit(
        "players",
        [
            {
                "nick": p.metadata["nick"],
                "avatar": p.metadata["avatar"],
                "points": p.points,
                "crown": p.is_tsar,
                "check": len(p.choice) > 0,
                "disconnected": not p.id in players_by_sid.values(),
            }
            for p in game.get_players()
        ],
    )


@io.on("join_game")
def join_game(data):
    query_result = users.search(User.id == data)
    if len(query_result) == 0:
        print("unknown id", data)
        return

    user = query_result[0]
    u_id = user["id"]

    if game.stage != Game.NOT_STARTED:
        if u_id in game.players:
            # TODO: add choosen cards to rejoin data
            socketio.join_room(u_id)
            p = game.players[u_id]

            rejoin_data = {
                "is_tsar": p.is_tsar,
                "black_card": game.current_black,
                "cards": p.cards,
            }

            if game.stage == Game.TSAR_VERDICT:
                rejoin_data["choices"] = game.get_choices()

            socketio.emit("rejoin", rejoin_data, room=u_id)
        else:
            socketio.disconnect()
            return
    else:
        socketio.join_room(u_id)
        game.new_player(data, user)

    players_by_sid[req.sid] = u_id

    update_users()


@io.on("disconnect")
def on_connect():
    print("disconnected", req.sid)
    if req.sid in players_by_sid:
        del players_by_sid[req.sid]
        update_users()


### - Routes - ###
def logged_in():
    if not "id" in req.cookies:
        return False
    if not users.contains(User.id == req.cookies["id"]):
        return False
    return True


def get_res_with_user():
    res = make_response()
    # if user has valid cookie return user
    if "id" in req.cookies:
        query_result = users.search(User.id == req.cookies["id"])
        if len(query_result) > 0:
            res.user = query_result[0]
            return res

    # if user does not have cookie or cookie is invalid return new user & cookie that should be set
    new_user = {
        "nick": f"user{len(users) + 1}",
        "id": uuid4().hex,
        "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAARYSURBVHhe7Zs9jBVVGIbv/iSbbBAxxsJCXWNnEDG0ipRq0MVYKSg9xkhJg9hvor0kNjaQGClINDH8JEoDGiXBWCgsaiwIsq4BOvbO+rzHbyaz14/d+TlnbzHzJk/es9/9Zu6cb2bOnDk3OzEYDFahs5o076z6Aph3Vn0BzDurvgDmnVVfAPPOqi+AeWfV+QKM82XoFiyBvv8ReBjGIh3AZnF+YmLi6OTk5OO0R7WFz/bDL7S9bVPhBmOzDIegqnbCdfD2FZXNuAWuc1bnV1dXr+gPzv4DWZa9SHMX8R3ENQ7dov0N7c+UI01NTW0bDofnaD73XySd/leViCzR4SfwIDr5GvYjeLniL3LexoOmp6cfxNbLj4EbjMU+CKJj72ND8PLWQO4XeK45cPMi4QZj8DkE0aF3sQy8PBe2OYbn+gjcvAi4wRjsAWkb5I+7OmTcPs/gKuBjpXhs3GBbljnoLbh0GLycDWEfx/Eg2t9hbl4bkswEOdhLjOh37c+95rXFPt6wptoXrBlVSQrAwf5sTekp8yZ6CMKVRFE1L4iuzXgXeNS8kTQfsGYSpSqABq1cf5o3EXOh4T9qcFUlOdZUBQijt+m0eRNpEhTGEm6BF+Qp5I6ObdGUF9eB7yjH68C2R3DtQ+PAzTweGTcYAz3+gujAGczLWY9Fmwpr+wOleGzcYAw0+QmamZnRaL4IXp7HMoPfblyd15V03uIpcINR4OC/xoNsDeAquLklFsktzx0+AC8vFm4wGnRGL0GF+Ps9zLsaboDm/8VjjwIexPQUGM2NiRuMCh35FF8j7u+tFOMVPnsZilfmXMRUKC2kuPuMxWZMhK7xDP99dnZW40ChlZWV21mWfclnX+lzCwctLCxooUYKc4DUcisTAV3mhzjL4XFYFgPcVs7wHLxkbPfyTHr+p1wec4NtyOjQJ/joFFbLYLrHf4X7LYzcYNuTujVoj0pjibdNW9xgU3TPFqtAEh2ax34AL389rrLtmgEU7ST2G+7lN8UNNkFrAOpsEGdRj71T4OXWQdNhLYsFsV8NmHXmFBvhBuuy5swzwuty/xu83CbottKCahBtFeQeeLl1cYN1KVZyOUOatiZ5fNHxd/Ag2s9jbl5N3GBlOJDiGU/nn8VSP7tfhVwaVL2cOrjBqui+fxqXNOpXmeq2Re8J+WKpHp1tv9MNVqVYuuZgTmJeTgq+hyC+t+2bohusgs5+vvKjQWkFvLwkcLu9hefSL81uXgXcYBVOQBCF0Djg5aREvyIH8f1tfjhxg1XYDxr4dO8nf2nxsDmBjmF7OV6Hxi9DVP1bOS8yb2JJV27vJ16mXjf/CdP0uraaFmCJjv+hBv5kiIxH5YWTs+a11LQAl82l5L/fr6Pyd5d/jKmspgW4Yy6N8woo1hi4JWetWVvu4LARfOGH+Mej8TFwkWM5ijd69+j/Zca8s+oLYN5Z9QUw76z6Aph3Vn0BzDurvgDmnVXHCzAY/AtSAicujIG4tQAAAABJRU5ErkJggg==",
    }
    users.insert(new_user)
    res.set_cookie("id", new_user["id"], domain=args.domain)
    res.user = new_user
    return res


@app.route("/")
def root():
    res = get_res_with_user()
    user = res.user

    if (
        game.stage != Game.NOT_STARTED and user["id"] in game.players
    ) or game.stage == Game.NOT_STARTED:
        packs = zip(
            range(len(game.CARDS["packs"].keys())),
            game.CARDS["packs"].keys(),
            game.CARDS["packs"].values(),
        )

        res.set_data(render_template("index.html", user=user, packs=packs))
    else:
        res.set_data(render_template("game-started.html"))

    return res


@app.route("/start", methods=["POST"])
def start():
    if not logged_in():
        return redirect("/")

    choosen_packs = req.json

    try:
        game.start(choosen_packs)
    except NotEnoughPlayersError:
        return "Not enough players", 405
    except WrongStageError:
        return "Game already started", 405
    except KeyError as e:
        return "Choosen packs dont contain any white or black cards", 405

    round_data = game.new_round()

    for p in game.get_players():
        io.emit(
            "new_round",
            {
                "tsar": p.is_tsar,
                "cards": p.cards,
                "black_card": round_data["black_card"],
            },
            room=p.id,
        )

    update_users()

    return ""


@app.route("/submit_cards", methods=["POST"])
def submit_cards():
    if not logged_in():
        return redirect("/")

    player = game.players[req.cookies["id"]]

    if player.is_tsar:
        return "User is tsar", 405
    if len(player.choice) > 0:
        return "Already chose", 405

    cards = req.json
    everyone_chose = player.choose(cards)

    if everyone_chose:
        io.emit("choices", game.get_choices())

    update_users()

    return ""

def handle_ending(table_data):
    for p in game.get_players():
        if "vote_end" in p.metadata:
            del p.metadata["vote_end"]

    table = [
        {"points": x[0], "name": x[1].metadata["nick"]} for x in table_data
    ]

    io.emit("end", table)

    update_users()


@app.route("/tsar_decision", methods=["POST"])
def tsar_decision():
    if not logged_in():
        return redirect("/")

    player = game.players[req.cookies["id"]]

    if not player.is_tsar:
        return "User is not tsar", 405

    decision = req.json["decision"]

    try:
        game.choose_winner(decision)
    except WrongStageError:
        return "Cannot choose winner during card picking", 405

    round_data = game.new_round()

    if round_data["end"]:
        handle_ending(round_data["table"])
        return ""

    for p in game.get_players():
        io.emit(
            "new_round",
            {
                "tsar": p.is_tsar,
                "cards": p.cards,
                "black_card": round_data["black_card"],
            },
            room=p.id,
        )
    update_users()

    return ""


@app.route("/vote_end", methods=["PUT"])
def vote_end():
    if not logged_in():
        return redirect("/")
    cookie = req.cookies["id"]
    if not cookie in game.players:
        return "Non players cannot vote", 405
    if game.stage == Game.NOT_STARTED:
        return "Game not started", 405

    vote = req.json.get("vote", True)
    game.players[cookie].metadata["vote_end"] = vote

    all_votes = [p.metadata.get("vote_end", False) for p in game.get_players()]
    if all(all_votes):
        handle_ending(game.end())
        return ""

    io.emit("vote_end", {
        "for": sum(all_votes),
        "all": len(all_votes)
    })

    return ""

### - User editing - ###
default_user_regex = re.compile("^user\d+$")
allowed_chars_regex = re.compile("^[A-Z0-9`~!@#$%^&*()-=_+{}\[\]:;'\",./<>?\\\|\s]+$", re.IGNORECASE)

@app.route("/change_nick")
def change_nick():
    if not logged_in():
        return redirect("/")
    if not "n" in req.args:
        return "No n parameter in request", 400

    new_nick = req.args["n"]

    if len(new_nick) > 16:
        return "Nick cannot be longer then 16 characters", 400
    if default_user_regex.match(new_nick):
        return "Nick cannot match user{number}", 400
    if not allowed_chars_regex.match(new_nick):
        return "Nick contains disallowed characters", 400
    if users.contains(User.nick == new_nick):
        return "Nick already taken", 409

    users.update({"nick": new_nick}, User.id == req.cookies["id"])

    if req.cookies["id"] in game.players:
        game.players[req.cookies["id"]].metadata["nick"] = new_nick
        update_users()

    return ""


def downscale64base(data, w=64, h=64):
    buffer = BytesIO()
    imgdata = base64.b64decode(data)
    img = Image.open(BytesIO(imgdata))
    new_img = img.resize((w, h))
    new_img.save(buffer, format="PNG")
    img_b64 = base64.b64encode(buffer.getvalue())
    return str(img_b64)[2:-1]


@app.route("/change_avatar", methods=["POST"])
def change_avatar():
    if not logged_in():
        return redirect("/")

    new_avatar = str(req.json["avatar"]).split("base64,", 1)[1]

    new_avatar_small = "data:image/png;base64," + downscale64base(new_avatar)

    print(len(new_avatar), len(new_avatar_small))

    users.update({"avatar": new_avatar_small}, User.id == req.cookies["id"])

    if req.cookies["id"] in game.players:
        game.players[req.cookies["id"]].metadata["avatar"] = new_avatar_small
        update_users()

    return new_avatar_small


if __name__ == "__main__":
    io.run(app, host="0.0.0.0", port=8080)

import random
from copy import deepcopy
from typing import List

DEFAULT_PACK_ICON = "https://cdn.sanity.io/images/vc07edlh/production/a3695e68ab205ea7ed56bc34e2f0165d40d79389-80x80.svg"


class BadCardsError(Exception):
    pass


class NotEnoughPlayersError(Exception):
    pass


class WrongStageError(Exception):
    pass


class Player:
    def __init__(self, game, id: str, metadata={}):
        self.game = game
        self.id = id
        self.metadata = metadata
        self.points = 0
        self.is_tsar = False
        self.cards = []
        self.choice = []

    def choose(self, card_ids: List[int]):
        if self.is_tsar:
            raise Exception("Player is tsar")
        if len(card_ids) != self.game.current_black["pick"]:
            raise Exception("Invalid number of cards")

        self.choice = self.remove_cards(card_ids)

        if self.game.all_chose():
            self.game.stage = Game.TSAR_VERDICT
            return True

        return False

    def remove_cards(self, card_ids: List[int]):
        removed = [None] * len(card_ids)
        new_cards = []

        for card in self.cards:
            try:
                i = card_ids.index(card["id"])
                removed[i] = card
            except ValueError:
                new_cards.append(card)

        if None in removed:
            raise Exception("There are card ids that don't point to any card")

        self.cards = new_cards

        return removed


class Game:
    NOT_STARTED = 0
    CHOOSING = 1
    TSAR_VERDICT = 2

    def __init__(self, cards: dict, max_cards=10):
        self.CARDS = self._parse_cards(cards)

        self.players = {}
        self.white_cards = []
        self.black_cards = []
        self.max_cards = max_cards

        self.previous_tsars = []
        self.card_tsar = None
        self.current_black = None
        self.stage = Game.NOT_STARTED

    def _parse_cards(self, cards):
        for pack in cards["packs"].values():
            pack["icon"] = pack.get("icon", DEFAULT_PACK_ICON)

            if not type(pack["icon"]) is str:
                raise BadCardsError(f"icon parameter cannot be: {card['icon']}")
            if not "name" in pack:
                raise BadCardsError(f"name parameter cannot be empty")
            if not type(pack["name"]) is str:
                raise BadCardsError(f"name parameter cannot be: {pack['name']}")

        c_id = 0

        for card in cards["black"]:
            card["draw"] = card.get("draw", 0)
            card["pick"] = card.get("pick", 1)

            if not type(card["draw"]) is int:
                raise BadCardsError(f"draw parameter cannot be: {card['draw']}")
            if not type(card["pick"]) is int:
                raise BadCardsError(f"pick parameter cannot be: {card['pick']}")
            if not "text" in card:
                raise BadCardsError(f"text parameter cannot be empty")
            if not type(card["text"]) is str:
                raise BadCardsError(f"text parameter cannot be: {card['text']}")
            if not "watermark" in card:
                raise BadCardsError(f"watermark parameter cannot be empty")
            if not type(card["watermark"]) is str:
                raise BadCardsError(f"watermark parameter cannot be: {card['text']}")

            card["id"] = c_id
            c_id += 1

        for card in cards["white"]:
            if not "text" in card:
                raise BadCardsError(f"text parameter cannot be empty")
            if not type(card["text"]) is str:
                raise BadCardsError(f"text parameter cannot be: {card['text']}")
            if not "watermark" in card:
                raise BadCardsError(f"watermark parameter cannot be empty")
            if not type(card["watermark"]) is str:
                raise BadCardsError(f"watermark parameter cannot be: {card['text']}")

            card["id"] = c_id
            c_id += 1

        return cards

    def new_player(self, id: str, metadata) -> bool:
        if id in self.players:
            return False

        new_player = Player(self, id, metadata)
        self.players[id] = new_player
        if self.stage != Game.NOT_STARTED:
            self.fill_players_cards()
        return True

    def get_players(self) -> List[Player]:
        return list(self.players.values())

    def fill_players_cards(self):
        if self.stage == Game.NOT_STARTED:
            raise WrongStageError("Game is not started")

        for player in self.get_players():
            num_of_player_cards = len(player.cards)
            if num_of_player_cards >= self.max_cards:
                continue
            for _ in range(self.max_cards - num_of_player_cards):
                card = self.white_cards.pop()
                card["pack"] = self.CARDS["packs"][card["watermark"]]["name"]
                player.cards.append(card)

    def get_black_card(self):
        if self.stage == Game.NOT_STARTED:
            raise WrongStageError("Game is not started")

        card = self.black_cards.pop()
        card["pack"] = self.CARDS["packs"][card["watermark"]]["name"]
        self.current_black = card
        return card

    def new_round(self):
        if self.stage == Game.NOT_STARTED:
            raise WrongStageError("Game is not started")

        if not self.enough_cards():
            return {"end": True, "table": self.end()}

        self.stage = Game.CHOOSING

        self.fill_players_cards()
        players = self.get_players()

        if len(self.previous_tsars) >= len(players):
            self.previous_tsars = []

        possible_tsars = []
        for p in players:
            p.choice = []
            p.is_tsar = False
            if not p.id in self.previous_tsars:
                possible_tsars.append(p)

        self.card_tsar = random.choice(possible_tsars)
        self.card_tsar.is_tsar = True
        self.previous_tsars.append(self.card_tsar.id)

        return {
            "end": False,
            "tsar": self.card_tsar,
            "black_card": self.get_black_card(),
            "other_players": [p for p in players if p.id != self.card_tsar.id],
        }

    def get_choices(self):
        choices = [p.choice for p in self.get_players() if not p.is_tsar]
        choices.sort(key=lambda c: self.choice_to_hash(c))
        return choices

    def all_chose(self):
        return all([len(p.choice) > 0 for p in self.get_players() if not p.is_tsar])

    def choice_to_hash(self, choice):
        h = ""
        for card in choice:
            h += str(card["id"])
        return h

    def get_player_from_choice_hash(self, choice_hash):
        for p in self.get_players():
            h = self.choice_to_hash(p.choice)
            if choice_hash == h:
                return p
        raise Exception("There is no player with choice hash:", choice_hash)

    def choose_winner(self, choice_hash):
        if self.stage != Game.TSAR_VERDICT:
            raise WrongStageError("Cannot choose winner during choosing stage")

        winner = self.get_player_from_choice_hash(choice_hash)
        winner.points += 1

        return winner

    def enough_cards(self):
        return (
            self.black_cards
            and len(self.white_cards) >= len(self.players.keys()) * self.max_cards
        )

    def start(self, choosen_packs):
        if self.stage != Game.NOT_STARTED:
            raise WrongStageError("Game already started")

        if len(self.players.keys()) < 2:
            raise NotEnoughPlayersError()

        def card_in_packs(c):
            return c["watermark"] in choosen_packs

        self.white_cards = list(filter(card_in_packs, deepcopy(self.CARDS["white"])))
        random.shuffle(self.white_cards)

        self.black_cards = list(filter(card_in_packs, deepcopy(self.CARDS["black"])))
        random.shuffle(self.black_cards)

        if not self.enough_cards():
            raise KeyError("Too little number of cards")

        self.stage = Game.CHOOSING

    def end(self):
        self.stage = Game.NOT_STARTED

        return_value = [(p.points, p) for p in self.get_players()]
        return_value.sort(key=lambda x: x[0], reverse=True)

        # restart players
        for p in self.get_players():
            p.is_tsar = False
            p.cards = []
            p.choice = []
            p.points = 0

        return return_value

import json
import random
from copy import deepcopy
from typing import List

class NotEnoughPlayersError(Exception):
    pass

class GameNotStartedError(Exception):
    pass

class Player:
    def __init__(self, game, id: str, cards: list, metadata = {}, points = 0):
        self.game = game
        self.id = id
        self.metadata = metadata
        self.cards = cards
        self.points = points
        self.is_tsar = False
        self.choice = []

    def choose(self, card_ids: List[int]):
        if self.is_tsar: raise Exception("Player is tsar")
        if len(card_ids) != self.game.current_black["pick"]:
            raise Exception("Invalid number of cards")
        self.choice = self.remove_cards(card_ids)

    def remove_cards(self, card_ids: List[int]):
        removed = []
        new_cards = []
        for c in self.cards:
            if c["id"] in card_ids:
                card_ids.remove(c["id"])
                removed.append(c)
            else:
                new_cards.append(c)
        if len(card_ids) > 0:
            raise Exception("Cards not found:", card_ids)
        self.cards = new_cards
        return removed


class Game:
    def __init__(self, cards_file: str, num_of_cards = 10):
        with open(cards_file) as f:
            self.CARDS =  json.load(f)
        self.players = {}
        self.white_cards = []
        self.black_cards = []
        self.num_of_cards = num_of_cards
        self.started = False
        self.previous_tsars = []
        self.card_tsar = None
        self.current_black = None

    def new_player(self, id: str, metadata) -> bool:
        new_player = Player(self, id, [], metadata)
        if id in self.players:
            if self.started:
                self.players[id] = new_player
                self.fill_players_cards()
            else:
                self.players[id] = new_player
            return False
        self.players[id] = new_player
        return True

    def get_players(self) -> List[Player]:
        return list(self.players.values())

    def fill_players_cards(self):
        for player in self.get_players():
            num_of_player_cards = len(player.cards)
            if num_of_player_cards >= self.num_of_cards:
                continue
            for _ in range(self.num_of_cards - num_of_player_cards):
                card = self.white_cards.pop()
                card["pack"] = self.CARDS["packs"][card["watermark"]]
                player.cards.append(card)

    def get_black_card(self):
        card = self.black_cards.pop()
        card["pack"] = self.CARDS["packs"][card["watermark"]]
        self.current_black = card
        return card

    def new_round(self):
        if not self.started:
            raise GameNotStartedError()

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
            "tsar": self.card_tsar,
            "black_card": self.get_black_card(), 
            "other_players": [p for p in players if p.id != self.card_tsar.id]
        }

    def all_chose(self):
        return all([len(p.choice) > 0 for p in self.get_players() if not p.is_tsar])

    def start(self):
        if len(self.players.keys()) < 2:
            raise NotEnoughPlayersError()
        self.started = True
        self.white_cards = deepcopy(self.CARDS["white"])
        random.shuffle(self.white_cards)
        self.black_cards = deepcopy(self.CARDS["black"])
        random.shuffle(self.black_cards)
        for p in self.get_players():
            p.choice = []
            p.is_tsar = False

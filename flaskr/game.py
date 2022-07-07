import json
import random
from copy import deepcopy
from typing import List

class NotEnoughPlayersError(Exception):
    pass

class GameNotStartedError(Exception):
    pass

class Player:
    def __init__(self, id: str, cards: list, metadata = {}, points = 0):
        self.id = id
        self.metadata = metadata
        self.cards = cards
        self.points = points
        self.is_tsar = False

    def remove_cards(self, card_ids: List[int]):
        self.cards = [c for c in self.cards if not c["id"] in card_ids]


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

    def new_player(self, id: str, metadata) -> bool:
        if id in self.players:
            if self.started:
                self.players[id] = Player(id, [], metadata)
                self.fill_players_cards()
            else:
                self.players[id] = Player(id, [], metadata)
            return False
        self.players[id] = Player(id, [], metadata)
        return True

    def get_players(self) -> List[Player]:
        return list(self.players.values())

    def fill_players_cards(self):
        for player in self.get_players():
            num_of_player_cards = len(player.cards)
            if num_of_player_cards >= self.num_of_cards:
                continue
            for _ in range(self.num_of_cards - num_of_player_cards):
                player.cards.append(self.white_cards.pop())

    def get_black_card(self):
        return self.black_cards.pop()

    def new_round(self):
        if not self.started:
            raise GameNotStartedError()

        self.fill_players_cards()
        players = self.get_players()
        
        if len(self.previous_tsars) >= len(players):
            self.previous_tsars = []

        possible_tsars = []
        for p in players:
            if not p.id in self.previous_tsars:
                possible_tsars.append(p)
            p.is_tsar = False
            
        self.card_tsar = random.choice(possible_tsars)
        self.card_tsar.is_tsar = True
        self.previous_tsars.append(self.card_tsar.id)

        return {
            "tsar": self.card_tsar,
            "black_card": self.get_black_card(), 
            "other_players": [p for p in players if p.id != self.card_tsar.id]
        }

    def start(self):
        if len(self.players.keys()) < 2:
            raise NotEnoughPlayersError()
        self.started = True
        self.white_cards = deepcopy(self.CARDS["white"])
        random.shuffle(self.white_cards)
        self.black_cards = deepcopy(self.CARDS["black"])
        random.shuffle(self.black_cards)

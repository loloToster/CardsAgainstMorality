import json
import random
from copy import deepcopy
from typing import List

class NotEnoughPlayersError(Exception):
    pass

class GameNotStartedError(Exception):
    pass

class WrongStageError(Exception):
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

        if self.game.all_chose():
            self.game.stage = Game.TSAR_VERDICT
            return True

        return False


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
    NOT_STARTED = 0
    CHOOSING = 1
    TSAR_VERDICT = 2

    def __init__(self, cards_file: str, max_cards = 10):
        with open(cards_file) as f:
            self.CARDS =  json.load(f)
            
        self.players = {}
        self.white_cards = []
        self.black_cards = []
        self.max_cards = max_cards

        self.previous_tsars = []
        self.card_tsar = None
        self.current_black = None
        self.stage = Game.NOT_STARTED

    def new_player(self, id: str, metadata) -> bool:
        if id in self.players:
            return False
            
        new_player = Player(self, id, [], metadata)
        self.players[id] = new_player
        if self.stage != Game.NOT_STARTED:
            self.fill_players_cards()
        return True

    def get_players(self) -> List[Player]:
        return list(self.players.values())

    def fill_players_cards(self):
        if self.stage == Game.NOT_STARTED:
            raise GameNotStartedError()

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
            raise GameNotStartedError()

        card = self.black_cards.pop()
        card["pack"] = self.CARDS["packs"][card["watermark"]]["name"]
        self.current_black = card
        return card

    def new_round(self):
        if self.stage == Game.NOT_STARTED:
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
            if choice_hash == h: return p
        raise Exception("There is no player with choice hash:", choice_hash)

    def choose_winner(self, choice_hash):
        if self.stage != Game.TSAR_VERDICT:
            raise WrongStageError("Cannot choose winner during choosing stage")

        winner = self.get_player_from_choice_hash(choice_hash)
        winner.points += 1
        self.stage = Game.CHOOSING

        return winner
    
    def enough_cards(self):
        return self.black_cards and len(self.white_cards) >= len(self.players.keys()) * self.max_cards

    def start(self, choosen_packs):
        if len(self.players.keys()) < 2:
            raise NotEnoughPlayersError()
            
        def card_in_packs(c):
            return c["watermark"] in choosen_packs

        self.white_cards = list(filter(
            card_in_packs, 
            deepcopy(self.CARDS["white"])
        ))
        random.shuffle(self.white_cards)

        self.black_cards = list(filter(
            card_in_packs,
            deepcopy(self.CARDS["black"])
        ))
        random.shuffle(self.black_cards)

        if not self.enough_cards():
            raise KeyError("Too little number of cards")

        self.stage = Game.CHOOSING
        for p in self.get_players():
            p.points = 0
            p.choice = []
            p.is_tsar = False

import { AceCard, BattleCard, Card, CrashCard, Distance100Card, Distance200Card, Distance25Card, Distance50Card, Distance75Card, DistanceCard, EmergencyCard, EmptyCard, FlatCard, GasCard, LimitCard, RemedyCard, RepairCard, RollCard, SafetyCard, SealantCard, SpareCard, SpeedCard, StopCard, TankerCard, UnlimitedCard } from "./Card";
import { Game, Player, Tableau, Team } from "./Data";

function getNextPlayer(game: Game): Player {
    const playerOrder = getPlayerOrder(game.teams);
    const nextPlayerIndex = (playerOrder.indexOf(game.currentPlayer) + 1) % playerOrder.length;
    return playerOrder[nextPlayerIndex];
}

function getPlayerOrder(teams: Array<Team>): Array<Player> {
    const teamWithMostPlayers = Math.max(...teams.map(team => team.players.length));

    const playerOrder: Array<Player> = [];

    for (let playerIndex = 0; playerIndex < teamWithMostPlayers; playerIndex++) {
        for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
            const player = teams[teamIndex].players[playerIndex];

            if (player !== undefined) {
                playerOrder.push(player);
            }
        }
    }

    return playerOrder;
}

export function playCard(card: Card, game: Game, targetTeam: Team | null) {
    // Remove card from hand
    game.currentPlayer.hand = game.currentPlayer.hand.filter(handCard => handCard !== card);

    if (targetTeam && canCardBePlayed(card, game, targetTeam)) {
        if (isInstanceOfDistanceCard(card)) {
            targetTeam.tableau.distanceArea.push(card as DistanceCard);
        } else if (card instanceof UnlimitedCard || card instanceof LimitCard) {
            targetTeam.tableau.speedArea = card;
        } else if (isInstanceOfHazardCard(card) || isInstanceOfRemedyCard(card)) {
            targetTeam.tableau.battleArea = card;
        } else if (isInstanceOfSafteyCard(card)) {
            targetTeam.tableau.safetyArea.push(card as SafetyCard);
        }
    } else {
        game.discard = card;
    }

    game.currentPlayer = getNextPlayer(game);
    // Draw a card
    game.currentPlayer.hand.push(game.deck.splice(0, 1)[0]);
}

export function canCardBePlayed(card: Card, game: Game, targetTeam?: Team) {
    const tableau = getCurrentPlayerTeam(game).tableau;
    const targetTeams = targetTeam === undefined
        ? game.teams.filter(team => team !== getCurrentPlayerTeam(game))
        : [targetTeam];

    if (isInstanceOfRemedyCard(card)) return canRemedyCardBePlayed(card, tableau.battleArea);
    if (isInstanceOfDistanceCard(card)) return canDistanceCardBePlayed(card as DistanceCard, tableau);
    if (card instanceof UnlimitedCard) return canUnlimitedCardBePlayed(tableau.speedArea);
    if (card instanceof LimitCard) return canLimitCardBePlayed(targetTeams);
    if (isInstanceOfHazardCard(card)) return canHazardCardBePlayed(targetTeams);
    if (isInstanceOfSafteyCard(card)) return true; // Safety cards can always be played

    return false;
}

function isInstanceOfSafteyCard(card: Card): boolean {
    return card instanceof AceCard || card instanceof TankerCard || card instanceof SealantCard || card instanceof EmergencyCard;
}

function isInstanceOfDistanceCard(card: Card): boolean {
    return card instanceof Distance25Card || card instanceof Distance50Card || card instanceof Distance75Card || card instanceof Distance100Card || card instanceof Distance200Card;
}

export function isInstanceOfHazardCard(card: Card): boolean {
    return card instanceof CrashCard || card instanceof EmptyCard || card instanceof FlatCard || card instanceof StopCard;
}

function isInstanceOfRemedyCard(card: Card): boolean {
    return card instanceof RepairCard || card instanceof GasCard || card instanceof SpareCard || card instanceof RollCard;
}

function canDistanceCardBePlayed(distanceCard: DistanceCard, tableau: Tableau): boolean {
    const battleArea = tableau.battleArea;
    const speedAreaLimit = tableau.speedArea === null ? 200 : tableau.speedArea.limit;

    if (battleArea instanceof RollCard && speedAreaLimit >= distanceCard.amount) return true;

    return false;
}

function canUnlimitedCardBePlayed(speedArea: SpeedCard | null): boolean {
    if (speedArea instanceof LimitCard) return true;

    return false;
}

function canLimitCardBePlayed(teams: Array<Team>): boolean {
    for (const team of teams) {
        if (team.tableau.speedArea === null || team.tableau.speedArea instanceof UnlimitedCard) return true;
    }

    return false;
}

function canHazardCardBePlayed(teams: Array<Team>): boolean {
    for (const team of teams) {
        if (team.tableau.battleArea instanceof RollCard) return true;
    }

    return false;
}

function canRemedyCardBePlayed(remedyCard: RemedyCard, battleArea: BattleCard | null): boolean {
    if (remedyCard instanceof RollCard) return canRollCardBePlayed(battleArea);
    if (remedyCard instanceof GasCard && battleArea instanceof EmptyCard) return true;
    if (remedyCard instanceof RepairCard && battleArea instanceof CrashCard) return true;
    if (remedyCard instanceof SpareCard && battleArea instanceof FlatCard) return true;

    return false;
}

function canRollCardBePlayed(battleArea: BattleCard | null): boolean {
    if (battleArea === null) return true;
    if (battleArea instanceof StopCard) return true;
    if (battleArea instanceof GasCard) return true;
    if (battleArea instanceof RepairCard) return true;
    if (battleArea instanceof SpareCard) return true;

    return false;
}

export function getCurrentPlayerTeam(game: Game): Team {
    return game.teams.find(team => team.id === game.currentPlayer.teamId) as Team;
}

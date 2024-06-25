import { Distance200Card, SafetyCard } from "./Card";
import { Game, Team } from "./Data";
import { getRemainingDistance, getTotalDistance } from "./Rules";

export interface Score {
    distance: number;
    eachSafety: number;
    allSafeties: number;
    coupFourré: number;
    tripCompleted?: number;
    deplayedAction?: number;
    safeTrip?: number;
    extention?: number;
    shutout?: number;
}

export function calculateScore(game: Game): Map<Team, Score> {
    const scores = new Map<Team, Score>();

    for (const team of game.teams) {
        const score: Score = {
            distance: 1 * getTotalDistance(team.tableau.distanceArea),
            eachSafety: 100 * team.tableau.safetyArea.length,
            allSafeties: team.tableau.safetyArea.length === 4 ? 300 : 0,
            coupFourré: team.tableau.safetyArea.reduce((points: number, safetyCard: SafetyCard) => points + (safetyCard.coupFourré ? 300 : 0), 0)
        };

        const didTeamCompleteTrip = getRemainingDistance(team.tableau.distanceArea, game.teams, game.extention) === 0;
        if (didTeamCompleteTrip) {
            score.tripCompleted = 400;
            score.deplayedAction = game.deck.length === 0 ? 300 : 0;
            score.safeTrip = team.tableau.distanceArea.some(distanceCard => distanceCard instanceof Distance200Card) ? 0 : 300;
            score.extention = game.extention ? 200 : 0;
            score.shutout = game.teams.filter(otherTeam => otherTeam !== team).every(otherTeam => getTotalDistance(otherTeam.tableau.distanceArea) === 0) ? 500 : 0;
        }

        scores.set(team, score);
    }

    return scores;
}

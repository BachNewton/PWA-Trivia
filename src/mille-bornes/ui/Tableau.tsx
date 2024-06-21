import { Tableau as TableauData, Team } from "../logic/Data";
import CardUi from "./Card";
import DistanceArea from './DistanceArea';
import SafetyArea from './SafetyArea';

interface TableauProps {
    team: Team;
    onClick?: () => void;
    isHighlighted?: boolean;
    greyedOut?: boolean;
}

const Tableau: React.FC<TableauProps> = ({ team, onClick, isHighlighted, greyedOut }) => {
    const tableauData = team.tableau;
    const teamName = 'Team ' + team.players.map(player => player.name).join(' & ');

    const tableauStyle: React.CSSProperties = {
        borderColor: isHighlighted ? 'yellow' : team.color,
        borderWidth: isHighlighted ? '3px' : '1px',
        borderStyle: 'solid',
        boxSizing: 'border-box',
        display: 'grid',
        minHeight: 0,
        margin: '2% 0',
        opacity: greyedOut ? 0.1 : 1
    };

    return <div style={tableauStyle} onClick={onClick} >
        <div style={{ textAlign: 'center' }}>{teamName}</div>

        <div style={{ display: 'grid', gridAutoFlow: 'column', justifyContent: 'space-evenly', minHeight: 0 }}>

            <div style={{ display: 'grid', alignContent: 'center', minHeight: 0 }}>
                <SafetyArea safetyArea={tableauData.safetyArea} />
                <DistanceArea distanceArea={tableauData.distanceArea} />
            </div>

            <div style={{ display: 'grid', minHeight: 0 }}>
                <CardUi card={tableauData.battleArea} />
                <CardUi card={tableauData.speedArea} />
            </div>
        </div>
    </div >
}

export default Tableau;

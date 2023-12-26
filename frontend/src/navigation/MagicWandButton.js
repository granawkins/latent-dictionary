import MagicWandIcon from './MagicWandIcon';

const MagicWandButton = ({ toggleMagicWand, isWandActive, pcaId }) => (
    <button
        onClick={toggleMagicWand}
        style={{
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: pcaId === 'default' ? 'black' : 'white',
            color: pcaId === 'default' ? 'white' : 'black',
            height: '50px',
            width: '50px',
            opacity: !isWandActive ? 0.5 : 1,
            cursor: isWandActive ? 'pointer' : 'default',
        }}
        disabled={!isWandActive}
        title={isWandActive ? "Reset Principle Components" : "Need at least 3 words!"}
    >
        <MagicWandIcon />
    </button>
);

export default MagicWandButton;

import LogoButton from './LogoButton';
import SearchBar from './SearchBar';
import MagicWandButton from './MagicWandButton';


const Navigation = ({ searchTerms, setSearchTerms, isLoading, toggleMagicWand, pcaId }) => (
    <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        padding: '10px',
        boxSizing: 'border-box',
    }}>
        <LogoButton />
        <SearchBar 
            searchTerms={searchTerms} 
            setSearchTerms={setSearchTerms} 
            isLoading={isLoading} 
        />
        <MagicWandButton 
            toggleMagicWand={toggleMagicWand} 
            isWandActive={!isLoading && searchTerms.length > 2} 
            pcaId={pcaId}
        />
    </div>
);

export default Navigation;

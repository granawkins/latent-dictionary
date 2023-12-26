import React, { useEffect, useState } from 'react';
import MagicWandIcon from './MagicWandIcon';


const LogoButton = () => (
    <button 
        onClick={() => window.location.reload()} 
        style={{ 
            padding: "0px", 
            border: '0', 
            height: '50px',
            cursor: 'pointer',
        }}
    >
        <img 
            src="/latent-dictionary.png" 
            alt="Latent Dictionary" 
            style={{ 
                height: '50px', 
                margin: "0px" 
            }} 
        />
    </button>
);


const SearchBar = ({ searchTerms, setSearchTerms, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const splitSearchTerm = (term) => {
        return term
        .split(/[ ,]+/)
        .map(word => word.toLowerCase().trim())
        .filter(word => word.length > 0)
    }
    
    const handleSearch = (e) => {
        e.preventDefault();
        setSearchTerms(splitSearchTerm(searchTerm));
    }
        
    useEffect(() => {
        if (searchTerms.length > 0) {
            // Update local when items are added/removed by select, but not otherwise
            const newWords = searchTerms.filter(word => !searchTerm.includes(word))
            const removedWords = splitSearchTerm(searchTerm).filter(word => !searchTerms.includes(word))
            if (newWords.length > 0 || removedWords.length > 0) {
                setSearchTerm(searchTerms.join(" "))
            }
        }
    }, [searchTerms])

    return (
        <form onSubmit={handleSearch} style={{ flexGrow: 1 }}>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    width: '100%',
                    padding: '15px 15px',
                    fontSize: '16px',
                    border: '1px solid #ccc',
                    backgroundColor: 'black',
                    color: 'white',
                    boxSizing: 'border-box',
                }}
                placeholder="Search..."
                disabled={isLoading}
            />
        </form>
    )
};


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

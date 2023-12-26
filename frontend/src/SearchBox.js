import React, { useEffect, useState } from 'react';


const splitSearchTerm = (term) => {
    return term
        .split(/[ ,]+/)
        .map(word => word.toLowerCase().trim())
        .filter(word => word.length > 0)
}

const SearchBox = ({ searchTerms, setSearchTerms, isLoading, setPca }) => {
    const [searchTerm, setSearchTerm] = useState('');

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

    const isWandActive = !isLoading && searchTerms.length > 2

    return (
        <div style={styles.container}>
            <button onClick={() => console.log("height")} style={styles.logoButton}>
                <img src="/latent-dictionary.png" alt="Latent Dictionary" style={styles.logo} />
            </button>
            <form onSubmit={handleSearch} style={{flexGrow: 1}}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.input}
                    placeholder="Search..."
                    disabled={isLoading}
                />
            </form>
            <button
                onClick={setPca}
                style={{ ...styles.magicWandButton, opacity: !isWandActive ? 0.5 : 1 }}
                disabled={!isWandActive}
                /* hover text */
                title={isWandActive ? "Reset Principle Components" : "Need at least 3 words!"}
            >
                <img src="/magic-wand.svg" alt="Magic Wand" style={{height: '100%', width: '100%'}} />
            </button>
        </div>
    );
};

const styles = {
    container: {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        padding: '10px',
        boxSizing: 'border-box',
    },
    input: {
        width: '100%',
        padding: '15px 15px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        backgroundColor: 'black',
        color: 'white',
        boxSizing: 'border-box',
    },
    magicWandButton: {
        // marginLeft: '10px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        backgroundColor: 'black',
        color: 'white',
        height: '50px',
        width: '50px',
    },
    logo: {
        height: '50px',
        margin: "0px",
    },
    logoButton: {
        // marginRight: '10px',
        padding: "0px",
        border: '0',
        height: '50px',
    }
};

export default SearchBox;

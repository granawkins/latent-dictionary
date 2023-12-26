import React, { useEffect, useState } from 'react';


const splitSearchTerm = (term) => {
    return term
        .split(/[ ,]+/)
        .map(word => word.toLowerCase().trim())
        .filter(word => word.length > 0)
}

const SearchBox = ({ searchTerms, setSearchTerms, isLoading }) => {
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

    return (
        <div style={styles.container}>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.input}
                    placeholder="Search..."
                    disabled={isLoading}
                />
            </form>
        </div>
    );
};

const styles = {
    container: {
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
    },
    input: {
        width: "80vw",
        padding: '15px 15px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        backgroundColor: 'black',
        color: 'white',
    }
};

export default SearchBox;

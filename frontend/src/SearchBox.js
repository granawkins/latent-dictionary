import React, { useState } from 'react';

const SearchBox = ({ setSearchTerms, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchTerms(searchTerm.split(/[ ,]+/).map(word => word.toLowerCase().trim()));
    }

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

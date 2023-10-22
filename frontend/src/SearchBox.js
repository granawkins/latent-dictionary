import React, { useState } from 'react';

const SearchBox = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(searchTerm);
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.input}
                    placeholder="Search..."
                />
            </form>
        </div>
    );
};

const styles = {
    container: {
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000
    },
    input: {
        padding: '10px 20px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc'
    }
};

export default SearchBox;

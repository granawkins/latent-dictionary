import { useEffect, useState } from 'react';

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

export default SearchBar;

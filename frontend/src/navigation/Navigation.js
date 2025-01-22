import LogoButton from './LogoButton';


const Navigation = ({ inputText, setInputText, handleSearch, loading }) => (
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
        <form onSubmit={handleSearch} style={{ flexGrow: 1 }}>
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
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
                disabled={loading}
            />
        </form>
    </div>
);

export default Navigation;

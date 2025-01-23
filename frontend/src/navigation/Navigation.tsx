import React from 'react';
import LogoButton from './LogoButton';

interface NavigationProps {
    inputText: string;
    setInputText: (text: string) => void;
    handleSearch: (e: React.FormEvent) => void;
    disabled?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ 
    inputText, 
    setInputText, 
    handleSearch, 
    disabled = false 
}) => (
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
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
                disabled={disabled}
            />
        </form>
    </div>
);

export default Navigation;

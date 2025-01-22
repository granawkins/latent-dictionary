import React from 'react';
import './App.css'; // Ensure the CSS file is imported

interface LoadingHandlerProps {
    isLoading?: boolean;
}

const LoadingHandler: React.FC<LoadingHandlerProps> = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #ffc107',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                animation: 'spin 0.5s linear infinite'
            }}></div>
        </div>
    );
};

export default LoadingHandler;

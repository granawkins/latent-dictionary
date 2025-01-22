import React from 'react';

interface ErrorModalProps {
    message: string;
    onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => (
    <div
        style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'black',
            color: 'white',
            padding: '20px',
            borderRadius: '4px',
            zIndex: 1000,
        }}
        onClick={onClose}
    >
        <strong>Error:</strong> {message}
    </div>
);

export default ErrorModal;

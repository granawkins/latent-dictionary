import { useState } from 'react';

const FAQModal = ({ onClose }) => (
    <div
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}
        onClick={onClose}
    >
        <div
            style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '4px',
                margin: '10%',
                minWidth: '300px',
            }}
            onClick={e => e.stopPropagation()}
        >
            <h2>Frequently Asked Questions</h2>
            <p><strong>Question:</strong> Filler question text?</p>
            <p><strong>Answer:</strong> Filler answer text.</p>
            {/* Add more Q&A pairs here */}
        </div>
    </div>
);

const FAQButton = () => {
    const [showModal, setShowModal] = useState(false);

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    return (
        <>
            {showModal && <FAQModal onClose={closeModal} />}
            <button
                style={{
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: 'black',
                    color: 'white',
                    height: '50px',
                    width: '50px',
                    position: 'fixed',
                    bottom: '10px',
                    left: '10px',
                    cursor: 'pointer',
                }}
                title="FAQ"
                onClick={openModal}
            >
                ?
            </button>
        </>
    );
};

export default FAQButton;

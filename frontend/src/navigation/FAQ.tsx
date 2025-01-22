import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    { question: "What am I looking at exactly?", answer: "DistilBert embeddings of the <a href='https://www.oxfordlearnersdictionaries.com/wordlist/american_english/oxford3000/' target='_blank'>Oxford 3000</a> word set + whatever you search for, reduced to 3 dimensions using PCA." },
    { question: "Excuse me?", answer: "AI's like ChatGPT convert text into embeddings, or long lists of numbers that represent their meanings. I've used one such model (<a href='https://huggingface.co/docs/transformers/model_doc/distilbert' target='_blank'>DistilBert</a>) to take a list of 3000 common words and convert them to embeddings.<br /><br />However, embeddings are very large - hundreds or thousands of numbers. I convert each one to just 3 numbers (x, y, and z) using a process called <a href='https://en.wikipedia.org/wiki/Principal_component_analysis' target='_blank'>Principal Components Analysis (PCA)</a>. This boils each embedding down to 3 numbers, which statistically best represent the differences found in that set of (3000) words. <br /><br />Those 3 numbers are the x, y, and z coordinates of each dot." },
    { question: "What does the magic wand do?", answer: "The magic wand resets the PCA based on the words selected when you click it." },
    { question: "But what does the location actually represent?", answer: "What indeed."},
    { question: "Why have you done this.", answer: "I tweeted about it as a joke, and people seemed interested, so I made it over the holidays."},
    { question: "What's your Twitter?", answer: "It's called X now. I'm <a href='https://x.com/granawkins' target='_blank'>@granawkins</a>."},
    { question: "Can I check out the code?", answer: "<a href='https://github.com/granawkins/latent-dictionary' target='_blank'>Absolutely</a>." },
];

interface FAQModalProps {
    onClose: () => void;
}

const FAQModal: React.FC<FAQModalProps> = ({ onClose }) => (
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
                maxHeight: '80vh',
                overflowY: 'auto',
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
            <div style={{width: '100%', textAlign: 'center'}}>
                <img 
                    src="/latent-dictionary.png" 
                    alt="Latent Dictionary" 
                />
            </div>
            {faqData.map((faq, index) => (
                <div key={index} style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontWeight: 'bold' }}>{faq.question}</h2>
                    <p dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
                </div>
            ))}
        </div>
    </div>
);

const FAQButton: React.FC = () => {
    const [showModal, setShowModal] = useState<boolean>(false);

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
                <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: '1.5em' }} />
            </button>
        </>
    );
};

export default FAQButton;

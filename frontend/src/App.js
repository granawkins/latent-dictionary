import React from 'react'
import { useCallback } from 'react';
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber'

import Dot from './Dot';
import Camera from './Camera';
import FAQButton from './navigation/FAQ';
import LoadingHandler from './LoadingHandler';
import ErrorModal from './ErrorModal';
import Navigation from './navigation/Navigation';
import { fetchWithAuth } from './utils.js';


const DotMemo = React.memo(Dot);


const App = () => {
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);
    const [corpus, setCorpus] = useState([]);
    const [inputText, setInputText] = useState("when u don't wanna get out of bed")
    const [activeText, setActiveText] = useState("")
    
    const handleSearch = useCallback(() => {
        if (!inputText || inputText === activeText) return
        setLoading(true)
        try {
            fetchWithAuth(
                "/api/search",
                "POST",
                {
                    word: inputText,
                    l1: "english",
                    l2: null,
                }
            )
                .then(data => {
                    console.log(data)
                    setActiveText(inputText)
                    setCorpus(data)
                })
        } catch (error) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }, [inputText, activeText]);
    
    useEffect(() => {
        handleSearch()
    }, [handleSearch])

    return (
        <>
            <Navigation 
                inputText={inputText}
                setInputText={setInputText}
                handleSearch={handleSearch}
                loading={loading}
            />
            <LoadingHandler loading={loading} />
            <Canvas>
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <Camera selectedCorpus={corpus} />
                {corpus &&
                    Object.entries(corpus).map(([word, data], i) => (
                        <DotMemo key={word} word={word} coordinates={data.coordinates} selected={data.selected} />
                    ))}
            </Canvas>
            <FAQButton />
            {error && <ErrorModal message={error} onClose={() => setError(null)} />}
        </>
    );
};

export default App

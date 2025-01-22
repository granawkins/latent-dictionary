import React from 'react'
import { useCallback } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber'

import Dot from './Dot';
import Camera from './Camera';
import FAQButton from './navigation/FAQ';
import LoadingHandler from './LoadingHandler';
import ErrorModal from './ErrorModal';
import Navigation from './navigation/Navigation';
import { debounce, fetchWithAuth } from './utils.js';


const DotMemo = React.memo(Dot);


const App = () => {
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);
    const [corpus, setCorpus] = useState([]);
    const [inputText, setInputText] = useState("when u don't wanna get out of bed")
    const [activeText, setActiveText] = useState("")
    const [searchPending, setSearchPending] = useState(false)
    const wordsPerL = 20

    const timer = useRef(null)
    
    const handleSearch = useCallback(() => {
        if (!inputText || inputText === activeText) return
        if (timer.current) clearTimeout(timer.current)
        setSearchPending(true)
        timer.current = setTimeout(() => {
            setLoading(true)
            try {
                fetchWithAuth(
                    "/api/search",
                    "POST",
                    {
                        word: inputText,
                        l1: "english",
                        l2: null,
                        words_per_l: wordsPerL,
                    }
                )
                    .then(data => {
                        console.log(data)
                        setActiveText(inputText)
                        setCorpus(data)
                        setSearchPending(false)
                    })
            } catch (error) {
                setError(error)
                setSearchPending(false)
            } finally {
                    setLoading(false)
            }
        }, 1000)
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
                        <DotMemo 
                            key={word} 
                            word={data.word} 
                            x={data.x} 
                            y={data.y} 
                            z={data.z}
                            language={data.language}
                            selected={true}
                            searchPending={searchPending}
                        />
                    ))}
                {/* A red dot at the origin to represent the search term */}
                <DotMemo 
                    word={inputText} 
                    x={0} 
                    y={0} 
                    z={0}
                    language={null}
                    selected={true}
                    color="red"
                    searchPending={searchPending}
                />
            </Canvas>
            <FAQButton />
            {error && <ErrorModal message={error} onClose={() => setError(null)} />}
        </>
    );
};

export default App

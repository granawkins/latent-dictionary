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
import { fetchWithAuth } from './utils.js';


const DotMemo = React.memo(Dot);


const App = () => {
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);
    const [corpus, setCorpus] = useState([]);
    const [inputText, setInputText] = useState("when u don't wanna get out of bed")
    const [activeText, setActiveText] = useState("")
    const wordsPerL = 20

    const timer = useRef(null)
    const [selected, setSelected] = useState([])
    const select = (word) => {
        setSelected(oldSelected => {
            if (oldSelected.includes(word)) return oldSelected.filter(w => w !== word)
            return [...oldSelected, word]
        })
    }
    
    const fetchSearch = useCallback(async (inputText, l1, l2, wordsPerL) => {
        setLoading(true)
        try {
            const response = await fetchWithAuth(
                "/api/search",
                "POST",
                {
                word: inputText,
                l1: "english",
                l2: null,
                words_per_l: wordsPerL,
            }
            )
            if (response) {
                setActiveText(inputText)
                setCorpus(response)
            }
        } finally {
            setLoading(false)
        }
    }, [inputText, wordsPerL])
    
    const handleSearch = useCallback(() => {
        if (!inputText || inputText === activeText) return
        if (timer.current) clearTimeout(timer.current)
        setLoading(true)
        timer.current = setTimeout(() => fetchSearch(inputText, "english", null, wordsPerL), 1000)
    }, [inputText, activeText]);
    
    useEffect(() => {
        fetchSearch(inputText, "english", null, wordsPerL)
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
                    Object.entries(corpus).map(([i, data]) => (
                        <DotMemo 
                            key={data.word} 
                            word={data.word} 
                            x={data.x} 
                            y={data.y} 
                            z={data.z}
                            language={data.language}
                            selected={selected.includes(data.word)}
                            select={() => select(data.word)}
                            searchPending={loading}
                        />
                    ))}
                {/* A red dot at the origin to represent the search term */}
                <DotMemo 
                    word={inputText} 
                    x={0} 
                    y={0} 
                    z={0}
                    language={null}
                    selected={selected.includes(inputText)}
                    select={() => select(inputText)}
                    color="red"
                    searchPending={loading}
                />
            </Canvas>
            <FAQButton />
            {error && <ErrorModal message={error} onClose={() => setError(null)} />}
        </>
    );
};

export default App

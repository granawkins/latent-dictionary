import React from 'react'
import { useState, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber'

import Dot from './Dot';
import SearchBox from './SearchBox';

const App = () => {
    const [corpus, setCorpus] = useState(null);
    const [selected, setSelected] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/get_vectors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    highlight: ["aardvark", "abacus", "astrophysicist"]
                })
            });
            const data = await response.json();
            console.log("got data", data)
            setCorpus(data);
            setSelected(Array(data.length).fill(false))
        } finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        if (!corpus && !isLoading) {
            setIsLoading(true)
            fetchData()
        }
    }, []);

    const handleSearch = (searchTerm) => {
        // Get hte index that matches the searchTerm, if any
        const index = Object.keys(corpus).findIndex(word => (
            word.toLowerCase() === searchTerm.toLowerCase()
        ));
        if (index !== -1) {
            const newSelected = [...selected]
            newSelected[index] = !newSelected[index]
            setSelected(newSelected)
        }  // Else, fetch from API
    }

    return (
        <>
            <SearchBox onSearch={handleSearch} isLoading={isLoading} />
            {isLoading && <div className="loading">Loading...</div>}
            <Canvas>
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <perspectiveCamera position={[0, 0, 5]} />
                <OrbitControls />
                {corpus &&
                    Object.entries(corpus).map(([word, coordinates], i) => (
                        <Dot key={word} word={word} coordinates={coordinates} selected={selected[i]} />
                    ))}
            </Canvas>
        </>
    );
};

export default App

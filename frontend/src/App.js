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
            const response = await fetch('/api/oxford_3000');
            const data = await response.json();
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
        const searchTerms = searchTerm.split(',').map(term => term.trim());
        const newSelected = Array(corpus.length).fill(false);
        searchTerms.forEach(term => {
            const index = Object.keys(corpus).findIndex(word => (
                word.toLowerCase() === term.toLowerCase()
            ));
            if (index !== -1) {
                newSelected[index] = !newSelected[index];
            }
        });
        setSelected(newSelected);
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

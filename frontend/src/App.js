import React from 'react'
import { useState, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber'

import Dot from './Dot';
import SearchBox from './SearchBox';

const App = () => {
    const [backendData, setBackendData] = useState(null);
    const [isLoading, setIsLoading] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            console.log('fetching data')
            const response = await fetch('/api/oxford_3000');
            console.log(response)
            const data = await response.json();
            console.log(data)
            setBackendData(data);
        } finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        if (!backendData && !isLoading) {
            fetchData()
        }
    }, []);

    const handleSearch = async (searchTerm) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/search/${searchTerm}`);
            const data = await response.json();
            setBackendData(data);
        } finally {
            setIsLoading(false)
        }
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
                {backendData &&
                    Object.entries(backendData).map(([word, coordinates]) => (
                        <Dot key={word} coordinates={coordinates} />
                    ))}
            </Canvas>
        </>
    );
};

export default App

import React from 'react'
import { useState, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber'

import Dot from './Dot';
import SearchBox from './SearchBox';

const App = () => {
    const [backendData, setBackendData] = useState(null);

    const handleSearch = async (searchTerm) => {
        const response = await fetch(`/api/search/${searchTerm}`);
        const data = await response.json();
        setBackendData(data);
    }

    return (
        <>
            <SearchBox onSearch={handleSearch} />
            <Canvas>
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <perspectiveCamera position={[0, 0, 5]} />
                <OrbitControls />
                {backendData &&
                    Object.entries(backendData).map(([word, coordinates]) => (
                        <Dot key={word} word={word} coordinates={coordinates} />
                    ))}
            </Canvas>
        </>
    );
};

export default App

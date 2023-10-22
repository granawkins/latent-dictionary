import { useState, useEffect } from 'react';
import React from 'react'
import { Canvas } from '@react-three/fiber'
import Box from './Box'

const App = () => {
    // const [backendData, setBackendData] = useState(null);

    useEffect(() => {
        fetchBackendData();
    }, []);

    const fetchBackendData = async () => {
        const response = await fetch('/api/search/king');
        const data = await response.json();
        console.log(data);
    };
    return (
        <Canvas>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Box position={[-1.2, 0, 0]} />
            <Box position={[1.2, 0, 0]} />
        </Canvas>
    )
}

export default App

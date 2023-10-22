import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

const SCALE = 100

function Dot({ word, coordinates, selected }) {
    const [localSelected, setLocalSelected] = useState(false);
    useEffect(() => {
        setLocalSelected(selected)
    }, [selected])
    
    const meshRef = useRef();
    const [x, y, z] = coordinates;
    useFrame((state, delta) => (meshRef.current.position.set(
        x * SCALE, 
        y * SCALE, 
        z * SCALE,
    )));

    const handleClick = () => {
        setLocalSelected(!localSelected);
    }

    return (
        <mesh ref={meshRef}
            onClick={handleClick}
        >
            <sphereGeometry args={[
                0.05 * (localSelected ? 3 : 1), 
                32, 
                32,
            ]} />
            <meshStandardMaterial 
                color={localSelected ? 'hotpink' : 'gray'} 
                transparent 
                opacity={localSelected ? 1 : 0.5} 
            />
        </mesh>
    );
}

export default Dot;

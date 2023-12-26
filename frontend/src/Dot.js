import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const SCALE = 10

function Dot({ word, coordinates, selected, select }) {
    
    const meshRef = useRef();
    const [x, y, z] = coordinates;
    useFrame((state, delta) => (meshRef.current.position.set(
        x * SCALE, 
        y * SCALE, 
        z * SCALE,
    )));

    return (
        <mesh ref={meshRef}
            onClick={() => select(word)}
        >
            <sphereGeometry args={[
                0.05 * (selected ? 3 : 1), 
                32, 
                32,
            ]} />
            <meshStandardMaterial 
                color='white' 
                emissive={selected ? 'yellow' : 'black'}
                transparent
                emissiveIntensity={selected ? 1 : 0}
                opacity={selected ? 1 : 0.5} 
            />
        </mesh>
    );
}

export default Dot;

import { Text } from '@react-three/drei';
import React, { useRef } from 'react';

export const SCALE = 10

function Dot({ word, coordinates, selected, select }) {
    
    const meshRef = useRef();
    const [x, y, z] = coordinates;

    return (
        <mesh ref={meshRef}
            position={[x * SCALE, y * SCALE, z * SCALE]}
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
            {selected && (
                <Text
                    position={[0, 0.5, 0]}
                    fontSize={0.5}
                    color="white"
                >
                    {word}
                </Text>
            )}
        </mesh>
    );
}

export default Dot;

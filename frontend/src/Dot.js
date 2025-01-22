import { Text } from '@react-three/drei';
import React, { useRef } from 'react';

export const SCALE = 10

function Dot({ word, x, y, z, selected, select, color = "white", searchPending = false }) {
    
    const meshRef = useRef();

    const handleClick = () => {
        console.log(word)
    }

    // Base opacity for dots is 0.5, reduced by half when search is pending
    const dotOpacity = (selected ? 1 : 0.5) * (searchPending ? 0.5 : 1);
    
    return (
        <mesh ref={meshRef}
            position={[x * SCALE, y * SCALE, z * SCALE]}
            onClick={handleClick}
        >
            <sphereGeometry args={[
                0.05 * (selected ? 3 : 1), 
                32, 
                32,
            ]} />
            <meshStandardMaterial 
                color={color}
                emissive={color}
                transparent
                emissiveIntensity={selected ? 1 : 0}
                opacity={dotOpacity}
            />
            {selected && (
                <Text
                    position={[0, 0.5, 0]}
                    fontSize={0.5}
                    color="white"
                    font='/NotoSans-Regular.ttf'
                    transparent
                    opacity={0.8 * (searchPending ? 0.5 : 1)} // Base text opacity is 0.8, reduced by half when search is pending
                >
                    {word}
                </Text>
            )}
        </mesh>
    );
}

export default Dot;

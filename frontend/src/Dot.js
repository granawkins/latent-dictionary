import { Text } from '@react-three/drei';
import React, { useRef } from 'react';

export const SCALE = 10

function Dot({ word, x, y, z, selected, select, color = "white" }) {
    
    const meshRef = useRef();

    const handleClick = () => {
        console.log(word)
    }

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
                opacity={selected ? 1 : 0.5} 
            />
            {selected && (
                <Text
                    position={[0, 0.5, 0]}
                    fontSize={0.5}
                    color="white"
                    font='/NotoSans-Regular.ttf'
                >
                    {word}
                </Text>
            )}
        </mesh>
    );
}

export default Dot;

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

const SCALE = 100

function Dot({ word, coordinates, selected }) {
    const [localSelected, setLocalSelected] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    useEffect(() => {
        setLocalSelected(selected)
    }, [selected])
    
    const meshRef = useRef();
    const [x, y, z] = coordinates;
    const targetScale = (localSelected ? 3 : 1) * (isHovered ? 1.2 : 1);
    useFrame((state, delta) => {
        meshRef.current.position.set(x * SCALE, y * SCALE, z * SCALE);
        const currentScale = meshRef.current.scale.x;
        const scaleDiff = targetScale - currentScale;
        const easeInOutFactor = scaleDiff * delta * 5;
        meshRef.current.scale.set(currentScale + easeInOutFactor, currentScale + easeInOutFactor, currentScale + easeInOutFactor);
    });

    const handleClick = () => {
        setLocalSelected(!localSelected);
    }

    return (
        <mesh ref={meshRef}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <sphereGeometry args={[
                0.05 * (localSelected ? 3 : 1) * (isHovered ? 1.2 : 1),
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

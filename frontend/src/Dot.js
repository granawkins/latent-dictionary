import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from "@react-three/drei";
import { useThree } from '@react-three/fiber';

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

    const [isClicked, setIsClicked] = useState(false);
    const handlePointerDown = () => {
        setIsClicked(true);
    }

    const handlePointerUp = () => {
        setIsClicked(false);
    }

    const {camera} = useThree()

    const radius = 0.05 * (localSelected ? 3 : 1) * (isHovered ? 1.2 : 1)
    const color = localSelected ? 'hotpink' : 'gray'

    return (
        <>
        <mesh ref={meshRef}

            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >
            <sphereGeometry args={[
                .05,
                32,
                32,
            ]} />
            <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={localSelected ? 1 : 0.5} 
            />
        </mesh>
        {(isHovered || isClicked) && (
            <Text
                fontSize={0.4}
                color={color}
                position={[x * SCALE, y * SCALE + 0.5 + (radius), z * SCALE]}
                rotation={camera.rotation}
            >
                {word}
            </Text>
        )}
        </>
    );
}

export default Dot;

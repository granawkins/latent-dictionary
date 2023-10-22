import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

function Dot({ word, coordinates }) {
    const meshRef = useRef();
    const [x, y, z] = coordinates;

    useFrame((state, delta) => (meshRef.current.position.set(x, y, z)));

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color={'hotpink'} />
        </mesh>
    );
}

export default Dot;
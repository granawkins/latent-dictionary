import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const SCALE = 100

function Dot({ word, coordinates }) {
    const [selected, setSelected] = useState(false);
    const meshRef = useRef();
    const [x, y, z] = coordinates;

    useFrame((state, delta) => (meshRef.current.position.set(
        x * SCALE, 
        y * SCALE, 
        z * SCALE,
    )));

    return (
        <mesh ref={meshRef}
            onClick={() => setSelected(!selected)}
        >
            <sphereGeometry args={[0.05, 32, 32]} />
            <meshStandardMaterial color={selected ? 'hotpink' : 'gray'} transparent opacity={selected ? 1 : 0.5} />
        </mesh>
    );
}

export default Dot;

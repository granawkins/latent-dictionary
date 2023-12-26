import * as THREE from 'three';
import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const Camera = ({ selectedCorpus }) => {

    const [targetCoordinates, setTargetCoordinates] = useState(null)
    useEffect(() => {
        if (selectedCorpus) {
            const newTargetCoordinates = [0, 0, 0]
            Object.values(selectedCorpus).forEach(coordinates => {
                newTargetCoordinates[0] += coordinates[0]
                newTargetCoordinates[1] += coordinates[1]
                newTargetCoordinates[2] += coordinates[2]
            })
            newTargetCoordinates[0] /= Object.keys(selectedCorpus).length
            newTargetCoordinates[1] /= Object.keys(selectedCorpus).length
            newTargetCoordinates[2] /= Object.keys(selectedCorpus).length
            setTargetCoordinates(newTargetCoordinates)
        }
    }, [selectedCorpus])


    // Cancel animation on user interaction
    useEffect(() => {
        const reset = () => setTargetCoordinates(null);
        window.addEventListener('mousedown', reset);
        window.addEventListener('touchstart', reset);
        return () => {
            window.removeEventListener('mousedown', reset);
            window.removeEventListener('touchstart', reset);
        };
    }, [])


    useFrame((state) => {
        if (targetCoordinates !== null) {
            const step = 0.05; // Define the step size
            const camera = state.camera;
            camera.position.lerp(new THREE.Vector3(...targetCoordinates), step);
        }
    });

    
    return (
        <perspectiveCamera />
    );
};

export default Camera;

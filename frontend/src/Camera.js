import * as THREE from 'three';
import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { SCALE } from './Dot';

const Camera = ({ selectedCorpus }) => {

    // When selectedCorpus updates, spin/move the camera to get all selected words in view
    const [targetCoordinates, setTargetCoordinates] = useState(null)
    const [lookAtPosition, setLookAtPosition] = useState(null)
    useEffect(() => {
        if (selectedCorpus) {
            // 1. Compute the bounding box
            const bbox = new THREE.Box3();
            Object.values(selectedCorpus).forEach(coordinates => {
                coordinates = coordinates.map(c => c * SCALE);
                bbox.expandByPoint(new THREE.Vector3(...coordinates));
            });

            // 2. Calculate the center point
            const center = bbox.getCenter(new THREE.Vector3());
            setLookAtPosition(center);

            // 3. Determine the Camera Distance
            const size = bbox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = 45; // Assuming a field of view of 75 degrees
            const cameraDistance = maxDim / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2));

            const target = new THREE.Vector3(center.x, center.y, center.z + cameraDistance);
            setTargetCoordinates(target);
        }
    }, [selectedCorpus])


    // Cancel animation on user interaction
    useEffect(() => {
        const reset = () => setTargetCoordinates(null);
        const events = ['mousedown', 'wheel', 'touchstart'];
        events.forEach(event => window.addEventListener(event, reset));
        return () => {
            events.forEach(event => window.removeEventListener(event, reset));
        };
    }, [])


    useFrame((state) => {
        if (targetCoordinates !== null) {
            const step = 0.05; // Define the step size
            const camera = state.camera;
            camera.position.lerp(targetCoordinates, step);
            camera.lookAt(lookAtPosition)
        }
    });

    
    return (
        <perspectiveCamera />
    );
};

export default Camera;

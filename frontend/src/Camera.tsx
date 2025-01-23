import React from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { SCALE } from "./Dot";

interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

interface CorpusItem {
  word: string;
  x: number;
  y: number;
  z: number;
  language: string | null;
}

interface CameraProps {
  selectedCorpus: Record<string, CorpusItem>;
}

const DEFAULT_TARGET: Vector3Like = { x: 1.5, y: -0.5, z: 11.5 };

const Camera: React.FC<CameraProps> = ({ selectedCorpus }) => {
  // When selectedCorpus updates, spin/move the camera to get all selected words in view
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [targetCoordinates, setTargetCoordinates] =
    useState<Vector3Like | null>(DEFAULT_TARGET);
  const [lookAtPosition, setLookAtPosition] = useState<THREE.Vector3 | null>(
    null,
  );

  useEffect(() => {
    if (selectedCorpus) {
      if (Object.keys(selectedCorpus).length === 1) {
        return;
      }
      // 1. Compute the bounding box
      const bbox = new THREE.Box3();
      Object.values(selectedCorpus).forEach((dot) => {
        bbox.expandByPoint(
          new THREE.Vector3(dot.x * SCALE, dot.y * SCALE, dot.z * SCALE),
        );
      });
      // 2. Calculate the center point
      const center = bbox.getCenter(new THREE.Vector3());
      setLookAtPosition(center);

      // 3. Determine the Camera Distance
      const size = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = 45; // Assuming a field of view of 75 degrees
      const cameraDistance =
        maxDim / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2));

      const target = new THREE.Vector3(
        center.x,
        center.y,
        center.z + cameraDistance,
      );
      if (Object.keys(selectedCorpus).length === 1) {
        target.z += 5;
      }
      if (target.z === 0 && target.y === 0 && target.x === 0) {
        return;
      }
      setTargetCoordinates(target);
    }
  }, [selectedCorpus]);

  // Cancel animation on user interaction
  useEffect(() => {
    const reset = () => setTargetCoordinates(null);
    const events = ["mousedown", "wheel", "touchstart"];
    events.forEach((event) => window.addEventListener(event, reset));
    return () => {
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, []);

  useFrame((state) => {
    if (targetCoordinates !== null && controlsRef.current && lookAtPosition) {
      const step = 0.05; // Define the step size
      const camera = state.camera;
      camera.position.lerp(
        new THREE.Vector3(
          targetCoordinates.x,
          targetCoordinates.y,
          targetCoordinates.z,
        ),
        step,
      );
      controlsRef.current.target.lerp(lookAtPosition, step);
    }
  });

  return (
    <>
      <perspectiveCamera />
      <OrbitControls ref={controlsRef} />
    </>
  );
};

export default Camera;

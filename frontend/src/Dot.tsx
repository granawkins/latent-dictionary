import { Text } from "@react-three/drei";
import React, { useRef } from "react";
import { Mesh } from "three";

export const SCALE = 10;

interface DotProps {
  word: string;
  x: number;
  y: number;
  z: number;
  selected: boolean;
  select: () => void;
  color?: string;
  searchPending?: boolean;
  language?: string | null;
}

const Dot: React.FC<DotProps> = ({
  word,
  x,
  y,
  z,
  selected,
  select,
  color = "white",
  searchPending = false,
}) => {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      position={[x * SCALE, y * SCALE, z * SCALE]}
      onClick={select}
    >
      <sphereGeometry args={[0.15 * (selected ? 1.2 : 1), 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        transparent
        opacity={searchPending ? 0.25 : selected ? 1 : 0.5}
      />
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color="white"
        transparent={!selected}
      >
        {word}
      </Text>
    </mesh>
  );
};

export default Dot;

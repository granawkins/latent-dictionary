import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import { Mesh } from "three";
import { animated, useSpring } from "@react-spring/three";
import { Languages, Language } from "./utils";

export const SCALE = 10;

interface DotProps {
  word: string;
  x: number;
  y: number;
  z: number;
  selected: boolean;
  select: () => void;
  language?: string | null;
  color?: string;
  searchPending?: boolean;
}

const Dot: React.FC<DotProps> = ({
  word,
  x,
  y,
  z,
  selected,
  select,
  language,
  color,
  searchPending,
}) => {
  const meshRef = useRef<Mesh>(null);
  const time = useRef(Math.random() * Math.PI * 2);

  const dotColor = color
    ? color
    : language
      ? Languages.find((l: Language) => l.name === language)?.color
      : "white";

  // Get the language code (zh for Chinese)
  const langCode = language
    ? Languages.find((l: Language) => l.name === language)?.code
    : null;

  // Spring animation for position
  const { position } = useSpring({
    position: [x * SCALE, y * SCALE, z * SCALE],
    config: { mass: 1, tension: 120, friction: 14 },
  });

  // Orbital motion for empty dots
  useFrame((_, delta) => {
    if (!word && meshRef.current && !searchPending) {
      time.current += delta * 0.2;
      const radius = 5;
      const orbitX = Math.cos(time.current) * radius;
      const orbitZ = Math.sin(time.current) * radius;
      meshRef.current.position.x = orbitX;
      meshRef.current.position.z = orbitZ;
      meshRef.current.position.y = Math.sin(time.current * 0.5) * 2;
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={word ? position : undefined}
      onClick={select}
    >
      <sphereGeometry args={[0.15 * (selected ? 1.2 : 1), 32, 32]} />
      <meshBasicMaterial
        color={dotColor}
        transparent
        opacity={selected ? 0.85 : word ? 0.6 : 0.3}
      />
      {word && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.3}
          color={dotColor}
          anchorX="center"
          anchorY="middle"
          font={
            langCode === "zh"
              ? "https://fonts.gstatic.com/s/notosanssc/v36/k3kXo84MPvpLmixcA63oeALhLOCT-xWNm8Hqd37g1OkDRZe7lR4sg1IzSy-MNbE9VH8V.ttf"
              : "https://fonts.gstatic.com/s/notosans/v35/o-0IIpQlx3QUlC5A4PNr5TRG.ttf"
          }
          onError={(e) => {
            console.error(`Text rendering error for word "${word}":`, e);
          }}
        >
          {word}
        </Text>
      )}
    </animated.mesh>
  );
};

export default Dot;

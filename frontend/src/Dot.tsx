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
  language?: string | null;
  color?: string;
  loading?: boolean;
}

const Dot: React.FC<DotProps> = ({
  word,
  x,
  y,
  z,
  language,
  color,
  loading,
}) => {
  const meshRef = useRef<Mesh>(null);
  const dotColor = color
    ? color
    : language
      ? Languages.find((l: Language) => l.name === language)?.color
      : "white";

  // Get the language code (zh for Chinese)
  const langCode = language
    ? Languages.find((l: Language) => l.name === language)?.code
    : null;

  const time = useRef(Math.random() * Math.PI * 2);
  const isEmptyOrLoading = !word || loading;

  // Use spring for positioned dots, manual position for drifting dots
  const { position } = useSpring({
    position: isEmptyOrLoading ? [0, 0, 0] : [x * SCALE, y * SCALE, z * SCALE],
    config: { mass: 2, tension: 80, friction: 20 },
  });

  // Gentle orbital motion for empty/loading dots
  useFrame((_, delta) => {
    if (isEmptyOrLoading && meshRef.current) {
      time.current += delta * 0.2;
      const radius = 3;
      meshRef.current.position.x = Math.cos(time.current) * radius;
      meshRef.current.position.z = Math.sin(time.current) * radius;
      meshRef.current.position.y = Math.sin(time.current * 0.5) * 1.5;
    }
  });

  return (
    <animated.mesh ref={meshRef} position={isEmptyOrLoading ? undefined : position}>
      <sphereGeometry args={[0.15, 32, 32]} />
      <meshBasicMaterial
        color={dotColor}
        transparent
        opacity={isEmptyOrLoading ? 0.25 : 0.6}
      />
      {!isEmptyOrLoading && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.3}
          color={dotColor}
          anchorX="center"
          anchorY="middle"
          font={
            langCode === "zh"
              ? "/NotoSansSC-VariableFont_wght.ttf"
              : "/NotoSans-Regular.ttf"
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

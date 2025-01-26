import { Text } from "@react-three/drei";
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

const Dot: React.FC<DotProps> = ({ word, x, y, z, language, color, loading }) => {
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

  const { position } = useSpring({
    position: [x * SCALE, y * SCALE, z * SCALE],
    config: { mass: 2, tension: 80, friction: 20 }
  });

  return (
    <animated.mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.15, 32, 32]} />
      <meshBasicMaterial color={dotColor} transparent opacity={loading ? 0.25 : 0.6} />
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color={dotColor}
        fillOpacity={loading && color !== "white" ? 0.25 : 1}
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
    </animated.mesh>
  );
};

export default Dot;

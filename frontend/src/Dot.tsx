import { Text } from "@react-three/drei";
import React, { useRef, useState, useEffect } from "react";
import { Mesh } from "three";

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
}) => {
  const meshRef = useRef<Mesh>(null);
  const [textError, setTextError] = useState<boolean>(false);
  const dotColor = color
    ? color
    : language
      ? Languages.find((l: Language) => l.name === language)?.color
      : "white";

  // Get the language code (zh for Chinese)
  const langCode = language
    ? Languages.find((l: Language) => l.name === language)?.code
    : null;

  // Reset error state when language changes
  useEffect(() => {
    setTextError(false);
  }, [language]);

  return (
    <mesh
      ref={meshRef}
      position={[x * SCALE, y * SCALE, z * SCALE]}
      onClick={select}
    >
      <sphereGeometry args={[0.15 * (selected ? 1.2 : 1), 32, 32]} />
      <meshBasicMaterial
        color={dotColor}
        transparent
        opacity={selected ? 0.85 : 0.6}
      />
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
          setTextError(true);
        }}
      >
        {word}
      </Text>
    </mesh>
  );
};

export default Dot;

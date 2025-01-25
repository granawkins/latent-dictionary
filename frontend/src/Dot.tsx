import { Html } from "@react-three/drei";
import React, { useRef } from "react";
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
  searchPending?: boolean;
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
  searchPending = false,
  language,
  color,
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
        opacity={searchPending ? 0.25 : selected ? 0.85 : 0.6}
      />
      <Html
        position={[0, 0.5, 0]}
        style={{
          transform: 'translate(-50%, -100%)',
        }}
      >
        <div
          className={`dot-label ${selected ? 'selected' : ''} ${
            langCode === 'zh' ? 'chinese-text' : ''
          }`}
          style={{ color: dotColor }}
        >
          {word}
        </div>
      </Html>
    </mesh>
  );
};

export default Dot;

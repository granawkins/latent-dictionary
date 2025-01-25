import { Text } from "@react-three/drei";
import React, { useRef, useState, useEffect } from "react";
import { Mesh } from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

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
  const [fontError, setFontError] = useState<boolean>(false);
  const dotColor = color
    ? color
    : language
      ? Languages.find((l: Language) => l.name === language)?.color
      : "white";

  // Get the language code (zh for Chinese)
  const langCode = language
    ? Languages.find((l: Language) => l.name === language)?.code
    : null;

  // Determine font path based on language
  const fontPath =
    langCode === "zh"
      ? `${window.location.origin}/NotoSansSC-VariableFont_wght.ttf`
      : `${window.location.origin}/NotoSans-Regular.ttf`;

  // Preload font to catch errors
  useEffect(() => {
    const loader = new FontLoader();
    loader.load(
      fontPath,
      () => setFontError(false),
      undefined,
      () => setFontError(true),
    );
  }, [fontPath]);

  if (fontError) {
    console.warn(`Failed to load font for language: ${language}`);
  }

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
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color={dotColor}
        transparent={!selected}
        font={fontPath}
        onError={(e) => {
          console.warn(`Text rendering error for word "${word}":`, e);
          setFontError(true);
        }}
      >
        {word}
      </Text>
    </mesh>
  );
};

export default Dot;

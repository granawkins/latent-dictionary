import { Html } from "@react-three/drei";
import React from "react";

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
    <group position={[x * SCALE, y * SCALE, z * SCALE]} onClick={select}>
      <Html
        center
        style={{
          pointerEvents: "none",
        }}
      >
        <div
          className={`dot-label ${selected ? "selected" : ""} ${
            langCode === "zh" ? "chinese-text" : ""
          }`}
          style={{ color: dotColor }}
        >
          {word}
        </div>
      </Html>
    </group>
  );
};

export default Dot;

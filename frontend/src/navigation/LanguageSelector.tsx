import React, { useState, CSSProperties } from "react";
import { US, ES } from "country-flag-icons/react/3x2";

interface Language {
  code: string;
  Flag: React.ComponentType<{ title: string; style?: React.CSSProperties }>;
  name: string;
  color: string;
}

const LANGUAGES: Language[] = [
  { code: "en", Flag: US, name: "English", color: "#4a90e2" },
  { code: "es", Flag: ES, name: "Spanish", color: "#e24a4a" },
];

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onToggleLanguage: (code: string) => void;
}

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
    userSelect: "none",
  } as CSSProperties,
  selectedLanguages: {
    cursor: "pointer",
    padding: "24px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    display: "flex",
    gap: "24px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  } as CSSProperties,
  menu: {
    position: "absolute",
    bottom: "100%",
    right: 0,
    marginBottom: "12px",
    background: "rgba(40, 40, 40, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  } as CSSProperties,
  flag: (selected: boolean, color?: string): CSSProperties => ({
    width: "72px",
    height: "54px",
    cursor: "pointer",
    padding: "12px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    outline: selected && color ? `3px solid ${color}` : "none",
    background: selected ? `${color}20` : "transparent",
  }),
  flagImage: {
    width: "100%",
    height: "100%",
    borderRadius: "4px",
  } as CSSProperties,
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onToggleLanguage,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={styles.container}>
      <div style={styles.selectedLanguages} onClick={toggleMenu}>
        {LANGUAGES.filter((lang) => selectedLanguages.includes(lang.code)).map(
          (lang) => (
            <div
              key={lang.code}
              style={styles.flag(true, lang.color)}
              title={lang.name}
            >
              <lang.Flag title={lang.name} style={styles.flagImage} />
            </div>
          ),
        )}
      </div>
      {isOpen && (
        <div style={styles.menu}>
          {LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              style={styles.flag(selectedLanguages.includes(lang.code), lang.color)}
              onClick={() => {
                onToggleLanguage(lang.code);
              }}
              title={lang.name}
            >
              <lang.Flag title={lang.name} style={styles.flagImage} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

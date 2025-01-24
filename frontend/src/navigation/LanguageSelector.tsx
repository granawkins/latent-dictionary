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

const CloseIcon: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div
    style={{
      width: "72px",
      height: "54px",
      padding: "12px",
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(255, 255, 255, 0.1)",
      transition: "background 0.2s ease",
    }}
    onClick={onClick}
    onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")}
    onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
  >
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255, 255, 255, 0.8)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </div>
);

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
    userSelect: "none",
  } as CSSProperties,
  legend: (expanded: boolean): CSSProperties => ({
    cursor: expanded ? "default" : "pointer",
    padding: "24px",
    borderRadius: "12px",
    background: expanded
      ? "rgba(40, 40, 40, 0.95)"
      : "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
    border: expanded
      ? "1px solid rgba(255, 255, 255, 0.2)"
      : "1px solid rgba(255, 255, 255, 0.3)",
    transition: "all 0.3s ease",
    position: "relative",
    maxWidth: expanded ? "400px" : "none",
  }),
  flag: (
    selected: boolean,
    color?: string,
    expanded: boolean,
  ): CSSProperties => ({
    width: expanded ? "72px" : "36px",
    height: expanded ? "54px" : "27px",
    cursor: expanded ? "pointer" : "default",
    padding: expanded ? "12px" : "6px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    outline: selected && color ? `3px solid ${color}` : "none",
    background: selected ? `${color}20` : "transparent",
    display: !expanded && !selected ? "none" : "block",
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
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.legend(isExpanded)} onClick={toggleExpanded}>
        {LANGUAGES.map((lang) => (
          <div
            key={lang.code}
            style={styles.flag(
              selectedLanguages.includes(lang.code),
              lang.color,
              isExpanded,
            )}
            onClick={(e) => {
              if (isExpanded) {
                e.stopPropagation();
                onToggleLanguage(lang.code);
              }
            }}
            title={lang.name}
          >
            <lang.Flag title={lang.name} style={styles.flagImage} />
          </div>
        ))}
        {isExpanded && (
          <CloseIcon
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;

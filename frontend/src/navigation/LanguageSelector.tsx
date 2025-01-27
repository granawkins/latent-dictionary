import React, { useState } from "react";
import { Languages } from "../utils";
import "./LanguageSelector.css";

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onToggleLanguage: (code: string) => void;
}

const CloseIcon: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="language-selector-close" onClick={onClick}>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255, 255, 255, 0.9)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </div>
);

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
    <div className="language-selector-container">
      <div
        className={`language-selector-legend ${isExpanded ? "expanded" : ""}`}
        onClick={toggleExpanded}
      >
        <div className="language-selector-flags">
          {Languages.map((lang) => (
            <div
              key={lang.code}
              className={`language-selector-flag ${
                selectedLanguages.includes(lang.code) ? "selected" : ""
              } ${!isExpanded && !selectedLanguages.includes(lang.code) ? "hidden" : ""}`}
              onClick={(e) => {
                if (isExpanded) {
                  e.stopPropagation();
                  onToggleLanguage(lang.code);
                }
              }}
              title={lang.name}
              style={
                {
                  "--flag-color": lang.color,
                } as React.CSSProperties
              }
            >
              <lang.Flag title={lang.name} className="flag-image" />
            </div>
          ))}
        </div>
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

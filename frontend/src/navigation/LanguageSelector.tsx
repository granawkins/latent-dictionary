import React, { useState } from "react";
import "./LanguageSelector.css";

interface Language {
  code: string;
  flag: string;
  name: string;
}

const LANGUAGES: Language[] = [
  { code: "en", flag: "🇺🇸", name: "English" },
  { code: "es", flag: "🇪🇸", name: "Spanish" },
];

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onToggleLanguage: (code: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onToggleLanguage,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`language-selector ${isOpen ? "open" : ""}`}>
      <div className="selected-languages" onClick={toggleMenu}>
        {LANGUAGES.filter((lang) => selectedLanguages.includes(lang.code)).map(
          (lang) => (
            <span
              key={lang.code}
              className="language-flag selected"
              title={lang.name}
            >
              {lang.flag}
            </span>
          ),
        )}
      </div>
      {isOpen && (
        <div className="language-menu">
          {LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              className={`language-option ${selectedLanguages.includes(lang.code) ? "selected" : ""}`}
              onClick={() => {
                onToggleLanguage(lang.code);
              }}
              title={lang.name}
            >
              {lang.flag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

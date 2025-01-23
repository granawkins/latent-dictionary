import React, { useState } from "react";
import { US, ES } from "country-flag-icons/react/3x2";
import "./LanguageSelector.css";

interface Language {
  code: string;
  Flag: React.ComponentType<{ title: string }>;
  name: string;
}

const LANGUAGES: Language[] = [
  { code: "en", Flag: US, name: "English" },
  { code: "es", Flag: ES, name: "Spanish" },
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
            <div key={lang.code} className="language-flag selected" title={lang.name}>
              <lang.Flag title={lang.name} />
            </div>
          ),
        )}
      </div>
      {isOpen && (
        <div className="language-menu">
          {LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              className={`language-option ${
                selectedLanguages.includes(lang.code) ? "selected" : ""
              }`}
              onClick={() => {
                onToggleLanguage(lang.code);
              }}
              title={lang.name}
            >
              <lang.Flag title={lang.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

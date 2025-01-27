import React from "react";
import { useCallback, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Dot from "./Dot";
import Camera from "./Camera";
import ErrorModal from "./ErrorModal";
import Navigation from "./navigation/Navigation";
import SwipeIndicator from "./SwipeIndicator";
import LanguageSelector from "./navigation/LanguageSelector";
import { fetchWithAuth, Languages } from "./utils";
import "./FullscreenButton.css";

// Add type definition for screen orientation API
interface ScreenOrientation {
  lock(orientation: "landscape"): Promise<void>;
}

// Use type references instead of extending EventTarget
interface Screen {
  orientation?: ScreenOrientation;
}

declare global {
  interface Window {
    screen: Screen;
  }
}

interface CorpusItem {
  word: string;
  x: number;
  y: number;
  z: number;
  language: string | null;
}

const DotMemo = React.memo(Dot);

const WORDS_PER_LANGUAGE = 20;
const DEFAULT_SEARCH_TERM = "when u don't wanna get out of bed";

const App: React.FC = () => {
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>(DEFAULT_SEARCH_TERM);
  const [activeText, setActiveText] = useState<string>("");
  const [corpus, setCorpus] = useState<Record<string, CorpusItem>>({});
  const [emptyDots, setEmptyDots] = useState<Record<string, CorpusItem[]>>({});
  const fetchSearch = useCallback(
    async (inputText: string, languages: string[]) => {
      setLoading(true);
      try {
        const response: Record<string, CorpusItem> = await fetchWithAuth(
          "/api/search",
          "POST",
          {
            word: inputText,
            languages: languages,
            words_per_l: WORDS_PER_LANGUAGE,
          },
        );
        if (response) {
          setActiveText(inputText);
          setCorpus(response);
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);
  const handleToggleLanguage = (code: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(code)) {
        // Don't allow deselecting if it's the last language
        if (prev.length === 1) return prev;
        const newSelected = prev.filter((lang) => lang !== code);
        // Remove empty dots for deselected language
        setEmptyDots(dots => {
          const newDots = { ...dots };
          delete newDots[code];
          return newDots;
        });
        return newSelected;
      }
      // Add empty dots for new language
      const langName = Languages.find(l => l.code === code)?.name;
      if (langName) {
        setEmptyDots(dots => ({
          ...dots,
          [code]: Array(WORDS_PER_LANGUAGE).fill(null).map(() => ({
            word: "",
            x: 0,
            y: 0,
            z: 0,
            language: langName
          }))
        }));
      }
      return [...prev, code];
    });
  };
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const languages = Languages.filter((l) =>
      selectedLanguages.includes(l.code),
    ).map((l) => l.name);
    fetchSearch(inputText, languages);
  }, [selectedLanguages]);

  const handleSearch = useCallback(() => {
    if (!inputText || inputText === activeText) return;
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      const languages = Languages.filter((l) =>
        selectedLanguages.includes(l.code),
      ).map((l) => l.name);
      fetchSearch(inputText, languages);
    }, 1000);
  }, [inputText, activeText, fetchSearch, selectedLanguages]);

  useEffect(() => {
    handleSearch();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [handleSearch]);

  return (
    <div className="app-container">
      <Navigation inputText={inputText} setInputText={setInputText} />
      <Canvas>
        <Camera selectedCorpus={corpus} />
        {/* Render corpus dots */}
        {corpus &&
          Object.entries(corpus)
            .filter(([, data]) => {
              if (!data.language) return true;
              const langCode = Languages.find(
                (l) => l.name === data.language,
              )?.code;
              return langCode && selectedLanguages.includes(langCode);
            })
            .map(([i, data]) => (
              <DotMemo
                key={i}
                word={data.word}
                x={data.x}
                y={data.y}
                z={data.z}
                language={data.language}
                loading={loading}
              />
            ))}
        {/* Render empty dots for selected languages */}
        {Object.entries(emptyDots).map(([code, dots]) =>
          dots.map((dot, index) => (
            <DotMemo
              key={`empty-${code}-${index}`}
              word=""
              x={0}
              y={0}
              z={0}
              language={dot.language}
              loading={loading}
            />
          ))
        )}
        {/* A white dot at the origin to represent the search term */}
        <DotMemo
          word={inputText}
          x={0}
          y={0}
          z={0}
          language={null}
          color="white"
          loading={loading}
        />
      </Canvas>
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      <SwipeIndicator hasData={!!corpus} />
      <LanguageSelector
        selectedLanguages={selectedLanguages}
        onToggleLanguage={handleToggleLanguage}
      />
    </div>
  );
};

export default App;

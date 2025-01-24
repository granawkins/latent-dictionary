import React from "react";
import { useCallback } from "react";
import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import "./FullscreenButton.css";

// Add type definition for screen orientation API
interface ScreenOrientation {
  lock(orientation: "landscape"): Promise<void>;
}

interface Screen extends EventTarget {
  orientation?: ScreenOrientation;
}

declare global {
  interface Window {
    screen: Screen;
  }
}

import Dot from "./Dot";
import Camera from "./Camera";
import ErrorModal from "./ErrorModal";
import Navigation from "./navigation/Navigation";
import SwipeIndicator from "./SwipeIndicator";
import LanguageSelector from "./navigation/LanguageSelector";
import { fetchWithAuth, Languages } from "./utils";

interface CorpusItem {
  word: string;
  x: number;
  y: number;
  z: number;
  language: string | null;
}

const DotMemo = React.memo(Dot);

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [corpus, setCorpus] = useState<Record<string, CorpusItem>>({});
  const [showSwipeIndicator, setShowSwipeIndicator] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const hasLoadedData = useRef<boolean>(false);
  const appRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      appRef.current
        ?.requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          // Force screen orientation to landscape if supported
          if (window.screen.orientation) {
            window.screen.orientation.lock("landscape").catch(() => {
              // Silently fail if orientation lock is not supported
            });
          }
        })
        .catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`,
          );
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  const [inputText, setInputText] = useState<string>(
    "when u don't wanna get out of bed",
  );
  const [activeText, setActiveText] = useState<string>("");
  const wordsPerL = 20;

  const timer = useRef<NodeJS.Timeout | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);

  const handleToggleLanguage = (code: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(code)) {
        // Don't allow deselecting if it's the last language
        if (prev.length === 1) return prev;
        return prev.filter((lang) => lang !== code);
      }
      return [...prev, code];
    });
  };

  const select = (word: string) => {
    setSelected((oldSelected) => {
      if (oldSelected.includes(word))
        return oldSelected.filter((w) => w !== word);
      return [...oldSelected, word];
    });
  };

  const fetchSearch = useCallback(
    async (inputText: string, languages: string[], wordsPerL: number) => {
      setLoading(true);
      try {
        const response: Record<string, CorpusItem> = await fetchWithAuth(
          "/api/search",
          "POST",
          {
            word: inputText,
            languages: languages,
            words_per_l: wordsPerL,
          },
        );
        if (response) {
          setActiveText(inputText);
          setCorpus(response);
          if (!hasLoadedData.current) {
            hasLoadedData.current = true;
            setShowSwipeIndicator(true);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const languages = Languages.filter((l) =>
      selectedLanguages.includes(l.code),
    ).map((l) => l.name);
    fetchSearch(inputText, languages, wordsPerL);
  }, [selectedLanguages]);

  const handleSearch = useCallback(() => {
    if (!inputText || inputText === activeText) return;
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      const languages = Languages.filter((l) =>
        selectedLanguages.includes(l.code),
      ).map((l) => l.name);
      fetchSearch(inputText, languages, wordsPerL);
    }, 1000);
  }, [inputText, activeText, fetchSearch, wordsPerL, selectedLanguages]);

  useEffect(() => {
    handleSearch();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [handleSearch]);

  return (
    <div ref={appRef} className="app-container">
      <Navigation inputText={inputText} setInputText={setInputText} />
      <button
        className="fullscreen-button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="currentColor"
              d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="currentColor"
              d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
            />
          </svg>
        )}
      </button>
      <Canvas>
        <Camera selectedCorpus={corpus} />
        {corpus &&
          Object.entries(corpus)
            .filter(([, data]) => {
              // Only show dots for selected languages
              if (!data.language) return true; // Always show words without language
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
                selected={selected.includes(data.word)}
                select={() => select(data.word)}
                searchPending={loading}
              />
            ))}
        {/* A white dot at the origin to represent the search term */}
        <DotMemo
          word={inputText}
          x={0}
          y={0}
          z={0}
          language={null}
          selected={selected.includes(inputText)}
          select={() => select(inputText)}
          color="white"
          searchPending={loading}
        />
      </Canvas>
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      <SwipeIndicator show={showSwipeIndicator} />
      <LanguageSelector
        selectedLanguages={selectedLanguages}
        onToggleLanguage={handleToggleLanguage}
      />
    </div>
  );
};

export default App;

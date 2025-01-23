import React from "react";
import { useCallback } from "react";
import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";

import Dot from "./Dot";
import Camera from "./Camera";
import FAQButton from "./navigation/FAQ";
import ErrorModal from "./ErrorModal";
import Navigation from "./navigation/Navigation";
import SwipeIndicator from "./SwipeIndicator";
import LanguageSelector from "./navigation/LanguageSelector";
import { fetchWithAuth } from "./utils";

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
  const hasLoadedData = useRef<boolean>(false);
  const [inputText, setInputText] = useState<string>(
    "when u don't wanna get out of bed",
  );
  const [activeText, setActiveText] = useState<string>("");
  const wordsPerL = 20;

  const timer = useRef<NodeJS.Timeout | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);

  const handleToggleLanguage = (code: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(code)) {
        // Don't allow deselecting if it's the last language
        if (prev.length === 1) return prev;
        return prev.filter(lang => lang !== code);
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
    async (
      inputText: string,
      l1: string,
      l2: string | null,
      wordsPerL: number,
    ) => {
      setLoading(true);
      try {
        const response: Record<string, CorpusItem> = await fetchWithAuth(
          "/api/search",
          "POST",
          {
            word: inputText,
            l1: l1,
            l2: l2,
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

  const handleSearch = useCallback(() => {
    if (!inputText || inputText === activeText) return;
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      fetchSearch(inputText, "english", null, wordsPerL);
    }, 1000);
  }, [inputText, activeText, fetchSearch, wordsPerL]);

  useEffect(() => {
    handleSearch();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [handleSearch]);

  return (
    <>
      <Navigation
        inputText={inputText}
        setInputText={setInputText}
        handleSearch={handleSearch}
      />
      <Canvas>
        {/* @ts-expect-error @react-three/fiber ambient light type */}
        <ambientLight />
        {/* @ts-expect-error @react-three/fiber point light type */}
        <pointLight position={[10, 10, 10]} />
        <Camera selectedCorpus={corpus} />
        {corpus &&
          Object.entries(corpus).map(([, data]) => (
            <DotMemo
              key={data.word}
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
        {/* A red dot at the origin to represent the search term */}
        <DotMemo
          word={inputText}
          x={0}
          y={0}
          z={0}
          language={null}
          selected={selected.includes(inputText)}
          select={() => select(inputText)}
          color="red"
          searchPending={loading}
        />
      </Canvas>
      <FAQButton />
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      <SwipeIndicator show={showSwipeIndicator} />
      <LanguageSelector
        selectedLanguages={selectedLanguages}
        onToggleLanguage={handleToggleLanguage}
      />
    </>
  );
};

export default App;

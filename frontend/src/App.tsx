import React from "react";
import { useCallback } from "react";
import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";

import Dot from "./Dot";
import Camera from "./Camera";
import FAQButton from "./navigation/FAQ";
import LoadingHandler from "./LoadingHandler";
import ErrorModal from "./ErrorModal";
import Navigation from "./navigation/Navigation";
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
  const [inputText, setInputText] = useState<string>(
    "when u don't wanna get out of bed",
  );
  const [activeText, setActiveText] = useState<string>("");
  const wordsPerL = 20;

  const timer = useRef<NodeJS.Timeout | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

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
            l1: "english",
            l2: null,
            words_per_l: wordsPerL,
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
    [inputText, wordsPerL],
  );

  const handleSearch = useCallback(() => {
    if (!inputText || inputText === activeText) return;
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(
      () => fetchSearch(inputText, "english", null, wordsPerL),
      1000,
    );
  }, [inputText, activeText]);

  useEffect(() => {
    fetchSearch(inputText, "english", null, wordsPerL);
  }, [handleSearch]);

  return (
    <>
      <Navigation
        inputText={inputText}
        setInputText={setInputText}
        handleSearch={handleSearch}
        loading={loading}
      />
      <LoadingHandler loading={loading} />
      <Canvas>
        <ambientLight />
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
    </>
  );
};

export default App;

import React from 'react'
import { useCallback } from 'react';
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber'

import Dot from './Dot';
import Camera from './Camera';
import FAQButton from './navigation/FAQ';
import LoadingHandler from './LoadingHandler';
import ErrorModal from './ErrorModal';
import Navigation from './navigation/Navigation';


const STARTING_WORDS = ['man', 'woman', 'king', 'queen']


const DotMemo = React.memo(Dot);


const App = () => {
    
    const [isLoading, setIsLoading] = useState(false)
    const [pcaId, setPcaId] = useState("default");
    const [corpus, setCorpus] = useState({});
    const [searchTerm, setSearchTerm] = useState([])
    const [searchHistory, setSearchHistory] = useState([])
    const [error, setError] = useState(null);
    
    const fetchApi = async (route="/api", method="GET", args={}) => {
        const token = localStorage.getItem('userToken')
        try {
            const headers = { 'Content-Type': 'application/json'}
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }    
            const response = await fetch(route, {
                method,
                headers,
                ...(method === "GET" ? {} : {body: JSON.stringify(args)}),
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            } else if (data.token) {
                localStorage.setItem('userToken', data.token);
            }
            return data;
        } catch (error) {
            if (method === "GET" && token) {
                localStorage.removeItem('userToken')
                return fetchApi(route, method, args)
            } else {
                setError(error.message);
                setTimeout(() => setError(null), 5000);
            }
        }
    }
    
    // On page load -> set default corpus, oxford 3000
    const fetchIndex = async (initialize=false) => {
        setIsLoading(true)
        try {
            const data = await fetchApi("/api/index");
            const newCorpus = { ...corpus }
            Object.entries(data.vectors).forEach(([word, coordinates]) => {
                newCorpus[word] = { coordinates, selected: initialize && STARTING_WORDS.includes(word) }
            })
            setPcaId(data.pca_id)
            setCorpus(newCorpus)
        }  catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false)
        }
    };
    useEffect(() => {
        if (Object.keys(corpus).length === 0 && !isLoading) {
            fetchIndex(true).then(() => {
                setSearchTerm(STARTING_WORDS)
            })
        }
    }, []);


    // Press enter on search box -> add any new words to corpus, reset selected
    const search = async (words) => {
        setIsLoading(true)
        try {
            const newWords = words.filter(word => !Object.keys(corpus).includes(word))
            const newCorpus = { ...corpus }
            let modified = false
            if (newWords.length > 0) {
                const data = await fetchApi("/api/search", "POST", {words: newWords, pca_id: pcaId});
                Object.entries(data.vectors).forEach(([word, coordinates]) => {
                    newCorpus[word] = { coordinates, selected: false }
                })
                setPcaId(data.pca_id);
                modified = true
            }
            for (let word in newCorpus) {
                if (words.includes(word) && !newCorpus[word].selected) {
                    newCorpus[word].selected = true
                    modified = true
                } else if (!words.includes(word) && newCorpus[word].selected) {
                    newCorpus[word].selected = false
                    modified = true
                }
            }
            if (modified) {
                setCorpus(newCorpus);
                setSearchHistory(oldSearchHistory => [...oldSearchHistory, ...words]);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        if (!searchTerm || searchTerm.length === 0) {
            if (corpus) {
                const newCorpus = { ...corpus }
                for (let word in newCorpus) {
                    newCorpus[word].selected = false
                }
                setCorpus(newCorpus)
            }
        } else if (!(searchTerm === STARTING_WORDS && searchHistory.length === 0)) {
            // don't search for starting words
            search(searchTerm)
        }
    }, [searchTerm])


    // Click on setPCA -> update all coordinates, old and new, based on searchTerm
    const toggleMagicWand = async () => {
        setIsLoading(true)
        try {
            const args = {words: searchTerm, search_history: searchHistory, reset: pcaId !== "default"}
            const data = await fetchApi("/api/set_pca", "POST", args);
            const expectedKeys = new Set([ ...Object.keys(corpus), ...searchHistory, ...searchTerm ]);
            const newCorpus = {}
            expectedKeys.forEach(word => {
                if (!Object.keys(data.vectors).includes(word)) {
                    throw new Error("PCA returned wrong number of results");
                }
                const isSelected = corpus[word]?.selected || false;
                newCorpus[word] = { coordinates: data.vectors[word], selected: isSelected }
            })
            setPcaId(data.pca_id);
            setCorpus(newCorpus);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false)
        }
    }


    // Click on a dot -> it's selected
    const select = useCallback((word) => {
        const newCorpus = { ...corpus }
        const newSelected = !newCorpus[word].selected
        newCorpus[word].selected = newSelected
        setCorpus(newCorpus)
        if (newSelected && !searchTerm.includes(word)) {
            setSearchTerm(oldSearchTerm => [...oldSearchTerm, word])
        } else if (!newSelected && searchTerm.includes(word)) {
            setSearchTerm(oldSearchTerm => oldSearchTerm.filter(w => w !== word))
        }
    }, [corpus]);
    const selectedCorpus = Object.fromEntries(
        Object.entries(corpus).filter(([word, data]) => data.selected).map(([word, data]) => [word, data.coordinates])
    )


    return (
        <>
            <Navigation 
                searchTerms={searchTerm} 
                setSearchTerms={setSearchTerm} 
                isLoading={isLoading} 
                toggleMagicWand={toggleMagicWand} 
                pcaId={pcaId}
            />
            <LoadingHandler isLoading={isLoading} />
            <Canvas>
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <Camera selectedCorpus={selectedCorpus} />
                {corpus &&
                    Object.entries(corpus).map(([word, data], i) => (
                        <DotMemo key={word} word={word} coordinates={data.coordinates} selected={data.selected} select={select} />
                    ))}
            </Canvas>
            <FAQButton />
            {error && <ErrorModal message={error} onClose={() => setError(null)} />}
        </>
    );
};

export default App

import * as use from '@tensorflow-models/universal-sentence-encoder';
import React, { useState } from 'react';
import { HashMap, LinkedList } from "./datastructures";
import History from './history';
import { calculateSynonymSimilarity, findTopMatchedWords } from './modules';
import Navbar from './navBar';
import './tensorflowSimilarity.css';

const TensorFlowSimilarity = () => {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [similarityMap, setSimilarityMap] = useState(new HashMap());
  const [isLoading, setIsLoading] = useState(false);
  const [matchedWordsList, setMatchedWordsList] = useState(new LinkedList());
  const [analysisHistory, setAnalysisHistory] = useState([]); // Stack to keep history
  const [showHistory, setShowHistory] = useState(false); // Added state for history view toggle

  // Function to calculate cosine similarity
  const cosineSimilarity = (vec1, vec2) => {
    const dotProduct = vec1.reduce((sum, val, idx) => sum + val * vec2[idx], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
  };

  // Function to load USE model and calculate similarity
  const calculateSimilarity = async () => {
    setIsLoading(true);

    try {
      // Load model and calculate cosine similarity
      const model = await use.load();
      const embeddings = await model.embed([text1, text2]);
      const embeddingsArray = await embeddings.array();
      const similarityScore = cosineSimilarity(embeddingsArray[0], embeddingsArray[1]);

      // Update similarity map
      const similarityMap = new HashMap();
      similarityMap.set('Cosine Similarity', (similarityScore * 100).toFixed(2));

      // Calculate synonym similarity
      const synonymFile = '/ppdb-2.0-xl-lexical'; // Path to the synonym file
      const synonymSimScore = await calculateSynonymSimilarity(text1, text2, synonymFile);
      similarityMap.set('Synonym Similarity', (synonymSimScore * 100).toFixed(2));

      // Update top matched words
      const topMatchedWords = await findTopMatchedWords(text1, text2, synonymFile);
      const linkedList = new LinkedList();
      topMatchedWords.forEach(word => linkedList.append(word));

      const analysisResult = {
        text1,
        text2,
        similarityMap: Array.from(similarityMap.entries()),
        matchedWords: linkedList.toArray(),
        timestamp: new Date().toISOString()
      };

      setAnalysisHistory((prevHistory) => [analysisResult, ...prevHistory]);
      setSimilarityMap(similarityMap);
      setMatchedWordsList(linkedList);
    } catch (error) {
      console.error('Error calculating similarity:', error);
      setSimilarityMap(new HashMap());
      setMatchedWordsList(new LinkedList());
    }

    setIsLoading(false);
  };

  return (
    <div className="tensorflow-similarity-container">
      <Navbar showHistory={showHistory} setShowHistory={setShowHistory} />
      
      {!showHistory ? (
        <div className="tensorflow-similarity-card">
          <div className="top-section">
            <h2>Text Similarity Analysis</h2>
            <div className="input-group">
              <textarea
                className="text-input"
                placeholder="Enter first text"
                value={text1}
                onChange={(e) => setText1(e.target.value)}
              />
              <textarea
                className="text-input"
                placeholder="Enter second text"
                value={text2}
                onChange={(e) => setText2(e.target.value)}
              />
            </div>
            <button
              className="check-button"
              onClick={calculateSimilarity}
              disabled={isLoading || !text1 || !text2}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Similarity'}
            </button>
          </div>

          {Array.from(similarityMap.entries()).map(([key, value]) => (
            <div key={key} className="similarity-score">
              <div className="similarity-score-header">
                <span>{key}</span>
                <span>{value}%</span>
              </div>
              <div className="similarity-score-bar">
                <div 
                  className="similarity-score-fill" 
                  style={{ width: `${value}%` }} 
                />
              </div>
            </div>
          ))}

          {matchedWordsList.head && (
            <div className="result">
              <h3>Top Matched Words</h3>
              <ul>
                {matchedWordsList.toArray().map(({ word, percentage }, index) => (
                  <li key={index}>
                    <div className="word-container">
                      <span className="word-index">{index + 1}</span>
                      <span className="word-text">{word}</span>
                    </div>
                    <div className="percentage-container">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="percentage-text">{percentage}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <History analysisHistory={analysisHistory} />
      )}
    </div>
  );
};

export default TensorFlowSimilarity;
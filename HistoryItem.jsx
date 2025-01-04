import React, { useState } from 'react';
import "./nav.css";

const HistoryItem = ({ analysis, index }) => {
  const [expanded, setExpanded] = useState(false);
  
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <div className="history-item">
      <div className="history-item-header">
        <h4>Analysis {index}</h4>
        <span className="history-timestamp">
          {new Date(analysis.timestamp).toLocaleDateString()}
        </span>
      </div>
      
      <div className="history-texts">
        <div className="history-text-box">
          <strong>Text 1:</strong>
          <p>{expanded ? analysis.text1 : truncateText(analysis.text1)}</p>
        </div>
        <div className="history-text-box">
          <strong>Text 2:</strong>
          <p>{expanded ? analysis.text2 : truncateText(analysis.text2)}</p>
        </div>
      </div>

      <div className="history-scores">
        {analysis.similarityMap.map(([key, value]) => (
          <div key={key} className="history-score-item">
            <span>{key}</span>
            <div className="history-score-bar">
              <div 
                className="history-score-fill" 
                style={{ width: `${value}%` }}
              />
            </div>
            <span>{value}%</span>
          </div>
        ))}
      </div>

      {!expanded ? (
        <button 
          className="see-more-button"
          onClick={() => setExpanded(true)}
        >
          See More
        </button>
      ) : (
        <>
          <div className="history-matched-words">
            <h5>Matched Words:</h5>
            <div className="history-words-grid">
              {analysis.matchedWords.map(({ word, percentage }, index) => (
                <div key={index} className="history-word-item">
                  <span>{word}</span>
                  <div className="history-word-percentage">
                    <div 
                      className="history-word-bar"
                      style={{ width: `${percentage}%` }}
                    />
                    <span>{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button 
            className="see-less-button"
            onClick={() => setExpanded(false)}
          >
            See Less
          </button>
        </>
      )}
    </div>
  );
};

export default HistoryItem;
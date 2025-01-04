import React from 'react';
import HistoryItem from './HistoryItem';
import "./nav.css";

const History = ({ analysisHistory }) => {
  return (
    <div className="history-container">
      <h3>Analysis History</h3>
      <div className="history-list">
        {analysisHistory.map((analysis, idx) => (
          <HistoryItem 
            key={idx} 
            analysis={analysis} 
            index={analysisHistory.length - idx} // Changed to reverse the numbering
          />
        ))}
      </div>
    </div>
  );
};

export default History;
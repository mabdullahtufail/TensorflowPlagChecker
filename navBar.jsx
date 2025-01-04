import React from 'react';
import "./nav.css";

const Navbar = ({ showHistory, setShowHistory }) => {
  return (
    <nav>
      <div className="nav-title">Plagiarism Checker</div>
      <div className="nav-buttons">
        <button 
          className={!showHistory ? 'active' : ''} 
          onClick={() => setShowHistory(false)}
        >
          Current Analysis
        </button>
        <button 
          className={showHistory ? 'active' : ''} 
          onClick={() => setShowHistory(true)}
        >
          History
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
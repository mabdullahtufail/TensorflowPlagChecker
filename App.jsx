import * as tf from '@tensorflow/tfjs';
import React from 'react';
import TensorFlowSimilarity from './tensorflow'; // Import the component

// Set the WebGL backend explicitly for performance (optional)
tf.setBackend('webgl')
  .then(() => console.log('WebGL backend initialized'))
  .catch((err) => console.error('Error initializing WebGL backend:', err));

function App() {
  return (
    <div className="App">
      <TensorFlowSimilarity /> {/* Render the TensorFlowSimilarity component */}
    </div>
    
  );
}
export default App;

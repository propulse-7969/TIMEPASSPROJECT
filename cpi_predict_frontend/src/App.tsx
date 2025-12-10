import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InputPage from './pages/Input';
import OutputPage from './pages/Output';

export interface PredictionResult {
  ans: number | string; // Predicted CPI value returned by backend
  plot: string;         // Base64-encoded plot image string
}

const App: React.FC = () => {
  const [predictionData, setPredictionData] = React.useState<PredictionResult | null>(null);

  // Function to pass the result from InputPage to OutputPage
  const handlePrediction = (data: PredictionResult) => {
    setPredictionData(data);
  };

  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center' }}>CPI Prediction Tool</h1>
        <Routes>
          {/* Route for the data input page */}
          <Route 
            path="/" 
            element={<InputPage onPrediction={handlePrediction} />} 
          />
          
          {/* Route for the results page */}
          <Route 
            path="/output" 
            element={<OutputPage data={predictionData} />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
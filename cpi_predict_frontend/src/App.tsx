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
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center'
        }}
      >
        <h1 style={{ marginBottom: '20px' }}>CPI Prediction Tool</h1>
        <p style={{ fontStyle: 'italic', marginTop: '-8px', marginBottom: '20px' }}>
          “Visualize your Downfall...”
        </p>
        <p style={{ color: 'red', marginTop: '-10px', marginBottom: '20px' }}>
          Pleace do not enter SPI, enter CPI
        </p>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
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
      </div>
    </Router>
  );
};

export default App;
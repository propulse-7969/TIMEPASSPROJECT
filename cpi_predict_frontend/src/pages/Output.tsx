import React from 'react';
import { Link } from 'react-router-dom';
import type{ PredictionResult } from '../App';

interface OutputPageProps {
  data: PredictionResult | null;
}

const OutputPage: React.FC<OutputPageProps> = ({ data }) => {
  // Handle case where data is missing (e.g., user navigated directly)
  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>No prediction data found.</h2>
        <Link to="/">Go back to input page</Link>
      </div>
    );
  }


  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h2>✅ Prediction Results</h2>
      <div style={{ 
        border: '2px solid #28a745', 
        padding: '20px', 
        borderRadius: '8px', 
        backgroundColor: '#e9f7ef',
        marginBottom: '30px'
      }}>
        <p style={{ fontSize: '1.2em', margin: '0 0 5px 0', color: '#007bff' }}>
          Based on the data provided, the predicted CPI for Next Semester is:
        </p>
        <p style={{ fontSize: '3em', fontWeight: 'bold', color: '#007bff', margin: '0' }}>
          {typeof data.ans === 'number' ? data.ans.toFixed(2) : String(data.ans).slice(0, 4)}
        </p>
      </div>

      <h3>Model Visualization</h3>
      {/* Display the plot using the Base64 string */}
      {data.plot ? (
        <img 
          src={`data:image/png;base64,${data.plot}`} 
          alt="CPI Prediction Plot" 
          style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ccc', borderRadius: '5px' }}
        />
      ) : (
        <p>Plot image could not be loaded.</p>
      )}

      <div style={{ marginTop: '30px' }}>
        <Link to="/" style={{ textDecoration: 'none', padding: '10px 20px', border: '1px solid #007bff', borderRadius: '5px', color: '#007bff' }}>
          Calculate Another Prediction
        </Link>
      </div>
    </div>
  );
};

export default OutputPage;
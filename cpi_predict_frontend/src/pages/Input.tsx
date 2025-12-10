import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type{ PredictionResult } from '../App'; // Import the interface from App.tsx

interface InputPageProps {
  onPrediction: (data: PredictionResult) => void;
}

const InputPage: React.FC<InputPageProps> = ({ onPrediction }) => {
  const navigate = useNavigate();
  
  // State for the total number of semesters the user wants to enter
  const [numSemesters, setNumSemesters] = useState<number>(0);
  
  // State to hold the CPI values for each semester
  const [cpiValues, setCpiValues] = useState<number[]>([]);
  
  // State for loading/error feedback
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Handle change for the main number of semesters input
  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    if (num > 0) {
      setNumSemesters(num);
      // Initialize CPI values array with enough empty/zero entries
      setCpiValues(new Array(num).fill(0)); 
    } else {
      setNumSemesters(0);
      setCpiValues([]);
    }
  };

  // Handle change for individual CPI input fields
  const handleCpiChange = useCallback((index: number, value: string) => {
    // Parse the value, ensuring it's a valid CPI (0-10)
    const cpi = parseFloat(value);
    if (cpi >= 0 && cpi <= 10) {
      setCpiValues(prev => {
        const newValues = [...prev];
        newValues[index] = cpi;
        return newValues;
      });
    }
  }, []);

  // API Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // --- 1. Validation ---
    const semesters = cpiValues.map((_, index) => index + 1);
    const validCpiValues = cpiValues.filter(cpi => cpi > 0);
    
    if (validCpiValues.length < 2) {
      setError('Please enter at least two valid CPI values (must be > 0) for prediction.');
      setIsLoading(false);
      return;
    }

    // --- 2. Construct Payload ---
    const payload = {
      semesters: semesters.slice(0, validCpiValues.length),
      cpi: validCpiValues
    };

    try {
      // --- 3. API Call to API ---
      // Use VITE_API_BASE if set (production), otherwise default to local FastAPI dev server
      const apiBase = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000';
      const response = await fetch(`${apiBase}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result: PredictionResult | { error: string } = await response.json();

      if (!response.ok) {
        throw new Error((result as { error: string }).error || 'Prediction failed.');
      }

      // --- 4. Success: Pass Data and Navigate ---
      onPrediction(result as PredictionResult);
      navigate('/output');

    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="num-semesters">
            Enter your Semester: 
          </label>
          <input
            id="num-semesters"
            type="number"
            min="2"
            value={numSemesters > 0 ? numSemesters : ''}
            onChange={handleNumChange}
            disabled={isLoading}
            style={{ padding: '8px', marginLeft: '10px', width: '100px' }}
          />
        </div>
        
        {/* Dynamic CPI Input Fields */}
        {numSemesters > 0 && (
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
            <p>Enter CPI for each semester (0.0 to 10.0):</p>
            {Array.from({ length: numSemesters }).map((_, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <label style={{ display: 'inline-block', width: '120px' }}>
                  Semester {index + 1}:
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="e.g., 9.25"
                  required
                  onChange={(e) => handleCpiChange(index, e.target.value)}
                  style={{ padding: '8px' }}
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={numSemesters < 2 || isLoading}
          style={{ 
            marginTop: '20px', 
            padding: '10px 20px', 
            backgroundColor: isLoading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Calculating...' : 'Predict Next CPI'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default InputPage;
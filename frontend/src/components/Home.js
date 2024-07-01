import React, { useState, useEffect } from 'react';
import Scene from './Scene';

function Home({ models }) {
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [time, setTime] = useState(12);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    console.log('Models:', models);
  }, [models]);

  if (models.length === 0) {
    console.log('No models available');
    return <div className="no-models">No models available</div>;
  }

  const currentModel = models[currentModelIndex];
  console.log('Current model:', currentModel);

  return (
    <div className="home">
      <h1>3D House and Land Visualizer</h1>
      <div className="model-viewer" style={{ border: '1px solid red', height: '500px' }}>
        {currentModel && currentModel.url ? (
          <Scene modelUrl={currentModel.url} time={time} />
        ) : (
          <div>No model URL available</div>
        )}
      </div>
      <div className="controls">
        <div className="time-control">
          <label htmlFor="time-slider">Time of Day: {time.toFixed(2)}</label>
          <input 
            id="time-slider"
            type="range" 
            min="0" 
            max="24" 
            step="0.1"
            value={time} 
            onChange={(e) => setTime(parseFloat(e.target.value))}
          />
        </div>
        <div className="date-control">
          <label htmlFor="date-picker">Date:</label>
          <input 
            id="date-picker"
            type="date" 
            value={date.toISOString().split('T')[0]} 
            onChange={(e) => setDate(new Date(e.target.value))}
          />
        </div>
      </div>
      <div className="model-list">
        {models.map((model, index) => (
          <button 
            key={model._id} 
            onClick={() => setCurrentModelIndex(index)}
            className={index === currentModelIndex ? 'active' : ''}
          >
            {model.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
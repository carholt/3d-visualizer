import React, { useState } from 'react';
import Scene from './Scene';

function UserPage({ models }) {
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [time, setTime] = useState(12);
  const [date, setDate] = useState(new Date());

  if (!models || models.length === 0) {
    return <div className="user-page">No models available</div>;
  }

  return (
    <div className="user-page">
      <h2>Your 3D Models</h2>
      <div className="controls">
        <input 
          type="range" 
          min="0" 
          max="24" 
          value={time} 
          onChange={(e) => setTime(parseFloat(e.target.value))}
        />
        <input 
          type="date" 
          value={date.toISOString().split('T')[0]} 
          onChange={(e) => setDate(new Date(e.target.value))}
        />
      </div>
      <div className="scene-container">
        <Scene modelUrl={models[currentModelIndex].url} time={time} date={date} />
      </div>
      {models.length > 1 && (
        <div className="model-list">
          {models.map((model, index) => (
            <button key={model.id} onClick={() => setCurrentModelIndex(index)}>
              {model.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserPage;
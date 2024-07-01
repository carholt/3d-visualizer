import React from 'react';

function ModelControls({ time, setTime, date, setDate }) {
  return (
    <div className="model-controls">
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
  );
}

export default ModelControls;
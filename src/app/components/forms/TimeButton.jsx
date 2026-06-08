// src/app/components/forms/TimeButton.jsx
'use client';

import { useState } from 'react';

export function TimeButton({ currentTime, onSetTime, placeholder = 'HH:MM' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTime, setTempTime] = useState(currentTime || '');

  const handleSetCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    onSetTime(timeString);
    setTempTime(timeString);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (tempTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(tempTime)) {
      onSetTime(tempTime);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={tempTime}
          onChange={(e) => setTempTime(e.target.value)}
          className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-manzur-primary"
          step="60"
        />
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setTempTime(currentTime || '');
          }}
          className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
        >
          ✗
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-md">
        {currentTime || '--:--'}
      </span>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="px-3 py-1 bg-manzur-primary text-white rounded-md text-sm hover:bg-manzur-primary-dark transition-colors"
      >
        ✏️ Editar
      </button>
      <button
        type="button"
        onClick={handleSetCurrentTime}
        className="px-3 py-1 bg-manzur-primary-light text-white rounded-md text-sm hover:bg-manzur-primary transition-colors"
      >
        🕐 Ahora
      </button>
    </div>
  );
}

export default TimeButton;
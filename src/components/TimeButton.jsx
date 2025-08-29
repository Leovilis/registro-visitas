const TimeButton = ({ field, onSetTime, currentTime }) => {
  const handleClick = () => {
    if (currentTime) {
      // Si ya hay una hora registrada, la borramos
      onSetTime(field, '');
    } else {
      // Si no hay hora, registramos la hora actual
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const time = `${hours}:${minutes}`;
      onSetTime(field, time);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm text-gray-700">{currentTime || '--:--'}</span>
      <button 
        type="button" 
        onClick={handleClick}
        className={`px-3 py-1 text-white rounded text-xs ${
          currentTime 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        title={currentTime ? 'Borrar hora' : 'Registrar hora'}
      >
        {currentTime ? 'Borrar' : 'Registrar Hora'}
      </button>
    </div>
  );
};

export default TimeButton;
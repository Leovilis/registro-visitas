const TimeButton = ({ field, onSetTime, currentTime }) => {
  const handleClick = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;
    onSetTime(field, time);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{currentTime || '--:--'}</span>
      <button 
        type="button" 
        onClick={handleClick}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
        Registrar Hora
      </button>
    </div>
  );
};

export default TimeButton;
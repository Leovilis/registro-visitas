import { useRef, useEffect, useState } from 'react';

const SignaturePad = ({ onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const ctxRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Configuración mejorada del contexto
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.globalCompositeOperation = 'source-over';
    
    // Fondo blanco para evitar transparencias
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctxRef.current = ctx;
  }, []);

  // Función para obtener coordenadas correctas tanto en mouse como en touch
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if (e.type.includes('touch')) {
      // Evento táctil
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      // Evento de mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    setIsEmpty(false);
    
    const coords = getCoordinates(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    
    const coords = getCoordinates(e);
    ctxRef.current.lineTo(coords.x, coords.y);
    ctxRef.current.stroke();
  };

  const endDrawing = (e) => {
    e.preventDefault();
    isDrawingRef.current = false;
    ctxRef.current.beginPath(); // Reiniciar el path
  };

  const handleSave = () => {
    if (isEmpty) {
      alert('Por favor, dibuje una firma antes de guardar.');
      return;
    }
    
    const canvas = canvasRef.current;
    const signature = canvas.toDataURL('image/png');
    onSave(signature);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Limpiar y restaurar fondo blanco
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setIsEmpty(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Firme en el área de abajo</h3>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            // Eventos de mouse
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            
            // Eventos táctiles - MEJORADOS
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
            onTouchCancel={endDrawing}
            
            className="w-full border-2 border-gray-300 bg-white rounded cursor-crosshair touch-none"
            style={{
              touchAction: 'none', // Previene scroll y zoom en móviles
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          />
          
          {/* Indicador visual para móviles */}
          <div className="mt-2 text-sm text-gray-500 text-center md:hidden">
            Use su dedo para firmar en el área blanca
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2">
          <button 
            type="button" 
            onClick={clearCanvas}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Limpiar
          </button>
          
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Guardar Firma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
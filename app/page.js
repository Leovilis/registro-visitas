"use client";

import { useState, useEffect } from "react";
import SignaturePad from "../src/components/SignaturePad";
import TimeButton from "../src/components/TimeButton";
import PrintButton from "../src/components/PrintButton";
import { empresas, sucursalesPorEmpresa, areas, provincias } from "../src/data";

export default function Home() {
  const [formData, setFormData] = useState({
    empresa: "",
    fechaVisita: new Date().toISOString().split("T")[0],
    area: "",
    sucursal: "",
    provincia: "",
    horarioSaludo: "",
    visitantes: ["", "", "", "", "", ""],
    sucursal1: {
      ingreso: "",
      egreso: "",
      firma: "",
    },
    sucursal2: {
      ingreso: "",
      egreso: "",
      firma: "",
    },
    actividades: [
      {
        inicio: "",
        fin: "",
        areaSector: "",
        descripcion: "",
        finalizada: "",
      },
    ],
    documentacion: {
      firma: "",
      entregados: [{ nombre: "", firmaRecibio: "" }],
      recibidos: [{ nombre: "", firmaRecibio: "" }],
    },
    horarioLlegada: "",
  });

  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [showSignaturePad, setShowSignaturePad] = useState({
    show: false,
    field: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formData.empresa) {
      setSucursalesDisponibles(sucursalesPorEmpresa[formData.empresa] || []);
      setFormData((prev) => ({ ...prev, sucursal: "" }));
    } else {
      setSucursalesDisponibles([]);
    }
  }, [formData.empresa]);

 const validateForm = () => {
  const newErrors = {};

  // Validar campos básicos
  if (!formData.empresa) newErrors.empresa = "Empresa es requerida";
  if (!formData.area) newErrors.area = "Área es requerida";
  if (!formData.sucursal) newErrors.sucursal = "Sucursal es requerida";
  if (!formData.provincia) newErrors.provincia = "Provincia es requerida";
  if (!formData.horarioSaludo) newErrors.horarioSaludo = "Horario de saludo es requerido";
  if (!formData.horarioLlegada) newErrors.horarioLlegada = "Horario de llegada es requerido";

  // Validar al menos un visitante
  const hasVisitante = formData.visitantes.some(visitante => visitante.trim() !== "");
  if (!hasVisitante) newErrors.visitantes = "Al menos un visitante es requerido";

  // Validar al menos una sucursal con datos completos
  const sucursal1Completa = formData.sucursal1.ingreso && formData.sucursal1.egreso && formData.sucursal1.firma;
  const sucursal2Completa = formData.sucursal2.ingreso && formData.sucursal2.egreso && formData.sucursal2.firma;
  
  if (!sucursal1Completa && !sucursal2Completa) {
    newErrors.sucursales = "Al menos una sucursal debe estar completa con horarios y firma";
  } else {
    if (sucursal1Completa) {
      if (!formData.sucursal1.ingreso) newErrors.sucursal1Ingreso = "Ingreso a sucursal 1 es requerido";
      if (!formData.sucursal1.egreso) newErrors.sucursal1Egreso = "Egreso de sucursal 1 es requerido";
      if (!formData.sucursal1.firma) newErrors.sucursal1Firma = "Firma de sucursal 1 es requerida";
    }
    
    if (sucursal2Completa) {
      if (!formData.sucursal2.ingreso) newErrors.sucursal2Ingreso = "Ingreso a sucursal 2 es requerido";
      if (!formData.sucursal2.egreso) newErrors.sucursal2Egreso = "Egreso de sucursal 2 es requerido";
      if (!formData.sucursal2.firma) newErrors.sucursal2Firma = "Firma de sucursal 2 es requerida";
    }
  }

  // Validar actividades
  formData.actividades.forEach((actividad, index) => {
    if (actividad.inicio || actividad.fin || actividad.areaSector || actividad.descripcion || actividad.finalizada) {
      if (!actividad.inicio) newErrors[`actividad${index}Inicio`] = "Hora de inicio es requerida";
      if (!actividad.fin) newErrors[`actividad${index}Fin`] = "Hora de finalización es requerida";
      if (!actividad.areaSector) newErrors[`actividad${index}AreaSector`] = "Área/sector es requerido";
      if (!actividad.descripcion) newErrors[`actividad${index}Descripcion`] = "Descripción es requerida";
      if (!actividad.finalizada) newErrors[`actividad${index}Finalizada`] = "Indicación de finalización es requerida";
    }
  });

  // NOTA: La firma de documentación ya no es requerida, se eliminó esta validación

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleVisitanteChange = (index, value) => {
    const newVisitantes = [...formData.visitantes];
    newVisitantes[index] = value;
    setFormData((prev) => ({ ...prev, visitantes: newVisitantes }));
    
    // Limpiar error de visitantes si se agrega al menos uno
    if (errors.visitantes && newVisitantes.some(v => v.trim() !== "")) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.visitantes;
        return newErrors;
      });
    }
  };

  const handleActividadChange = (index, field, value) => {
    const newActividades = [...formData.actividades];
    newActividades[index][field] = value;
    setFormData((prev) => ({ ...prev, actividades: newActividades }));
    
    // Limpiar error del campo cuando se modifica
    const errorKey = `actividad${index}${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addActividad = () => {
    setFormData((prev) => ({
      ...prev,
      actividades: [
        ...prev.actividades,
        {
          inicio: "",
          fin: "",
          areaSector: "",
          descripcion: "",
          finalizada: "",
        },
      ],
    }));
  };

  const handleDocumentoChange = (tipo, index, field, value) => {
    const newDocs = { ...formData.documentacion };
    newDocs[tipo][index][field] = value;
    setFormData((prev) => ({ ...prev, documentacion: newDocs }));
  };

  const addDocumento = (tipo) => {
    const newDocs = { ...formData.documentacion };
    newDocs[tipo].push({ nombre: "", firmaRecibio: "" });
    setFormData((prev) => ({ ...prev, documentacion: newDocs }));
  };

  const handleSucursalChange = (sucursalNum, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [`sucursal${sucursalNum}`]: {
        ...prev[`sucursal${sucursalNum}`],
        [field]: value,
      },
    }));
    
    // Limpiar error del campo cuando se modifica
    const errorKey = `sucursal${sucursalNum}${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
    
    // Limpiar error general de sucursales si se completa una sucursal
    if (errors.sucursales) {
      const sucursal1Completa = formData.sucursal1.ingreso && formData.sucursal1.egreso && formData.sucursal1.firma;
      const sucursal2Completa = formData.sucursal2.ingreso && formData.sucursal2.egreso && formData.sucursal2.firma;
      
      if (sucursal1Completa || sucursal2Completa) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.sucursales;
          return newErrors;
        });
      }
    }
  };

  const handleSaveSignature = (signature) => {
    if (showSignaturePad.field.includes("sucursal")) {
      const sucursalNum = showSignaturePad.field.split("-")[1];
      handleSucursalChange(sucursalNum, "firma", signature);
    } else if (showSignaturePad.field === "documentacion-firma") {
      setFormData((prev) => ({
        ...prev,
        documentacion: {
          ...prev.documentacion,
          firma: signature,
        },
      }));
      
      // Limpiar error de firma de documentación
      if (errors.documentacionFirma) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.documentacionFirma;
          return newErrors;
        });
      }
    } else if (showSignaturePad.field.includes("entregado")) {
      const index = parseInt(showSignaturePad.field.split("-")[1]);
      const newDocs = { ...formData.documentacion };
      newDocs.entregados[index].firmaRecibio = signature;
      setFormData((prev) => ({ ...prev, documentacion: newDocs }));
    } else if (showSignaturePad.field.includes("recibido")) {
      const index = parseInt(showSignaturePad.field.split("-")[1]);
      const newDocs = { ...formData.documentacion };
      newDocs.recibidos[index].firmaRecibio = signature;
      setFormData((prev) => ({ ...prev, documentacion: newDocs }));
    }
    setShowSignaturePad({ show: false, field: "" });
  };

  const handleSetTime = (field, time) => {
    if (field.includes("sucursal")) {
      const parts = field.split("-");
      const sucursalNum = parts[1];
      const fieldName = parts[2];
      handleSucursalChange(sucursalNum, fieldName, time);
    } else if (field.includes("actividad")) {
      const parts = field.split("-");
      const index = parseInt(parts[1]);
      const fieldName = parts[2];
      handleActividadChange(index, fieldName, time);
    } else {
      setFormData((prev) => ({ ...prev, [field]: time }));
      
      // Limpiar error del campo cuando se modifica
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const handleClearForm = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres limpiar el formulario? Se perderán todos los datos."
      )
    ) {
      setFormData({
        empresa: "",
        fechaVisita: new Date().toISOString().split("T")[0],
        area: "",
        sucursal: "",
        provincia: "",
        horarioSaludo: "",
        visitantes: ["", "", "", "", "", ""],
        sucursal1: {
          ingreso: "",
          egreso: "",
          firma: "",
        },
        sucursal2: {
          ingreso: "",
          egreso: "",
          firma: "",
        },
        actividades: [
          {
            inicio: "",
            fin: "",
            areaSector: "",
            descripcion: "",
            finalizada: "",
          },
        ],
        documentacion: {
          firma: "",
          entregados: [{ nombre: "", firmaRecibio: "" }],
          recibidos: [{ nombre: "", firmaRecibio: "" }],
        },
        horarioLlegada: "",
      });
      setErrors({});
      alert("Formulario limpiado correctamente");
    }
  };

  const handleNewForm = () => {
    window.open(window.location.href, '_blank');
  };

  // Función para manejar la impresión con validación
  const handlePrintWithValidation = () => {
    if (validateForm()) {
      // Lógica para imprimir (debe ser implementada en PrintButton)
      return true;
    } else {
      // Desplazarse al primer error
      const firstErrorKey = Object.keys(errors)[0];
      const firstErrorElement = document.querySelector(`[data-error="${firstErrorKey}"]`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorElement.focus();
      }
      return false;
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl text-center font-bold text-black mb-4">
        REGISTRO DE VISITAS
      </h1>
      <p className="text-sm text-center text-black mb-6">
        Para completar este formulario utilice como referencia el instructivo
        "I-RD-01" disponible en la carpeta Calidad Genéricos/Instructivos
      </p>

      {/* Mostrar errores generales */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Error de validación: </strong>
          <span>Por favor complete todos los campos requeridos</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2" data-error="empresa">
          <label className="block text-sm font-medium text-gray-700">
            EMPRESA A LA QUE VISITA: *
          </label>
          <select
            name="empresa"
            value={formData.empresa}
            onChange={handleChange}
            className={`w-full p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.empresa ? 'border-red-500' : ''}`}
          >
            <option className="text-black" value="">
              Seleccione una empresa
            </option>
            {empresas.map((empresa) => (
              <option key={empresa} value={empresa}>
                {empresa}
              </option>
            ))}
          </select>
          {errors.empresa && <p className="text-red-500 text-xs mt-1">{errors.empresa}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            FECHA DE VISITA:
          </label>
          <input
            type="date"
            name="fechaVisita"
            value={formData.fechaVisita}
            onChange={handleChange}
            disabled
            className="w-full p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm bg-gray-100"
          />
        </div>

        <div className="space-y-2" data-error="area">
          <label className="block text-sm font-medium text-gray-700">
            AREA/S (que realizan la visita): *
          </label>
          <select
            name="area"
            value={formData.area}
            onChange={handleChange}
            className={`w-full p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.area ? 'border-red-500' : ''}`}
          >
            <option value="">Seleccione un área</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
        </div>

        <div className="space-y-2" data-error="sucursal">
          <label className="block text-sm font-medium text-gray-700">
            Sucursal o Localidad: *
          </label>
          <select
            name="sucursal"
            value={formData.sucursal}
            onChange={handleChange}
            disabled={!formData.empresa}
            className={`w-full p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${errors.sucursal ? 'border-red-500' : ''}`}
          >
            <option value="">Seleccione una sucursal</option>
            {sucursalesDisponibles.map((sucursal) => (
              <option key={sucursal} value={sucursal}>
                {sucursal}
              </option>
            ))}
          </select>
          {errors.sucursal && <p className="text-red-500 text-xs mt-1">{errors.sucursal}</p>}
        </div>

        <div className="space-y-2" data-error="provincia">
          <label className="block text-sm font-medium text-gray-700">
            Provincia: *
          </label>
          <select
            name="provincia"
            value={formData.provincia}
            onChange={handleChange}
            className={`w-full p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.provincia ? 'border-red-500' : ''}`}
          >
            <option value="">Seleccione una provincia</option>
            {provincias.map((provincia) => (
              <option key={provincia} value={provincia}>
                {provincia}
              </option>
            ))}
          </select>
          {errors.provincia && <p className="text-red-500 text-xs mt-1">{errors.provincia}</p>}
        </div>

        <div className="space-y-2" data-error="horarioSaludo">
          <label className="block text-sm font-medium text-gray-700">
            HORARIO DE SALIDA DE ADMINISTRACIÓN: *
          </label>
          <input
            type="text"
            name="horarioSaludo"
            value={formData.horarioSaludo}
            onChange={handleChange}
            className={`w-full p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.horarioSaludo ? 'border-red-500' : ''}`}
          />
          {errors.horarioSaludo && <p className="text-red-500 text-xs mt-1">{errors.horarioSaludo}</p>}
        </div>
      </div>

      <div className="mb-6" data-error="visitantes">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          NOMBRE Y APELLIDO: (personas que realizan la visita) *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {formData.visitantes.map((visitante, index) => (
            <input
              key={index}
              type="text"
              value={visitante}
              onChange={(e) => handleVisitanteChange(index, e.target.value)}
              placeholder={`Visitante ${index + 1}`}
              className="p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          ))}
        </div>
        {errors.visitantes && <p className="text-red-500 text-xs mt-1">{errors.visitantes}</p>}
      </div>

      <h2 className="text-xl font-semibold text-black mb-4">
        ACTIVIDADES REALIZADAS
      </h2>

      <div className="overflow-x-auto mb-6">
        {/* Tabla Sucursal 1 */}
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                HORARIO DE INGRESO A LA SUCURSAL 1: *
              </th>
              <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                HORARIO DE EGRESO DE LA SUCURSAL 1: *
              </th>
              <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                FIRMA Y ACLARACIÓN DEL RESPONSABLE DE SUCURSAL 1: *
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td colSpan="2" className="px-4 py-2 border border-gray-200" data-error="sucursal1Ingreso">
                <div className="flex justify-center md:justify-start">
                  <TimeButton
                    field="sucursal-1-ingreso"
                    onSetTime={handleSetTime}
                    currentTime={formData.sucursal1.ingreso}
                  />
                </div>
                {errors.sucursal1Ingreso && <p className="text-red-500 text-xs mt-1 text-center">{errors.sucursal1Ingreso}</p>}
              </td>
              <td colSpan="2" className="px-4 py-2 border border-gray-200" data-error="sucursal1Egreso">
                <div className="flex justify-center md:justify-start">
                  <TimeButton
                    field="sucursal-1-egreso"
                    onSetTime={handleSetTime}
                    currentTime={formData.sucursal1.egreso}
                  />
                </div>
                {errors.sucursal1Egreso && <p className="text-red-500 text-xs mt-1 text-center">{errors.sucursal1Egreso}</p>}
              </td>
              <td colSpan="2" className="px-4 py-2 border border-gray-200" data-error="sucursal1Firma">
                <div className="flex justify-center">
                  {formData.sucursal1.firma ? (
                    <img
                      src={formData.sucursal1.firma}
                      alt="Firma"
                      className="max-w-full h-16 mx-auto"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setShowSignaturePad({ show: true, field: "sucursal-1" })
                      }
                      className="w-full py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Firmar
                    </button>
                  )}
                </div>
                {errors.sucursal1Firma && <p className="text-red-500 text-xs mt-1 text-center">{errors.sucursal1Firma}</p>}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Tabla Sucursal 2 */}
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                HORARIO DE INGRESO A LA SUCURSAL 2: *
              </th>
              <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                HORARIO DE EGRESO DE LA SUCURSAL 2: *
              </th>
              <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                FIRMA Y ACLARACIÓN DEL RESPONSABLE DE SUCURSAL 2: *
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td colSpan="2" className="px-4 py-2 border border-gray-200" data-error="sucursal2Ingreso">
                <div className="flex justify-center md:justify-start">
                  <TimeButton
                    field="sucursal-2-ingreso"
                    onSetTime={handleSetTime}
                    currentTime={formData.sucursal2.ingreso}
                  />
                </div>
                {errors.sucursal2Ingreso && <p className="text-red-500 text-xs mt-1 text-center">{errors.sucursal2Ingreso}</p>}
              </td>
              <td colSpan="2" className="px-4 py-2 border border-gray-200" data-error="sucursal2Egreso">
                <div className="flex justify-center md:justify-start">
                  <TimeButton
                    field="sucursal-2-egreso"
                    onSetTime={handleSetTime}
                    currentTime={formData.sucursal2.egreso}
                  />
                </div>
                {errors.sucursal2Egreso && <p className="text-red-500 text-xs mt-1 text-center">{errors.sucursal2Egreso}</p>}
              </td>
              <td colSpan="2" className="px-4 py-2 border border-gray-200" data-error="sucursal2Firma">
                <div className="flex justify-center">
                  {formData.sucursal2.firma ? (
                    <img
                      src={formData.sucursal2.firma}
                      alt="Firma"
                      className="max-w-full h-16 mx-auto"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setShowSignaturePad({ show: true, field: "sucursal-2" })
                      }
                      className="w-full py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Firmar
                    </button>
                  )}
                </div>
                {errors.sucursal2Firma && <p className="text-red-500 text-xs mt-1 text-center">{errors.sucursal2Firma}</p>}
              </td>
            </tr>
          </tbody>
        </table>
        
        {errors.sucursales && <p className="text-red-500 text-xs mt-1 mb-4 text-center">{errors.sucursales}</p>}

        {/* Actividades - Versión Desktop */}
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                  HS. INICIO
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                  HS. FINALIZACION
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                  AREA/SECTOR DE LA SUCURSAL
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                  DESCRIPCIÓN DE LA ACTIVIDAD
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                  ¿ACTIVIDAD FINALIZADA? (S)/NO)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.actividades.map((actividad, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border border-gray-200" data-error={`actividad${index}Inicio`}>
                    <div className="flex justify-center md:justify-start">
                      <TimeButton
                        field={`actividad-${index}-inicio`}
                        onSetTime={handleSetTime}
                        currentTime={actividad.inicio}
                      />
                    </div>
                    {errors[`actividad${index}Inicio`] && <p className="text-red-500 text-xs mt-1 text-center">{errors[`actividad${index}Inicio`]}</p>}
                  </td>
                  <td className="px-4 py-2 border border-gray-200" data-error={`actividad${index}Fin`}>
                    <div className="flex justify-center md:justify-start">
                      <TimeButton
                        field={`actividad-${index}-fin`}
                        onSetTime={handleSetTime}
                        currentTime={actividad.fin}
                      />
                    </div>
                    {errors[`actividad${index}Fin`] && <p className="text-red-500 text-xs mt-1 text-center">{errors[`actividad${index}Fin`]}</p>}
                  </td>
                  <td className="px-4 py-2 border text-gray-700 border-gray-200" data-error={`actividad${index}AreaSector`}>
                    <input
                      type="text"
                      value={actividad.areaSector}
                      onChange={(e) =>
                        handleActividadChange(index, "areaSector", e.target.value)
                      }
                      className="w-full p-1 border text-gray-700 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors[`actividad${index}AreaSector`] && <p className="text-red-500 text-xs mt-1">{errors[`actividad${index}AreaSector`]}</p>}
                  </td>
                  <td className="px-4 py-2 border text-gray-700 border-gray-200" data-error={`actividad${index}Descripcion`}>
                    <input
                      type="text"
                      value={actividad.descripcion}
                      onChange={(e) =>
                        handleActividadChange(
                          index,
                          "descripcion",
                          e.target.value
                        )
                      }
                      className="w-full p-1 border text-gray-700 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors[`actividad${index}Descripcion`] && <p className="text-red-500 text-xs mt-1">{errors[`actividad${index}Descripcion`]}</p>}
                  </td>
                  <td className="px-4 py-2 border text-gray-700 border-gray-200" data-error={`actividad${index}Finalizada`}>
                    <select
                      value={actividad.finalizada}
                      onChange={(e) =>
                        handleActividadChange(index, "finalizada", e.target.value)
                      }
                      className="w-full p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-</option>
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                    {errors[`actividad${index}Finalizada`] && <p className="text-red-500 text-xs mt-1">{errors[`actividad${index}Finalizada`]}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actividades - Versión Mobile */}
        <div className="md:hidden">
          {formData.actividades.map((actividad, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 mb-4 bg-white"
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2" data-error={`actividad${index}Inicio`}>
                  <div className="text-xs font-medium text-black uppercase">
                    HS. INICIO
                  </div>
                  <div className="flex justify-center">
                    <TimeButton
                      field={`actividad-${index}-inicio`}
                      onSetTime={handleSetTime}
                      currentTime={actividad.inicio}
                    />
                  </div>
                  {errors[`actividad${index}Inicio`] && <p className="text-red-500 text-xs mt-1 text-center">{errors[`actividad${index}Inicio`]}</p>}
                </div>

                <div className="space-y-2" data-error={`actividad${index}Fin`}>
                  <div className="text-xs font-medium text-black uppercase">
                    HS. FINALIZACION
                  </div>
                  <div className="flex justify-center">
                    <TimeButton
                      field={`actividad-${index}-fin`}
                      onSetTime={handleSetTime}
                      currentTime={actividad.fin}
                    />
                  </div>
                  {errors[`actividad${index}Fin`] && <p className="text-red-500 text-xs mt-1 text-center">{errors[`actividad${index}Fin`]}</p>}
                </div>
              </div>

              <div className="mb-4" data-error={`actividad${index}AreaSector`}>
                <div className="text-xs font-medium text-black uppercase mb-1">
                  AREA/SECTOR DE LA SUCURSAL
                </div>
                <input
                  type="text"
                  value={actividad.areaSector}
                  onChange={(e) =>
                    handleActividadChange(index, "areaSector", e.target.value)
                  }
                  className="w-full p-2 border text-gray-700 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
                {errors[`actividad${index}AreaSector`] && <p className="text-red-500 text-xs mt-1">{errors[`actividad${index}AreaSector`]}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2" data-error={`actividad${index}Descripcion`}>
                  <div className="text-xs font-medium text-black uppercase">
                    DESCRIPCIÓN
                  </div>
                  <input
                    type="text"
                    value={actividad.descripcion}
                    onChange={(e) =>
                      handleActividadChange(
                        index,
                        "descripcion",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border text-gray-700 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors[`actividad${index}Descripcion`] && <p className="text-red-500 text-xs mt-1">{errors[`actividad${index}Descripcion`]}</p>}
                </div>

                <div className="space-y-2" data-error={`actividad${index}Finalizada`}>
                  <div className="text-xs font-medium text-black uppercase">
                    FINALIZADA (S/NO)
                  </div>
                  <select
                    value={actividad.finalizada}
                    onChange={(e) =>
                      handleActividadChange(index, "finalizada", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-</option>
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                  {errors[`actividad${index}Finalizada`] && <p className="text-red-500 text-xs mt-1">{errors[`actividad${index}Finalizada`]}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center md:justify-start mt-4">
          <button
            type="button"
            onClick={addActividad}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            + Agregar Actividad
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-black mb-4">DOCUMENTACIÓN</h2>

      <div className="mb-6" data-error="documentacionFirma">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          FIRMA Y ACLARACIÓN DE LA PERSONA RESPONSABLE DE LA DOCUMENTACIÓN
          (Manual Administraciones): *
        </label>
        <div className="border border-gray-300 rounded p-4 flex justify-center items-center h-24">
          {formData.documentacion.firma ? (
            <img
              src={formData.documentacion.firma}
              alt="Firma"
              className="max-w-full h-20"
            />
          ) : (
            <button
              type="button"
              onClick={() =>
                setShowSignaturePad({
                  show: true,
                  field: "documentacion-firma",
                })
              }
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Firmar
            </button>
          )}
        </div>
        {/* {errors.documentacionFirma && <p className="text-red-500 text-xs mt-1">{errors.documentacionFirma}</p>} */}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium flex justify-center md:justify-start text-gray-700 mb-2">
          Documentos ENTREGADOS
        </h3>
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                ESCRIBA EL NOMBRE DEL DOCUMENTO QUE USTED ENTREGA
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                FIRMA Y ACLARACIÓN de quien recibió la documentación
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formData.documentacion.entregados.map((doc, index) => (
              <tr key={`entregado-${index}`}>
                <td className="px-4 py-2 border text-gray-700 border-gray-200">
                  <input
                    type="text"
                    value={doc.nombre}
                    onChange={(e) =>
                      handleDocumentoChange(
                        "entregados",
                        index,
                        "nombre",
                        e.target.value
                      )
                    }
                    className="w-full p-1 border text-gray-700 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-4 py-2 border text-gray-700 border-gray-200">
                  {doc.firmaRecibio ? (
                    <img
                      src={doc.firmaRecibio}
                      alt="Firma"
                      className="max-w-full h-16 mx-auto"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setShowSignaturePad({
                          show: true,
                          field: `entregado-${index}-firma`,
                        })
                      }
                      className="w-full py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Firmar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={() => addDocumento("entregados")}
          className="px-4 py-2 bg-blue-500 text-white rounded  hover:bg-blue-600 text-sm"
        >
          + Agregar Documento Entregado
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Documentos RECIBIDOS
        </h3>
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                ESCRIBA EL NOMBRE DEL DOCUMENTO QUE USTED RECIBE
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200">
                FIRMA Y ACLARACIÓN de quien recibió la documentación
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formData.documentacion.recibidos.map((doc, index) => (
              <tr key={`recibido-${index}`}>
                <td className="px-4 py-2 border text-gray-700 border-gray-200">
                  <input
                    type="text"
                    value={doc.nombre}
                    onChange={(e) =>
                      handleDocumentoChange(
                        "recibidos",
                        index,
                        "nombre",
                        e.target.value
                      )
                    }
                    className="w-full p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {doc.firmaRecibio ? (
                    <img
                      src={doc.firmaRecibio}
                      alt="Firma"
                      className="max-w-full h-16 mx-auto"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setShowSignaturePad({
                          show: true,
                          field: `recibido-${index}-firma`,
                        })
                      }
                      className="w-full py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Firmar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={() => addDocumento("recibidos")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          + Agregar Documento Recibido
        </button>
      </div>

      <div className="mb-6" data-error="horarioLlegada">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          HORARIO DE LLEGADA A LA ADMINISTRACIÓN: *
        </label>
        <TimeButton
          field="horarioLlegada"
          onSetTime={handleSetTime}
          currentTime={formData.horarioLlegada}
        />
        {errors.horarioLlegada && <p className="text-red-500 text-xs mt-1">{errors.horarioLlegada}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <PrintButton
          formData={formData}
          onClearForm={handleClearForm}
          onNewForm={handleNewForm}
          onValidate={validateForm}
          errors={errors}
        />
      </div>

      {showSignaturePad.show && (
        <SignaturePad
          onSave={handleSaveSignature}
          onCancel={() => setShowSignaturePad({ show: false, field: "" })}
        />
      )}
    </div>
  );
}
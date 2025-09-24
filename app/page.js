"use client";

import { useState, useEffect } from "react";
import SignaturePad from "../src/components/SignaturePad";
import TimeButton from "../src/components/TimeButton";
import PrintButton from "../src/components/PrintButton";
import { empresas, sucursalesPorEmpresa, areas, provincias } from "../src/data";
import {
  saveFormToLocalStorage,
  loadFormFromLocalStorage,
  clearLocalStorageBackup,
  hasSignificantData,
  handleDataRecovery,
  getDefaultFormData,
  validateFormData,
  AUTO_SAVE_CONFIG,
  getFormStats,
} from "../src/utils/utils";

export default function Home() {
  const [formData, setFormData] = useState(getDefaultFormData());
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [showSignaturePad, setShowSignaturePad] = useState({
    show: false,
    field: "",
  });
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFormSaved, setIsFormSaved] = useState(false);

  // useEffect para detectar cambios en el formulario
  useEffect(() => {
    const hasData = hasSignificantData(formData);
    setHasUnsavedChanges(hasData && !isFormSaved);
  }, [formData, isFormSaved]);

  // useEffect para prevenir cierre/actualización de la página
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && !isFormSaved) {
        e.preventDefault();
        e.returnValue =
          "¿Estás seguro de que quieres salir? Se perderán todos los datos no guardados.";
        return e.returnValue;
      }
    };

    const handlePopState = (e) => {
      if (hasUnsavedChanges && !isFormSaved) {
        const confirmLeave = window.confirm(
          "¿Estás seguro de que quieres salir? Se perderán todos los datos no guardados."
        );
        if (!confirmLeave) {
          window.history.pushState(null, "", window.location.href);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    if (hasUnsavedChanges && !isFormSaved) {
      window.history.pushState(null, "", window.location.href);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, isFormSaved]);

  // useEffect para guardado automático
  useEffect(() => {
    if (hasUnsavedChanges) {
      const interval = setInterval(() => {
        saveFormToLocalStorage(formData);
      }, AUTO_SAVE_CONFIG.INTERVAL_MS);

      return () => clearInterval(interval);
    }
  }, [formData, hasUnsavedChanges]);

  // useEffect para recuperar datos al cargar la página
  useEffect(() => {
    handleDataRecovery(setFormData);
  }, []);

  useEffect(() => {
    if (formData.empresa) {
      setSucursalesDisponibles(sucursalesPorEmpresa[formData.empresa] || []);
      setFormData((prev) => ({ ...prev, sucursal: "" }));
    } else {
      setSucursalesDisponibles([]);
    }
  }, [formData.empresa]);

  const validateForm = () => {
    const validation = validateFormData(formData);
    setErrors(validation.errors);

    if (!validation.isValid) {
      const firstErrorKey = Object.keys(validation.errors)[0];
      const firstErrorElement = document.querySelector(
        `[data-error="${firstErrorKey}"]`
      );
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        firstErrorElement.focus();
      }
    }

    return validation.isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // const handleVisitanteChange = (index, value) => {
  //   const newVisitantes = [...formData.visitantes];
  //   newVisitantes[index] = value;
  //   setFormData((prev) => ({ ...prev, visitantes: newVisitantes }));

  //   if (errors.visitantes && newVisitantes.some((v) => v.trim() !== "")) {
  //     setErrors((prev) => {
  //       const newErrors = { ...prev };
  //       delete newErrors.visitantes;
  //       return newErrors;
  //     });
  //   }
  // };

  const handleActividadChange = (index, field, value) => {
    const newActividades = [...formData.actividades];
    newActividades[index][field] = value;
    setFormData((prev) => ({ ...prev, actividades: newActividades }));

    const errorKey = `actividad${index}${
      field.charAt(0).toUpperCase() + field.slice(1)
    }`;
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

    const errorKey = `sucursal${sucursalNum}${
      field.charAt(0).toUpperCase() + field.slice(1)
    }`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }

    if (errors.sucursales) {
      const sucursal1Completa =
        formData.sucursal1.ingreso &&
        formData.sucursal1.egreso &&
        formData.sucursal1.firma;
      const sucursal2Completa =
        formData.sucursal2.ingreso &&
        formData.sucursal2.egreso &&
        formData.sucursal2.firma;

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
      setFormData(getDefaultFormData());
      setErrors({});
      setIsFormSaved(false);
      setHasUnsavedChanges(false);
      clearLocalStorageBackup();
      alert("Formulario limpiado correctamente");
    }
  };

  const handleNewForm = () => {
    window.open(window.location.href, "_blank");
  };

  const handleFormSaved = () => {
    setIsFormSaved(true);
    setHasUnsavedChanges(false);
    clearLocalStorageBackup();
  };

  // Debug: Mostrar estadísticas del formulario en consola (opcional)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const stats = getFormStats(formData);
      console.log("Form Stats:", stats);
    }
  }, [formData]);

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Indicador de cambios no guardados */}
      {hasUnsavedChanges && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-400 text-yellow-800 px-4 py-2 text-sm text-center z-50">
          ⚠️ Tienes cambios sin guardar. Guarda el PDF antes de cerrar la
          página.
        </div>
      )}

      <div className={hasUnsavedChanges ? "mt-10" : ""}>
        <h1 className="text-2xl text-center font-bold text-black mb-4">
          REGISTRO DE VISITAS
        </h1>
        <p className="text-sm text-center text-black mb-6">
          Para completar este formulario utilice como referencia el instructivo
          "I-RD-01" disponible en la carpeta Calidad Genéricos/Instructivos
        </p>

        {/* Errores de validación */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error de validación: </strong>
            <span>Por favor complete todos los campos requeridos</span>
          </div>
        )}

        {/* Campos básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2" data-error="empresa">
            <label className="block text-sm font-medium text-gray-700">
              EMPRESA A LA QUE VISITA: *
            </label>
            <select
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              className={`w-full p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.empresa ? "border-red-500" : ""
              }`}
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
            {errors.empresa && (
              <p className="text-red-500 text-xs mt-1">{errors.empresa}</p>
            )}
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
              className={`w-full p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.area ? "border-red-500" : ""
              }`}
            >
              <option value="">Seleccione un área</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            {errors.area && (
              <p className="text-red-500 text-xs mt-1">{errors.area}</p>
            )}
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
              className={`w-full p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                errors.sucursal ? "border-red-500" : ""
              }`}
            >
              <option value="">Seleccione una sucursal</option>
              {sucursalesDisponibles.map((sucursal) => (
                <option key={sucursal} value={sucursal}>
                  {sucursal}
                </option>
              ))}
            </select>
            {errors.sucursal && (
              <p className="text-red-500 text-xs mt-1">{errors.sucursal}</p>
            )}
          </div>

          <div className="space-y-2" data-error="provincia">
            <label className="block text-sm font-medium text-gray-700">
              Provincia: *
            </label>
            <select
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              className={`w-full p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.provincia ? "border-red-500" : ""
              }`}
            >
              <option value="">Seleccione una provincia</option>
              {provincias.map((provincia) => (
                <option key={provincia} value={provincia}>
                  {provincia}
                </option>
              ))}
            </select>
            {errors.provincia && (
              <p className="text-red-500 text-xs mt-1">{errors.provincia}</p>
            )}
          </div>

          <div className="space-y-2" data-error="horarioSaludo">
            <label className="block text-sm font-medium text-gray-700" >
              HORARIO DE SALIDA DE ADMINISTRACIÓN: *
            </label>
            <input
              type="text"
              name="horarioSaludo"
              placeholder="Formato de hora 00:00"
              value={formData.horarioSaludo}
              onChange={handleChange}
              className={`w-full p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.horarioSaludo ? "border-red-500" : ""
              }`}
            />
            {errors.horarioSaludo && (
              <p className="text-red-500 text-xs mt-1">
                {errors.horarioSaludo}
              </p>
            )}
          </div>
        </div>

        {/* Visitante */}
        <div className="mb-6" data-error="visitante">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NOMBRE Y APELLIDO: (persona que realiza la visita) *
          </label>
          <input
            type="text"
            name="visitante"
            value={formData.visitante}
            onChange={handleChange}
            placeholder="Nombre y apellido del visitante"
            className={`w-full p-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.visitante ? "border-red-500" : ""
            }`}
          />
          {errors.visitante && (
            <p className="text-red-500 text-xs mt-1">{errors.visitante}</p>
          )}
        </div>

        {/* Actividades realizadas */}
        <h2 className="text-xl font-semibold text-black mb-4">
          ACTIVIDADES REALIZADAS
        </h2>

        <div className="overflow-x-auto mb-6">
          {/* Tabla Sucursal 1 */}
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
            <thead className="bg-gray-50">
              <tr>
                <th
                  colSpan="2"
                  className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200"
                >
                  HORARIO DE INGRESO A LA SUCURSAL 1: *
                </th>
                <th
                  colSpan="2"
                  className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200"
                >
                  HORARIO DE EGRESO DE LA SUCURSAL 1: *
                </th>
                <th
                  colSpan="2"
                  className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200"
                >
                  FIRMA Y ACLARACIÓN DEL RESPONSABLE DE SUCURSAL 1: *
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td
                  colSpan="2"
                  className="px-4 py-2 border border-gray-200"
                  data-error="sucursal1Ingreso"
                >
                  <div className="flex justify-center md:justify-start">
                    <TimeButton
                      field="sucursal-1-ingreso"
                      onSetTime={handleSetTime}
                      currentTime={formData.sucursal1.ingreso}
                    />
                  </div>
                  {errors.sucursal1Ingreso && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {errors.sucursal1Ingreso}
                    </p>
                  )}
                </td>
                <td
                  colSpan="2"
                  className="px-4 py-2 border border-gray-200"
                  data-error="sucursal1Egreso"
                >
                  <div className="flex justify-center md:justify-start">
                    <TimeButton
                      field="sucursal-1-egreso"
                      onSetTime={handleSetTime}
                      currentTime={formData.sucursal1.egreso}
                    />
                  </div>
                  {errors.sucursal1Egreso && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {errors.sucursal1Egreso}
                    </p>
                  )}
                </td>
                <td
                  colSpan="2"
                  className="px-4 py-2 border border-gray-200"
                  data-error="sucursal1Firma"
                >
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
                          setShowSignaturePad({
                            show: true,
                            field: "sucursal-1",
                          })
                        }
                        className="w-full py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Firmar
                      </button>
                    )}
                  </div>
                  {errors.sucursal1Firma && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {errors.sucursal1Firma}
                    </p>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tabla Sucursal 2 */}
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
            <thead className="bg-gray-50">
              <tr>
                <th
                  colSpan="2"
                  className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200"
                >
                  HORARIO DE INGRESO A LA SUCURSAL 2: *
                </th>
                <th
                  colSpan="2"
                  className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200"
                >
                  HORARIO DE EGRESO DE LA SUCURSAL 2: *
                </th>
                <th
                  colSpan="2"
                  className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-200"
                >
                  FIRMA Y ACLARACIÓN DEL RESPONSABLE DE SUCURSAL 2: *
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td
                  colSpan="2"
                  className="px-4 py-2 border border-gray-200"
                  data-error="sucursal2Ingreso"
                >
                  <div className="flex justify-center md:justify-start">
                    <TimeButton
                      field="sucursal-2-ingreso"
                      onSetTime={handleSetTime}
                      currentTime={formData.sucursal2.ingreso}
                    />
                  </div>
                  {errors.sucursal2Ingreso && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {errors.sucursal2Ingreso}
                    </p>
                  )}
                </td>
                <td
                  colSpan="2"
                  className="px-4 py-2 border border-gray-200"
                  data-error="sucursal2Egreso"
                >
                  <div className="flex justify-center md:justify-start">
                    <TimeButton
                      field="sucursal-2-egreso"
                      onSetTime={handleSetTime}
                      currentTime={formData.sucursal2.egreso}
                    />
                  </div>
                  {errors.sucursal2Egreso && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {errors.sucursal2Egreso}
                    </p>
                  )}
                </td>
                <td
                  colSpan="2"
                  className="px-4 py-2 border border-gray-200"
                  data-error="sucursal2Firma"
                >
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
                          setShowSignaturePad({
                            show: true,
                            field: "sucursal-2",
                          })
                        }
                        className="w-full py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Firmar
                      </button>
                    )}
                  </div>
                  {errors.sucursal2Firma && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {errors.sucursal2Firma}
                    </p>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {errors.sucursales && (
            <p className="text-red-500 text-xs mt-1 mb-4 text-center">
              {errors.sucursales}
            </p>
          )}

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
                    ¿ACTIVIDAD FINALIZADA? (SI)/NO)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.actividades.map((actividad, index) => (
                  <tr key={index}>
                    <td
                      className="px-4 py-2 border border-gray-200"
                      data-error={`actividad${index}Inicio`}
                    >
                      <div className="flex justify-center md:justify-start">
                        <TimeButton
                          field={`actividad-${index}-inicio`}
                          onSetTime={handleSetTime}
                          currentTime={actividad.inicio}
                        />
                      </div>
                      {errors[`actividad${index}Inicio`] && (
                        <p className="text-red-500 text-xs mt-1 text-center">
                          {errors[`actividad${index}Inicio`]}
                        </p>
                      )}
                    </td>
                    <td
                      className="px-4 py-2 border border-gray-200"
                      data-error={`actividad${index}Fin`}
                    >
                      <div className="flex justify-center md:justify-start">
                        <TimeButton
                          field={`actividad-${index}-fin`}
                          onSetTime={handleSetTime}
                          currentTime={actividad.fin}
                        />
                      </div>
                      {errors[`actividad${index}Fin`] && (
                        <p className="text-red-500 text-xs mt-1 text-center">
                          {errors[`actividad${index}Fin`]}
                        </p>
                      )}
                    </td>
                    <td
                      className="px-4 py-2 border text-gray-700 border-gray-200"
                      data-error={`actividad${index}AreaSector`}
                    >
                      <input
                        type="text"
                        value={actividad.areaSector}
                        onChange={(e) =>
                          handleActividadChange(
                            index,
                            "areaSector",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border text-gray-700 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors[`actividad${index}AreaSector`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`actividad${index}AreaSector`]}
                        </p>
                      )}
                    </td>
                    <td
                      className="px-4 py-2 border text-gray-700 border-gray-200"
                      data-error={`actividad${index}Descripcion`}
                    >
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
                      {errors[`actividad${index}Descripcion`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`actividad${index}Descripcion`]}
                        </p>
                      )}
                    </td>
                    <td
                      className="px-4 py-2 border text-gray-700 border-gray-200"
                      data-error={`actividad${index}Finalizada`}
                    >
                      <select
                        value={actividad.finalizada}
                        onChange={(e) =>
                          handleActividadChange(
                            index,
                            "finalizada",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">-</option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                      </select>
                      {errors[`actividad${index}Finalizada`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`actividad${index}Finalizada`]}
                        </p>
                      )}
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
                  <div
                    className="space-y-2"
                    data-error={`actividad${index}Inicio`}
                  >
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
                    {errors[`actividad${index}Inicio`] && (
                      <p className="text-red-500 text-xs mt-1 text-center">
                        {errors[`actividad${index}Inicio`]}
                      </p>
                    )}
                  </div>

                  <div
                    className="space-y-2"
                    data-error={`actividad${index}Fin`}
                  >
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
                    {errors[`actividad${index}Fin`] && (
                      <p className="text-red-500 text-xs mt-1 text-center">
                        {errors[`actividad${index}Fin`]}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className="mb-4"
                  data-error={`actividad${index}AreaSector`}
                >
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
                  {errors[`actividad${index}AreaSector`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`actividad${index}AreaSector`]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="space-y-2"
                    data-error={`actividad${index}Descripcion`}
                  >
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
                    {errors[`actividad${index}Descripcion`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`actividad${index}Descripcion`]}
                      </p>
                    )}
                  </div>

                  <div
                    className="space-y-2"
                    data-error={`actividad${index}Finalizada`}
                  >
                    <div className="text-xs font-medium text-black uppercase">
                      FINALIZADA (S/NO)
                    </div>
                    <select
                      value={actividad.finalizada}
                      onChange={(e) =>
                        handleActividadChange(
                          index,
                          "finalizada",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-</option>
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                    {errors[`actividad${index}Finalizada`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`actividad${index}Finalizada`]}
                      </p>
                    )}
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

        {/* Documentación */}
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
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

        {/* Horario de llegada */}
        <div className="mb-6" data-error="horarioLlegada">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HORARIO DE LLEGADA A LA ADMINISTRACIÓN: *
          </label>
          <TimeButton
            field="horarioLlegada"
            onSetTime={handleSetTime}
            currentTime={formData.horarioLlegada}
          />
          {errors.horarioLlegada && (
            <p className="text-red-500 text-xs mt-1">{errors.horarioLlegada}</p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <PrintButton
            formData={formData}
            onClearForm={handleClearForm}
            onNewForm={handleNewForm}
            onValidate={validateForm}
            errors={errors}
            onFormSaved={handleFormSaved}
          />
        </div>

        {showSignaturePad.show && (
          <SignaturePad
            onSave={handleSaveSignature}
            onCancel={() => setShowSignaturePad({ show: false, field: "" })}
          />
        )}
      </div>
    </div>
  );
}

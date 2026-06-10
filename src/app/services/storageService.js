// src/app/services/storageService.js
import { storage } from "@/app/lib/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export const storageService = {
  // Subir PDF a Firebase Storage
  async uploadPDF(recorridoId, pdfBlob) {
    try {
      if (!storage) {
        throw new Error("Firebase Storage no inicializado");
      }

      const fileName = `pdfs/${recorridoId}/visita_${recorridoId}_${Date.now()}.pdf`;
      const storageRef = ref(storage, fileName);

      // Subir el archivo
      const snapshot = await uploadBytes(storageRef, pdfBlob);

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        success: true,
        url: downloadURL,
        path: fileName,
      };
    } catch (error) {
      console.error("Error en uploadPDF:", error);
      throw error;
    }
  },

  // Eliminar PDF
  async deletePDF(filePath) {
    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error("Error en deletePDF:", error);
      throw error;
    }
  },

  // Subir firma (imagen)
  async uploadSignature(visitaId, firmaDataUrl) {
    try {
      // Convertir dataURL a Blob
      const response = await fetch(firmaDataUrl);
      const blob = await response.blob();

      const fileName = `firmas/${visitaId}/firma_${Date.now()}.png`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      return { success: true, url: downloadURL };
    } catch (error) {
      console.error("Error en uploadSignature:", error);
      throw error;
    }
  },
};

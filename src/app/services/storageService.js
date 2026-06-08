// src/app/services/storageService.js
import { storage } from "@/app/lib/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export const storageService = {
  // Subir PDF
  async uploadPDF(visitaId, pdfBlob, fileName = null) {
    try {
      const filename = fileName || `visita_${visitaId}_${Date.now()}.pdf`;
      const storageRef = ref(storage, `pdfs/${visitaId}/${filename}`);

      await uploadBytes(storageRef, pdfBlob);
      const downloadURL = await getDownloadURL(storageRef);

      return { url: downloadURL, path: `pdfs/${visitaId}/${filename}` };
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    }
  },

  // Eliminar PDF
  async deletePDF(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting PDF:", error);
      throw error;
    }
  },

  // Obtener URL de PDF
  async getPDFUrl(path) {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error getting PDF URL:", error);
      return null;
    }
  },
};

// También exporta como default por si acaso
export default storageService;

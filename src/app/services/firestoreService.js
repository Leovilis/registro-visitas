import { db } from "@/app/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION = "visitas";

export const saveRecorrido = async (recorridoId, recorridoData) => {
  try {
    const recorridoRef = doc(db, "recorridos", recorridoId);
    await setDoc(
      recorridoRef,
      {
        ...recorridoData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    return { success: true };
  } catch (error) {
    console.error("Error en saveRecorrido:", error);
    throw error;
  }
};

export const firestoreService = {
  saveRecorrido: saveRecorrido,

  // Dentro de firestoreService (agrega esta función)
  async getRecorrido(recorridoId) {
    try {
      const recorridoRef = doc(db, "recorridos", recorridoId);
      const docSnap = await getDoc(recorridoRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error en getRecorrido:", error);
      throw error;
    }
  },

  // Guardar/Crear visita
  async saveVisita(visitaId, data) {
    const visitaRef = doc(db, COLLECTION, visitaId);
    const now = serverTimestamp();

    const existing = await getDoc(visitaRef);

    if (!existing.exists()) {
      await setDoc(visitaRef, {
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await updateDoc(visitaRef, {
        ...data,
        updatedAt: now,
      });
    }

    return visitaId;
  },

  // Obtener visita por ID
  async getVisita(visitaId) {
    const visitaRef = doc(db, COLLECTION, visitaId);
    const docSnap = await getDoc(visitaRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  // Listar visitas (con filtros)
  async listVisitas({
    visitante,
    estado,
    fechaInicio,
    fechaFin,
    limit = 50,
  } = {}) {
    let q = collection(db, COLLECTION);
    const constraints = [];

    if (visitante) {
      constraints.push(where("visitante", "==", visitante));
    }
    if (estado) {
      constraints.push(where("estado", "==", estado));
    }
    if (fechaInicio) {
      constraints.push(where("fechaVisita", ">=", fechaInicio));
    }
    if (fechaFin) {
      constraints.push(where("fechaVisita", "<=", fechaFin));
    }

    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(limit));

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Eliminar visita
  async deleteVisita(visitaId) {
    const visitaRef = doc(db, COLLECTION, visitaId);
    await deleteDoc(visitaRef);
  },

  // Cambiar estado
  async updateEstado(visitaId, estado, pdfUrl = null) {
    const visitaRef = doc(db, COLLECTION, visitaId);
    const updateData = { estado, updatedAt: serverTimestamp() };
    if (pdfUrl) updateData.pdfUrl = pdfUrl;
    await updateDoc(visitaRef, updateData);
  },
};

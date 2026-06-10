// src/app/hooks/useFirebase.js
"use client";
import { db } from "@/app/lib/firebase";
import { storage } from "@/app/lib/firebase";
import { useState, useEffect } from "react";

export function useFirebase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        if (db && storage) {
          setIsInitialized(true);
        } else {
          setError("Firebase no inicializado correctamente");
        }
      } catch (err) {
        setError(err.message);
      }
    };
    checkFirebase();
  }, []);

  return { db, storage, isInitialized, error };
}

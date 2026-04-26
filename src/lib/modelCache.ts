"use client";

const DB_NAME = "ThreeViewerDB";
const STORE_NAME = "modelCache";
const DB_VERSION = 1;

interface CachedModel {
  id: string;
  arrayBuffer: ArrayBuffer;
  fileName: string;
  timestamp: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

export const cacheModelFile = async (file: File): Promise<void> => {
  const arrayBuffer = await file.arrayBuffer();
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const record: CachedModel = {
      id: "currentModel",
      arrayBuffer,
      fileName: file.name,
      timestamp: Date.now(),
    };

    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getCachedModel = async (): Promise<{
  arrayBuffer: ArrayBuffer;
  fileName: string;
} | null> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get("currentModel");

    request.onsuccess = () => {
      const result = request.result as CachedModel | undefined;
      if (result) {
        resolve({
          arrayBuffer: result.arrayBuffer,
          fileName: result.fileName,
        });
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const clearCachedModel = async (): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete("currentModel");

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Helper for persistent IndexedDB PDF storage across page reloads

const DB_NAME = 'BookScanPdfDB';
const STORE_NAME = 'pdf_files';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject('IndexedDB not supported');
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function savePdfData(bookId: string, pdfData: Blob | ArrayBuffer | string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(pdfData, bookId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to save PDF to IndexedDB:', err);
  }
}

export async function getPdfData(bookId: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(bookId);
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }
        if (typeof result === 'string') {
          resolve(result);
        } else if (result instanceof Blob) {
          const blobUrl = URL.createObjectURL(result);
          resolve(blobUrl);
        } else if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get PDF from IndexedDB:', err);
    return null;
  }
}

export async function deletePdfData(bookId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(bookId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to delete PDF from IndexedDB:', err);
  }
}

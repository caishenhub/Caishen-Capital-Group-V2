import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Report, Shareholder, CorporateNotification } from '../types';

/**
 * SERVICIO DE DATOS FIREBASE (REEMPLAZO DE GOOGLE SHEETS)
 */

// --- REPORTES ---

export const getReports = async (): Promise<Report[]> => {
  const path = 'reports';
  try {
    const q = query(collection(db, path), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Report));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const subscribeToReports = (callback: (reports: Report[]) => void) => {
  const path = 'reports';
  const q = query(collection(db, path), orderBy('date', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Report)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

// --- USUARIOS / ACCIONISTAS ---

export const getUserProfile = async (uid: string): Promise<any | null> => {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

// --- NOTIFICACIONES ---

export const getNotifications = async (): Promise<CorporateNotification[]> => {
  const path = 'notifications';
  try {
    const q = query(collection(db, path), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CorporateNotification));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// --- UTILIDADES DE MIGRACIÓN (Para Admins) ---

export const saveUserToFirebase = async (userData: any) => {
  const path = `users/${userData.uid}`;
  try {
    await setDoc(doc(db, 'users', userData.uid), {
      ...userData,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return { success: false };
  }
};

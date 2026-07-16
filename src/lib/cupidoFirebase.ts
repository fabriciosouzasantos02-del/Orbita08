import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where,
  onSnapshot
} from "firebase/firestore";
import { 
  getFirestoreDB, 
  getUserDocKey, 
  handleFirestoreError, 
  OperationType 
} from "./firebase";

// Interfaces
export interface CupidoPerson {
  id: string;
  name: string;
  birthDate: string;
  birthTime?: string;
  birthCity: string;
  birthCountry?: string;
  gender?: string;
  isUnknownTime?: boolean;
  createdAt: string;
  userId?: string;
}

export interface CupidoHistory {
  id: string; // e.g. personId_date (YYYY-MM-DD)
  personId: string;
  date: string;
  radarData: any;
  createdAt: string;
}

export interface CupidoFavorite {
  id: string;
  personId: string;
  tipCategory: string;
  tipText: string;
  createdAt: string;
}

export interface CupidoSettings {
  notifyNewRadar: boolean;
  notifyTransits: boolean;
  notifyFavorablePeriods: boolean;
}

const DEFAULT_SETTINGS: CupidoSettings = {
  notifyNewRadar: true,
  notifyTransits: true,
  notifyFavorablePeriods: true
};

// ----------------------------------------------------
// Cupido Person Operations
// ----------------------------------------------------
export async function saveCupidoPerson(email: string, person: CupidoPerson): Promise<void> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return;

  const docKey = getUserDocKey(email);

  // 1. Sync to LocalStorage
  const savedList = localStorage.getItem("cupido_people_list_v1");
  let currentList: CupidoPerson[] = [];
  try {
    currentList = savedList ? JSON.parse(savedList) : [];
  } catch {}
  currentList = currentList.filter(p => p.id !== person.id);
  currentList.push(person);
  localStorage.setItem("cupido_people_list_v1", JSON.stringify(currentList));

  // 2. Sync to Firestore
  const db = getFirestoreDB();
  if (db) {
    const path = `users/${docKey}/cupidoPeople/${person.id}`;
    try {
      const personRef = doc(db, "users", docKey, "cupidoPeople", person.id);
      await setDoc(personRef, {
        ...person,
        userId: docKey
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }
}

export async function deleteCupidoPerson(email: string, personId: string): Promise<void> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return;

  const docKey = getUserDocKey(email);

  // 1. LocalStorage Sync
  const savedList = localStorage.getItem("cupido_people_list_v1");
  let currentList: CupidoPerson[] = [];
  try {
    currentList = savedList ? JSON.parse(savedList) : [];
  } catch {}
  currentList = currentList.filter(p => p.id !== personId);
  localStorage.setItem("cupido_people_list_v1", JSON.stringify(currentList));

  // Clean favorites and history locally for this person
  const favList = localStorage.getItem("cupido_favorites_list_v1");
  if (favList) {
    try {
      const list = JSON.parse(favList);
      const filtered = list.filter((f: any) => f.personId !== personId);
      localStorage.setItem("cupido_favorites_list_v1", JSON.stringify(filtered));
    } catch {}
  }

  // 2. Firestore Sync
  const db = getFirestoreDB();
  if (db) {
    const path = `users/${docKey}/cupidoPeople/${personId}`;
    try {
      const personRef = doc(db, "users", docKey, "cupidoPeople", personId);
      await deleteDoc(personRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  }
}

export async function loadCupidoPeople(email: string): Promise<CupidoPerson[]> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return [];

  // Always pre-load from LocalStorage for immediate layout render
  const savedList = localStorage.getItem("cupido_people_list_v1");
  let localList: CupidoPerson[] = [];
  try {
    localList = savedList ? JSON.parse(savedList) : [];
  } catch {}

  const db = getFirestoreDB();
  if (db) {
    const docKey = getUserDocKey(email);
    try {
      const collRef = collection(db, "users", docKey, "cupidoPeople");
      const snapshot = await getDocs(collRef);
      const remoteList: CupidoPerson[] = [];
      snapshot.forEach(doc => {
        remoteList.push(doc.data() as CupidoPerson);
      });

      if (remoteList.length > 0) {
        localStorage.setItem("cupido_people_list_v1", JSON.stringify(remoteList));
        return remoteList;
      }
    } catch (e) {
      console.warn("Error loading cupido people from firestore, using local fallback:", e);
    }
  }

  return localList;
}

export function subscribeToCupidoPeople(
  email: string, 
  onUpdate: (people: CupidoPerson[]) => void, 
  onError?: (err: Error) => void
) {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return () => {};

  const docKey = getUserDocKey(email);
  const db = getFirestoreDB();

  if (!db) {
    // If offline, just trigger once with local list
    const savedList = localStorage.getItem("cupido_people_list_v1");
    let localList: CupidoPerson[] = [];
    try {
      localList = savedList ? JSON.parse(savedList) : [];
    } catch {}
    onUpdate(localList);
    return () => {};
  }

  const collRef = collection(db, "users", docKey, "cupidoPeople");
  return onSnapshot(
    collRef,
    (snapshot) => {
      const people: CupidoPerson[] = [];
      snapshot.forEach(doc => {
        people.push(doc.data() as CupidoPerson);
      });
      localStorage.setItem("cupido_people_list_v1", JSON.stringify(people));
      onUpdate(people);
    },
    (err) => {
      console.error("Firestore cupidoPeople sub error:", err);
      if (onError) onError(err);
    }
  );
}

// ----------------------------------------------------
// Cupido History Operations
// ----------------------------------------------------
export async function saveCupidoHistory(email: string, history: CupidoHistory): Promise<void> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return;

  const docKey = getUserDocKey(email);

  // 1. Sync to LocalStorage
  const savedList = localStorage.getItem("cupido_history_list_v1");
  let currentList: CupidoHistory[] = [];
  try {
    currentList = savedList ? JSON.parse(savedList) : [];
  } catch {}
  currentList = currentList.filter(h => h.id !== history.id);
  currentList.push(history);
  localStorage.setItem("cupido_history_list_v1", JSON.stringify(currentList));

  // 2. Sync to Firestore
  const db = getFirestoreDB();
  if (db) {
    const path = `users/${docKey}/cupidoHistory/${history.id}`;
    try {
      const ref = doc(db, "users", docKey, "cupidoHistory", history.id);
      await setDoc(ref, {
        ...history,
        userId: docKey
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }
}

export async function loadCupidoHistory(email: string): Promise<CupidoHistory[]> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return [];

  const savedList = localStorage.getItem("cupido_history_list_v1");
  let localList: CupidoHistory[] = [];
  try {
    localList = savedList ? JSON.parse(savedList) : [];
  } catch {}

  const db = getFirestoreDB();
  if (db) {
    const docKey = getUserDocKey(email);
    try {
      const collRef = collection(db, "users", docKey, "cupidoHistory");
      const snapshot = await getDocs(collRef);
      const remoteList: CupidoHistory[] = [];
      snapshot.forEach(doc => {
        remoteList.push(doc.data() as CupidoHistory);
      });

      if (remoteList.length > 0) {
        localStorage.setItem("cupido_history_list_v1", JSON.stringify(remoteList));
        return remoteList;
      }
    } catch (e) {
      console.warn("Error loading cupido history from firestore:", e);
    }
  }

  return localList;
}

// ----------------------------------------------------
// Cupido Favorites Operations
// ----------------------------------------------------
export async function saveCupidoFavorite(email: string, favorite: CupidoFavorite): Promise<void> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return;

  const docKey = getUserDocKey(email);

  // 1. LocalStorage
  const savedList = localStorage.getItem("cupido_favorites_list_v1");
  let currentList: CupidoFavorite[] = [];
  try {
    currentList = savedList ? JSON.parse(savedList) : [];
  } catch {}
  currentList = currentList.filter(f => f.id !== favorite.id);
  currentList.push(favorite);
  localStorage.setItem("cupido_favorites_list_v1", JSON.stringify(currentList));

  // 2. Firestore
  const db = getFirestoreDB();
  if (db) {
    const path = `users/${docKey}/cupidoFavorites/${favorite.id}`;
    try {
      const ref = doc(db, "users", docKey, "cupidoFavorites", favorite.id);
      await setDoc(ref, {
        ...favorite,
        userId: docKey
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }
}

export async function deleteCupidoFavorite(email: string, favoriteId: string): Promise<void> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return;

  const docKey = getUserDocKey(email);

  // 1. LocalStorage
  const savedList = localStorage.getItem("cupido_favorites_list_v1");
  let currentList: CupidoFavorite[] = [];
  try {
    currentList = savedList ? JSON.parse(savedList) : [];
  } catch {}
  currentList = currentList.filter(f => f.id !== favoriteId);
  localStorage.setItem("cupido_favorites_list_v1", JSON.stringify(currentList));

  // 2. Firestore
  const db = getFirestoreDB();
  if (db) {
    const path = `users/${docKey}/cupidoFavorites/${favoriteId}`;
    try {
      const ref = doc(db, "users", docKey, "cupidoFavorites", favoriteId);
      await deleteDoc(ref);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  }
}

export async function loadCupidoFavorites(email: string): Promise<CupidoFavorite[]> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return [];

  const savedList = localStorage.getItem("cupido_favorites_list_v1");
  let localList: CupidoFavorite[] = [];
  try {
    localList = savedList ? JSON.parse(savedList) : [];
  } catch {}

  const db = getFirestoreDB();
  if (db) {
    const docKey = getUserDocKey(email);
    try {
      const collRef = collection(db, "users", docKey, "cupidoFavorites");
      const snapshot = await getDocs(collRef);
      const remoteList: CupidoFavorite[] = [];
      snapshot.forEach(doc => {
        remoteList.push(doc.data() as CupidoFavorite);
      });

      if (remoteList.length > 0) {
        localStorage.setItem("cupido_favorites_list_v1", JSON.stringify(remoteList));
        return remoteList;
      }
    } catch (e) {
      console.warn("Error loading cupido favorites from firestore:", e);
    }
  }

  return localList;
}

// ----------------------------------------------------
// Cupido Settings Operations
// ----------------------------------------------------
export async function saveCupidoSettings(email: string, settings: CupidoSettings): Promise<void> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return;

  const docKey = getUserDocKey(email);

  // 1. LocalStorage
  localStorage.setItem("cupido_settings_v1", JSON.stringify(settings));

  // 2. Firestore
  const db = getFirestoreDB();
  if (db) {
    const path = `users/${docKey}/cupidoSettings/config`;
    try {
      const ref = doc(db, "users", docKey, "cupidoSettings", "config");
      await setDoc(ref, {
        ...settings,
        userId: docKey
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }
}

export async function loadCupidoSettings(email: string): Promise<CupidoSettings> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return DEFAULT_SETTINGS;

  const saved = localStorage.getItem("cupido_settings_v1");
  let localSettings = DEFAULT_SETTINGS;
  if (saved) {
    try {
      localSettings = JSON.parse(saved);
    } catch {}
  }

  const db = getFirestoreDB();
  if (db) {
    const docKey = getUserDocKey(email);
    try {
      const ref = doc(db, "users", docKey, "cupidoSettings", "config");
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        const remoteSettings = docSnap.data() as CupidoSettings;
        localStorage.setItem("cupido_settings_v1", JSON.stringify(remoteSettings));
        return remoteSettings;
      }
    } catch (e) {
      console.warn("Error loading cupido settings from firestore:", e);
    }
  }

  return localSettings;
}

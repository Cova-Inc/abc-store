import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const isFirebase = CONFIG.auth.method === 'firebase';

export const firebaseApp = isFirebase
  ? !getApps().length
    ? initializeApp(CONFIG.firebase)
    : getApp()
  : {};
// export const analytics = isFirebase? getAnalytics(firebaseApp): {};
export const AUTH = isFirebase ? getAuth(firebaseApp) : {};
export const FIRESTORE = isFirebase ? getFirestore(firebaseApp) : {};

export const docsToArray = (snapshot) =>
  snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

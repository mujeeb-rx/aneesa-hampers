/**
 * firebase.js — Shared Firebase Configuration
 * Aneesa Hampers · Central Firebase init module
 *
 * Import this file in any page that needs Firebase access:
 *   import { app, db, auth, storage } from './firebase.js';
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getStorage }    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey:            "AIzaSyCT98OpXIDMCHEiZl6PRrQ6GDziOo2hnTM",
  authDomain:        "aneesa-hampers.firebaseapp.com",
  projectId:         "aneesa-hampers",
  storageBucket:     "aneesa-hampers.firebasestorage.app",
  messagingSenderId: "909653560410",
  appId:             "1:909653560410:web:397db4fec2d9f042609c63"
};

export const app     = initializeApp(firebaseConfig);
export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);

// Also expose globally for pages that need window access
window._ahFirebase = { app, db, auth, storage };

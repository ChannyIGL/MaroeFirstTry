import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// config
const firebaseConfig = {
    apiKey: "AIzaSyDQiNHUk8TH2ZRKsf2BOjanQZqelmjiD2Y",
    authDomain: "maroe-b715b.firebaseapp.com",
    projectId: "maroe-b715b",
    storageBucket: "maroe-b715b.firebasestorage.app",
    messagingSenderId: "926746026243",
    appId: "1:926746026243:web:eff669d454aedbca2dc936"
};  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export modules
export const auth = getAuth(app);
export const db = getFirestore(app);


import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {getFirestore} from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyB4Fne6-GR5XiEtAFRO-VoCH07L_slGgR4",
    authDomain: "ai-chatbot-93da2.firebaseapp.com",
    projectId: "ai-chatbot-93da2",
    storageBucket: "ai-chatbot-93da2.appspot.com",
    messagingSenderId: "867080365427",
    appId: "1:867080365427:web:8bbccf08e28d34dd9c1106"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app)

export { auth, provider, signInWithPopup, signOut, db };

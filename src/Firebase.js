import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import {getFirestore} from '@firebase/firestore'
import {getStorage} from '@firebase/storage'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: "chatter-box-chat-app.firebaseapp.com",
  projectId: "chatter-box-chat-app",
  storageBucket: "chatter-box-chat-app.appspot.com",
  messagingSenderId: "979777823179",
  appId: "1:979777823179:web:1d729f0e92da6d5dfb564e"
};

const app = initializeApp(firebaseConfig);
export const auth =  getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
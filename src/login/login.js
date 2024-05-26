import React, { useState } from 'react';
import './login.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';
import { auth, db } from '../Firebase';
import {collection,setDoc, getDocs, addDoc, updateDoc, doc, query,where} from 'firebase/firestore'
import upload from './upload';

export const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar({
        file: file,
        url: URL.createObjectURL(file),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);

    // VALIDATE INPUTS
    if (!username || !email || !password)
      return toast.warn("Please enter inputs!");
    if (!avatar.file) return toast.warn("Please upload an avatar!");

    // VALIDATE UNIQUE USERNAME
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return toast.warn("Select another username");
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });
      e.target.reset();
      toast.success("Account created! You can login now!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Account logged in successfuly!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className='login-container' style={{ display: 'flex'}}>
      <h1 className="titler">Chatter Box</h1>
    <div className='login' style={{ display: 'flex'}}>
             <div className="items" style={{ display: 'flex'}}>
                <h2>Log in</h2>
                       <form onSubmit={handleLogin}>
                     <input type="email" name="email" placeholder='Email' id="e1" />
                     <input type="password" name="password" placeholder='Password' id="p1" />
                     <button disabled={loading} type="submit">{loading? "Loading":"Log in"}</button>
                 </form>
             </div>
             <div className="separator"/>
             <div className="items">
                 <h2>Create Account</h2>
                 <form onSubmit={handleRegister}>
                     <input type="text" name="username" placeholder='Username' id="u" />
                     <input type="email" name="email" placeholder='Email' id="e2" />
                     <input type="password" name="password" placeholder='Password' id="p2" />
                    {avatar.url ? (
                        <img src={avatar.url || "./avatar.png"} alt="" style={{ width: 100, height: 100 }} />
                    ) : (
                        <label htmlFor="file">Upload Profie photo</label>
                    )}
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
                    <button disabled={loading} type="submit">{loading? "Loading":"Register"}</button>
                </form>
                <ToastContainer position='bottom-right' hideProgressBar theme="dark" autoClose={3000}/>
            </div>
        </div>
        </div>
  );
};

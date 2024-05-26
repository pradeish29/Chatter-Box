import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import React, { useState } from 'react'
import { db } from '../Firebase'
import { useUserStore } from '../userStore'

export const AddUser = () => {
  const {currentUser} =useUserStore()
  const [user, setUser] =useState(null)

  const handleSearch =async (e) =>{
    e.preventDefault()
    const formData = new FormData(e.target)
    const username = formData.get("username")

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q)

      if(!querySnapShot.empty){
        setUser(querySnapShot.docs[0].data())
      }

    } catch (error) {
      console.log(error)
    }
  }

  const handleAdd =async (e) =>{
    const  chatRef = collection(db, "chats")
    const  userChatsRef = collection(db, "userchats")
    try {
      const newChatRef = doc(chatRef)
      await setDoc(newChatRef,{
        createdAt : serverTimestamp(),
        message:[],
      })
      await updateDoc(doc(userChatsRef,user.id),{
        chats:arrayUnion({
          chatId: newChatRef.id,
          lastMessage:"",
          receiverId:currentUser.id,
          updatedAt: Date.now(),
        })
      })

      await updateDoc(doc(userChatsRef,currentUser.id),{
        chats:arrayUnion({
          chatId: newChatRef.id,
          lastMessage:"",
          receiverId:user.id,
          updatedAt: Date.now(),
        })
      })


    } catch (error) {
      console.log(error)
      
    }
  }
  return (
    <div className='addUser'>
        <form onSubmit={handleSearch}>
            <input type="text" placeholder='username' name='username' />
            <button>Search</button>
        </form>
        {user && <div className="users">
            <div className="details">
                <img src={user.avatar ||"../bg.jpg"} alt="" />
                <span>{user.username}</span>
                <button onClick={handleAdd}>Add User</button>
            </div>
        </div>}
    </div>
  )
}

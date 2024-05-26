import React,{useState} from 'react'
import './detail.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { auth, db } from '../Firebase';
import { signOut } from 'firebase/auth';
import { useChatStore } from '../chatStore';
import { useUserStore } from '../userStore';
import { doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';


export const Detail = () => {

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat } =
    useChatStore();
  const { currentUser } = useUserStore();
  const [open,setOpen] = useState(false)

  const handleBlock= async ()=>{
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  }

   const handleLogout = () => {
      auth.signOut();
      resetChat()
    };

  return (
    <div className='detail'>
      <div className='userdetail'>
        <img src={user?.avatar || "./avatar.png"}/>
        <h2>{(user?.username)? user.username:"User"}</h2>

        <p>Hey there, I'm using Chatter Box</p>
      </div>
      <div className='info'>
        <div className='option'>
          <div className='title'>
            <span>Chat Settings</span>
            <FontAwesomeIcon className='detIcon' icon={"angle-down"} size='1x'/>
          </div>
        </div>

        <div className='option'>
          <div className='title'>
            <span>Privacy Help</span>
            <FontAwesomeIcon className='detIcon' icon={"angle-down"} size='1x'/>
          </div>
        </div>

        <div className='option'>
          <div className='title' onClick={()=>setOpen((prev)=>!prev)}>
            <span>Shared Media</span>
            {!open?
            <FontAwesomeIcon className='detIcon' icon={"angle-down"}  onClick={()=>setOpen((prev)=>!prev)} size='1x'/>:
            <FontAwesomeIcon className='detIcon' icon={"angle-up"}  onClick={()=>setOpen((prev)=>!prev)} size='1x'/>}
          </div>
         {open?<div className='photos'>
            <div className='photoItem'>
              <img src='https://slp-statics.astockcdn.net/static_assets/staging/23spring/photos/popular-categories-group/Card1_430087637.jpg?width=530'/>
              <FontAwesomeIcon className='detIcon' icon={"download"} size='1x'/>
            </div>

            <div className='photoItem'>
              <img src='https://slp-statics.astockcdn.net/static_assets/staging/23spring/photos/popular-categories-group/Card1_430087637.jpg?width=530'/>
              <FontAwesomeIcon className='detIcon' icon={"download"} size='1x'/>
            </div>

          </div>:""}
        </div>

        <div className='option'>
          <div className='title'>
            <span>Shared FIles</span>
            <FontAwesomeIcon className='detIcon' icon={"angle-down"} size='1x'/>
          </div>
        </div>
        <div className='btn'>
        <button className='blk' onClick={handleBlock}> <FontAwesomeIcon className='detIcon' icon={"user-xmark"} size='1x'/> 
        {isCurrentUserBlocked
            ? " You are Blocked!"
            : isReceiverBlocked
            ? " User blocked"
            : " Block User"}</button>
        <button className='log' onClick={handleLogout}><FontAwesomeIcon className='detIcon' icon={"sign-out"} size='1x'/> Log Out</button>
        </div>
      </div>
    </div>
  )
}

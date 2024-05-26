import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AddUser } from './addUser';
import { useUserStore } from '../userStore';
import { doc, onSnapshot, getDoc, updateDoc} from 'firebase/firestore';
import { db } from '../Firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useChatStore } from '../chatStore';

export const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [mode, setMode] = useState(false);
  const [input, setInput] = useState("");
  const { currentUser } = useUserStore();
  const { changeChat, chatId } = useChatStore(); // Destructure the changeChat function

  const addUserRef = useRef();

  useEffect(() => {
    if (!currentUser || !currentUser.id) return; // Ensure currentUser.id is defined

    const userChatsDocRef = doc(db, "userchats", currentUser.id);

    const unSub = onSnapshot(userChatsDocRef, async (res) => {
      if (!res.exists()) {
        setChats([]);
        return;
      }

      const items = res.data().chats || [];
      
      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);

        const user = userDocSnap.data();
        return { ...item, user };
      });

      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => unSub(); // Ensure proper cleanup
  }, [currentUser]);

  // console.log(chats);
  
  const handleSelect = async (chat) => {

    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });

      const updateChats = chats.map((item) => ({
        ...item,
        selected: item.chatId === chat.chatId ? !item.selected : false
      }));
      setChats(updateChats);


      changeChat(chat.chatId, chat.user);

    } catch (err) {
      console.log(err);
    }
  };
 
  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  const handleClickOutside = (event) => {
    if (addUserRef.current && !addUserRef.current.contains(event.target)) {
      setMode(false);
    }
  };
  useEffect(() => {
    if (mode) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mode]);
  

  return (
    <div className='chatList'>
      <div className='search'>
        <div className='searchbar'>
          <FontAwesomeIcon className='bt' icon={['fas', 'search']} />
          <input type='text' placeholder='Search'  onChange={(e) => setInput(e.target.value)}/>
        </div>
        {!mode ? (
          <FontAwesomeIcon className='bt' icon={['fas', 'plus']} onClick={() => setMode((prev) => !prev)} />
        ) : (
          <FontAwesomeIcon className='bt' icon={['fas', 'minus']} onClick={() => setMode((prev) => !prev)} />
        )}
      </div>
      {filteredChats.map((chat, index) => (
        <div
        className="item"
          key={index}
          onClick={() => handleSelect(chat) }
          style={{
            backgroundColor: chat?.isSeen ? "transparent": "#5183fe",
            backgroundColor: chat?.selected ? "#5182fed5": "transparent"
          }} >
          <img src={chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || './bg.jpg'} alt="A" />
          <div className='text'>
            <span> {chat.user.blocked.includes(currentUser.id)
                ? "User"
                : chat.user.username}</span>
            <p style={{ 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {mode && <div ref={addUserRef}><AddUser /></div>}
      <ToastContainer position='bottom-right' />
    </div>
  );
};
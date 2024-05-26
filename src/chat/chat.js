import React, { useState, useRef, useEffect } from 'react';
import './chat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import EmojiPicker from 'emoji-picker-react';
import { db } from '../Firebase';
import { arrayUnion, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { useChatStore } from '../chatStore';
import { useUserStore } from '../userStore';
import upload from '../login/upload';
import { formatDistanceToNow } from 'date-fns';

export const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChats] = useState();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const { currentUser } = useUserStore();
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const endRef = useRef(null);
  const inputRef = useRef(null);


  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]); // Add chat as a dependency

  useEffect(() => {
    if (chatId) {
      const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
        setChats(res.data());
      });
      return () => unSub();
    }
  }, [chatId]);

  useEffect(() => {
    const inputElement = inputRef.current;
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !isCurrentUserBlocked && !isReceiverBlocked) {
        handleSend();
      }
    };
  
    if (inputElement) {
      inputElement.addEventListener('keydown', handleKeyDown);
    }
  
    return () => {
      if (inputElement) {
        inputElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [text, img, isCurrentUserBlocked, isReceiverBlocked]);
  

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return; // Ensure there's either text or an image to send
    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });

    } catch (error) {
      console.log(error);
    } finally {
      setImg({
        file: null,
        url: "",
      });

      setText("");
    }
  };

  return (
    <div className='chat'>
      <div className='top'>
        <div className='user'>
          <img className='user-img' src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{(user?.username)? user.username:"User"}</span>
          </div>
        </div>
        <div className='icons'  disabled={isCurrentUserBlocked || isReceiverBlocked}>
          <FontAwesomeIcon icon={['fas', 'phone']} style={{ fontSize: '25px' }} />
          <FontAwesomeIcon icon={['fas', 'video']} style={{ fontSize: '25px' }} />
          <FontAwesomeIcon icon={"info"} style={{ fontSize: '25px' }} />
        </div>
      </div>
      <div className='center' style={{ display: 'flex',overflowY:'scroll'}}>
        {chat && chat.messages ? (
          chat.messages.map((message) => (
            <div
              className={message.senderId === currentUser?.id ? "message own" : "message"}
              key={message?.createAt}>
              <div className='text'>
                {message.img && <img className='text-img' src={message.img} alt='Message attachment' />}
                <p>{message.text}</p>
                <span>{formatDistanceToNow(new Date(message.createdAt.toDate()))}</span>
              </div>
            </div>
          ))
        ) : " "}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className='bottom'>
        <div className='icons'>
          <label htmlFor="file">
            <FontAwesomeIcon icon={["far", "image"]} size='2x' />
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleImg}
            />
          </label>
          <FontAwesomeIcon icon={"camera"} size='2x' />
          <FontAwesomeIcon icon={"microphone"} size='2x' />
        </div>
        <input type='text' placeholder='Type a Message' onChange={e => setText(e.target.value)} value={text} disabled={isCurrentUserBlocked || isReceiverBlocked}   ref={inputRef}
 />
        <div className='emoji'>
          <FontAwesomeIcon icon={["far", "face-smile"]} size='2x' onClick={() => setOpen((prev) => !prev)} />
          <div className='picker'>
            {open && <EmojiPicker onEmojiClick={handleEmoji} />}
          </div>
          <FontAwesomeIcon icon={["far", "paper-plane"]} size='2x' color='#5183fe' onClick={handleSend} />
        </div>
      </div>
    </div>
  );
};

import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from './Firebase';
import { useEffect } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { List } from '../src/list/list';
import { Chat } from '../src/chat/chat';
import { Detail } from '../src/detail/detail';
import { Login } from './login/login';
import { onAuthStateChanged } from 'firebase/auth';
import { useUserStore } from './userStore';
import { useChatStore } from './chatStore';

library.add(fas, far);

function App() {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo(user?.uid);
      } else {
        // Handle the case where there is no user
        fetchUserInfo(null);
      }
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className='loading'>Loading</div>;

  return (
    <div className="container">
      <Router basename="/Chatter-Box">
        <Routes>
          <Route path='/' element={
            currentUser ? (
              <>
                <List />
                {chatId && <Chat />}
                {chatId && <Detail />}
              </>
            ) : (
              <Login />
            )
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

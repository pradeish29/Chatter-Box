import React from 'react'
import "./list.css"

import { UserInfo } from './userInfo';
import { ChatList } from './chatList';

export const List = () => {
  return (
    <div className='list'>
        <UserInfo/>
        <ChatList/>
        </div>
  )
}

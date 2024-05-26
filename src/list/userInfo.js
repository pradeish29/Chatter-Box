import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useUserStore } from '../userStore';

export const UserInfo = () => {

  const {currentUser} = useUserStore()

  return (
    <div className='userInfo'>
        <div  className='user'>
            <img src={currentUser.avatar}></img>
            <h2>{currentUser.username}</h2>
        </div>

        <div className='icons'>
        <FontAwesomeIcon icon={"ellipsis-h"} style={{ fontSize: '20px' }}/>
        <FontAwesomeIcon icon={"edit"} style={{ fontSize: '20px' }}/>
        </div>

    </div>
  )
}

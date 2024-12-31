import { useEffect } from 'react'
import React from 'react'
import { useSocket } from '../providers/Socket'
const RoomPage = () => {
    const socket = useSocket();
    const handleNewUserJoined = (data) =>{
        const email = data.email;
        console.log('User Connected:', email);
    }
    useEffect(() => {
        socket.on('user-connected',handleNewUserJoined);
    }, []);
  return (
    <div>
        <h1>Room</h1>
    </div>
  )
}

export default RoomPage
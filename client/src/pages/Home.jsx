import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../providers/Socket';

const Home = () => {
  const socket = useSocket();
  const [email, setEmail] =  useState('');
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    socket.emit('join-room', { roomId: roomCode, email });
  };

  const handleRoomJoined = ({roomId}) =>{
    navigate(`/room/${roomId}`);
  }

  useEffect(() => {
    socket.on('joined-room',handleRoomJoined )
  }, []);
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Join a Room</h1>
        <div className="space-y-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter Your E-Mail"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            onChange={(e) => setRoomCode(e.target.value)}
            type="text"
            placeholder="Enter The Room Code"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button onClick={handleJoinRoom} className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
            Join Room
          </button>
        </div>
      </div>
    </section>
  );
};

export default Home;

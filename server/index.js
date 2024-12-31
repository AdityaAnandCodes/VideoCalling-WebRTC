const express = require('express');
const bodyParser = require('body-parser');
const {Server} = require('socket.io');

const app = express();
const io = new Server(
    {cors: true,

    }
);

app.use(bodyParser.json());

const emailToSocketMapping = new Map();


io.on('connection', (socket) => {
    console.log('User Connected:',socket.id);
    socket.on('join-room',(data)=>{
        const {roomId,email} = data;
        console.log('Joining Room:',roomId,email);
        emailToSocketMapping.set(email,socket.id);
        socket.join(roomId);
        socket.emit('joined-room',{roomId});
        socket.broadcast.to(roomId).emit('user-connected', {email});
    })
});


app.listen(8000, () => {
  console.log('Server is running on port 3000');
});
io.listen(8001);

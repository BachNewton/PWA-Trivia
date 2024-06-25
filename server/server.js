import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['*']
    }
});
const PORT = 80;

app.get('/', (_, res) => {
    res.send('<h1>Novelty Games Server</h1>');
});

io.on('connection', (socket) => {
    console.log('Connection:', socket.id);
    socket.broadcast.emit('connection', socket.id);

    socket.on('disconnect', () => {
        console.log('Disconnect:', socket.id);
        socket.broadcast.emit('disconnected', socket.id);
    });

    socket.on('broadcast', (data) => {
        console.log('Socket ID:', socket.id, 'Broadcast data:', data);
        socket.broadcast.emit('broadcast', data);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

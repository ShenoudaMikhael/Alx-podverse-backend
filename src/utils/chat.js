const http = require('http');
const { Server } = require('socket.io');


function createChatServer(app) {
    console.log('createChatServer');
    const server = http.createServer(app);
    const io = new Server(server);


    io.on('connection', (socket) => {
        console.log('A user connected');

        // Listen for chat messages
        socket.on('chat message', (msg) => {
            io.emit('chat message', msg); // Broadcast message to all clients
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
    return server
}

module.exports = createChatServer;
const getenv = require('getenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const dbClient = require('./db')
const User = dbClient.models.users;

let activeUsers = {};  // Store active users by room
function createChatServer(app) {
    console.log('createChatServer');
    const server = http.createServer(app);
    const io = new Server(server);
    io.use((socket, next) => {
        const token = socket.handshake.auth.token; // Assuming you're passing the token in the auth header
        if (!token) {
            return next(new Error('Authentication error'));
        }

        jwt.verify(token, getenv('JWT'), (err, decoded) => {
            if (err) {
                return next(new Error('Authentication error'));
            }
            // If token is valid, save the decoded data (user info) in the socket object
            socket.data = decoded;
            next();
        });
    });
    io.on('connection', (socket) => {
        // const ids = [];
        console.log('A user connected', socket.id);
        socket.emit("me", socket.id);
        // Listen for chat messages
        socket.on('chat message', ({ message, room }) => {
            console.log(message, room);
            io.to(room).emit('chat message', message); // Broadcast message to all clients
        });

        socket.on('get-broadcast-id', ({ listenerId }) => {
            console.log('fired:get-broadcast-id', listenerId);
            //needs to be updated
            socket.broadcast.emit('get-broadcast-id', { listenerId });
        })

        socket.on('shake-listener', ({ listenerId, broadcaster }) => {
            console.log('shake-listener', listenerId, broadcaster);
            socket.to(listenerId).emit('get-broadcast-id', broadcaster);
        })
        socket.on('connect-to-broadcaster', (data) => {
            console.log('fired:connect-to-broadcaster')
            socket.to(data.userToCall).emit('connect-to-broadcaster', data);
        })

        socket.on('connect-listner', ({ signal, to }) => {
            socket.to(to).emit('connect-listner', { signal, to });
        });



        //chat   
        socket.on('join-podcast', async (podcast) => {

            socket.join(podcast);

            const user = await User.findByPk(socket.data.user.id);

            if (user) {
                // Add user to the activeUsers list
                if (!activeUsers[podcast]) {
                    activeUsers[podcast] = [];
                }
                activeUsers[podcast].push({
                    id: user.id,
                    name: user.name,
                    image: user.image,
                    socketId: socket.id,  // Track socket ID for disconnection later
                });

            }
            io.to(podcast).emit('activeUsers', activeUsers[podcast]);
            console.log(`User ${socket.id} joined podcast: ${podcast}`, socket.data.user.id);
        });




        socket.on('disconnect', () => {
            for (const podcastId in activeUsers) {
                const userIndex = activeUsers[podcastId].findIndex(user => user.socketId === socket.id);
                if (userIndex !== -1) {
                    activeUsers[podcastId].splice(userIndex, 1);  // Remove user from the list

                    // Broadcast the updated list to the room
                    io.to(podcastId).emit('activeUsers', activeUsers[podcastId]);
                }
            }
            console.log('User disconnected:', socket.id);
        });
    });
    return server
}

module.exports = createChatServer;
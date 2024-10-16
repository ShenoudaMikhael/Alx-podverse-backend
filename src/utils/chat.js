const getenv = require('getenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const dbClient = require('./db')
const User = dbClient.models.users;
const Podcast = dbClient.models.podcasts;

let activeUsers = {};  // Store active users by room
let podcast_broadcasters = {};
let podcast_listeners = {} // Store active users by room
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

        console.log('A user connected', socket.id);

        socket.on('chat message', ({ message, room }) => {
            console.log(message, room);
            io.to(room).emit('chat message', message); // Broadcast message to all clients
        });

        socket.on('connect-to-me', ({ listenerId, broadcasterId }) => {
            console.log('fired:connect-to-me', listenerId);
            //needs to be updated
            socket.to(listenerId).emit('connect-to-me', { broadcasterId });
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


        socket.on('podcast-ended', (uuid) => {
            socket.to(uuid).emit('podcast-ended');
        });


        //chat   
        socket.on('join-podcast', async (podcast) => {

            socket.join(podcast);
            const user = await User.findByPk(socket.data.user.id);
            const current_podcast = await Podcast.findOne({ where: { uuid: podcast } });
            if (current_podcast.user_id == socket.data.user.id) {
                podcast_broadcasters[podcast] = { user_id: socket.data.user.id, socketId: socket.id }
                socket.to(podcast).except(socket.id).emit('broadcaster-connected', socket.id);
            } else {
                if (!podcast_listeners[podcast]) podcast_listeners[podcast] = [];
                podcast_listeners[podcast].push[{ user_id: socket.data.user.id, socketId: socket.id }]
                socket.to(podcast).except(socket.id).emit('listener-connected', socket.id);
            }
            if (user) {
                console.log(user.dataValues);
                // Add user to the activeUsers list
                if (!activeUsers[podcast]) {
                    activeUsers[podcast] = [];
                }
                activeUsers[podcast].push({
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    image: user.profilePic,
                    socketId: socket.id,  // Track socket ID for disconnection later
                });

            }
            io.to(podcast).emit('activeUsers', activeUsers[podcast]);
            io.emit('activeListeners', activeUsers);
            console.log(`User ${socket.id} joined podcast: ${podcast}`, socket.data.user.id);
        });




        socket.on('disconnect', () => {

            for (const room in podcast_broadcasters) {
                if (podcast_broadcasters[room].socketId == socket.id) {
                    io.to(room).emit('broadcaster-left', socket.id);
                }
            }



            for (const room in podcast_listeners) {
                for (const listener in podcast_listeners[room]) {
                    if (listener.socketId == socket.id) {
                        io.to(room).emit('listener-left', socket.id);
                        podcast_listeners[room].remove(listener);
                    }
                }
            }

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
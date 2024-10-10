const getenv = require('getenv');
const http = require('http');
const { Server } = require('socket.io');


function createChatServer(app) {
    console.log('createChatServer');
    const server = http.createServer(app);
    const io = new Server(server);
    // io.use((socket, next) => {
    //     const token = socket.handshake.auth.token; // Assuming you're passing the token in the auth header
    //     if (!token) {
    //       return next(new Error('Authentication error'));
    //     }
      
    //     jwt.verify(token, getenv('JWT'), (err, decoded) => {
    //       if (err) {
    //         return next(new Error('Authentication error'));
    //       }
      
    //       // If token is valid, save the decoded data (user info) in the socket object
    //       socket.user = decoded;
    //       next();
    //     });
    //   });
    io.on('connection', (socket) => {
        // const ids = [];
        console.log('A user connected', socket.id);
        socket.emit("me", socket.id);
        // Listen for chat messages
        socket.on('chat message', (msg) => {
            io.emit('chat message', msg); // Broadcast message to all clients
        });

        socket.on('get-broadcast-id', ({listenerId}) => {
            console.log('fired:get-broadcast-id', listenerId);
            //needs to be updated
            socket.broadcast.emit('get-broadcast-id', {listenerId});
        })

        socket.on('shake-listener', ({listenerId, broadcaster}) => {
            console.log('shake-listener',listenerId,broadcaster);
            socket.to(listenerId).emit('get-broadcast-id', broadcaster);
        })
        socket.on('connect-to-broadcaster', (data) => {
            console.log('fired:connect-to-broadcaster')
            socket.to(data.userToCall).emit('connect-to-broadcaster', data);
        })

        socket.on('connect-listner', ({ signal, to }) => {
            socket.to(to).emit('connect-listner', {signal,to});
        });


      

        socket.on('disconnect', () => {

            console.log('User disconnected:', socket.id);
        });
    });
    return server
}

module.exports = createChatServer;
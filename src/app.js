
const express = require('express');
const cors = require('cors');
dbClient = require('./utils/db')
const createChatServer = require('./utils/chat');






async function createServer() {
    const app = express();
    // will need it later for full http request. 
    // app.use(cors({
    //     origin: '*',
    //     methods: ['GET', 'POST'],
    //     // credentials: true,
    // }));
    app.use(express.json());
  
    await dbClient.isAlive()

    app.get('/', (req, res) => {
        res.send("Socket.io Chat Server is running");
    });

    const server = createChatServer(app);

    // app.post('*', function (req, res) {
    //     res.status(404).send({ "error": "Endpoint is not there" });
    // });
    return server;
}




module.exports = createServer;
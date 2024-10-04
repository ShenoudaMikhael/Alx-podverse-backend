
const express = require('express');
dbClient = require('./utils/db')

const app = express();

async function createServer() {
    await dbClient.isAlive()
    app.use(express.json());


    app.get('*', function (req, res) {
        res.status(404).send({ "error": "Endpoint is not there" });
    });
    app.post('*', function (req, res) {
        res.status(404).send({ "error": "Endpoint is not there" });
    });
    return app;
}




module.exports = createServer;

const express = require('express');
const sequelize = require('./utils/db');

const app = express();
app.use(express.json());


app.get('*', function (req, res) {
    res.status(404).send({ "error": "Endpoint is not there" });
});
app.post('*', function (req, res) {
    res.status(404).send({ "error": "Endpoint is not there" });
});



module.exports = app;
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
    'podverse',
    'shno',
    'B5XXV0POew4a7NQt',
    {
        host: 'localhost',
        dialect: 'mysql',
        logging: console.log,
    }
);

sequelize.authenticate().then((value) => {
    console.log(value);
    console.log('Connection has been established successfully.');
}).catch(error => {
    console.error('Unable to connect to the database:', error);
})
console.log('here')
module.exports = sequelize;
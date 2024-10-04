const { Sequelize } = require('sequelize');



class DbClient {
    constructor() {
        this.sequelize = new Sequelize(
            'podverse',
            'shno',
            'B5XXV0POew4a7NQt',
            {
                host: 'localhost',
                dialect: 'mysql',
                logging: console.log,
            }
        );
    }

    async isAlive() {
        try {
            await this.sequelize.authenticate();
            console.log('Connection has been established successfully.');
            return true;
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            return false;
        }
    }
}
dbClient = new DbClient();
module.exports = dbClient;
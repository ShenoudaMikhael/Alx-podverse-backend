const { Sequelize } = require('sequelize');
const initModels = require('../models/init-models');



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
        // Models object 
        this.models = initModels(this.sequelize);
        this.sequelize.sync();
    }

    async isAlive() {
        try {
            await this.sequelize.authenticate();
            console.debug('Connection has been established successfully.');
            return true;
        } catch (error) {
            console.debug('Unable to connect to the database:', error);
            return false;
        }
    }

}
dbClient = new DbClient();
module.exports = dbClient;
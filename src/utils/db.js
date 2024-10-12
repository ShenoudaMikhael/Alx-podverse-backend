const { Sequelize } = require('sequelize');
const initModels = require('../models/init-models');
const getenv = require('getenv');


class DbClient {
    constructor() {
        this.sequelize = new Sequelize(
            getenv('DATABASE'),
            getenv('DATABASE_USER'),
            getenv('DATABASE_PASS'),         
            {
                host: getenv('DATABASE_HOST'),
                dialect: 'mysql',
                logging: false,
                // logging: console.log,
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
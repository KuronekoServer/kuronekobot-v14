const { Sequelize, Model, DataTypes } = require('sequelize');
const { database } = require("../../config.json")
const sequelize = new Sequelize(database);

const User = sequelize.define('Features', {
    LevelSystem: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    GuildID: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    });
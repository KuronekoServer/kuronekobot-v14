const { Sequelize, Model, DataTypes } = require('sequelize');
const { database } = require("../../config.json")
const sequelize = new Sequelize(database);

const User = sequelize.define('AFK', {
  GuildID: DataTypes.STRING,
  UserID: DataTypes.STRING,
  Status: DataTypes.STRING,
  Time: DataTypes.STRING,
});
const { Sequelize, Model, DataTypes } = require('sequelize');
const { database } = require("../../config.json")
const sequelize = new Sequelize(database);

const User = sequelize.define('Captcha', {
  GuildID: DataTypes.STRING,
  Role: DataTypes.STRING,
});
const { Client } = require("discord.js");
const { activityInterval, database } = require("../../../config.json")
const { Sequelize } = require('sequelize');

module.exports = {
  name: "ready",
  rest: false,
  once: false,
  /**
   * @param {Client} client
   */
  async execute(client) {

    /* Connect to database */
    if(!database) return;
    const sequelize = new Sequelize(database)
    try {
      await sequelize.authenticate();
      console.log('DBに接続できました');
    } catch (error) {
      console.error('DB接続に失敗しました: ', error);
    }

    console.log(
      `Logged in as ${client.user.tag} and running on ${client.guilds.cache.size} Server!`
    );
    updateActivity(client)
  },
};

/**
 * @param {Client} client
 */
async function updateActivity(client) {

  let servercount = await client.guilds.cache.size

  const activities = [
    `/invite | ${servercount} Servers`,
    `にゃ～`,
    `ねみぃ...`,
    //好きに足して
  ]

  setInterval(() => {
    const status = activities[Math.floor(Math.random() * activities.length)]
    client.user.setActivity(status)
  }, activityInterval*1000)
}
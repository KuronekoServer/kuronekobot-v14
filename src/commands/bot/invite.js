const { EmbedBuilder } = require('@discordjs/builders')
const { Client, SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("私を招待する"),
    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const link = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`
        const Response = new EmbedBuilder()
        .setColor(client.mainColor)
        .setTitle("招待する")
        .setFooter({text: client.user.tag, iconURL: client.user.displayAvatarURL()})
        .setDescription(`[黒猫ちゃんbotを招待する](${link})`)

        await interaction.reply({embeds: [Response]})

    }
}
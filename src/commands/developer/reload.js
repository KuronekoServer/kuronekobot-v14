const { EmbedBuilder } = require('@discordjs/builders');
const { Client, SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } = require('discord.js')
const { loadCommands } = require('../../Handlers/CommandHandler')
const { loadEvents } = require('../../Handlers/EventHandler')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("リロードする")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(
        command => 
        command.setName("events")
        .setDescription("イベントをリロードする"))
    .addSubcommand(
        command => 
        command.setName("commands")
        .setDescription("コマンドをリロードする")),
    developer: true,
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async execute(interaction, client) {

        const sub = interaction.options.getSubcommand();
        const Response = new EmbedBuilder()
        .setTitle("💻 Developer")
        .setColor(client.mainColor)

        switch (sub) {
            case "commands": {
                loadCommands(client);
                interaction.reply({embeds: [Response.setDescription("✅ コマンドをリロードしました")]})
            }
            break;
        
            case "events": {
                loadEvents(client);
                interaction.reply({embeds: [Response.setDescription("✅ イベントをリロードしました")]})
            }
            break;
        }

    },
}
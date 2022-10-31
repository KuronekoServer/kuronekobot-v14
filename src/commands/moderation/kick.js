const { EmbedBuilder } = require('@discordjs/builders');
const { Client, SlashCommandBuilder, CommandInteraction, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('メンバーを追放する')
    .addUserOption(
        option => 
        option.setName("target")
        .setDescription("追放したいメンバー")
        .setRequired(true))
    .addStringOption(
        option =>
        option.setName("reason")
        .setDescription("追放の理由")
        .setRequired(false))

    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    /**
     * @param {CommandInteraction} interaction 
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options } = interaction;

        const Target = options.getMember("target")
        const Reason = options.getString("reason")

        const Response = new EmbedBuilder()
        .setColor(client.mainColor)
        .setTimestamp(Date.now())

        if(Target.kickable) {
            client.modlogs({
                Member: Target,
                Action: "追放",
                Color: 0xfff763,
                Reason: Reason
            }, interaction)

            if (Reason) {
                    Target.kick(Reason)
                    Response.setDescription(`<@${interaction.member.id}>が<@${Target.id}>を追放しました`)
                    Response.addFields([
                        {
                            name: "Reason:",
                            value: Reason,
                            inline: false
                        }
                    ])
            } else {
                Target.kick()
                Response.setDescription(`<@${interaction.member.id}>が<@${Target.id}>を追放しました`)
            }
        } else {
            Response.setDescription(`❌ 権限不足のため、<@${Target.id}>を追放することができません`).setColor(client.errorColor)
        }

        await interaction.reply({embeds: [Response]})
    }
}
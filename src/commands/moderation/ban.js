const { EmbedBuilder } = require('@discordjs/builders');
const { Client, SlashCommandBuilder, CommandInteraction, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('メンバーをBANする')
    .addUserOption(
        option => 
        option.setName("target")
        .setDescription("BANしたいメンバー")
        .setRequired(true))
    .addStringOption(
        option =>
        option.setName("reason")
        .setDescription("BANの理由")
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

        if(Target.bannable) {
            client.modlogs({
                Member: Target,
                Action: "BAN",
                Color: 0xf5425a,
                Reason: Reason
            }, interaction)

            if (Reason) {
                    await interaction.guild.bans.create(Target, {reason: Reason})
                    Response.setDescription(`<@${interaction.member.id}>が<@${Target.id}>をBANしました`)
                    Response.addFields([
                        {
                            name: "理由",
                            value: Reason,
                            inline: false
                        }
                    ])
            } else {
                await interaction.guild.bans.create(Target)
                Response.setDescription(`<@${interaction.member.id}>が<@${Target.id}>をBANしました`)
            }
        } else {
            Response.setDescription(`❌ 権限不足のため、<@${Target.id}>をBANすることができません`).setColor(client.errorColor)
        }

        await interaction.reply({embeds: [Response]})
    }
}
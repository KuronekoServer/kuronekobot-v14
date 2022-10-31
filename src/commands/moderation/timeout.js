const { EmbedBuilder } = require('@discordjs/builders');
const { Client, SlashCommandBuilder, CommandInteraction, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('メンバーをタイムアウトする')
    .addUserOption(
        option => 
        option.setName("user")
        .setDescription("タイムアウトしたいユーザー")
        .setRequired(true))
    .addNumberOption(
        option =>
        option.setName("duration")
        .setDescription("タイムアウトしたい時間")
        .setRequired(true)
        .addChoices(
            { name: "60秒", value: 60*1000 },
            { name: "5分", value: 5*60*1000 },
            { name: "10分", value: 10*60*1000 },
            { name: "30分", value: 30*60*1000 },
            { name: "1時間", value: 60*60*1000 },
            { name: "1日", value: 24*60*60*1000 },
            { name: "1週間", value: 7*24*60*60*1000 }
        ))
    .addStringOption(
        option =>
        option.setName("reason")
        .setDescription("タイムアウトの理由")
        .setRequired(false))

    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    /**
     * @param {CommandInteraction} interaction 
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options } = interaction
        
        let member = options.getMember("user")
        let duration = options.getNumber("duration")
        let reason = options.getString("reason") || "理由がありません"

        const Response = new EmbedBuilder()
        .setColor(client.mainColor)

        if (!member) return interaction.reply({embeds: [Response.setDescription("❌ 無効なメンバーです").setColor(client.errorColor)], ephemeral: true})
        
        try {
            await member.timeout(duration, reason)
            Response.setDescription(`🚫 <@${member.user.id}>をタイムアウトしました`)
            .addFields([
                {name: "Reason:", value: reason, inline: false},
            ])

            client.modlogs({
                Member: member,
                Action: "タイムアウト",
                Color: 0xfff763,
                Reason: reason
            }, interaction)
            return interaction.reply({embeds: [Response]})
        } catch (err) {
            return console.error(err)
        }
    
    }
} 
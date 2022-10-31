const { Client, SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("kuronekoserver")
    .setDescription("KuronekoServerの情報を表示する"),
    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        
        const Response = new EmbedBuilder()
        .setTitle("KuronekoServer")
        .setDescription(
        `💻 │ [Github](https://github.com/KuronekoServer)\n🐤 │ [Twitter](https://www.twitter.com/kuroneko_server)\n:rofl: | [コミュニティーサーバー](https://discord.gg/ju73AKjqw4)\n:hammer: │ [サポートサーバー](https://discord.gg/BxZWEKMEUn)\n`)
        .setTimestamp(Date.now())
        .setColor(client.mainColor)
        .setThumbnail('https://github.com/KuronekoServer.png')

        interaction.reply({embeds: [Response]})

    }
}
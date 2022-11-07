const { Client, SlashCommandBooleanOption, SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("screenshot")
    .setDescription("Webサイトをスクリーンショットする")
    .addStringOption(
        option =>
        option.setName("url")
        .setDescription("スクリーンショット撮りたいWebサイトのURL")
        .setRequired(true)
    ),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const { options, guild, member } = interaction;

        const url = options.getString("url")
        const color = client.hexMainColor

        const ScreenshotEmbed = new EmbedBuilder()
        

  
        }
    }
}

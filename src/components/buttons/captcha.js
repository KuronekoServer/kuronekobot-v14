const { ButtonInteraction, Client, AttachmentBuilder, EmbedBuilder } = require('discord.js')
const DB = require('../../models/CaptchaSystem')
const { Captcha } = require('captcha-canvas')

module.exports = {
    data: {
        name: "captcha-btn"
    },
    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const { member, guild } =  interaction;

        DB.findOne({ GuildID: guild.id }, async (err, data) => {
            if(!data) return console.log(`${guild.name}では認証システムは無効化されています`);

            const captcha = new Captcha();
            captcha.async = true;
            captcha.addDecoy();
            captcha.drawTrace();
            captcha.drawCaptcha();

            const captchaAttachment = new AttachmentBuilder(await captcha.png)
            .setName("captcha.png");
            
            const captchaEmbed = new EmbedBuilder()
            .setColor(client.mainColor)
            .setDescription("30秒以内に以下の文字を入力してください")
            .setImage('attachment://captcha.png')

            try {
                interaction.reply({content: `DMに認証内容を送信しました`, ephemeral: true})
                const msg = await member.user.send({files: [captchaAttachment], embeds: [captchaEmbed]})
                
                const wrongCaptchaEmbed = new EmbedBuilder()
                .setColor(client.errorColor)
                .setDescription("🚫 入力に間違えがあります");

                const filter_ = (message) => {
                    if(message.author.id !== member.id) return;
                    if(message.content === captcha.text) {
                        return true;
                    } else {
                        member.send({embeds: [wrongCaptchaEmbed]})
                    }
                }

                try {
                    const response = await msg.channel.awaitMessages({
                        filter: filter_,
                        max: 1,
                        time: 30*1000,
                        errors: ["time"]});

                    if(response) {
                        DB.findOne({ GuildID: member.guild.id }, async (err, data) => {
                            if(!data) return;
                            if(!data.Role) return;

                            const role = member.guild.roles.cache.get(data.Role)
                            member.roles.add(role).catch
                            member.user.send("`✅ 認証に成功しました`");
                        })
                    } else {
                        member.user.send("`❌ 認証に失敗しました`");
                    }

                } catch (error) {
                    return console.log(error)
                }

            } catch (error) {
                return console.log(error)
            }
        })
    }
}
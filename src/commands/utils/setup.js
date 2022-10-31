const { Client, ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

const voiceDB = require('../../models/VoiceSystem')
const captchaDB = require('../../models/CaptchaSystem')
const modlogsDB = require('../../models/ModerationLogs')
const featuresDB = require('../../models/Features')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("setup")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Setup some settings!")
    .addSubcommand(
        command =>
        command.setName("voice")
        .setDescription("一時VCチャンネルの設定")
        .addChannelOption(
            channel =>
            channel.setName("channel")
            .setDescription("参加したら転送されるチャンネル")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
    ))
    .addSubcommand(
        command =>
        command.setName("levels")
        .setDescription("レベルシステムを設定する")
        .addStringOption(
            option =>
            option.setName("turn")
            .setDescription("有効化・無効化する")
            .addChoices(
                { name: "有効化", value: "on" },
                { name: "無効化", value: "off" },
            ))
        .addStringOption(
            option =>
            option.setName("background")
            .setDescription("ランクカードの背景を変える(画像のURL)")
            .setMinLength(2)))
    .addSubcommand(
        command =>
        command.setName("modlogs")
        .setDescription("管理ログチャンネルを設定する")
        .addChannelOption(
            channel =>
            channel.setName("log")
            .setDescription("ログチャンネル")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
    ))
    .addSubcommand(
        command =>
        command.setName("captcha")
        .setDescription("Captcha認証システムの設定")
        .addRoleOption(
            option =>
            option.setName("role")
            .setDescription("認証に成功したら付与するロール")
            .setRequired(true))
        .addChannelOption(
            option => 
            option.setName("captcha_channel")
            .setDescription("認証ボタンを送信するチャンネル")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        ))
    .addSubcommand(
        command =>
        command.setName("info")
        .setDescription("ボットの設定を表示する"))
    .addSubcommand(
        command =>
        command.setName("remove")
        .setDescription("設定を解除する")
        .addStringOption(
            option =>
            option.setName("configuration")
            .setDescription("解除したい設定")
            .setRequired(true)
            .addChoices(
                { name: '🤖 認証システム', value: 'captcha' },
                { name: '🔊 一時VCチャンネル', value: 'voice' },
                { name: '📕 管理ログ', value: 'modlogs' },
            ))),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const { options, guild } = interaction;

        const channel = options.getChannel("channel")
        const role = options.getRole("role")
        const type = options.getString("configuration")

        const sub = options.getSubcommand();

        const Response = new EmbedBuilder()
        .setColor(client.mainColor)
        .setTitle("✨ 設定")
        .setTimestamp(Date.now())
        .setDescription("現在の設定です")

        switch(sub) {
            case "voice": {
                await voiceDB.findOneAndUpdate(
                    {GuildID: guild.id}, 
                    {ChannelID: channel.id},
                    {new: true, upsert: true})
                
                Response.setDescription("✅ 一時VCシステムを設定しました")
            }
            break;

            case "levels": {
                const background = options.getString("background");
                const level_enabled = await featuresDB.findOne({GuildID: guild.id});
                if(level_enabled) {
                    const { LevelSystem } = level_enabled;

                    if(background) {
                        if(isValidHttpUrl(background)) {
                            await featuresDB.findOneAndUpdate(
                                {GuildID: guild.id},
                                {LevelSystem: {
                                     Enabled: LevelSystem ? 
                                     LevelSystem.Enabled : 
                                     false,
                                     Background: background 
                                }},
                                {new: true, upsert: true}
                            )
        
                            Response
                            .setDescription("🖼️ 新しい背景が設定されました")
                            .setImage(background);
                        } else {
                            Response.setDescription("❌ `background` に有効なURLを入力してください") 
                            return interaction.reply({embeds: [Response], ephemeral: true})
                        }
                    }

                    switch(options.getString("turn")) {

                        case "on": {
                            await featuresDB.findOneAndUpdate(
                                {GuildID: guild.id},
                                {LevelSystem: { Enabled: true, Background: LevelSystem ? LevelSystem.Background : "https://cdn.discordapp.com/attachments/975054410331861082/1036589682999435304/kuroneko-rankcard.png" }},
                                {new: true, upsert: true})
    
                            Response.setDescription("✅ レベルシステムを有効化しました")
                        }
                        break;
    
                        case "off": {
                            await featuresDB.findOneAndUpdate(
                                {GuildID: guild.id},
                                {LevelSystem: { Enabled: true, Background: LevelSystem ? LevelSystem.Background : "https://cdn.discordapp.com/attachments/975054410331861082/1036589682999435304/kuroneko-rankcard.png" }},
                                {new: true, upsert: true})
    
                            Response.setDescription("✅ レベルシステムを無効化しました")
                        }
                        break;
                    }
                } else {
                    await featuresDB.findOneAndUpdate(
                        {GuildID: guild.id},
                        {LevelSystem: { Enabled: false, Background: "https://cdn.discordapp.com/attachments/975054410331861082/1036589682999435304/kuroneko-rankcard.png"}},
                        {new: true, upsert: true})
                    Response.setDescription("`/setup levels turn: On` でレベルシステムを有効化できます \n`/setup levels background: 'url'` でランクカードの背景を変更できます");
                }
            }
            break;

            case "captcha": {
                const button = new ButtonBuilder()
                .setCustomId("captcha-btn")
                .setLabel("✅ 認証する")
                .setStyle(ButtonStyle.Success);

                const captcha_channel = options.getChannel("captcha_channel")
                const captcha_embed = new EmbedBuilder()
                .setColor(client.mainColor)
                .setTitle("🤖 認証システム")
                .setDescription("以下のボタンを押してDMに送信されたCaptchaを解いてください")

                await captchaDB.findOneAndUpdate(
                    {GuildID: guild.id},
                    {Role: role.id},
                    {new: true, upsert: true})

                Response.setDescription("✅ 認証システムを有効化しました")
                captcha_channel.send({embeds: [captcha_embed], components: [new ActionRowBuilder().addComponents(button)]});
            }
            break;

            case "modlogs": {
                const modChannel = options.getChannel("log")

                await modlogsDB.findOneAndUpdate(
                    {GuildID: guild.id},
                    {ChannelID: modChannel.id},
                    {new: true, upsert: true})

                Response.setDescription("✅ 管理ログを有効化しました")
            }
            break;

            case "info": {

                let captchaStatus = '`🔴 無効`'
                let voiceStatus = '`🔴 無効`'
                let modlogStatus = '`🔴 無効`'
                let levelSystemStatus = '`🔴 無効`'

                const levelSystemCheck = await featuresDB.findOne({GuildID: guild.id})
                if(levelSystemCheck) {
                    const { LevelSystem } = levelSystemCheck
                    if(LevelSystem.Enabled) levelSystemStatus = '`🟢 設定済み`' 
                } else{
                    levelSystemStatus = '`🔴 無効`'
                }

                const voiceCheck = await voiceDB.findOne({GuildID: guild.id})
                if(voiceCheck) voiceStatus = '`🟢 設定済み`'

                const captchaCheck = await captchaDB.findOne({GuildID: guild.id})
                if(captchaCheck) captchaStatus = '`🟢 設定済み`'

                const modlogCheck = await modlogsDB.findOne({GuildID: guild.id})
                if(modlogCheck) modlogStatus = '`🟢 設定済み`'

                await Response.addFields([
                    {name: '🤖 認証システム', value: captchaStatus, inline: true },
                    {name: '🔊 一時VCシステム', value: voiceStatus, inline: true },
                    {name: '📕 管理ログ', value: modlogStatus, inline: true },
                    {name: '🎉 レベルシステム', value: levelSystemStatus, inline: true },
                ])
            }
            break;

            case "remove": {
                switch(type) {
                    case "captcha": {
                        captchaDB.findOneAndDelete({ GuildID: guild.id }, (err) => {
                            if(err) console.error(err)
                        });
                        Response.setDescription("🗑️ 認証システムう無効化しました！")
                    }
                    break;

                    case "voice": {
                        voiceDB.findOneAndDelete({ GuildID: guild.id }, (err) => {
                            if(err) console.error(err)
                        });
                        Response.setDescription("🗑️ 一時VCシステムを無効化しました")
                    }
                    break;

                    case "modlogs": {
                        modlogsDB.findOneAndDelete({ GuildID: guild.id }, (err) => {
                            if(err) console.error(err)
                        });
                        Response.setDescription("🗑️ 管理ログを無効化しました")
                    }
                    break;
                }
            }
        }

        await interaction.reply({embeds: [Response], ephemeral: true})
    }
}

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false
    }

    return url.protocol === "https:" || url.protocol === "http:";
}
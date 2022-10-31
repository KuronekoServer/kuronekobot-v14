const { Client, EmbedBuilder, SlashCommandBuilder, CommandInteraction } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('voice')
    .setDescription('Control your own channel')
    .addSubcommand(subcommand => 
        subcommand
        .setName("invite")
        .setDescription("自分のVCに誰かを招待する")
        .addUserOption(option => 
            option.setName("member").setDescription("招待したいメンバー").setRequired(true))
    )
    .addSubcommand(subcommand => 
        subcommand
        .setName("disallow")
        .setDescription("誰かを自分のVCに参加できなくする")
        .addUserOption(option => 
            option.setName("member")
            .setDescription("参加できなくしたいメンバー")
            .setRequired(true))
    )
    .addSubcommand(subcommand => 
        subcommand
        .setName("name")
        .setDescription("自分のボイスチャンネルの名前を変える")
        .addStringOption(option => 
            option.setName("text")
            .setDescription("設定したい名前")
            .setRequired(true))
    )
    .addSubcommand(subcommand => 
        subcommand
        .setName("public")
        .setDescription("自分のVCを誰にも参加可能にする")
        .addStringOption(option => 
            option.setName("turn")
            .setDescription("参加設定")
            .setRequired(true)
            .addChoices(
                {name: "全員参加可能", value: "on"},
                {name: "招待限定", value: "off"}
            ))
    )

    .setDMPermission(false),
    /**
     * @param {CommandInteraction} interaction 
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options, member, guild } = interaction;

        const subCommand = options.getSubcommand();
        const voiceChannel = member.voice.channel;
        const Embed = new EmbedBuilder().setTitle("🔊 一時VCシステム").setColor(client.mainColor).setTimestamp(Date.now());
        const ownedChannel = client.voiceGenerator.get(member.id);

        if(!voiceChannel) 
            return interaction.reply({embeds: [Embed.setDescription("🔇 あなたはVCに接続していません").setColor(client.errorColor)], ephemeral: true});
        
        if(!ownedChannel || voiceChannel.id !== ownedChannel) 
            return interaction.reply({embeds: [Embed.setDescription("❌ ここはあなたのVCではありません").setColor(client.errorColor)], ephemeral: true})

        switch(subCommand) {
            case "name": {
                const newName = options.getString("text");
                if(newName.length > 22 || newName.length < 1)
                    return interaction.reply({embeds: [Embed.setDescription("❌ 22文字以上の名前は設定できません").setColor(client.errorColor)], ephemeral: true})

                voiceChannel.edit({name: newName});
                interaction.reply({embeds: [Embed.setDescription(`📝 チャンネル名を**${newName}**に設定しました`)], ephemeral: true})
            }
            break;

            case "invite": {
                const targetMember = options.getMember('member');
                voiceChannel.permissionOverwrites.edit(targetMember, {Connect: true});
                const sendEmbed = new EmbedBuilder().setTitle("🔊 VCへの招待").setColor(client.mainColor).setDescription(`👋 <@${member.id}> から <#${voiceChannel.id}> への招待が来ています`)

                targetMember.send({embeds: [sendEmbed]}).catch(() => {})
                interaction.reply({embeds: [Embed.setDescription(`📨 ${targetMember}を招待しました！`)], ephemeral: true})
            }
            break;

            case "disallow": {
                const targetMember = options.getMember('member');
                voiceChannel.permissionOverwrites.edit(targetMember, {Connect: false})

                if(targetMember.voice.channel && targetMember.voice.channel.id == voiceChannel.id) targetMember.voice.setChannel(null);
                interaction.reply({embeds: [Embed.setDescription(`💢 ${targetMember}はあなたのVCから追放されました`)], ephemeral: true})
            }
            break;

            case "public": {
                const turnChoice = options.getString("turn");

                switch(turnChoice) {
                    case "on": {
                        voiceChannel.permissionOverwrites.edit(guild.id, {Connect: true})
                        interaction.reply({embeds: [Embed.setDescription("🔓 あなたのVCに誰もが参加可能になりました")], ephemeral: true})
                    }
                    break;

                    case "off": {
                        voiceChannel.permissionOverwrites.edit(guild.id, {Connect: false})
                        interaction.reply({embeds: [Embed.setDescription("🔒 あなたのVCを招待限定にしました")], ephemeral: true})
                    }
                    break;
                }
            }
            break;
        }
    }
}
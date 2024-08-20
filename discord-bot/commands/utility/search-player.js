const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongo = require("../../libs/database.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search-player')
        .setDescription('Search player name on the database')
        .addStringOption(option =>
            option.setName('input') 
                .setDescription('Player name to search')),
    async execute(interaction) {
                const player = interaction.options.getString('input')

				await interaction.deferReply({ ephemeral: true });
                const elapsedTime = Date.now() - interaction.createdTimestamp;
                const mongoData = await mongo.searchPlayers(player);

                if(mongoData === "Player not found"){
                    await interaction.editReply('Player not found ❌')
                }else{
                    const serverEmbed = new EmbedBuilder()
                    .setTitle('Player found ✅')
                    .setDescription('Player found in ' + mongoData[0].IP + '\n' + "Elapsed time: " + elapsedTime + 'ms')
                    await interaction.channel.send({
                    embeds: [serverEmbed],
                    })
                    await interaction.deleteReply();
                }

    },
};
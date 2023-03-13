const discord = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, VoiceConnectionStatus, AudioPlayerStatus, NoSubscriberBehavio } = require('@discordjs/voice');
const client = new discord.Client({
    intents: [
        discord.GatewayIntentBits.DirectMessageReactions,
        discord.GatewayIntentBits.DirectMessageTyping,
        discord.GatewayIntentBits.DirectMessages,
        discord.GatewayIntentBits.GuildIntegrations,
        discord.GatewayIntentBits.GuildInvites,
        discord.GatewayIntentBits.GuildMembers,
        discord.GatewayIntentBits.GuildMessageReactions,
        discord.GatewayIntentBits.GuildMessageTyping,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.GuildPresences,
        discord.GatewayIntentBits.GuildVoiceStates,
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.MessageContent
    ], partials: [
        discord.Partials.Channel,
        discord.Partials.GuildMember,
        discord.Partials.GuildScheduledEvent,
        discord.Partials.Message,
        discord.Partials.Reaction,
        discord.Partials.ThreadMember,
        discord.Partials.User
    ]
});
const gtts = require('node-gtts')('en');

var ttsList = [];

client.on("ready", function() {
	console.log("Ready!");
})

client.on('messageCreate', async function(msg) => {
    if (msg.author.bot) {
		return;
    }
	if(ttsList.indexOf(msg.channel.id) !== -1) {
		if(!msg.member.voice) return;
		const connection = joinVoiceChannel({
			channelId: msg.member.voice.channelId,
			guildId: msg.channel.guild.id,
			adapterCreator: msg.channel.guild.voiceAdapterCreator,
			selfDeaf: false
		});
		const player = createAudioPlayer();
		await connection.subscribe(player);
		connection.on('stateChange', (old_state, new_state) => {
			if (old_state.status === VoiceConnectionStatus.Ready && new_state.status === VoiceConnectionStatus.Connecting) {
				connection.configureNetworking();
			}
		});
		gtts.save("./audio/tts.wav", msg.content, async function() {
			const resource = createAudioResource("./audio/tts.wav");
			player.play(resource);
		});
	}
});
client.on("interactionCreate", async function(interaction) => {
	if(interaction.commandName === "learn") {
		if(interaction.options.getSubcommand() === "speak") {
			await interaction.deferReply();
			const text = interaction.options.getString("text");
			if(!interaction.member.voice) { await interaction.editReply("Please connect a voice channel!"); return; }
			const connection = joinVoiceChannel({
            	channelId: interaction.member.voice.channelId,
            	guildId: interaction.channel.guild.id,
            	adapterCreator: interaction.channel.guild.voiceAdapterCreator,
            	selfDeaf: false
        	});
			const player = createAudioPlayer();
        	await connection.subscribe(player);
			connection.on('stateChange', (old_state, new_state) => {
				if (old_state.status === VoiceConnectionStatus.Ready && new_state.status === VoiceConnectionStatus.Connecting) {
					connection.configureNetworking();
				}
			});
			await gtts.save("./audio/tts.wav", text, async function() {
  				const resource = createAudioResource("./audio/tts.wav");
				await wait(1000);
				await player.play(resource);
				await interaction.editReply(`Played ${text} to your voice channel.`);
			});
		}
		if(interaction.options.getSubcommand() === "start") {
			await interaction.deferReply();
			if(ttsList.indexOf(interaction.channel.id) === -1) {
				ttsList.push(interaction.channel.id);
				await interaction.editReply("Set TTS");
				return;
			} else {
				await interaction.editReply("Your channel already set up as a TTS channel.");
			}
		}
		if(interaction.options.getSubcommand() === "stop") {
			await interaction.deferReply();
			if(ttsList.indexOf(interaction.channel.id) === -1) {
				await interaction.editReply("You didn't set up this channel as a TTS channel.");
				return;
			} else {
				let num = ttsList.indexOf(interaction.channel.id);
				ttsList.splice(num, 1);
				await interaction.editReply("Disabled TTS");
				return;
			}
		}
	}
});

client.login("your-token-goes-here");

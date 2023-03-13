var start = new Date();
const { REST, SlashCommandBuilder, Routes, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const commands = [
		new SlashCommandBuilder()
			.setName('learn')
			.setDescription('Learning')
			.addSubcommand(subcommand =>
				subcommand.setName("speak")
				.setDescription("Speak it")
				.addStringOption(option =>
					option.setName("text")
					.setDescription("Text to speech")
					.setRequired(true)))
			.addSubcommand(subcommand =>
				subcommand.setName("start")
				.setDescription("Start English TTS"))
			.addSubcommand(subcommand =>
				subcommand.setName("stop")
				.setDescription("Stop English TTS"))
].map(command => command.toJSON());
const rest = new REST({ version: '10' }).setToken("your-token-gose-here");
rest.put(Routes.applicationCommands("your-application-id-goes-here"), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands with ${(new Date() - start)/1000}s`))
	.catch(console.error);

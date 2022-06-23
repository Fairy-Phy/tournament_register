// Copyright 2021 (Fairy)Phy
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const Discord = require("discord.js");
const Config = require("./config.json");
const API = require("./api.js");
const fs = require("fs/promises");

const existfileAsync = async path => {
	try {
		return (await fs.lstat(path)).isFile();
	}
	catch {
		return false;
	}
};

const rem_key = "a175080faa4652ca30c91ad849f46e7f48367ca41f1362aefa622e3d82ff22ec34524b16757dd64e3f27ea8f34c0927d48ff69435ee00c9a4a334de16c4ca69e";
const rem_key_path = `./${rem_key}`;
const debug = false;

const client = new Discord.Client({
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
		Discord.Intents.FLAGS.GUILD_MEMBERS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_PRESENCES,
		Discord.Intents.FLAGS.GUILD_VOICE_STATES,
		Discord.Intents.FLAGS.GUILD_WEBHOOKS
	]
});

process.on("exit", () => {
	console.log("Exiting...");
	client.destroy();
});

process.on("SIGINT", () => {
	process.exit(0);
});

client.on('ready', async event_client => {
	event_client.user.setPresence({ activities: [{ name: "/register で認証します！" }] });
	console.log("ready");
});

client.on("messageCreate", async message_data => {
	if (message_data.channel.type != "GUILD_TEXT" || message_data.author.bot) return;

	if (message_data.content == rem_key) {
		if (await existfileAsync(rem_key_path)) {
			await message_data.channel.send("すでに終わらせました");
			return;
		}
		await fs.writeFile(rem_key_path, Buffer.alloc(0));
	}
});

client.on("interactionCreate", async interaction => {
	console.log(interaction);
	if (!interaction.isCommand()) return;

	try {
		if (interaction.commandName != "register") return;

		const message_embed = new Discord.MessageEmbed();
		message_embed.setFooter(`${client.user.username} Bot`, client.user.avatar ? client.user.avatarURL() : client.user.defaultAvatarURL);
		message_embed.setAuthor(`失敗`);
		message_embed.setColor("#FF4B00");

		if (!interaction.inGuild()) {
			message_embed.setDescription(`DMでは実行できません`);
			message_embed.setTimestamp();
			await interaction.reply({ embeds: [message_embed], ephemeral: !debug });
			return;
		}

		if (interaction.guildId !== Config.guild_id) return;

		if (interaction.channelId !== Config.auth_channel_id) {
			message_embed.setDescription(`このチャンネルでは実行できません`);
			message_embed.setTimestamp();
			await interaction.reply({ embeds: [message_embed], ephemeral: !debug });
			return;
		}

		//console.log(interaction);
		//console.log(interaction.commandName);

		const player_role = interaction.guild.roles.cache.find(v => v.id === Config.player_role_id);
		const spect_role = interaction.guild.roles.cache.find(v => v.id === Config.spect_role_id);

		if (await interaction.member.roles.cache.has(player_role.id) || await interaction.member.roles.cache.has(spect_role.id)) {
			message_embed.setDescription(`すでに登録されています`);
			message_embed.setTimestamp();
			await interaction.reply({ embeds: [message_embed], ephemeral: !debug });
			return;
		}

		const regist_type = interaction.options.get("regist_type").value;
		const osu_user_url = interaction.options.get("osu_user_url").value;

		const osu_user_id = osu_user_url.replace(/(https|http):\/\/osu.ppy.sh\/users\//, "");
		if (isNaN(osu_user_id) && isNaN(parseFloat(osu_user_id))) {
			message_embed.setDescription(`URLが正しくありません`);
			message_embed.setTimestamp();
			await interaction.reply({ embeds: [message_embed], ephemeral: !debug });
			return;
		}

		const osu_prof = await API.Get_osu_user_from_id(osu_user_id, 3);

		if (osu_prof == null) {
			message_embed.setDescription(`URLが正しくないかユーザーが存在しません`);
			message_embed.setTimestamp();
			await interaction.reply({ embeds: [message_embed], ephemeral: !debug });
			return;
		}

		if (regist_type == "Player") {
			if (await existfileAsync(rem_key_path)) {
				message_embed.setDescription(`参加受付は終了しました！現在はスペクテイターのみ可能です！`);
				message_embed.setTimestamp();
				await interaction.reply({ embeds: [message_embed], ephemeral: !debug });
				return;
			}

			if (osu_prof.country != "JP") {
				message_embed.setAuthor(`Failure`);
				message_embed.setDescription(`Registration is not possible because you are not in Japan (Spectator only)`);
				message_embed.setTimestamp();
				await interaction.reply({ embeds: [message_embed], ephemeral: !debug });
				return;
			}

			await interaction.guild.channels.cache.find(v => v.id === Config.record_channel_id).send(`${osu_prof.username} -> ${osu_prof.user_id}`);
			await interaction.member.roles.add(player_role);
		}
		else if (regist_type == "Spectator") {
			if (osu_prof.country != "JP") {
				const Button_Row = new Discord.MessageActionRow().addComponents(
					new Discord.MessageButton().setCustomId("OKButton").setLabel("OK").setStyle("PRIMARY")
				);

				const warning_message_embed = new Discord.MessageEmbed();
				warning_message_embed.setFooter(`${client.user.username} Bot`, client.user.avatar ? client.user.avatarURL() : client.user.defaultAvatarURL);
				warning_message_embed.setAuthor(`Warning`);
				warning_message_embed.setColor("#F2E700");
				warning_message_embed.setDescription(`The entire tournament will be run in Japanese. And this server must be spoken in Japanese.`);
				warning_message_embed.setTimestamp();
				const reply_mes = await interaction.reply({ embeds: [warning_message_embed], ephemeral: !debug, components: [Button_Row], fetchReply: true });
				if (!(reply_mes instanceof Discord.Message)) throw new Error("Discord.Messageじゃない");

				const buttom_press = await reply_mes.awaitMessageComponent({ filter: v => v.customId == "OKButton", time: 60000, componentType: "BUTTON" }).catch(() => null);
				if (buttom_press == null) {
					const error_message_embed = new Discord.MessageEmbed();
					error_message_embed.setFooter(`${client.user.username} Bot`, client.user.avatar ? client.user.avatarURL() : client.user.defaultAvatarURL);
					error_message_embed.setAuthor(`Failure`);
					error_message_embed.setColor("#FF4B00");
					error_message_embed.setDescription(`Request time out.`);
					error_message_embed.setTimestamp();

					await interaction.editReply({ embeds: [error_message_embed], ephemeral: !debug, components: [] });
					return;
				}
			}

			interaction.member.roles.add(spect_role);
		}

		await interaction.member.setNickname(osu_prof.username, "登録のため");

		message_embed.setAuthor(`成功`);
		message_embed.setColor("#00B06B");
		message_embed.setDescription(`正常に登録されました！`);
		message_embed.addField("形式", regist_type == "Player" ? `プレイヤー(参加者)` : `スペクテイター(観戦者)`, true);
		message_embed.addField("ユーザー名", `${osu_prof.username} (${osu_prof.user_id})`, true);
		message_embed.setTimestamp();
		if (osu_prof.country != "JP") await interaction.editReply({ embeds: [message_embed], ephemeral: !debug, components: [] });
		else await interaction.reply({ embeds: [message_embed], ephemeral: !debug });
	}
	catch (error) {
		await interaction.channel.send({ content: `エラーが発生しました\n${String(error)}`, ephemeral: false });
		
		console.log(error);
	}
});

client.login(Config.token);



const request = require("request-promise");
const Config = require("./config.json");

const register = {
	name: "register",
	description: "サーバーに入るための認証をします",
	options: [
		{
			type: 3,
			name: "regist_type",
			description: "どの形式で登録するかを指定します",
			required: true,
			choices: [
				{
					name: "プレイヤー(参加者)",
					value: "Player"
				},
				{
					name: "スペクテイター(観戦者)",
					value: "Spectator"
				}
			],
		},
		{
			type: 3,
			name: "osu_user_url",
			description: "自身のosu!のプロフィールURLを入力してください",
			required: true
		},
	]
};

// サーバー用
const api_url = `https://discord.com/api/v8/applications/${Config.bot_id}/guilds/${Config.guild_id}/commands`;
// 全体用
//const api_url = `https://discord.com/api/v8/applications/${Config.bot_id}/commands`;

/* 

CommandIDの保存を忘れずに！！！！！！！

*/


(async () => {
	const response = await request(api_url, {
		method: "POST",
		body: JSON.stringify(register),
		headers: {
			"Authorization": 'Bot ' + Config.token,
			"Content-Type": "application/json"
		}
	});
	console.log(response);
})();

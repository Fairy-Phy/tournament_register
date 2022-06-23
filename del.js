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

const request = require("request-promise");
const Config = require("./config.json");

const command_id = "";

// サーバー用
const api_url = `https://discord.com/api/v8/applications/${Config.bot_id}/guilds/${Config.guild_id}/commands/${command_id}`;
// 全体用
//const api_url = `https://discord.com/api/v8/applications/${Config.bot_id}/commands/${command_id}`;

(async () => {
	const response = await request(api_url, {
		method: "DELETE",
		headers: {
			"Authorization": 'Bot ' + Config.token,
			"Content-Type": "application/json"
		}
	});
	console.log(response);
})();

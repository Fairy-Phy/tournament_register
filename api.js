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

const api_base_url = `https://osu.ppy.sh/api`;

const api_get_user = `/get_user`;

const api_key = require("./config.json").osu_api_key;

const Get_url_from_id = (id, mode) => `${api_base_url}${api_get_user}?k=${api_key}&m=${mode}&u=${id}&type=id`;
const Get_url_from_name = (name, mode) => `${api_base_url}${api_get_user}?k=${api_key}&m=${mode}&u=${name}&type=string`;

const Get_osu_user = async url => {
	const req_res = await request(url);

	if (req_res == "[]") {
		console.log("譜面情報が取得できませんでした");
		return null;
	}

	return JSON.parse(req_res)[0];
};

module.exports.Get_osu_user_from_id = async (id, mode) => await Get_osu_user(Get_url_from_id(id, mode));

module.exports.Get_osu_user_from_name = async (name, mode) => await Get_osu_user(Get_url_from_name(name, mode));

"use strict"
import axios from "axios";
import Chat from "./chat.js";
import debug from "../comm/debug.js";
import { OpenAI } from "../service/openai.js";
import { getAccessToken } from "../ding/accesstoken.js";

export default class TextChat extends Chat {

    constructor(name) {
        super(name);
    }

    async response(staffID, robotCode, answer) {
        /*response to dingtalk*/
        const token = await getAccessToken();
        debug.log(answer);

        const data = {
            "robotCode": robotCode,
            "userIds": [staffID],
            "msgKey": "sampleText",
            "msgParam": JSON.stringify({ "content": answer })
        };
        const url = 'https://api.dingtalk.com/v1.0/robot/oToMessages/batchSend';

        const config = {
            headers: {
                'Accept': "application/json",
                'Content-Type': "application/json",
                'x-acs-dingtalk-access-token': token
            }
        };

        return axios.post(url, data, config);
    }

    process(info, res) {

        debug.log("text chat...");
        const question = info?.text?.content;
        const staffID = info?.senderStaffId;
        const robotCode = info?.robotCode;

        const openai = new OpenAI();
        openai.ctText(question).then(result => {
            const content = result?.data?.choices[0]?.message?.content;
            debug.log(content);
            if (!!content) {
                const answer = content;
                this.response(staffID, robotCode, answer);
            }
        });

    }

}

import axios from "axios"
import config from "../config.json" assert { type: "json" }

var endpoint = config.scanner.twitch.endpoint

const fetchToken = async () => {
    return await axios.post("https://id.twitch.tv/oauth2/token", {
        client_id: config.scanner.twitch.app["client-id"],
        client_secret: config.scanner.twitch.app["client-secret"],
        grant_type: "client_credentials"
    }).then(res => res.data.access_token).catch(err => console.log(err))
}

var token = await fetchToken()

const fetchGame = async () => {
    return await axios.get(`${endpoint}games?name=Minecraft`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            "Client-Id": config.scanner.twitch.app["client-id"]
        }
    }).then(res => res.data.data[0].id).catch(err => console.log(err))
}

var game = await fetchGame()

const fetchStreams = async (cursor = "") => new Promise(async (resolve, reject) => {
    await axios.get(`${endpoint}streams?game_id=${game}&first=100&type=all&after=${cursor}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            "Client-Id": config.scanner.twitch.app["client-id"]
        }
    }).then(res => {
        resolve(res.data)
    }).catch(err => reject(err))
})

export default { fetchStreams }
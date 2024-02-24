const config = require("../config.json").scanner.cloudflare.api
const axios = require("axios")

const fetchRecords = async () => {
    return await axios.get(`${config.endpoint}zones/${config.zone.id}/dns_records?comment.contains=ui`, {
        headers: {
            Authorization: `Bearer ${config["api-token"]}`,
            "Content-Type": "application/json"
        }
    }).then(res => res.data).catch(err => err)
}

const updateRecord = async (data) => {
    return await axios.patch(`${config.endpoint}zones/${config.zone.id}/dns_records/${data.record_id}`, data.content, {
        headers: {
            Authorization: `Bearer ${config["api-token"]}`,
            "Content-Type": "application/json"
        }
    }).then(res => res.data).catch(err => err)
}

module.exports = {
    fetchRecords,
    updateRecord
}